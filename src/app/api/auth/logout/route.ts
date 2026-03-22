import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get Traccar configuration from environment
    const traccarUrl = process.env.TRACCAR_URL;

    // Try to close Traccar session (best effort, don't fail if it doesn't work)
    if (traccarUrl) {
      try {
        await fetch(`${traccarUrl}/api/session`, {
          method: "DELETE",
        });
      } catch (error) {
        // Ignore errors from Traccar logout
        console.warn("Could not logout from Traccar:", error);
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
    });

    // Clear session cookie
    clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    
    // Even if there's an error, try to clear the cookie
    const response = NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
    
    clearSessionCookie(response);
    
    return response;
  }
}
