import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const TRACCAR_URL = process.env.TRACCAR_URL;

// GET /api/drivers - Listar todos los conductores
export async function GET(request: NextRequest) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session?.traccarToken) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    console.log("[DRIVERS] Fetching drivers from Traccar...");

    // Obtener conductores de Traccar
    const driversResponse = await fetch(`${TRACCAR_URL}api/drivers`, {
      method: "GET",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!driversResponse.ok) {
      console.error("[DRIVERS] Traccar error:", driversResponse.status);
      return NextResponse.json(
        { error: "Error al obtener conductores" },
        { status: driversResponse.status }
      );
    }

    const drivers = await driversResponse.json();
    console.log(`[DRIVERS] Retrieved ${drivers.length} drivers`);

    return NextResponse.json(drivers);
  } catch (error) {
    console.error("[DRIVERS] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/drivers - Crear un nuevo conductor
export async function POST(request: NextRequest) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session?.traccarToken) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("[DRIVERS] Creating driver:", body.name);

    // Crear conductor en Traccar
    const response = await fetch(`${TRACCAR_URL}api/drivers`, {
      method: "POST",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[DRIVERS] Traccar create error:", response.status, errorData);
      return NextResponse.json(
        { error: "Error al crear conductor" },
        { status: response.status }
      );
    }

    const newDriver = await response.json();
    console.log("[DRIVERS] Driver created:", newDriver.id);

    return NextResponse.json(newDriver, { status: 201 });
  } catch (error) {
    console.error("[DRIVERS] Create error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
