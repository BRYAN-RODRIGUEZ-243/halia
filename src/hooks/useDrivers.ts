"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Driver {
  id: number;
  name: string;
  uniqueId: string;
  attributes?: {
    email?: string;
    phone?: string;
    license?: string;
    licenseExpiry?: string;
    address?: string;
    notes?: string;
  };
}

export interface DriverFormData {
  name: string;
  uniqueId: string;
  attributes?: {
    email?: string;
    phone?: string;
    license?: string;
    licenseExpiry?: string;
    address?: string;
    notes?: string;
  };
}

/**
 * Hook to fetch all drivers
 */
export function useDrivers() {
  return useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const response = await fetch("/api/drivers");
      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });
}

/**
 * Hook to fetch a single driver by ID
 */
export function useDriver(id: number | string) {
  return useQuery<Driver>({
    queryKey: ["drivers", id],
    queryFn: async () => {
      const response = await fetch(`/api/drivers/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch driver");
      }
      return response.json();
    },
    enabled: !!id, // Only fetch if ID is provided
  });
}

/**
 * Hook to create a new driver
 */
export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DriverFormData) => {
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create driver");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch drivers list
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

/**
 * Hook to update a driver
 */
export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DriverFormData> }) => {
      const response = await fetch(`/api/drivers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update driver");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific driver
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", variables.id] });
    },
  });
}

/**
 * Hook to delete a driver
 */
export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/drivers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete driver");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate drivers list
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}
