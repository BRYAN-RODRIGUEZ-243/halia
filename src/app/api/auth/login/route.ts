import { NextRequest, NextResponse } from "next/server";
import { signJWT, setSessionCookie } from "@/lib/auth";

// Traccar User response type (complete fields from Traccar API)
interface TraccarUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  readonly?: boolean;
  administrator?: boolean;
  map?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  password?: string;
  token?: string;
  expirationTime?: string;
  deviceLimit?: number;
  userLimit?: number;
  disabled?: boolean;
  deviceReadonly?: boolean;
  limitCommands?: boolean;
  poiLayer?: string;
  attributes?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestBody = await request.json();
    const { email, password } = requestBody;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Get Traccar configuration from environment
    const traccarUrl = process.env.TRACCAR_URL;
    if (!traccarUrl) {
      return NextResponse.json(
        { error: "Configuración del servidor no disponible" },
        { status: 500 }
      );
    }

    // In development, allow self-signed certificates
    if (process.env.NODE_ENV === "development") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    // Prepare form data for Traccar (application/x-www-form-urlencoded)
    const body = new URLSearchParams({ email, password }).toString();

    console.log("[LOGIN] Attempting login to Traccar:", traccarUrl);
    console.log("[LOGIN] Email:", email);

    // Call Traccar API
    const traccarResponse = await fetch(`${traccarUrl}/api/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    console.log("[LOGIN] Traccar response status:", traccarResponse.status);

    // Handle authentication failure
    if (traccarResponse.status === 401) {
      console.log("[LOGIN] Authentication failed: 401 Unauthorized");
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // Handle other errors from Traccar
    if (!traccarResponse.ok) {
      const errorText = await traccarResponse.text();
      console.error("[LOGIN] Traccar API error:", traccarResponse.status, errorText);
      return NextResponse.json(
        { error: "Error al conectar con el servidor" },
        { status: 503 }
      );
    }

    // Parse Traccar user data
    const traccarUser: TraccarUser = await traccarResponse.json();
    
    // Extract JSESSIONID from Set-Cookie header
    const setCookie = traccarResponse.headers.get("set-cookie");
    let jsessionid: string | undefined;
    
    if (setCookie) {
      const match = setCookie.match(/JSESSIONID=([^;]+)/);
      if (match) {
        jsessionid = match[1];
        console.log("[LOGIN] JSESSIONID extracted successfully");
      }
    }
    
    if (!jsessionid) {
      console.error("[LOGIN] Failed to extract JSESSIONID from Traccar response");
      return NextResponse.json(
        { error: "Error al obtener sesión del servidor" },
        { status: 500 }
      );
    }
    
    console.log("[LOGIN] Traccar user data received:", {
      id: traccarUser.id,
      name: traccarUser.name,
      email: traccarUser.email,
      administrator: traccarUser.administrator,
      readonly: traccarUser.readonly,
      hasJSessionId: !!jsessionid,
    });

    // Determine user role
    const role = traccarUser.administrator
      ? "admin"
      : traccarUser.readonly
        ? "readonly"
        : "user";

    // Create JWT payload with all necessary Traccar data
    const sessionPayload = {
      userId: traccarUser.id.toString(),
      email: traccarUser.email,
      name: traccarUser.name,
      traccarUserId: traccarUser.id,
      role: role,
      isAdmin: traccarUser.administrator || false,
      traccarToken: jsessionid,
    };

    console.log("[LOGIN] Creating JWT with payload:", {
      userId: sessionPayload.userId,
      email: sessionPayload.email,
      name: sessionPayload.name,
      role: sessionPayload.role,
      isAdmin: sessionPayload.isAdmin,
      hasTraccarToken: !!sessionPayload.traccarToken,
    });

    // Sign JWT token
    const token = await signJWT(sessionPayload);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        name: traccarUser.name,
        email: traccarUser.email,
        role: role,
      },
    });

    // Set session cookie
    setSessionCookie(response, token);

    console.log("[LOGIN] Login successful for:", traccarUser.email);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        { error: "No se pudo conectar con el servidor" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
