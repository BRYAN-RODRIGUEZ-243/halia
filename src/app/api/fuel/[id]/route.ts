import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { FuelLogWithRelations } from '@/types/fuel';

const TRACCAR_URL = process.env.TRACCAR_URL || '';
const TRACCAR_USER = process.env.TRACCAR_USER || '';
const TRACCAR_PASS = process.env.TRACCAR_PASS || '';

/**
 * GET /api/fuel/[id]
 * Obtener un registro específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    console.log('[FUEL] Fetching log:', id);

    // Obtener log de la DB
    const log = await prisma.fuelLog.findUnique({
      where: { id },
      include: {
        driver: true,
      },
    });

    if (!log) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    // Obtener nombre del vehículo de Traccar
    const authHeader = 'Basic ' + Buffer.from(`${TRACCAR_USER}:${TRACCAR_PASS}`).toString('base64');
    const traccarUrl = TRACCAR_URL.endsWith('/') ? TRACCAR_URL.slice(0, -1) : TRACCAR_URL;

    const deviceResponse = await fetch(`${traccarUrl}/api/devices/${log.deviceId}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    let vehicleName = `Vehículo ${log.deviceId}`;
    if (deviceResponse.ok) {
      const device = await deviceResponse.json();
      vehicleName = device.name;
    }

    // Enriquecer con relaciones
    const logWithRelations: FuelLogWithRelations = {
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
      vehicleName,
      driverName: log.driver ? log.driver.name : null,
    };

    return NextResponse.json(logWithRelations);
  } catch (error) {
    console.error('[FUEL] Get error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/fuel/[id]
 * Actualizar un registro existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    console.log('[FUEL] Updating log:', id, body);

    // Verificar que el registro existe
    const existingLog = await prisma.fuelLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    // Recalcular totalCost si se actualizan liters o pricePerLiter
    let totalCost = existingLog.totalCost;
    const newLiters = body.liters ?? existingLog.liters;
    const newPricePerLiter = body.pricePerLiter ?? existingLog.pricePerLiter;

    if (body.liters !== undefined || body.pricePerLiter !== undefined) {
      totalCost = newLiters * newPricePerLiter;
    }

    // Si se actualiza odometer, validar que sea mayor al anterior (excluyendo el actual)
    if (body.odometer !== undefined && body.odometer !== existingLog.odometer) {
      const lastLog = await prisma.fuelLog.findFirst({
        where: {
          deviceId: existingLog.deviceId,
          id: { not: id },
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
    }

    // Actualizar registro
    const updatedLog = await prisma.fuelLog.update({
      where: { id },
      data: {
        driverId: body.driverId !== undefined ? body.driverId : existingLog.driverId,
        liters: newLiters,
        pricePerLiter: newPricePerLiter,
        totalCost,
        odometer: body.odometer ?? existingLog.odometer,
        station: body.station !== undefined ? body.station : existingLog.station,
        fuelType: body.fuelType ?? existingLog.fuelType,
        invoiceNumber: body.invoiceNumber !== undefined ? body.invoiceNumber : existingLog.invoiceNumber,
        date: body.date ? new Date(body.date) : existingLog.date,
        notes: body.notes !== undefined ? body.notes : existingLog.notes,
      },
      include: {
        driver: true,
      },
    });

    console.log('[FUEL] Log updated:', updatedLog.id);

    // Obtener nombre del vehículo
    const authHeader = 'Basic ' + Buffer.from(`${TRACCAR_USER}:${TRACCAR_PASS}`).toString('base64');
    const traccarUrl = TRACCAR_URL.endsWith('/') ? TRACCAR_URL.slice(0, -1) : TRACCAR_URL;

    const deviceResponse = await fetch(`${traccarUrl}/api/devices/${updatedLog.deviceId}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    let vehicleName = `Vehículo ${updatedLog.deviceId}`;
    if (deviceResponse.ok) {
      const device = await deviceResponse.json();
      vehicleName = device.name;
    }

    // Enriquecer con relaciones
    const logWithRelations: FuelLogWithRelations = {
      id: updatedLog.id,
      deviceId: updatedLog.deviceId,
      driverId: updatedLog.driverId,
      liters: updatedLog.liters,
      pricePerLiter: updatedLog.pricePerLiter,
      totalCost: updatedLog.totalCost,
      odometer: updatedLog.odometer,
      station: updatedLog.station,
      fuelType: updatedLog.fuelType as any,
      invoiceNumber: updatedLog.invoiceNumber,
      date: updatedLog.date,
      notes: updatedLog.notes,
      createdAt: updatedLog.createdAt,
      updatedAt: updatedLog.updatedAt,
      vehicleName,
      driverName: updatedLog.driver ? updatedLog.driver.name : null,
    };

    return NextResponse.json(logWithRelations);
  } catch (error) {
    console.error('[FUEL] Update error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/fuel/[id]
 * Eliminar un registro
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    console.log('[FUEL] Deleting log:', id);

    // Verificar que el registro existe
    const existingLog = await prisma.fuelLog.findUnique({
      where: { id },
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar registro
    await prisma.fuelLog.delete({
      where: { id },
    });

    console.log('[FUEL] Log deleted:', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[FUEL] Delete error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
