import React from "react";

interface DriverStatusBadgeProps {
  isActive: boolean;
}

export default function DriverStatusBadge({ isActive }: DriverStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}
