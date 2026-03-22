import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

// Session Payload Type
export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  traccarUserId: number;
  role: string;
  isAdmin: boolean;
  traccarToken?: string;
}

// Get JWT secret key as Uint8Array
const getSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return new TextEncoder().encode(secret);
};

// Get JWT expiration time in seconds
const getExpirationTime = (): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "8h";
  return expiresIn;
};

// Parse expiration time to seconds
const parseExpirationToSeconds = (expiration: string): number => {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error("Invalid JWT_EXPIRES_IN format");
  }
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      return 8 * 60 * 60; // Default 8 hours
  }
};

/**
 * Sign a JWT token with the given payload
 */
export async function signJWT(payload: SessionPayload): Promise<string> {
  const secret = getSecretKey();
  const expiresIn = getExpirationTime();
  const expirationSeconds = parseExpirationToSeconds(expiresIn);

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirationSeconds)
    .sign(secret);

  return token;
}

/**
 * Verify a JWT token and return the payload
 * Returns null if verification fails (never throws)
 */
export async function verifyJWT(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    
    // Validate payload has required fields
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      typeof payload.traccarUserId === "number" &&
      typeof payload.role === "string" &&
      typeof payload.isAdmin === "boolean"
    ) {
      return payload as unknown as SessionPayload;
    }
    
    return null;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Get session from request cookie
 */
export async function getSession(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get("halia-token")?.value;
  if (!token) {
    return null;
  }
  return await verifyJWT(token);
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(
  response: NextResponse,
  token: string
): NextResponse {
  const expiresIn = getExpirationTime();
  const maxAgeSeconds = parseExpirationToSeconds(expiresIn);
  const isProduction = process.env.NODE_ENV === "production";

  response.cookies.set("halia-token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: maxAgeSeconds,
    path: "/",
  });

  return response;
}

/**
 * Clear session cookie from response (logout)
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set("halia-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}
