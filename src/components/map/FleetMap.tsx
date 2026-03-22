"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import { useFleetStore } from "@/store/fleetStore";
import { usePositionsSSE } from "@/hooks/usePositionsSSE";
import { VehicleMarker } from "./VehicleMarker";
import { VehicleTrail } from "./VehicleTrail";
import { MapController } from "./MapController";
import "leaflet/dist/leaflet.css";

// Corregir íconos default de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

export function FleetMap() {
  // Iniciar conexión SSE - un solo lugar en toda la app
  const { isConnected } = usePositionsSSE();
  
  const { positions, devices, positionHistory } = useFleetStore();

  // Centro inicial en Honduras (Tegucigalpa)
  const defaultCenter: [number, number] = [14.0818, -87.2068];
  const defaultZoom = 12;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Controlador del mapa (flyTo, fitBounds) */}
      <MapController />

      {/* Rastros de posiciones históricas */}
      {Object.entries(positionHistory).map(([deviceId, history]) => (
        <VehicleTrail
          key={`trail-${deviceId}`}
          history={history}
          deviceId={parseInt(deviceId)}
        />
      ))}

      {/* Marcadores de vehículos */}
      {Object.values(positions).map((position) => {
        const device = devices.find((d) => d.id === position.deviceId);
        if (!device) return null;

        return (
          <VehicleMarker
            key={`marker-${device.id}`}
            position={position}
            device={device}
          />
        );
      })}
    </MapContainer>
  );
}
