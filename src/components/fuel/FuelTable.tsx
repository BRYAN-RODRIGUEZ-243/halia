"use client";
import React, { useState, useMemo } from "react";
import { useFuelLogs, useDeleteFuelLog } from "@/hooks/useFuel";
import FuelFormModal from "./FuelFormModal";
import { useModal } from "@/hooks/useModal";
import Button from "../ui/button/Button";
import type { FuelLogWithRelations } from "@/types/fuel";

interface FuelTableProps {
  devices: Array<{ id: number; name: string }>;
  drivers: Array<{ id: string; name: string }>;
}

export default function FuelTable({ devices, drivers }: FuelTableProps) {
  const [filters, setFilters] = useState({
    deviceId: "",
    driverId: "",
    fuelType: "",
    from: "",
    to: "",
  });

  const { data, isLoading, error } = useFuelLogs(
    Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) acc[key as keyof typeof filters] = value;
      return acc;
    }, {} as any)
  );

  const deleteFuelLog = useDeleteFuelLog();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingLog, setEditingLog] = useState<FuelLogWithRelations | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { isOpen, openModal, closeModal } = useModal();

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];

    return data.logs.filter((log) => {
      // Search filter
      const matchesSearch =
        log.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.station?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [data?.logs, searchTerm]);

  const handleCreate = () => {
    setEditingLog(null);
    setModalMode("create");
    openModal();
  };

  const handleEdit = (log: FuelLogWithRelations) => {
    setEditingLog(log);
    setModalMode("edit");
    openModal();
  };

  const handleDelete = async (log: FuelLogWithRelations) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar este registro de combustible?`
    );

    if (confirmed) {
      try {
        await deleteFuelLog.mutateAsync(log.id);
      } catch (error) {
        alert("Error al eliminar el registro");
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFuelTypeBadge = (type: string) => {
    const badges = {
      regular: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      super: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      diesel: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    };
    return badges[type as keyof typeof badges] || badges.regular;
  };

  if (error) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-900 dark:bg-error-900/20">
        <p className="text-sm text-error-700 dark:text-error-400">
          Error al cargar los registros de combustible. Por favor, intenta de nuevo.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark">
        {/* Header with search and filters */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-800 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Search and Create Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por vehículo, conductor, estación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-dark dark:text-white/90"
                  />
                  <svg
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleCreate}>
                  + Nueva Carga
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              <select
                value={filters.deviceId}
                onChange={(e) => setFilters({ ...filters, deviceId: e.target.value })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Todos los vehículos</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.driverId}
                onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Todos los conductores</option>
                <option value="null">Sin conductor</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.fuelType}
                onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Todos los tipos</option>
                <option value="regular">Regular</option>
                <option value="super">Super</option>
                <option value="diesel">Diesel</option>
              </select>

              {filters.deviceId || filters.driverId || filters.fuelType ? (
                <button
                  onClick={() => setFilters({ deviceId: "", driverId: "", fuelType: "", from: "", to: "" })}
                  className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>

            {/* Stats Summary */}
            {data?.stats && (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Litros</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {data.stats.totalLiters.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Costo</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${data.stats.totalCost.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Precio Promedio</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${data.stats.avgPricePerLiter.toFixed(2)}/L
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Registros</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {data.logs.length}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
                  ></div>
                ))}
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || filters.deviceId || filters.driverId || filters.fuelType
                  ? "No se encontraron registros con los filtros aplicados"
                  : "No hay registros de combustible. Crea el primero."}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Vehículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Conductor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Litros
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Costo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Odómetro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white/90">
                      {formatDate(log.date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900 dark:text-white/90">
                        {log.vehicleName}
                      </div>
                      {log.station && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {log.station}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {log.driverName || (
                        <span className="text-gray-400 dark:text-gray-500">Sin asignar</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white/90">
                      {log.liters.toFixed(2)} L
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getFuelTypeBadge(
                          log.fuelType
                        )}`}
                      >
                        {log.fuelType.charAt(0).toUpperCase() + log.fuelType.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900 dark:text-white/90">
                        ${log.totalCost.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${log.pricePerLiter.toFixed(2)}/L
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {log.odometer.toFixed(1)} km
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="text-brand-600 hover:text-brand-700 dark:text-brand-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(log)}
                          className="text-error-600 hover:text-error-700 dark:text-error-400"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <FuelFormModal
        isOpen={isOpen}
        onClose={closeModal}
        fuelLog={editingLog}
        mode={modalMode}
        devices={devices}
        drivers={drivers}
      />
    </>
  );
}
