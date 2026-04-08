"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useDrivers } from "@/hooks/useDrivers";
import type { Vehicle } from "@/hooks/useVehicles";

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export default function AssignDriverModal({
  isOpen,
  onClose,
  vehicle,
}: AssignDriverModalProps) {
  const queryClient = useQueryClient();
  const { data: drivers, isLoading: loadingDrivers } = useDrivers();
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Pre-seleccionar el conductor actual si ya tiene uno asignado
  useEffect(() => {
    if (vehicle?.attributes?.driverId) {
      setSelectedDriverId(String(vehicle.attributes.driverId));
    } else {
      setSelectedDriverId("");
    }
    setError("");
  }, [vehicle, isOpen]);

  const assignDriver = useMutation({
    mutationFn: async (driverId: string | null) => {
      const res = await fetch(`/api/vehicles/${vehicle?.id}/assign-driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al asignar conductor");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignDriver.mutate(selectedDriverId || null);
  };

  const handleUnassign = () => {
    assignDriver.mutate(null);
  };

  const currentDriver = drivers?.find(
    (d) => String(d.id) === String(vehicle?.attributes?.driverId)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[480px] p-4 sm:p-6">
      <form onSubmit={handleSubmit}>
        <h4 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
          Asignar Conductor
        </h4>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Vehículo: <span className="font-medium text-gray-700 dark:text-gray-300">{vehicle?.name}</span>
        </p>

        {currentDriver && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Conductor actual:{" "}
              <span className="font-semibold">{currentDriver.name}</span>
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Seleccionar conductor
          </label>
          <select
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
            disabled={loadingDrivers || assignDriver.isPending}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">— Sin conductor —</option>
            {drivers?.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name} ({driver.uniqueId})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mb-3 text-xs text-error-500">{error}</p>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            {currentDriver && (
              <button
                type="button"
                onClick={handleUnassign}
                disabled={assignDriver.isPending}
                className="text-xs text-error-500 hover:text-error-700 dark:text-error-400 disabled:opacity-50"
              >
                Desasignar conductor
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Button size="sm" variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={assignDriver.isPending || loadingDrivers}
            >
              {assignDriver.isPending ? "Guardando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
