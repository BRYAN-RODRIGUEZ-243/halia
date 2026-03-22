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
    // Check if offline based on status or last update time
    const isOffline = status === "offline" || isStale(lastUpdate);

    if (isOffline) {
      return {
        label: "Offline",
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
        dot: "bg-gray-500",
      };
    }

    // Online status - check movement
    if (speed > 0) {
      return {
        label: "En movimiento",
        color: "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400",
        dot: "bg-success-500",
      };
    }

    // Online but stopped
    return {
      label: "Detenido",
      color: "bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400",
      dot: "bg-warning-500",
    };
  };

  // Check if last update is older than 10 minutes
  const isStale = (lastUpdate?: string) => {
    if (!lastUpdate) return true;
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    return now - lastUpdateTime > tenMinutes;
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
