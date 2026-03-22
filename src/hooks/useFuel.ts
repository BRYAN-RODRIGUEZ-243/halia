import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  FuelLogWithRelations,
  CreateFuelLogDTO,
  FuelStats,
  VehicleEfficiency,
  MonthlyFuelData,
  MonthlyBudget,
  BudgetProgress,
} from '@/types/fuel';

interface FuelLogsResponse {
  logs: FuelLogWithRelations[];
  stats: FuelStats;
}

interface FuelStatsResponse {
  stats: FuelStats;
  efficiency: VehicleEfficiency[];
  monthlyData: MonthlyFuelData[];
  budget: MonthlyBudget | null;
  budgetProgress: BudgetProgress | null;
}

interface FuelLogsFilters {
  deviceId?: string;
  driverId?: string;
  from?: string;
  to?: string;
  fuelType?: string;
}

interface FuelStatsFilters {
  from?: string;
  to?: string;
}

/**
 * Hook para obtener registros de combustible
 */
export function useFuelLogs(filters?: FuelLogsFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.deviceId) queryParams.append('deviceId', filters.deviceId);
  if (filters?.driverId) queryParams.append('driverId', filters.driverId);
  if (filters?.from) queryParams.append('from', filters.from);
  if (filters?.to) queryParams.append('to', filters.to);
  if (filters?.fuelType) queryParams.append('fuelType', filters.fuelType);

  const queryString = queryParams.toString();
  const url = `/api/fuel${queryString ? `?${queryString}` : ''}`;

  return useQuery<FuelLogsResponse>({
    queryKey: ['fuel', 'logs', filters],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cargar registros');
      }
      return res.json();
    },
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener un registro específico
 */
export function useFuelLog(id: string | null) {
  return useQuery<FuelLogWithRelations>({
    queryKey: ['fuel', 'log', id],
    queryFn: async () => {
      if (!id) throw new Error('ID no proporcionado');
      const res = await fetch(`/api/fuel/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cargar registro');
      }
      return res.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook para obtener estadísticas de combustible
 */
export function useFuelStats(filters?: FuelStatsFilters) {
  const queryParams = new URLSearchParams();
  if (filters?.from) queryParams.append('from', filters.from);
  if (filters?.to) queryParams.append('to', filters.to);

  const queryString = queryParams.toString();
  const url = `/api/fuel/stats${queryString ? `?${queryString}` : ''}`;

  return useQuery<FuelStatsResponse>({
    queryKey: ['fuel', 'stats', filters],
    queryFn: async () => {
      const res = await fetch(url);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al cargar estadísticas');
      }
      return res.json();
    },
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para crear un registro de combustible
 */
export function useCreateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFuelLogDTO) => {
      const res = await fetch('/api/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear registro');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['fuel', 'stats'] });
    },
  });
}

/**
 * Hook para actualizar un registro de combustible
 */
export function useUpdateFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateFuelLogDTO> }) => {
      const res = await fetch(`/api/fuel/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al actualizar registro');
      }

      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fuel', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['fuel', 'log', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['fuel', 'stats'] });
    },
  });
}

/**
 * Hook para eliminar un registro de combustible
 */
export function useDeleteFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/fuel/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al eliminar registro');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel', 'logs'] });
      queryClient.invalidateQueries({ queryKey: ['fuel', 'stats'] });
    },
  });
}

/**
 * Hook para actualizar el presupuesto mensual
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { month: string; budgetAmount: number }) => {
      const res = await fetch('/api/fuel/stats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al actualizar presupuesto');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel', 'stats'] });
    },
  });
}
