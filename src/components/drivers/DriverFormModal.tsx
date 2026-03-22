"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useCreateDriver, useUpdateDriver, Driver } from "@/hooks/useDrivers";

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver?: Driver | null;
  mode: "create" | "edit";
}

export default function DriverFormModal({
  isOpen,
  onClose,
  driver,
  mode,
}: DriverFormModalProps) {
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();

  const [formData, setFormData] = useState({
    name: "",
    uniqueId: "",
    email: "",
    phone: "",
    license: "",
    licenseExpiry: "",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (driver && mode === "edit") {
      setFormData({
        name: driver.name || "",
        uniqueId: driver.uniqueId || "",
        email: driver.attributes?.email || "",
        phone: driver.attributes?.phone || "",
        license: driver.attributes?.license || "",
        licenseExpiry: driver.attributes?.licenseExpiry || "",
        address: driver.attributes?.address || "",
        notes: driver.attributes?.notes || "",
      });
    } else {
      // Reset form when creating
      setFormData({
        name: "",
        uniqueId: "",
        email: "",
        phone: "",
        license: "",
        licenseExpiry: "",
        address: "",
        notes: "",
      });
    }
    setErrors({});
  }, [driver, mode, isOpen]);

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
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.uniqueId.trim()) {
      newErrors.uniqueId = "El identificador único es obligatorio";
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
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
      const driverData = {
        name: formData.name,
        uniqueId: formData.uniqueId,
        attributes: {
          email: formData.email,
          phone: formData.phone,
          license: formData.license,
          licenseExpiry: formData.licenseExpiry,
          address: formData.address,
          notes: formData.notes,
        },
      };

      if (mode === "create") {
        await createDriver.mutateAsync(driverData);
      } else if (driver) {
        await updateDriver.mutateAsync({
          id: driver.id,
          data: driverData,
        });
      }

      onClose();
    } catch (error) {
      console.error("Error saving driver:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Error al guardar el conductor",
      });
    }
  };

  const isLoading = createDriver.isPending || updateDriver.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[680px] p-4 sm:p-6">
      <form onSubmit={handleSubmit}>
        <h4 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
          {mode === "create" ? "Nuevo Conductor" : "Editar Conductor"}
        </h4>

        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          {/* Datos Básicos */}
          <div className="col-span-1 sm:col-span-2">
            <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Información Básica
            </h5>
          </div>

          <div className="col-span-1">
            <Label>
              Nombre completo <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              name="name"
              placeholder="Juan Pérez"
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
              Identificador único (DNI/Cédula){" "}
              <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              name="uniqueId"
              placeholder="12345678"
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

          {/* Contacto */}
          <div className="col-span-1 sm:col-span-2 mt-2">
            <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Información de Contacto
            </h5>
          </div>

          <div className="col-span-1">
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="conductor@ejemplo.com"
              defaultValue={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error-500">{errors.email}</p>
            )}
          </div>

          <div className="col-span-1">
            <Label>Teléfono</Label>
            <Input
              type="tel"
              name="phone"
              placeholder="+1 234 567 8900"
              defaultValue={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Dirección</Label>
            <Input
              type="text"
              name="address"
              placeholder="Calle Principal #123, Ciudad"
              defaultValue={formData.address}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {/* Licencia */}
          <div className="col-span-1 sm:col-span-2 mt-2">
            <h5 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Licencia de Conducir
            </h5>
          </div>

          <div className="col-span-1">
            <Label>Número de licencia</Label>
            <Input
              type="text"
              name="license"
              placeholder="A-12345678"
              defaultValue={formData.license}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-span-1">
            <Label>Fecha de vencimiento</Label>
            <Input
              type="date"
              name="licenseExpiry"
              defaultValue={formData.licenseExpiry}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Notas</Label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Información adicional del conductor..."
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
                ? "Crear Conductor"
                : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
