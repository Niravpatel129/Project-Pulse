import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Get hostname (subdomain.domain.com)
  const hostname = request.headers.get('host') || '';

  // Parse subdomain
  const subdomain = hostname.split('.')[0];
  const isCustomSubdomain = !['www', 'localhost:3000', 'pulse-app'].includes(subdomain);

  // Handle subdomain routing
  if (isCustomSubdomain) {
    // Extract workspace from the subdomain
    const workspace = subdomain;

    // If path is root, redirect to workspace path
    if (path === '/') {
      return NextResponse.rewrite(new URL(`/${workspace}`, request.url));
    }

    // For other paths, check if they already include the workspace
    if (!path.startsWith(`/${workspace}`)) {
      // Rewrite the URL to include the workspace
      return NextResponse.rewrite(new URL(`/${workspace}${path}`, request.url));
    }
  }

  // Get the token from cookies

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
