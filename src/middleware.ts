import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Get hostname (subdomain.domain.com)
  const hostname = request.headers.get('host') || '';

  // Parse subdomain
  const subdomain = hostname.split('.')[0];
  const isCustomSubdomain = !['www', 'localhost:3000', 'pulse-app', 'pay'].includes(subdomain);

  // Handle service worker related paths
  if (path === '/sw.js' || path.startsWith('/workbox-')) {
    // Don't apply subdomain redirects to service worker files
    return NextResponse.next();
  }

  // Check if user is authenticated
  // Check for auth token in cookies - our auth system stores it as 'user' cookie
  const userCookie = request.cookies.get('user')?.value;

  // Also check localStorage via headers (though this won't work in middleware)
  // This is just for debugging purposes
  const authHeader = request.headers.get('Authorization');

  const isAuthenticated = !!userCookie;

  // Handle subdomain routing
  if (isCustomSubdomain) {
    // Extract workspace from the subdomain
    const workspace = subdomain;

    // Skip authentication check for invoice view pages and payment success page
    if (path.match(/\/invoice\/[^\/]+$/) || path === '/payment-success') {
      // Allow access to invoice view pages and payment success without authentication
      if (path === '/') {
        return NextResponse.rewrite(new URL(`/${workspace}`, request.url));
      }

      if (!path.startsWith(`/${workspace}`)) {
        return NextResponse.rewrite(new URL(`/${workspace}${path}`, request.url));
      }

      return NextResponse.next();
    }

    // If not authenticated and not already on login page, redirect to login
    if (
      !isAuthenticated &&
      !path.includes('/login') &&
      !path.includes('/register') &&
      !path.includes('/payment-success') &&
      !path.includes('/lead') &&
      !path.includes('/portal/lead/')
    ) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.url);

      // Also store the current URL in localStorage for redirect after login
      // (this will be handled client-side since we can't set localStorage here)
      console.log('Redirecting unauthenticated user to login');
      return NextResponse.redirect(redirectUrl);
    }

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
