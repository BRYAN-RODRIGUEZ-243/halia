import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Public routes that don't require authentication
const publicRoutes = ["/", "/signin", "/signup"];
const authApiRoutes = ["/api/auth/login", "/api/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API routes
  if (authApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if user has valid session
  const session = await getSession(request);

  // If user is authenticated and trying to access signin, redirect to dashboard
  if (session && pathname === "/signin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access protected route, redirect to signin
  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // User is authenticated, allow access
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
