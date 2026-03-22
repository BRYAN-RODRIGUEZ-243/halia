"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Vehicle {
  id: number;
  name: string;
  uniqueId: string;
  status: string;
  lastUpdate: string;
  positionId?: number;
  groupId?: number;
  phone?: string;
  model?: string;
  contact?: string;
  category?: string;
  disabled?: boolean;
  attributes?: {
    plate?: string;
    brand?: string;
    model?: string;
    year?: string;
    color?: string;
    driverId?: number;
    driverName?: string;
    notes?: string;
  };
  position?: {
    id: number;
    deviceId: number;
    protocol: string;
    deviceTime: string;
    fixTime: string;
    serverTime: string;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    course: number;
    address?: string;
    accuracy: number;
    network?: any;
    attributes: {
      ignition?: boolean;
      motion?: boolean;
      [key: string]: any;
    };
  };
}

export interface VehicleFormData {
  name: string;
  uniqueId: string;
  attributes?: {
    plate?: string;
    brand?: string;
    model?: string;
    year?: string;
    color?: string;
    driverId?: number;
    notes?: string;
  };
}

/**
 * Hook to fetch all vehicles
 */
export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const response = await fetch("/api/vehicles");
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

/**
 * Hook to fetch a single vehicle by ID
 */
export function useVehicle(id: number | string) {
  return useQuery<Vehicle>({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch vehicle");
      }
      return response.json();
    },
    enabled: !!id, // Only fetch if ID is provided
  });
}

/**
 * Hook to create a new vehicle
 */
export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create vehicle");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch vehicles list
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

/**
 * Hook to update a vehicle
 */
export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<VehicleFormData> }) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update vehicle");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific vehicle and vehicles list
      queryClient.invalidateQueries({ queryKey: ["vehicles", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

/**
 * Hook to delete a vehicle
 */
export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete vehicle");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate vehicles list
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}
