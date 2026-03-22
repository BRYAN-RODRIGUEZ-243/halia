"use client";

export function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-900 dark:bg-gray-950">
      <div className="animate-pulse text-center">
        <div className="mb-4 flex justify-center">
          <svg
            className="h-16 w-16 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
          Cargando mapa...
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Inicializando vista en tiempo real
        </p>
      </div>
    </div>
  );
}
