import { NextResponse } from 'next/server';

/**
 * Dynamic manifest.json generator for workspace subdomains
 */
export function GET(request, { params }) {
  const workspace = params.workspace;

  // Generate a dynamic manifest for this specific workspace
  const manifest = {
    name: `${workspace}  App`,
    short_name: workspace,
    description: `${workspace} workspace in Pulse Application`,
    start_url: `/`,
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0066FF',
    icons: [
      {
        src: '/icons/manifest-icon-192.maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/manifest-icon-192.maskable.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/manifest-icon-512.maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/manifest-icon-512.maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return NextResponse.json(manifest);
}
