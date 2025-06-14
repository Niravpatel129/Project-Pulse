import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Get hostname (subdomain.domain.com)
  const hostname = request.headers.get('host') || '';

  // Parse subdomain
  const subdomain = hostname.split('.')[0];
  console.log(`[Middleware] Hostname: ${hostname}`);
  console.log(`[Middleware] Subdomain: ${subdomain}`);
  console.log(`[Middleware] Domain parts: ${hostname.split('.').length}`);
  console.log(`[Middleware] Domain parts array:`, hostname.split('.'));

  const isCustomSubdomain =
    !['www', 'localhost:3000', 'localhost:3001', 'pulse-app', 'hourblock'].includes(subdomain) &&
    hostname.split('.').length > 2;

  console.log(`[Middleware] Is custom subdomain: ${isCustomSubdomain}`);
  console.log(`[Middleware] NODE_ENV: ${process.env.NODE_ENV}`);

  // Handle service worker related paths
  if (path === '/sw.js' || path.startsWith('/workbox-')) {
    // Don't apply subdomain redirects to service worker files
    return NextResponse.next();
  }

  // Handle privacy and terms pages - they should be accessible without workspace routing
  if (path === '/privacy' || path === '/terms') {
    return NextResponse.next();
  }

  // Development mode: Handle localhost:3000 or localhost:3001 as if it has a workspace
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalhost = hostname === 'localhost:3000' || hostname === 'localhost:3001';

  if (isDevelopment && isLocalhost && !isCustomSubdomain) {
    // For development on localhost, treat it as a workspace
    const mockWorkspace = 'bolocreate'; // Default mock workspace

    // Allow workspace switching via URL param (already handled in page.tsx)
    const url = new URL(request.url);
    const workspaceParam = url.searchParams.get('workspace');
    const activeWorkspace = workspaceParam || mockWorkspace;

    // Skip middleware for API routes, _next, and static files
    if (
      path.startsWith('/api') ||
      path.startsWith('/_next') ||
      path.startsWith('/favicon') ||
      path.startsWith('/public')
    ) {
      return NextResponse.next();
    }

    // Handle location pages: /locations/[slug] -> /[workspace]/locations/[slug]
    if (path.startsWith('/locations/')) {
      const newPath = `/${activeWorkspace}${path}`;
      console.log(
        `[DEV Middleware] Rewriting ${path} -> ${newPath} (workspace: ${activeWorkspace})`,
      );
      return NextResponse.rewrite(new URL(newPath, request.url));
    }

    // Handle root path with workspace param
    if (path === '/' && workspaceParam) {
      // Keep the root path, let page.tsx handle workspace switching
      return NextResponse.next();
    }

    // For development, don't enforce authentication
    console.log(`[DEV Middleware] Allowing ${path} in development mode`);
    return NextResponse.next();
  }

  const userCookie = request.cookies.get('user')?.value;

  const isAuthenticated = !!userCookie;

  // Handle subdomain routing
  if (isCustomSubdomain) {
    // Extract workspace from the subdomain
    const workspace = subdomain;

    // Skip authentication check for invoice view pages and payment success page
    if (
      path.match(/\/invoice\/[^\/]+$/) ||
      path === '/payment-success' ||
      path.match(/\/i\/[^\/]+$/)
    ) {
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
      !path.includes('/portal/lead/') &&
      !path.includes('/portal/payments/receipt/') &&
      !path.includes('/privacy') &&
      !path.includes('/terms')
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
