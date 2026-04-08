import React from "react";

interface VehicleStatusBadgeProps {
  status: string;
  speed?: number;
  lastUpdate?: string;
}

export default function VehicleStatusBadge({
  status,
  speed = 0,
  lastUpdate,
}: VehicleStatusBadgeProps) {
  // Determine vehicle status
  const getStatus = () => {
    // Confiar completamente en el status que reporta Traccar
    if (status === "offline" || status === "unknown" || !status) {
      return {
        label: "Offline",
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
        dot: "bg-gray-500",
      };
    }

    if (speed > 0) {
      return {
        label: "En movimiento",
        color: "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400",
        dot: "bg-success-500 animate-pulse",
      };
    }

    // Conectado pero detenido
    return {
      label: "Detenido",
      color: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      dot: "bg-blue-500",
    };
  };

  const statusInfo = getStatus();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusInfo.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}></span>
      {statusInfo.label}
    </span>
  );
}
