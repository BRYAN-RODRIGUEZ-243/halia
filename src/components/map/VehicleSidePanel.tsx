"use client";

import { useState, useMemo } from "react";
import { useFleetStore } from "@/store/fleetStore";
import VehicleStatusBadge from "@/components/vehicles/VehicleStatusBadge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type FilterStatus = "all" | "moving" | "stopped" | "offline";

export function VehicleSidePanel() {
  const { devices, positions, isConnected, selectedDeviceId, selectDevice } = useFleetStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Combinar devices con sus posiciones y calcular estado
  const vehiclesWithStatus = useMemo(() => {
    return devices.map((device) => {
      const position = positions[device.id];
      const lastUpdate = position
        ? new Date(position.serverTime).getTime()
        : device.lastUpdate
        ? new Date(device.lastUpdate).getTime()
        : 0;
      const now = Date.now();
      const isOnline = (now - lastUpdate) < 10 * 60 * 1000; // 10 minutos
      const speed = position?.speed || 0;

      let status: "moving" | "stopped" | "offline";
      if (!isOnline) {
        status = "offline";
      } else if (speed > 0) {
        status = "moving";
      } else {
        status = "stopped";
      }

      return {
        device,
        position,
        status,
        speed,
        lastUpdate,
        isOnline,
      };
    });
  }, [devices, positions]);

  // Filtrar vehículos según búsqueda y estado
  const filteredVehicles = useMemo(() => {
    let filtered = vehiclesWithStatus;

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.device.name.toLowerCase().includes(query) ||
          v.device.attributes?.plate?.toLowerCase().includes(query) ||
          v.device.uniqueId.toLowerCase().includes(query)
      );
    }

    // Filtro por estado
    if (filterStatus !== "all") {
      filtered = filtered.filter((v) => v.status === filterStatus);
    }

    // Ordenar: seleccionado primero, luego por nombre
    return filtered.sort((a, b) => {
      if (a.device.id === selectedDeviceId) return -1;
      if (b.device.id === selectedDeviceId) return 1;
      return a.device.name.localeCompare(b.device.name);
    });
  }, [vehiclesWithStatus, searchQuery, filterStatus, selectedDeviceId]);

  // Contar vehículos por estado
  const counts = useMemo(() => {
    return vehiclesWithStatus.reduce(
      (acc, v) => {
        acc[v.status]++;
        return acc;
      },
      { moving: 0, stopped: 0, offline: 0 }
    );
  }, [vehiclesWithStatus]);

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Flota en vivo
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected
                  ? "bg-green-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isConnected ? "Conectado" : "Reconectando..."}
            </span>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o placa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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

        {/* Filtros de estado */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Todos ({vehiclesWithStatus.length})
          </button>
          <button
            onClick={() => setFilterStatus("moving")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === "moving"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            En movimiento ({counts.moving})
          </button>
          <button
            onClick={() => setFilterStatus("stopped")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === "stopped"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Detenidos ({counts.stopped})
          </button>
          <button
            onClick={() => setFilterStatus("offline")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === "offline"
                ? "bg-gray-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            Sin señal ({counts.offline})
          </button>
        </div>
      </div>

      {/* Lista de vehículos */}
      <div className="flex-1 overflow-y-auto">
        {filteredVehicles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <svg
              className="mb-3 h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              No se encontraron vehículos
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Intenta con otro término de búsqueda"
                : "No hay vehículos con este estado"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {filteredVehicles.map(({ device, position, status, speed, lastUpdate }) => {
              const isSelected = device.id === selectedDeviceId;
              const timeAgo = lastUpdate
                ? formatDistanceToNow(new Date(lastUpdate), {
                    addSuffix: true,
                    locale: es,
                  })
                : "Desconocido";

              // Color del borde según estado
              const borderColor =
                status === "moving"
                  ? "border-green-500"
                  : status === "stopped"
                  ? "border-yellow-500"
                  : "border-gray-400";

              return (
                <button
                  key={device.id}
                  onClick={() => selectDevice(device.id)}
                  className={`w-full rounded-lg border-l-4 p-3 text-left transition-all ${borderColor} ${
                    isSelected
                      ? "bg-blue-50 shadow-md dark:bg-blue-900/20"
                      : "bg-white hover:bg-gray-50 dark:bg-gray-750 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5 text-gray-600 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {device.name}
                        </h3>
                      </div>
                      {device.attributes?.plate && (
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {device.attributes.plate}
                        </p>
                      )}
                    </div>
                    <VehicleStatusBadge
                      status={status}
                      speed={speed}
                      lastUpdate={new Date(lastUpdate).toISOString()}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    {status === "moving" && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium">
                          {Math.round(speed)} km/h
                        </span>
                      </div>
                    )}
                    <span className="text-gray-500 dark:text-gray-400">
                      {timeAgo}
                    </span>
                  </div>

                  {position?.address && (
                    <p className="mt-2 truncate text-xs text-gray-600 dark:text-gray-400">
                      📍 {position.address}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
