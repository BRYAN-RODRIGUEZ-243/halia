"use client";

import { VehicleSidePanel } from "./VehicleSidePanel";
import { MapSkeleton } from "./MapSkeleton";
import dynamic from "next/dynamic";

// Cargar el mapa solo en el cliente (Leaflet no soporta SSR)
const ClientOnlyMap = dynamic(
  () => import("./FleetMap").then((mod) => ({ default: mod.FleetMap })),
  { 
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export function MapView() {
  return (
    <div className="flex h-[calc(100vh-80px)] w-full">
      {/* Panel lateral izquierdo */}
      <VehicleSidePanel />

      {/* Mapa */}
      <div className="flex-1">
        <ClientOnlyMap />
      </div>
    </div>
  );
}
