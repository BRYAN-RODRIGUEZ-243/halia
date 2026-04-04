import type { Metadata } from "next";
import { MapView } from "@/components/map/MapView";

export const metadata: Metadata = {
  title: "Dashboard | HALIA - Gestión de Flotas",
  description: "Seguimiento en tiempo real de la flota de vehículos",
};

export default function Home() {
  return <MapView />;
}
