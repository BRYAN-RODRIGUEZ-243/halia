"use client";

import { useEffect, useRef, useState } from "react";
import { useFleetStore } from "@/store/fleetStore";

interface UsePositionsSSEReturn {
  isConnected: boolean;
  reconnectCount: number;
}

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 5000; // 5 segundos

export function usePositionsSSE(): UsePositionsSSEReturn {
  const [reconnectCount, setReconnectCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);

  const { 
    isConnected, 
    setConnected, 
    updatePositions, 
    setDevices 
  } = useFleetStore();

  const connect = () => {
    // Limpiar conexión anterior si existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    console.log("[SSE Hook] Connecting to positions stream...");

    try {
      const eventSource = new EventSource("/api/positions/stream");
      eventSourceRef.current = eventSource;
      
      console.log("[SSE Hook] EventSource created, waiting for connection...");

      // Conexión establecida
      eventSource.onopen = () => {
        console.log("[SSE Hook] ✅ Connected to stream successfully");
        setConnected(true);
        attemptCountRef.current = 0; // Resetear contador de intentos
        setReconnectCount(0);
      };

      // Recibir datos
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Ignorar mensajes de heartbeat y status
          if (data.type === "connected" || data.type === "disconnected") {
            return;
          }

          // Actualizar posiciones si vienen en el payload
          if (data.positions && Array.isArray(data.positions)) {
            updatePositions(data.positions);
          }

          // Actualizar dispositivos si vienen en el payload
          if (data.devices && Array.isArray(data.devices)) {
            setDevices(data.devices);
          }

          // Log de eventos si vienen
          if (data.events && Array.isArray(data.events) && data.events.length > 0) {
            console.log("[SSE Hook] Events received:", data.events.length);
          }
        } catch (error) {
          console.error("[SSE Hook] Error parsing message:", error);
        }
      };

      // Manejar eventos de heartbeat (ignorar)
      eventSource.addEventListener("heartbeat", () => {
        // Heartbeat recibido, conexión activa
      });

      // Manejar eventos de status
      eventSource.addEventListener("status", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[SSE Hook] Status:", data.type);
        } catch {
          // Ignorar errores de parsing
        }
      });

      // Manejar eventos de error
      eventSource.addEventListener("error", (event) => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          console.error("[SSE Hook] Error event:", data.message);
        } catch {
          // Ignorar errores de parsing
        }
      });

      // Error de conexión
      eventSource.onerror = (error) => {
        console.error("[SSE Hook] ❌ Connection error:", error);
        console.error("[SSE Hook] ReadyState:", eventSource.readyState);
        console.error("[SSE Hook] URL:", eventSource.url);
        
        // ReadyState values: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
        const stateNames = ['CONNECTING', 'OPEN', 'CLOSED'];
        console.error("[SSE Hook] State name:", stateNames[eventSource.readyState] || 'UNKNOWN');
        
        setConnected(false);
        eventSource.close();

        // Intentar reconectar si no se ha excedido el límite
        if (attemptCountRef.current < MAX_RECONNECT_ATTEMPTS) {
          attemptCountRef.current++;
          setReconnectCount(attemptCountRef.current);
          
          console.log(
            `[SSE Hook] Reconnecting in ${RECONNECT_DELAY / 1000}s (attempt ${attemptCountRef.current}/${MAX_RECONNECT_ATTEMPTS})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else {
          console.error(
            "[SSE Hook] Max reconnection attempts reached. Please refresh the page."
          );
        }
      };
    } catch (error) {
      console.error("[SSE Hook] Error creating EventSource:", error);
      setConnected(false);
    }
  };

  // Conectar al montar el componente
  useEffect(() => {
    connect();

    // Cleanup al desmontar
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        console.log("[SSE Hook] Closing connection...");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isConnected,
    reconnectCount,
  };
}
