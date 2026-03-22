"use client";

import { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import { useRouter } from "next/navigation";
import L from "leaflet";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Position, Device, useFleetStore } from "@/store/fleetStore";

interface VehicleMarkerProps {
  position: Position;
  device: Device;
}

export function VehicleMarker({ position, device }: VehicleMarkerProps) {
  const router = useRouter();
  const { selectedDeviceId, selectDevice } = useFleetStore();

  const isSelected = selectedDeviceId === device.id;
  const speed = position.speed || 0;
  const isMoving = speed > 0;
  
  // Verificar si está online (última actualización hace menos de 10 min)
  const lastUpdate = new Date(position.serverTime).getTime();
  const now = Date.now();
  const isOnline = (now - lastUpdate) < 10 * 60 * 1000;
  
  // Determinar color
  let color = "#6b7280"; // gris (offline)
  if (isOnline) {
    color = isMoving ? "#22c55e" : "#eab308"; // verde (moving) o amarillo (stopped)
  }

  // Crear ícono personalizado con useMemo
  const icon = useMemo(() => {
    const course = position.course || 0;
    
    // SVG de flecha rotada según el rumbo
    const arrowSvg = `
      <div style="position: relative; width: 40px; height: 40px;">
        ${isSelected ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            border: 3px solid ${color};
            border-radius: 50%;
            opacity: 0.8;
          "></div>
        ` : ''}
        ${isMoving ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            border: 2px solid ${color};
            border-radius: 50%;
            opacity: 0.4;
            animation: pulse 2s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
              50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.1; }
            }
          </style>
        ` : ''}
        <svg 
          width="40" 
          height="40" 
          viewBox="0 0 40 40" 
          style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(${course}deg);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          "
        >
          <path
            d="M20 5 L28 30 L20 26 L12 30 Z"
            fill="${color}"
            stroke="white"
            stroke-width="2"
          />
        </svg>
      </div>
    `;

    return L.divIcon({
      html: arrowSvg,
      className: "vehicle-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  }, [position.course, color, isMoving, isSelected]);

  // Formatear tiempo de última actualización
  const lastUpdateText = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(position.serverTime), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return "Desconocido";
    }
  }, [position.serverTime]);

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          selectDevice(device.id);
        },
      }}
    >
      <Popup>
        <div className="min-w-[250px]">
          {/* Encabezado */}
          <div className="mb-3 border-b pb-2">
            <h3 className="text-lg font-bold text-gray-900">
              {device.name}
            </h3>
            {device.attributes?.plate && (
              <p className="text-sm text-gray-600">
                Placa: {device.attributes.plate}
              </p>
            )}
          </div>

          {/* Información de velocidad y estado */}
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Velocidad:</span>
              <span className="text-lg font-semibold text-gray-900">
                {Math.round(speed)} km/h
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  isMoving
                    ? "bg-green-100 text-green-800"
                    : isOnline
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {isMoving ? "En movimiento" : isOnline ? "Detenido" : "Sin señal"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actualizado:</span>
              <span className="text-xs text-gray-500">{lastUpdateText}</span>
            </div>
          </div>

          {/* Dirección si está disponible */}
          {position.address && (
            <div className="mb-3 rounded bg-gray-50 p-2">
              <span className="text-xs font-medium text-gray-600">Ubicación:</span>
              <p className="mt-1 text-xs text-gray-700">{position.address}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={() => selectDevice(device.id)}
              className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Seleccionar
            </button>
            <button
              onClick={() => router.push(`/vehicles/${device.id}`)}
              className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
