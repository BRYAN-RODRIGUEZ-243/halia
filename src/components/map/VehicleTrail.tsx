"use client";

import { Polyline } from "react-leaflet";
import { Position } from "@/store/fleetStore";

interface VehicleTrailProps {
  history: Position[];
  deviceId: number;
}

export function VehicleTrail({ history, deviceId }: VehicleTrailProps) {
  // No renderizar si hay menos de 2 puntos
  if (!history || history.length < 2) {
    return null;
  }

  // Determinar color según el último estado
  const lastPosition = history[history.length - 1];
  const speed = lastPosition.speed || 0;
  const isMoving = speed > 0;
  
  let baseColor = "#6b7280"; // gray (offline)
  
  // Verificar si está online (última actualización hace menos de 10 min)
  const lastUpdate = new Date(lastPosition.serverTime).getTime();
  const now = Date.now();
  const isOnline = (now - lastUpdate) < 10 * 60 * 1000;
  
  if (isOnline) {
    baseColor = isMoving ? "#22c55e" : "#eab308"; // green or yellow
  }

  // Crear segmentos con opacidad decreciente
  // Los más recientes (al final del array) son más opacos
  const segments = [];
  const numSegments = history.length - 1;
  
  for (let i = 0; i < numSegments; i++) {
    const start = history[i];
    const end = history[i + 1];
    
    // Opacidad de 0.1 (más antiguo) a 0.6 (más reciente)
    const opacity = 0.1 + (i / numSegments) * 0.5;
    
    segments.push(
      <Polyline
        key={`${deviceId}-${i}`}
        positions={[
          [start.latitude, start.longitude],
          [end.latitude, end.longitude],
        ]}
        pathOptions={{
          color: baseColor,
          weight: 3,
          opacity: opacity,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
    );
  }

  return <>{segments}</>;
}
