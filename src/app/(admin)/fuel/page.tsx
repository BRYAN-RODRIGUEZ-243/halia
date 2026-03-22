"use client";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import FuelTable from "@/components/fuel/FuelTable";
import { useQuery } from "@tanstack/react-query";

export default function FuelPage() {
  // Fetch devices from Traccar
  const { data: devices = [] } = useQuery({
    queryKey: ["devices"],
    queryFn: async () => {
      const res = await fetch("/api/devices");
      if (!res.ok) throw new Error("Error al cargar vehículos");
      return res.json();
    },
  });

  // Fetch drivers from Traccar
  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await fetch("/api/drivers");
      if (!res.ok) throw new Error("Error al cargar conductores");
      return res.json();
    },
  });

  return (
    <>
      <PageBreadCrumb pageTitle="Combustible" />

      <div className="space-y-6">
        <FuelTable devices={devices} drivers={drivers} />
      </div>
    </>
  );
}
