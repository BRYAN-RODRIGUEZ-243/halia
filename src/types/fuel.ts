/**
 * Tipos para el módulo de Combustible
 */

export type FuelType = 'regular' | 'super' | 'diesel';

export interface FuelLog {
  id: string;
  deviceId: string;
  driverId: string | null;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  odometer: number;
  station: string | null;
  fuelType: FuelType;
  invoiceNumber: string | null;
  date: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelLogWithRelations extends FuelLog {
  vehicleName: string;
  driverName: string | null;
}

export interface FuelStats {
  totalCost: number;
  totalLiters: number;
  avgPricePerLiter: number;
  avgEfficiency: number;
}

export interface VehicleEfficiency {
  deviceId: string;
  vehicleName: string;
  plate: string;
  totalLiters: number;
  totalCost: number;
  kmTraveled: number;
  efficiency: number;
  lastFuelDate: Date;
}

export interface MonthlyBudget {
  id: string;
  month: string;
  budgetAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFuelLogDTO {
  deviceId: string;
  driverId?: string | null;
  liters: number;
  pricePerLiter: number;
  odometer: number;
  station?: string | null;
  fuelType: FuelType;
  invoiceNumber?: string | null;
  date: string | Date;
  notes?: string | null;
}

export interface MonthlyFuelData {
  month: string;
  totalCost: number;
  totalLiters: number;
}

export interface BudgetProgress {
  percentage: number;
  status: 'ok' | 'warning' | 'exceeded';
}
