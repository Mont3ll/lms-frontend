import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Import if verifying JWT here

// --- Configuration ---
const LOGIN_URL = "/login";
const UNAUTHORIZED_URL = "/unauthorized";
const DEFAULT_DASHBOARD_URL = "/dashboard"; // Generic dashboard entry point

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/certificates/verify/",
]; // Paths accessible without login (add password reset confirm etc.)
const ROLE_BASED_PATHS: Record<string, string[]> = {
  // Path prefixes requiring specific roles
  ADMIN: ["/admin", "/instructor"], // Admin can access admin and instructor sections
  INSTRUCTOR: ["/instructor"], // Instructor can access instructor sections
  LEARNER: [], // Define learner-specific restricted paths if any (e.g., '/learner-only-feature')
};
// All other authenticated routes (like /dashboard, /courses, /profile) are generally accessible by any logged-in role,
// the specific content/actions are handled client-side.

const JWT_SECRET = process.env.JWT_SECRET_KEY; // Ensure this matches backend's SIMPLE_JWT SIGNING_KEY
const AUTH_COOKIE_NAME = "authToken"; // Name of the cookie storing the JWT access token

// Function to verify JWT using jose (runs on Edge)
async function verifyToken(token: string): Promise<{ role: string } | null> {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET environment variable is not set!");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    // Assuming your JWT payload has a 'role' claim and potentially 'user_id' ('sub' or custom)
    const role = payload.role as string; // Adjust claim name if different
    // const userId = payload.user_id as string; // Adjust claim name if different
    if (!role) return null; // Invalid token if role claim is missing
    return { role: role.toUpperCase() }; // Return role (ensure consistent casing)
  } catch (error) {
    console.error("JWT Verification failed:", error);
    return null; // Token is invalid or expired
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const token = tokenCookie?.value;

  console.log(`Middleware: Path=${pathname}, HasToken=${!!token}`);

  // Allow Next.js internal requests, static files, and image optimization
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") || // Adjust if your public images are elsewhere
    pathname.startsWith("/fonts") || // Adjust if your public fonts are elsewhere
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") || // Add other common static extensions
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css")
  ) {
    return NextResponse.next();
  }

  // --- Public Path Handling ---
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    // If user IS logged in and tries to access login/register, redirect to dashboard
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded && (pathname === LOGIN_URL || pathname === "/register")) {
        console.log(
          "Middleware: Redirecting logged-in user from public auth page to dashboard",
        );
        return NextResponse.redirect(
          new URL(DEFAULT_DASHBOARD_URL, request.url),
        );
      }
    }
    // Allow access to public paths for unauthenticated or authenticated users (unless redirected above)
    console.log(`Middleware: Allowing public path ${pathname}`);
    return NextResponse.next();
  }

  // --- Authentication Check for Protected Routes ---
  if (!token) {
    console.log(
      `Middleware: No token, redirecting to login from protected path ${pathname}`,
    );
    // Add returnUrl for redirect after login
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_URL;
    url.searchParams.set("returnUrl", pathname); // Pass original path
    return NextResponse.redirect(url);
  }

  // --- Token Verification & Role Check ---
  const decodedToken = await verifyToken(token);

  if (!decodedToken) {
    console.log(
      `Middleware: Invalid token, redirecting to login from ${pathname}`,
    );
    // Optionally clear the invalid cookie? Be careful with loops.
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_URL;
    url.searchParams.set("returnUrl", pathname);
    const response = NextResponse.redirect(url);
    // Clear the potentially invalid cookie
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  const userRole = decodedToken.role; // e.g., 'ADMIN', 'INSTRUCTOR', 'LEARNER'
  console.log(`Middleware: Token verified. Role=${userRole}, Path=${pathname}`);

  // --- Role-Based Access Control ---
  // Check if path requires a specific role
  let requiresSpecificRole = false;
  for (const [role, paths] of Object.entries(ROLE_BASED_PATHS)) {
    if (paths.some((prefix) => pathname.startsWith(prefix))) {
      requiresSpecificRole = true;
      const allowedRolesForPath = Object.entries(ROLE_BASED_PATHS)
        .filter(([_, allowedPaths]) =>
          allowedPaths.some((p) => pathname.startsWith(p)),
        )
        .map(([roleKey]) => roleKey);

      // Check if user's role is allowed for this path prefix
      // Note: This logic assumes higher roles inherit access to lower roles based on ROLE_BASED_PATHS definition
      // Example: Admin definition ['/admin', '/instructor'] implies admin can access instructor routes.
      const userAllowedPrefixes = ROLE_BASED_PATHS[userRole] || [];
      const canAccess = userAllowedPrefixes.some((prefix) =>
        pathname.startsWith(prefix),
      );

      if (!canAccess) {
        console.log(
          `Middleware: Role '${userRole}' denied access to '${pathname}'. Redirecting to Unauthorized.`,
        );
        return NextResponse.redirect(new URL(UNAUTHORIZED_URL, request.url));
      }
      // If user role allows access to this specific prefix, break the loop
      break;
    }
  }

  // If path didn't require a specific role check above, it's an authenticated route accessible to all roles
  console.log(
    `Middleware: Allowing access for role '${userRole}' to path '${pathname}'`,
  );
  return NextResponse.next(); // Allow access
}

// --- Matcher Configuration ---
// Apply middleware to all paths EXCEPT static files, image optimization, api routes (unless needed)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - Apply middleware selectively if needed (e.g., rate limiting)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images) - Adjust if needed
     * - fonts/ (public fonts) - Adjust if needed
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
