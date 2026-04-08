import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const TRACCAR_URL = process.env.TRACCAR_URL;

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/vehicles/[id]/assign-driver
// Body: { driverId: string | null }
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession(request);
    if (!session?.traccarToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    const { driverId } = body;

    // Obtener el dispositivo actual de Traccar para conservar sus atributos
    const deviceResponse = await fetch(`${TRACCAR_URL}api/devices/${id}`, {
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!deviceResponse.ok) {
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }

    const device = await deviceResponse.json();

    // Actualizar los atributos del dispositivo con el driverId
    const updatedAttributes = {
      ...device.attributes,
      driverId: driverId || null,
    };

    // Si se desasigna, también eliminar driverName
    if (!driverId) {
      delete updatedAttributes.driverName;
    }

    const updateResponse = await fetch(`${TRACCAR_URL}api/devices/${id}`, {
      method: "PUT",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...device,
        attributes: updatedAttributes,
      }),
    });

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: "Error al actualizar el vehículo en Traccar" },
        { status: updateResponse.status }
      );
    }

    const updatedDevice = await updateResponse.json();
    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error("[VEHICLES] Error assigning driver:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
