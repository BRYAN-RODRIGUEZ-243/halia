"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useFleetStore } from "@/store/fleetStore";
import L from "leaflet";

export function MapController() {
  const map = useMap();
  const { selectedDeviceId, positions } = useFleetStore();
  const hasInitialFit = useRef(false);

  // Ajustar vista inicial cuando se cargan los vehículos por primera vez
  useEffect(() => {
    const positionArray = Object.values(positions);
    
    if (positionArray.length > 0 && !hasInitialFit.current) {
      const bounds = L.latLngBounds(
        positionArray.map((pos) => [pos.latitude, pos.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      hasInitialFit.current = true;
    }
  }, [positions, map]);

  // Animar el mapa cuando se selecciona un vehículo
  useEffect(() => {
    if (selectedDeviceId !== null && positions[selectedDeviceId]) {
      const position = positions[selectedDeviceId];
      map.flyTo(
        [position.latitude, position.longitude],
        16,
        { duration: 1.2 }
      );
    }
  }, [selectedDeviceId, positions, map]);

  return null;
}
