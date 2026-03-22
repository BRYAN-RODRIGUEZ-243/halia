import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  calcEfficiency,
  calcMonthlyStats,
  calcBudgetProgress,
  groupByMonth,
} from '@/lib/fuelCalculations';
import type { FuelStats, VehicleEfficiency, MonthlyFuelData, BudgetProgress } from '@/types/fuel';

const TRACCAR_URL = process.env.TRACCAR_URL || '';
const TRACCAR_USER = process.env.TRACCAR_USER || '';
const TRACCAR_PASS = process.env.TRACCAR_PASS || '';

/**
 * GET /api/fuel/stats
 * Estadísticas generales y por vehículo
 * Query params: from (ISO), to (ISO)
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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Construir filtros para Prisma
    const where: any = {};

    if (from || to) {
      where.date = {};
      if (from) {
        where.date.gte = new Date(from);
      }
      if (to) {
        where.date.lte = new Date(to);
      }
    }

    console.log('[FUEL STATS] Fetching data with filters:', where);

    // Obtener todos los logs del período
    const logs = await prisma.fuelLog.findMany({
      where,
      include: {
        driver: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    console.log(`[FUEL STATS] Found ${logs.length} logs`);

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

    // Calcular estadísticas generales
    const stats: FuelStats = calcMonthlyStats(logs);

    // Calcular eficiencia por vehículo
    const efficiencyData: VehicleEfficiency[] = calcEfficiency(logs, deviceMap);

    // Agrupar datos por mes (últimos 12 meses)
    const monthlyData: MonthlyFuelData[] = groupByMonth(logs);

    // Obtener presupuesto del mes actual
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budget = await prisma.monthlyBudget.findUnique({
      where: { month: currentMonth },
    });

    let budgetProgress: BudgetProgress | null = null;

    if (budget) {
      // Obtener logs del mes actual
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const currentMonthLogs = await prisma.fuelLog.findMany({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const currentMonthStats = calcMonthlyStats(currentMonthLogs);

      budgetProgress = calcBudgetProgress(currentMonthStats.totalCost, budget.budgetAmount);
    }

    return NextResponse.json({
      stats,
      efficiency: efficiencyData,
      monthlyData,
      budget: budget || null,
      budgetProgress,
    });
  } catch (error) {
    console.error('[FUEL STATS] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/fuel/stats
 * Actualizar o crear presupuesto mensual
 * Body: { month: 'YYYY-MM', budgetAmount: number }
 */
export async function PUT(request: NextRequest) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body: { month: string; budgetAmount: number } = await request.json();

    // Validar campos requeridos
    if (!body.month || !body.budgetAmount) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (month, budgetAmount)' },
        { status: 400 }
      );
    }

    // Validar formato de mes (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(body.month)) {
      return NextResponse.json(
        { error: 'Formato de mes inválido. Usar YYYY-MM' },
        { status: 400 }
      );
    }

    console.log('[FUEL STATS] Upserting budget:', body);

    // Crear o actualizar presupuesto
    const budget = await prisma.monthlyBudget.upsert({
      where: {
        month: body.month,
      },
      create: {
        month: body.month,
        budgetAmount: body.budgetAmount,
      },
      update: {
        budgetAmount: body.budgetAmount,
      },
    });

    console.log('[FUEL STATS] Budget upserted:', budget.id);

    return NextResponse.json(budget);
  } catch (error) {
    console.error('[FUEL STATS] Update error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
