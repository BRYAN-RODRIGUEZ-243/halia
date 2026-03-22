"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVehicles, useDeleteVehicle, Vehicle } from "@/hooks/useVehicles";
import VehicleStatusBadge from "./VehicleStatusBadge";
import VehicleFormModal from "./VehicleFormModal";
import { useModal } from "@/hooks/useModal";
import Button from "../ui/button/Button";

export default function VehiclesTable() {
  const router = useRouter();
  const { data: vehicles, isLoading, error } = useVehicles();
  const deleteVehicle = useDeleteVehicle();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "moving" | "stopped" | "offline">("all");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { isOpen, openModal, closeModal } = useModal();

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];

    return vehicles.filter((vehicle) => {
      // Search filter
      const matchesSearch =
        vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.attributes?.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.uniqueId.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === "all") return true;

      const speed = vehicle.position?.speed || 0;
      const lastUpdate = vehicle.lastUpdate;
      const isStale = lastUpdate
        ? Date.now() - new Date(lastUpdate).getTime() > 10 * 60 * 1000
        : true;
      const isOffline = vehicle.status === "offline" || isStale;

      if (statusFilter === "offline") return isOffline;
      if (statusFilter === "moving") return !isOffline && speed > 0;
      if (statusFilter === "stopped") return !isOffline && speed === 0;

      return true;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const handleCreate = () => {
    setEditingVehicle(null);
    setModalMode("create");
    openModal();
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setModalMode("edit");
    openModal();
  };

  const handleDelete = async (vehicle: Vehicle) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el vehículo "${vehicle.name}" (${vehicle.attributes?.plate || vehicle.uniqueId})?`
    );

    if (confirmed) {
      try {
        await deleteVehicle.mutateAsync(vehicle.id);
      } catch (error) {
        alert("Error al eliminar el vehículo");
      }
    }
  };

  const handleRowClick = (vehicleId: number) => {
    router.push(`/vehicles/${vehicleId}`);
  };

  const handleViewOnMap = (e: React.MouseEvent, deviceId: number) => {
    e.stopPropagation();
    router.push(`/map?deviceId=${deviceId}`);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-900 dark:bg-error-900/20">
        <p className="text-sm text-error-700 dark:text-error-400">
          Error al cargar los vehículos. Por favor, intenta de nuevo.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark">
        {/* Header with search and filters */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-800 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, placa o IMEI..."
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
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-dark dark:text-white/90"
              >
                <option value="all">Todos</option>
                <option value="moving">En movimiento</option>
                <option value="stopped">Detenidos</option>
                <option value="offline">Offline</option>
              </select>

              <Button size="sm" onClick={handleCreate}>
                + Nuevo Vehículo
              </Button>
            </div>
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
          ) : filteredVehicles.length === 0 ? (
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
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron vehículos"
                  : "No hay vehículos registrados"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Intenta cambiar los filtros de búsqueda"
                  : "Comienza agregando tu primer vehículo"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <div className="mt-6">
                  <Button size="sm" onClick={handleCreate}>
                    + Agregar Vehículo
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Vehículo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Marca/Modelo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Velocidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Última Conexión
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    onClick={() => handleRowClick(vehicle.id)}
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                          <svg
                            className="h-5 w-5 text-brand-600 dark:text-brand-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {vehicle.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {vehicle.attributes?.plate || vehicle.uniqueId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vehicle.attributes?.brand || "-"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {vehicle.attributes?.model || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <VehicleStatusBadge
                        status={vehicle.status}
                        speed={vehicle.position?.speed}
                        lastUpdate={vehicle.lastUpdate}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vehicle.position?.speed
                          ? `${Math.round(vehicle.position.speed)} km/h`
                          : "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {vehicle.lastUpdate
                          ? new Date(vehicle.lastUpdate).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleViewOnMap(e, vehicle.id)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                          title="Ver en mapa"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(vehicle);
                          }}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-warning-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-warning-400"
                          title="Editar"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(vehicle);
                          }}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-error-400"
                          title="Eliminar"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
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

      <VehicleFormModal
        isOpen={isOpen}
        onClose={closeModal}
        vehicle={editingVehicle}
        mode={modalMode}
      />
    </>
  );
}
