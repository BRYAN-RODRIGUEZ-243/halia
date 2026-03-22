import type { Metadata } from "next";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DriversTable from "@/components/drivers/DriversTable";

export const metadata: Metadata = {
  title: "Conductores | HALIA - Gestión de Flotas",
  description: "Gestión de conductores de la flota",
};

export default function DriversPage() {
  return (
    <>
      <PageBreadCrumb pageTitle="Conductores" />

      <div className="space-y-6">
        <DriversTable />
      </div>
    </>
  );
}
