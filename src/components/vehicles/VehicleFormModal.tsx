"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useCreateVehicle, useUpdateVehicle, Vehicle } from "@/hooks/useVehicles";

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  mode: "create" | "edit";
}

export default function VehicleFormModal({
  isOpen,
  onClose,
  vehicle,
  mode,
}: VehicleFormModalProps) {
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const [formData, setFormData] = useState({
    name: "",
    uniqueId: "",
    plate: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (vehicle && mode === "edit") {
      setFormData({
        name: vehicle.name || "",
        uniqueId: vehicle.uniqueId || "",
        plate: vehicle.attributes?.plate || "",
        brand: vehicle.attributes?.brand || "",
        model: vehicle.attributes?.model || "",
        year: vehicle.attributes?.year || "",
        color: vehicle.attributes?.color || "",
        notes: vehicle.attributes?.notes || "",
      });
    } else {
      // Reset form when creating
      setFormData({
        name: "",
        uniqueId: "",
        plate: "",
        brand: "",
        model: "",
        year: "",
        color: "",
        notes: "",
      });
    }
    setErrors({});
  }, [vehicle, mode, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del dispositivo es obligatorio";
    }

    if (!formData.uniqueId.trim()) {
      newErrors.uniqueId = "El identificador único es obligatorio";
    }

    if (!formData.plate.trim()) {
      newErrors.plate = "La placa es obligatoria";
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
      const vehicleData = {
        name: formData.name,
        uniqueId: formData.uniqueId,
        attributes: {
          plate: formData.plate,
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          color: formData.color,
          notes: formData.notes,
        },
      };

      if (mode === "create") {
        await createVehicle.mutateAsync(vehicleData);
      } else if (vehicle) {
        await updateVehicle.mutateAsync({
          id: vehicle.id,
          data: vehicleData,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Error al guardar el vehículo",
      });
    }
  };

  const isLoading = createVehicle.isPending || updateVehicle.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[680px] p-4 sm:p-6">
      <form onSubmit={handleSubmit}>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === "create" ? "Nuevo Vehículo" : "Editar Vehículo"}
        </h4>

        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          {/* Datos Traccar */}
          <div className="col-span-1 sm:col-span-2">
            <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Datos del Dispositivo
            </h5>
          </div>

          <div className="col-span-1">
            <Label>
              Nombre del dispositivo <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              name="name"
              placeholder="GPS Tracker - Vehículo 1"
              defaultValue={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error-500">{errors.name}</p>
            )}
          </div>

          <div className="col-span-1">
            <Label>
              Identificador único (IMEI/ID){" "}
              <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              name="uniqueId"
              placeholder="123456789012345"
              defaultValue={formData.uniqueId}
              onChange={handleChange}
              disabled={isLoading || mode === "edit"}
            />
            {errors.uniqueId && (
              <p className="mt-1 text-xs text-error-500">{errors.uniqueId}</p>
            )}
            {mode === "edit" && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                El identificador no se puede modificar
              </p>
            )}
          </div>

          {/* Datos del Vehículo */}
          <div className="col-span-1 sm:col-span-2 mt-2">
            <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Datos del Vehículo
            </h5>
          </div>

          <div className="col-span-1">
            <Label>
              Placa <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              name="plate"
              placeholder="ABC-123"
              defaultValue={formData.plate}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.plate && (
              <p className="mt-1 text-xs text-error-500">{errors.plate}</p>
            )}
          </div>

          <div className="col-span-1">
            <Label>Marca</Label>
            <Input
              type="text"
              name="brand"
              placeholder="Toyota"
              defaultValue={formData.brand}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-span-1">
            <Label>Modelo</Label>
            <Input
              type="text"
              name="model"
              placeholder="Hilux"
              defaultValue={formData.model}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-span-1">
            <Label>Año</Label>
            <Input
              type="text"
              name="year"
              placeholder="2023"
              defaultValue={formData.year}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-span-1">
            <Label>Color</Label>
            <Input
              type="text"
              name="color"
              placeholder="Blanco"
              defaultValue={formData.color}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Notas</Label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Información adicional del vehículo..."
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-dark dark:border-gray-700 dark:text-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {errors.submit && (
            <div className="col-span-1 sm:col-span-2">
              <p className="text-sm text-error-500">{errors.submit}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onClose()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Guardando..."
              : mode === "create"
                ? "Crear Vehículo"
                : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
