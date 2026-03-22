import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const TRACCAR_URL = process.env.TRACCAR_URL;

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/vehicles/[id] - Obtener un vehículo específico
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session?.traccarToken) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;

    console.log(`[VEHICLES] Fetching vehicle ${id} from Traccar...`);

    // Obtener dispositivo de Traccar
    const deviceResponse = await fetch(`${TRACCAR_URL}api/devices/${id}`, {
      method: "GET",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!deviceResponse.ok) {
      console.error(`[VEHICLES] Traccar error for vehicle ${id}:`, deviceResponse.status);
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: deviceResponse.status }
      );
    }

    const device = await deviceResponse.json();

    // Obtener posición actual si existe
    let position = null;
    if (device.positionId) {
      const positionResponse = await fetch(
        `${TRACCAR_URL}api/positions?id=${device.positionId}`,
        {
          method: "GET",
          headers: {
            Cookie: `JSESSIONID=${session.traccarToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (positionResponse.ok) {
        const positions = await positionResponse.json();
        position = positions.length > 0 ? positions[0] : null;
      }
    }

    const vehicle = {
      ...device,
      position,
    };

    console.log(`[VEHICLES] Vehicle ${id} retrieved successfully`);
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error(`[VEHICLES] Error fetching vehicle:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/vehicles/[id] - Actualizar un vehículo
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session?.traccarToken) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    console.log(`[VEHICLES] Updating vehicle ${id}:`, body.name);

    // Actualizar dispositivo en Traccar
    const response = await fetch(`${TRACCAR_URL}api/devices/${id}`, {
      method: "PUT",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, id: parseInt(id) }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[VEHICLES] Traccar update error for vehicle ${id}:`, response.status, errorData);
      return NextResponse.json(
        { error: "Error al actualizar vehículo" },
        { status: response.status }
      );
    }

    const updatedDevice = await response.json();
    console.log(`[VEHICLES] Vehicle ${id} updated successfully`);

    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error(`[VEHICLES] Update error:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/vehicles/[id] - Eliminar un vehículo
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Verificar sesión
    const session = await getSession(request);
    if (!session?.traccarToken) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id } = params;

    console.log(`[VEHICLES] Deleting vehicle ${id}...`);

    // Eliminar dispositivo en Traccar
    const response = await fetch(`${TRACCAR_URL}api/devices/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[VEHICLES] Traccar delete error for vehicle ${id}:`, response.status, errorData);
      return NextResponse.json(
        { error: "Error al eliminar vehículo" },
        { status: response.status }
      );
    }

    console.log(`[VEHICLES] Vehicle ${id} deleted successfully`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[VEHICLES] Delete error:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
