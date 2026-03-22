"use client";
import React, { useState, useMemo } from "react";
import { useDrivers, useDeleteDriver, Driver } from "@/hooks/useDrivers";
import DriverStatusBadge from "./DriverStatusBadge";
import DriverFormModal from "./DriverFormModal";
import { useModal } from "@/hooks/useModal";
import Button from "../ui/button/Button";

export default function DriversTable() {
  const { data: drivers, isLoading, error } = useDrivers();
  const deleteDriver = useDeleteDriver();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { isOpen, openModal, closeModal } = useModal();

  // Filter drivers
  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];

    return drivers.filter((driver) => {
      // Search filter
      const matchesSearch =
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.attributes?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.attributes?.license?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [drivers, searchTerm]);

  const handleCreate = () => {
    setEditingDriver(null);
    setModalMode("create");
    openModal();
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setModalMode("edit");
    openModal();
  };

  const handleDelete = async (driver: Driver) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar al conductor "${driver.name}" (${driver.uniqueId})?`
    );

    if (confirmed) {
      try {
        await deleteDriver.mutateAsync(driver.id);
      } catch (error) {
        alert("Error al eliminar el conductor");
      }
    }
  };

  // Check if license is expired or expiring soon
  const getLicenseStatus = (licenseExpiry?: string) => {
    if (!licenseExpiry) return null;
    
    const expiryDate = new Date(licenseExpiry);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { text: "Vencida", color: "text-error-600 dark:text-error-400" };
    } else if (daysUntilExpiry < 30) {
      return { text: `Vence en ${daysUntilExpiry} días`, color: "text-warning-600 dark:text-warning-400" };
    }
    return { text: "Vigente", color: "text-success-600 dark:text-success-400" };
  };

  if (error) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-900 dark:bg-error-900/20">
        <p className="text-sm text-error-700 dark:text-error-400">
          Error al cargar los conductores. Por favor, intenta de nuevo.
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
                  placeholder="Buscar por nombre, DNI, email o licencia..."
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
                + Nuevo Conductor
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
          ) : filteredDrivers.length === 0 ? (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {searchTerm
                  ? "No se encontraron conductores"
                  : "No hay conductores registrados"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "Intenta cambiar los filtros de búsqueda"
                  : "Comienza agregando tu primer conductor"}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button size="sm" onClick={handleCreate}>
                    + Agregar Conductor
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Conductor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Email / Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Licencia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredDrivers.map((driver) => {
                  const licenseStatus = getLicenseStatus(driver.attributes?.licenseExpiry);
                  
                  return (
                    <tr
                      key={driver.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/20">
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {driver.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              DNI: {driver.uniqueId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          {driver.attributes?.email && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {driver.attributes.email}
                            </p>
                          )}
                          {driver.attributes?.phone && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {driver.attributes.phone}
                            </p>
                          )}
                          {!driver.attributes?.email && !driver.attributes?.phone && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">-</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {driver.attributes?.license ? (
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {driver.attributes.license}
                            </p>
                            {licenseStatus && (
                              <p className={`text-xs ${licenseStatus.color}`}>
                                {licenseStatus.text}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">-</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <DriverStatusBadge isActive={true} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(driver);
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
                              handleDelete(driver);
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
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <DriverFormModal
        isOpen={isOpen}
        onClose={closeModal}
        driver={editingDriver}
        mode={modalMode}
      />
    </>
  );
}
