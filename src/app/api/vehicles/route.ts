import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const TRACCAR_URL = process.env.TRACCAR_URL;

// GET /api/vehicles - Listar todos los vehículos
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

    console.log("[VEHICLES] Fetching vehicles from Traccar...");

    // Obtener dispositivos de Traccar
    const devicesResponse = await fetch(`${TRACCAR_URL}api/devices`, {
      method: "GET",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!devicesResponse.ok) {
      console.error("[VEHICLES] Traccar error:", devicesResponse.status);
      return NextResponse.json(
        { error: "Error al obtener vehículos" },
        { status: devicesResponse.status }
      );
    }

    const devices = await devicesResponse.json();
    console.log(`[VEHICLES] Retrieved ${devices.length} vehicles`);

    // Obtener posiciones de Traccar
    const positionsResponse = await fetch(`${TRACCAR_URL}api/positions`, {
      method: "GET",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
    });

    let positions = [];
    if (positionsResponse.ok) {
      positions = await positionsResponse.json();
      console.log(`[VEHICLES] Retrieved ${positions.length} positions`);
    }

    // Mapear dispositivos a vehículos con posiciones
    const vehicles = devices.map((device: any) => {
      const position = positions.find((p: any) => p.deviceId === device.id);
      return {
        ...device,
        position: position || null,
      };
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("[VEHICLES] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Crear un nuevo vehículo
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
    console.log("[VEHICLES] Creating vehicle:", body.name);

    // Crear dispositivo en Traccar
    const response = await fetch(`${TRACCAR_URL}api/devices`, {
      method: "POST",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[VEHICLES] Traccar create error:", response.status, errorData);
      return NextResponse.json(
        { error: "Error al crear vehículo" },
        { status: response.status }
      );
    }

    const newDevice = await response.json();
    console.log("[VEHICLES] Vehicle created:", newDevice.id);

    return NextResponse.json(newDevice, { status: 201 });
  } catch (error) {
    console.error("[VEHICLES] Create error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
