import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Obtiene la información del usuario actual desde la sesión
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Retornar información del usuario desde la sesión
    return NextResponse.json({
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      isAdmin: session.isAdmin || false,
    });
  } catch (error) {
    console.error("[AUTH ME] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
