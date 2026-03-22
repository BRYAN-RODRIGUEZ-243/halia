import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const TRACCAR_URL = process.env.TRACCAR_URL;

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/drivers/[id] - Obtener un conductor específico
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

    console.log(`[DRIVERS] Fetching driver ${id} from Traccar...`);

    // Obtener conductor de Traccar
    const driverResponse = await fetch(`${TRACCAR_URL}api/drivers/${id}`, {
      method: "GET",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!driverResponse.ok) {
      console.error(`[DRIVERS] Traccar error for driver ${id}:`, driverResponse.status);
      return NextResponse.json(
        { error: "Conductor no encontrado" },
        { status: driverResponse.status }
      );
    }

    const driver = await driverResponse.json();

    console.log(`[DRIVERS] Driver ${id} retrieved successfully`);
    return NextResponse.json(driver);
  } catch (error) {
    console.error(`[DRIVERS] Error fetching driver:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/drivers/[id] - Actualizar un conductor
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

    console.log(`[DRIVERS] Updating driver ${id}:`, body.name);

    // Actualizar conductor en Traccar
    const response = await fetch(`${TRACCAR_URL}api/drivers/${id}`, {
      method: "PUT",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, id: parseInt(id) }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[DRIVERS] Traccar update error for driver ${id}:`, response.status, errorData);
      return NextResponse.json(
        { error: "Error al actualizar conductor" },
        { status: response.status }
      );
    }

    const updatedDriver = await response.json();
    console.log(`[DRIVERS] Driver ${id} updated successfully`);

    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error(`[DRIVERS] Update error:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE /api/drivers/[id] - Eliminar un conductor
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

    console.log(`[DRIVERS] Deleting driver ${id}...`);

    // Eliminar conductor en Traccar
    const response = await fetch(`${TRACCAR_URL}api/drivers/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: `JSESSIONID=${session.traccarToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[DRIVERS] Traccar delete error for driver ${id}:`, response.status, errorData);
      return NextResponse.json(
        { error: "Error al eliminar conductor" },
        { status: response.status }
      );
    }

    console.log(`[DRIVERS] Driver ${id} deleted successfully`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DRIVERS] Delete error:`, error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
