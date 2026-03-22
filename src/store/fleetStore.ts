import { create } from "zustand";

export interface Position {
  id: number;
  deviceId: number;
  protocol: string;
  deviceTime: string;
  fixTime: string;
  serverTime: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  address?: string;
  accuracy: number;
  network?: any;
  attributes: {
    ignition?: boolean;
    motion?: boolean;
    batteryLevel?: number;
    [key: string]: any;
  };
}

export interface Device {
  id: number;
  name: string;
  uniqueId: string;
  status: string;
  lastUpdate: string;
  positionId?: number;
  groupId?: number;
  phone?: string;
  model?: string;
  contact?: string;
  category?: string;
  disabled?: boolean;
  attributes?: {
    plate?: string;
    brand?: string;
    model?: string;
    year?: string;
    color?: string;
    driverId?: number;
    driverName?: string;
    notes?: string;
    [key: string]: any;
  };
}

interface FleetStore {
  // Estado
  positions: Record<number, Position>; // deviceId → Position
  devices: Device[];
  selectedDeviceId: number | null;
  isConnected: boolean;
  positionHistory: Record<number, Position[]>; // últimos 10 puntos por device
  
  // Acciones
  setDevices: (devices: Device[]) => void;
  updatePositions: (positions: Position[]) => void;
  selectDevice: (id: number | null) => void;
  setConnected: (connected: boolean) => void;
  clearHistory: () => void;
}

// Cargar selectedDeviceId de sessionStorage
const loadSelectedDevice = (): number | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem("halia-selected-device");
    return saved ? parseInt(saved) : null;
  } catch {
    return null;
  }
};

// Guardar selectedDeviceId en sessionStorage
const saveSelectedDevice = (id: number | null) => {
  if (typeof window === "undefined") return;
  try {
    if (id === null) {
      sessionStorage.removeItem("halia-selected-device");
    } else {
      sessionStorage.setItem("halia-selected-device", id.toString());
    }
  } catch {
    // Ignorar errores de storage
  }
};

export const useFleetStore = create<FleetStore>((set) => ({
  // Estado inicial
  positions: {},
  devices: [],
  selectedDeviceId: loadSelectedDevice(),
  isConnected: false,
  positionHistory: {},

  // Establecer dispositivos
  setDevices: (devices) => set({ devices }),

  // Actualizar posiciones (merge, no reemplazar)
  updatePositions: (newPositions) =>
    set((state) => {
      const positions = { ...state.positions };
      const positionHistory = { ...state.positionHistory };

      newPositions.forEach((pos) => {
        // Actualizar posición actual
        positions[pos.deviceId] = pos;

        // Actualizar historial (mantener últimos 10 puntos)
        if (!positionHistory[pos.deviceId]) {
          positionHistory[pos.deviceId] = [];
        }

        const history = positionHistory[pos.deviceId];
        history.push(pos);

        // Mantener solo los últimos 10 puntos
        if (history.length > 10) {
          history.shift();
        }
      });

      return { positions, positionHistory };
    }),

  // Seleccionar dispositivo
  selectDevice: (id) => {
    saveSelectedDevice(id);
    set({ selectedDeviceId: id });
  },

  // Establecer estado de conexión
  setConnected: (connected) => set({ isConnected: connected }),

  // Limpiar historial
  clearHistory: () => set({ positionHistory: {} }),
}));
