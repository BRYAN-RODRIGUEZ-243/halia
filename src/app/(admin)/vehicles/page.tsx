"use client";
import React from "react";
import { useVehicles } from "@/hooks/useVehicles";
import VehiclesTable from "@/components/vehicles/VehiclesTable";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function VehiclesPage() {
  const { data: vehicles, isLoading } = useVehicles();

  // Calculate KPIs
  const totalVehicles = vehicles?.length || 0;
  const movingVehicles =
    vehicles?.filter((v) => {
      const isOnline =
        v.status === "online" &&
        (!v.lastUpdate ||
          Date.now() - new Date(v.lastUpdate).getTime() <= 10 * 60 * 1000);
      return isOnline && (v.position?.speed || 0) > 0;
    }).length || 0;

  const stoppedVehicles =
    vehicles?.filter((v) => {
      const isOnline =
        v.status === "online" &&
        (!v.lastUpdate ||
          Date.now() - new Date(v.lastUpdate).getTime() <= 10 * 60 * 1000);
      return isOnline && (v.position?.speed || 0) === 0;
    }).length || 0;

  const offlineVehicles =
    vehicles?.filter((v) => {
      const isStale = v.lastUpdate
        ? Date.now() - new Date(v.lastUpdate).getTime() > 10 * 60 * 1000
        : true;
      return v.status === "offline" || isStale;
    }).length || 0;

  return (
    <>
      <PageBreadCrumb pageTitle="Vehículos" />

      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Vehicles */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Vehículos
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></span>
                ) : (
                  totalVehicles
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
              <svg
                className="h-6 w-6 text-brand-600 dark:text-brand-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Moving Vehicles */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                En Movimiento
              </p>
              <p className="mt-2 text-3xl font-semibold text-success-600 dark:text-success-400">
                {isLoading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></span>
                ) : (
                  movingVehicles
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-50 dark:bg-success-900/20">
              <svg
                className="h-6 w-6 text-success-600 dark:text-success-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Stopped Vehicles */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Detenidos
              </p>
              <p className="mt-2 text-3xl font-semibold text-warning-600 dark:text-warning-400">
                {isLoading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></span>
                ) : (
                  stoppedVehicles
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning-50 dark:bg-warning-900/20">
              <svg
                className="h-6 w-6 text-warning-600 dark:text-warning-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Offline Vehicles */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Offline
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-600 dark:text-gray-400">
                {isLoading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></span>
                ) : (
                  offlineVehicles
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-6 w-6 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <VehiclesTable />
    </>
  );
}
