"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import {
  useCreateFuelLog,
  useUpdateFuelLog,
} from "@/hooks/useFuel";
import type { FuelLogWithRelations } from "@/types/fuel";

interface FuelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  fuelLog?: FuelLogWithRelations | null;
  mode: "create" | "edit";
  devices: Array<{ id: number; name: string }>;
  drivers: Array<{ id: string; name: string }>;
}

export default function FuelFormModal({
  isOpen,
  onClose,
  fuelLog,
  mode,
  devices,
  drivers,
}: FuelFormModalProps) {
  const createFuelLog = useCreateFuelLog();
  const updateFuelLog = useUpdateFuelLog();

  const [formData, setFormData] = useState({
    deviceId: "",
    driverId: "",
    liters: "",
    pricePerLiter: "",
    odometer: "",
    station: "",
    fuelType: "regular",
    invoiceNumber: "",
    date: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (fuelLog && mode === "edit") {
      setFormData({
        deviceId: fuelLog.deviceId,
        driverId: fuelLog.driverId || "",
        liters: fuelLog.liters.toString(),
        pricePerLiter: fuelLog.pricePerLiter.toString(),
        odometer: fuelLog.odometer.toString(),
        station: fuelLog.station || "",
        fuelType: fuelLog.fuelType || "regular",
        invoiceNumber: fuelLog.invoiceNumber || "",
        date: new Date(fuelLog.date).toISOString().slice(0, 16),
        notes: fuelLog.notes || "",
      });
    } else {
      // Reset form when creating
      const now = new Date();
      setFormData({
        deviceId: "",
        driverId: "",
        liters: "",
        pricePerLiter: "",
        odometer: "",
        station: "",
        fuelType: "regular",
        invoiceNumber: "",
        date: now.toISOString().slice(0, 16),
        notes: "",
      });
    }
    setErrors({});
  }, [fuelLog, mode, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.deviceId) {
      newErrors.deviceId = "Seleccione un vehículo";
    }

    if (!formData.liters || parseFloat(formData.liters) <= 0) {
      newErrors.liters = "Los litros deben ser mayor a 0";
    }

    if (!formData.pricePerLiter || parseFloat(formData.pricePerLiter) <= 0) {
      newErrors.pricePerLiter = "El precio debe ser mayor a 0";
    }

    if (!formData.odometer || parseFloat(formData.odometer) <= 0) {
      newErrors.odometer = "El odómetro debe ser mayor a 0";
    }

    if (!formData.date) {
      newErrors.date = "La fecha es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const fuelData = {
        deviceId: formData.deviceId,
        driverId: formData.driverId || null,
        liters: parseFloat(formData.liters),
        pricePerLiter: parseFloat(formData.pricePerLiter),
        odometer: parseFloat(formData.odometer),
        station: formData.station || null,
        fuelType: formData.fuelType as "regular" | "super" | "diesel",
        invoiceNumber: formData.invoiceNumber || null,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes || null,
      };

      if (mode === "create") {
        await createFuelLog.mutateAsync(fuelData);
      } else if (fuelLog) {
        await updateFuelLog.mutateAsync({
          id: fuelLog.id,
          data: fuelData,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error saving fuel log:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Error al guardar el registro",
      });
    }
  };

  const isLoading = createFuelLog.isPending || updateFuelLog.isPending;

  const totalCost =
    formData.liters && formData.pricePerLiter
      ? (parseFloat(formData.liters) * parseFloat(formData.pricePerLiter)).toFixed(2)
      : "0.00";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[680px] p-4 sm:p-6">
      <form onSubmit={handleSubmit}>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === "create" ? "Nueva Carga de Combustible" : "Editar Carga"}
        </h4>

        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          {/* Vehículo y Conductor */}
          <div className="col-span-1">
            <Label>
              Vehículo <span className="text-error-500">*</span>
            </Label>
            <select
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              disabled={isLoading}
              className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Seleccionar vehículo</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
            {errors.deviceId && (
              <p className="mt-1 text-xs text-error-500">{errors.deviceId}</p>
            )}
          </div>

          <div className="col-span-1">
            <Label>Conductor (opcional)</Label>
            <select
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              disabled={isLoading}
              className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="">Sin conductor asignado</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>

          {/* Litros y Precio */}
          <div className="col-span-1">
            <Label>
              Litros <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              name="liters"
              placeholder="50.5"
              step={0.01}
              defaultValue={formData.liters}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.liters && (
              <p className="mt-1 text-xs text-error-500">{errors.liters}</p>
            )}
          </div>

          <div className="col-span-1">
            <Label>
              Precio por Litro <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              name="pricePerLiter"
              placeholder="1.50"
              step={0.01}
              defaultValue={formData.pricePerLiter}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.pricePerLiter && (
              <p className="mt-1 text-xs text-error-500">{errors.pricePerLiter}</p>
            )}
          </div>

          {/* Total Cost Display */}
          <div className="col-span-1 sm:col-span-2">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Costo Total: <span className="font-semibold text-gray-900 dark:text-white">${totalCost}</span>
              </p>
            </div>
          </div>

          {/* Odómetro y Fecha */}
          <div className="col-span-1">
            <Label>
              Odómetro (km) <span className="text-error-500">*</span>
            </Label>
            <Input
              type="number"
              name="odometer"
              placeholder="15000"
              step={0.1}
              defaultValue={formData.odometer}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.odometer && (
              <p className="mt-1 text-xs text-error-500">{errors.odometer}</p>
            )}
          </div>

          <div className="col-span-1">
            <Label>
              Fecha y Hora <span className="text-error-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              name="date"
              defaultValue={formData.date}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-error-500">{errors.date}</p>
            )}
          </div>

          {/* Tipo de Combustible y Estación */}
          <div className="col-span-1">
            <Label>Tipo de Combustible</Label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              disabled={isLoading}
              className="h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="regular">Regular</option>
              <option value="super">Super</option>
              <option value="diesel">Diesel</option>
            </select>
          </div>

          <div className="col-span-1">
            <Label>Estación de Servicio</Label>
            <Input
              type="text"
              name="station"
              placeholder="Shell Centro"
              defaultValue={formData.station}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Factura */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Número de Factura</Label>
            <Input
              type="text"
              name="invoiceNumber"
              placeholder="FAC-001234"
              defaultValue={formData.invoiceNumber}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Notas */}
          <div className="col-span-1 sm:col-span-2">
            <Label>Notas</Label>
            <textarea
              name="notes"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary-400"
              rows={2}
              placeholder="Notas adicionales..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Error de submit */}
          {errors.submit && (
            <div className="col-span-1 sm:col-span-2">
              <p className="text-sm text-error-500">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : mode === "create" ? "Crear" : "Actualizar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
