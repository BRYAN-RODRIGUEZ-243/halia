import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get session to extract Traccar token
    const session = await getSession(request);
    const traccarUrl = process.env.TRACCAR_URL;

    // Try to close Traccar session using the user's token
    if (traccarUrl && session?.traccarToken) {
      try {
        await fetch(`${traccarUrl}/api/session`, {
          method: "DELETE",
          headers: {
            Cookie: `JSESSIONID=${session.traccarToken}`,
          },
        });
        console.log(`[LOGOUT] Traccar session closed for user: ${session.email}`);
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
