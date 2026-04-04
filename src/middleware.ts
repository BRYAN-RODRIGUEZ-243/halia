import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Public routes that don't require authentication
const publicRoutes = ["/signin", "/signup"];
const authApiRoutes = ["/api/auth/login", "/api/auth/logout", "/api/auth/me"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API routes
  if (authApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user has valid session
  const session = await getSession(request);

  const isPublicRoute = publicRoutes.includes(pathname);

  // If user is authenticated:
  if (session) {
    // And tries to access a public route (signin/signup), redirect to dashboard
    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Otherwise, allow access to protected route
    return NextResponse.next();
  }

  // If user is not authenticated:
  // And tries to access a protected route, redirect to signin
  if (!isPublicRoute) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow access to public routes for unauthenticated users
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
