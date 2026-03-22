import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

// Variables de entorno
const TRACCAR_URL = process.env.TRACCAR_URL || "";
const TRACCAR_USER = process.env.TRACCAR_USER || "";
const TRACCAR_PASS = process.env.TRACCAR_PASS || "";

/**
 * Endpoint SSE que hace polling a Traccar REST API
 * GET /api/positions/stream
 */
export async function GET(request: NextRequest) {
  console.log("[SSE] ========== New SSE connection request ==========");
  
  try {
    // Verificar que el usuario esté autenticado
    const session = await getSession(request);
    console.log("[SSE] Session check:", session ? "✅ Authenticated" : "❌ Not authenticated");
    
    if (!session) {
      console.log("[SSE] Returning 401 - No session");
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Headers para autenticación con Traccar
    const authHeader = "Basic " + Buffer.from(`${TRACCAR_USER}:${TRACCAR_PASS}`).toString("base64");
    
    // Normalizar URL de Traccar (quitar barra final si existe)
    const traccarBaseUrl = TRACCAR_URL.endsWith('/') ? TRACCAR_URL.slice(0, -1) : TRACCAR_URL;
    
    console.log("[SSE] Traccar URL:", traccarBaseUrl);

    // Crear stream
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController;
    let intervalId: NodeJS.Timeout;
    let heartbeatId: NodeJS.Timeout;
    let isActive = true;

    const stream = new ReadableStream({
      start(ctrl) {
        controller = ctrl;

        // Función helper para enviar datos SSE
        const sendSSE = (data: string, event?: string) => {
          if (!isActive) return;
          
          try {
            const message =
              (event ? `event: ${event}\n` : "") +
              `data: ${data}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (error) {
            console.error("[SSE] Error sending data:", error);
          }
        };

        // Función para obtener posiciones
        const fetchPositions = async () => {
          if (!isActive) return;

          try {
            // Obtener dispositivos
            const devicesResponse = await fetch(`${traccarBaseUrl}/api/devices`, {
              headers: {
                Authorization: authHeader,
              },
            });

            if (!devicesResponse.ok) {
              throw new Error(`Devices API error: ${devicesResponse.status}`);
            }

            const devices = await devicesResponse.json();

            // Obtener posiciones
            const positionsResponse = await fetch(`${traccarBaseUrl}/api/positions`, {
              headers: {
                Authorization: authHeader,
              },
            });

            if (!positionsResponse.ok) {
              throw new Error(`Positions API error: ${positionsResponse.status}`);
            }

            const positions = await positionsResponse.json();

            // Enviar datos al cliente
            sendSSE(
              JSON.stringify({
                devices,
                positions,
              })
            );

            console.log(
              `[SSE] Sent ${devices.length} devices and ${positions.length} positions`
            );
          } catch (error) {
            console.error("[SSE] Error fetching data:", error);
            sendSSE(
              JSON.stringify({
                type: "error",
                message: error instanceof Error ? error.message : "Error fetching data",
              }),
              "error"
            );
          }
        };

        // Enviar conexión exitosa
        console.log("[SSE] Client connected, starting polling");
        sendSSE(JSON.stringify({ type: "connected" }), "status");

        // Primera llamada inmediata
        fetchPositions().catch(err => {
          console.error("[SSE] Initial fetch error:", err);
        });

        // Polling cada 5 segundos
        intervalId = setInterval(fetchPositions, 5000);

        // Heartbeat cada 30 segundos
        heartbeatId = setInterval(() => {
          if (isActive) {
            sendSSE("ping", "heartbeat");
          }
        }, 30000);
      },

      cancel() {
        console.log("[SSE] Stream cancelled");
        isActive = false;
        if (intervalId) {
          clearInterval(intervalId);
        }
        if (heartbeatId) {
          clearInterval(heartbeatId);
        }
      },
    });

    // Cleanup cuando el cliente se desconecta
    request.signal.addEventListener("abort", () => {
      console.log("[SSE] Client disconnected");
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (heartbeatId) {
        clearInterval(heartbeatId);
      }
    });

    // Retornar stream con headers SSE
    console.log("[SSE] Returning stream with SSE headers");
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("[SSE] ❌ Fatal error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
