/**
 * Funciones puras de cálculo para el módulo de combustible
 * Sin dependencias de DB ni Traccar
 */

import type { FuelLog, FuelStats, VehicleEfficiency, BudgetProgress, MonthlyFuelData } from '@/types/fuel';

/**
 * Calcula la eficiencia (km/litro) por vehículo
 * Agrupa por deviceId y calcula usando diferencia de odómetros
 */
export function calcEfficiency(
  logs: FuelLog[],
  vehicleNames: Record<string, { name: string; plate: string }>
): VehicleEfficiency[] {
  if (logs.length === 0) return [];

  // Agrupar por deviceId
  const groupedByDevice = logs.reduce((acc, log) => {
    if (!acc[log.deviceId]) {
      acc[log.deviceId] = [];
    }
    acc[log.deviceId].push(log);
    return acc;
  }, {} as Record<string, FuelLog[]>);

  // Calcular eficiencia por vehículo
  const efficiencies: VehicleEfficiency[] = [];

  Object.entries(groupedByDevice).forEach(([deviceId, deviceLogs]) => {
    // Ordenar por fecha
    const sortedLogs = [...deviceLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const totalLiters = sortedLogs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = sortedLogs.reduce((sum, log) => sum + log.totalCost, 0);

    // Calcular km recorridos (diferencia entre último y primer odómetro)
    const firstOdometer = sortedLogs[0].odometer;
    const lastOdometer = sortedLogs[sortedLogs.length - 1].odometer;
    const kmTraveled = lastOdometer - firstOdometer;

    // Calcular eficiencia (km/litro)
    const efficiency = totalLiters > 0 ? kmTraveled / totalLiters : 0;

    const vehicleInfo = vehicleNames[deviceId] || { name: `Vehículo ${deviceId}`, plate: '' };

    efficiencies.push({
      deviceId,
      vehicleName: vehicleInfo.name,
      plate: vehicleInfo.plate,
      totalLiters,
      totalCost,
      kmTraveled,
      efficiency,
      lastFuelDate: sortedLogs[sortedLogs.length - 1].date,
    });
  });

  // Ordenar por peor eficiencia primero (menor km/L)
  return efficiencies.sort((a, b) => a.efficiency - b.efficiency);
}

/**
 * Calcula estadísticas agregadas del período
 */
export function calcMonthlyStats(logs: FuelLog[]): FuelStats {
  if (logs.length === 0) {
    return {
      totalCost: 0,
      totalLiters: 0,
      avgPricePerLiter: 0,
      avgEfficiency: 0,
    };
  }

  const totalCost = logs.reduce((sum, log) => sum + log.totalCost, 0);
  const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;

  // Calcular eficiencia promedio de la flota
  // Agrupar por vehículo y calcular km totales y litros totales
  const vehicleData = logs.reduce((acc, log) => {
    if (!acc[log.deviceId]) {
      acc[log.deviceId] = {
        logs: [],
      };
    }
    acc[log.deviceId].logs.push(log);
    return acc;
  }, {} as Record<string, { logs: FuelLog[] }>);

  let totalKm = 0;
  Object.values(vehicleData).forEach(({ logs: vehicleLogs }) => {
    const sortedLogs = [...vehicleLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (sortedLogs.length > 1) {
      const kmTraveled = sortedLogs[sortedLogs.length - 1].odometer - sortedLogs[0].odometer;
      totalKm += kmTraveled;
    }
  });

  const avgEfficiency = totalLiters > 0 ? totalKm / totalLiters : 0;

  return {
    totalCost,
    totalLiters,
    avgPricePerLiter,
    avgEfficiency,
  };
}

/**
 * Calcula el progreso del presupuesto
 */
export function calcBudgetProgress(spent: number, budget: number): BudgetProgress {
  if (budget <= 0) {
    return { percentage: 0, status: 'ok' };
  }

  const percentage = (spent / budget) * 100;

  let status: 'ok' | 'warning' | 'exceeded' = 'ok';
  if (percentage > 100) {
    status = 'exceeded';
  } else if (percentage > 80) {
    status = 'warning';
  }

  return { percentage, status };
}

/**
 * Agrupa logs por vehículo
 */
export function groupByVehicle(logs: FuelLog[]): Record<string, FuelLog[]> {
  return logs.reduce((acc, log) => {
    if (!acc[log.deviceId]) {
      acc[log.deviceId] = [];
    }
    acc[log.deviceId].push(log);
    return acc;
  }, {} as Record<string, FuelLog[]>);
}

/**
 * Agrupa logs por mes para gráficas
 * Retorna últimos 12 meses
 */
export function groupByMonth(logs: FuelLog[]): MonthlyFuelData[] {
  // Obtener últimos 12 meses
  const now = new Date();
  const months: MonthlyFuelData[] = [];
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      month,
      totalCost: 0,
      totalLiters: 0,
    });
  }

  // Agrupar logs por mes
  logs.forEach((log) => {
    const logDate = new Date(log.date);
    const logMonth = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
    
    const monthData = months.find((m) => m.month === logMonth);
    if (monthData) {
      monthData.totalCost += log.totalCost;
      monthData.totalLiters += log.liters;
    }
  });

  return months;
}
