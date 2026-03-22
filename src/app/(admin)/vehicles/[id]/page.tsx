"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useVehicle } from "@/hooks/useVehicles";
import VehicleStatusBadge from "@/components/vehicles/VehicleStatusBadge";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const { data: vehicle, isLoading, error } = useVehicle(vehicleId);

  if (isLoading) {
    return (
      <>
        <PageBreadCrumb
          pageTitle="Vehículo"
        />
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            <div className="h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !vehicle) {
    return (
      <>
        <PageBreadCrumb
          pageTitle="Vehículo"
        />
        <div className="rounded-lg border border-error-200 bg-error-50 p-8 text-center dark:border-error-900 dark:bg-error-900/20">
          <svg
            className="mx-auto h-12 w-12 text-error-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-error-900 dark:text-error-100">
            No se pudo cargar el vehículo
          </h3>
          <p className="mt-2 text-sm text-error-700 dark:text-error-300">
            El vehículo no existe o hubo un error al cargar los datos.
          </p>
          <div className="mt-6">
            <Button size="sm" onClick={() => router.push("/vehicles")}>
              Volver a Vehículos
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadCrumb
        pageTitle={vehicle.name}
      />

      {/* Header Card */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
              <svg
                className="h-8 w-8 text-brand-600 dark:text-brand-400"
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
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {vehicle.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {vehicle.attributes?.plate || vehicle.uniqueId}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <VehicleStatusBadge
              status={vehicle.status}
              speed={vehicle.position?.speed}
              lastUpdate={vehicle.lastUpdate}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/map?deviceId=${vehicle.id}`)}
            >
              Ver en Mapa
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Vehicle Information */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Información del Vehículo
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Placa
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle.attributes?.plate || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Marca
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle.attributes?.brand || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Modelo
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle.attributes?.model || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Año</p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle.attributes?.year || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Color
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle.attributes?.color || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  IMEI/ID
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle.uniqueId}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Última Conexión
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {vehicle.lastUpdate
                    ? new Date(vehicle.lastUpdate).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "-"}
                </p>
              </div>
            </div>

            {vehicle.attributes?.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notas
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {vehicle.attributes.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Position Information */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Posición Actual
            </h2>
            {vehicle.position ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Velocidad
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                    {Math.round(vehicle.position.speed)} km/h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Coordenadas
                  </p>
                  <p className="mt-1 text-sm font-mono text-gray-700 dark:text-gray-300">
                    {vehicle.position.latitude.toFixed(6)},{" "}
                    {vehicle.position.longitude.toFixed(6)}
                  </p>
                </div>
                {vehicle.position.address && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Dirección
                    </p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {vehicle.position.address}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ignición
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                    {vehicle.position.attributes?.ignition ? (
                      <span className="text-success-600 dark:text-success-400">
                        Encendido
                      </span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">
                        Apagado
                      </span>
                    )}
                  </p>
                </div>
                {vehicle.position.course !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Rumbo
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                      {Math.round(vehicle.position.course)}°
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay datos de posición disponibles
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-6">
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/vehicles")}
        >
          ← Volver a Vehículos
        </Button>
      </div>
    </>
  );
}
