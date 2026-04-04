import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calcMonthlyStats } from '@/lib/fuelCalculations';
import type { CreateFuelLogDTO, FuelLogWithRelations, FuelLog } from '@/types/fuel';

const TRACCAR_URL = process.env.TRACCAR_URL || '';
const TRACCAR_USER = process.env.TRACCAR_USER || '';
const TRACCAR_PASS = process.env.TRACCAR_PASS || '';

/**
 * GET /api/fuel
 * Query params: deviceId, driverId, from (ISO), to (ISO), fuelType
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener filtros de query params
    const searchParams = request.nextUrl.searchParams;
    const deviceId = searchParams.get('deviceId');
    const driverId = searchParams.get('driverId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const fuelType = searchParams.get('fuelType');

    // Construir filtros para Prisma
    const where: any = {};

    if (deviceId) {
      where.deviceId = deviceId;
    }

    if (driverId) {
      where.driverId = driverId === 'null' ? null : driverId;
    }

    if (fuelType) {
      where.fuelType = fuelType;
    }

    if (from || to) {
      where.date = {};
      if (from) {
        where.date.gte = new Date(from);
      }
      if (to) {
        where.date.lte = new Date(to);
      }
    }

    console.log('[FUEL] Fetching logs with filters:', where);

    // Obtener logs de la DB
    const logs = await prisma.fuelLog.findMany({
      where,
      include: {
        driver: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    console.log(`[FUEL] Found ${logs.length} logs`);

    // Obtener dispositivos de Traccar para enriquecer con nombres
    const authHeader = 'Basic ' + Buffer.from(`${TRACCAR_USER}:${TRACCAR_PASS}`).toString('base64');
    const traccarUrl = TRACCAR_URL.endsWith('/') ? TRACCAR_URL.slice(0, -1) : TRACCAR_URL;

    const devicesResponse = await fetch(`${traccarUrl}/api/devices`, {
      headers: {
        Authorization: authHeader,
      },
    });

    let devices: any[] = [];
    if (devicesResponse.ok) {
      devices = await devicesResponse.json();
    }

    // Crear mapa de deviceId -> nombre
    const deviceMap = devices.reduce((acc: any, device: any) => {
      acc[device.id] = device.name;
      return acc;
    }, {});

    // Enriquecer logs con nombres de vehículos y conductores
    const logsWithRelations: FuelLogWithRelations[] = logs.map((log: any) => ({
      id: log.id,
      deviceId: log.deviceId,
      driverId: log.driverId,
      liters: log.liters,
      pricePerLiter: log.pricePerLiter,
      totalCost: log.totalCost,
      odometer: log.odometer,
      station: log.station,
      fuelType: log.fuelType as any,
      invoiceNumber: log.invoiceNumber,
      date: log.date,
      notes: log.notes,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      vehicleName: deviceMap[log.deviceId] || `Vehículo ${log.deviceId}`,
      driverName: log.driver ? log.driver.name : null,
    }));

    // Calcular estadísticas del período (cast logs para coincidir con tipo FuelLog)
    const stats = calcMonthlyStats(logs as FuelLog[]);

    return NextResponse.json({
      logs: logsWithRelations,
      stats,
    });
  } catch (error) {
    console.error('[FUEL] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fuel
 * Crear nuevo registro de combustible
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: CreateFuelLogDTO = await request.json();

    // Validar campos requeridos
    if (!body.deviceId || !body.liters || !body.pricePerLiter || !body.odometer || !body.date) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    console.log('[FUEL] Creating fuel log:', body);

    // Calcular totalCost (no confiar en el cliente)
    const totalCost = body.liters * body.pricePerLiter;

    // Verificar que deviceId existe en Traccar
    const authHeader = 'Basic ' + Buffer.from(`${TRACCAR_USER}:${TRACCAR_PASS}`).toString('base64');
    const traccarUrl = TRACCAR_URL.endsWith('/') ? TRACCAR_URL.slice(0, -1) : TRACCAR_URL;

    const deviceResponse = await fetch(`${traccarUrl}/api/devices/${body.deviceId}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!deviceResponse.ok) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado en el sistema' },
        { status: 404 }
      );
    }

    // Validar que odometer sea mayor al último registrado
    const lastLog = await prisma.fuelLog.findFirst({
      where: {
        deviceId: body.deviceId,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (lastLog && body.odometer < lastLog.odometer) {
      return NextResponse.json(
        { error: 'El odómetro no puede ser menor al último registro' },
        { status: 400 }
      );
    }

    // Crear registro en DB
    const fuelLog = await prisma.fuelLog.create({
      data: {
        deviceId: body.deviceId,
        driverId: body.driverId || null,
        liters: body.liters,
        pricePerLiter: body.pricePerLiter,
        totalCost,
        odometer: body.odometer,
        station: body.station || null,
        fuelType: body.fuelType || 'regular',
        invoiceNumber: body.invoiceNumber || null,
        date: new Date(body.date),
        notes: body.notes || null,
      },
      include: {
        driver: true,
      },
    });

    console.log('[FUEL] Fuel log created:', fuelLog.id);

    // Obtener nombre del vehículo
    const device = await deviceResponse.json();

    // Enriquecer con relaciones
    const logWithRelations: FuelLogWithRelations = {
      id: fuelLog.id,
      deviceId: fuelLog.deviceId,
      driverId: fuelLog.driverId,
      liters: fuelLog.liters,
      pricePerLiter: fuelLog.pricePerLiter,
      totalCost: fuelLog.totalCost,
      odometer: fuelLog.odometer,
      station: fuelLog.station,
      fuelType: fuelLog.fuelType as any,
      invoiceNumber: fuelLog.invoiceNumber,
      date: fuelLog.date,
      notes: fuelLog.notes,
      createdAt: fuelLog.createdAt,
      updatedAt: fuelLog.updatedAt,
      vehicleName: device.name,
      driverName: fuelLog.driver ? fuelLog.driver.name : null,
    };

    return NextResponse.json(logWithRelations, { status: 201 });
  } catch (error) {
    console.error('[FUEL] Create error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
