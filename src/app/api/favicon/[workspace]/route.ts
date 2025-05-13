import { newRequest } from '@/utils/newRequest';
import { NextResponse } from 'next/server';

// Add proper Next.js route export
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, { params }: { params: { workspace: string } }) {
  console.log('[Favicon API] Route triggered for workspace:', params.workspace);

  try {
    // Fetch workspace data to get the logo
    console.log('[Favicon API] Fetching workspace data...');
    const response = await newRequest.get(`/workspaces/current-workspace`);
    const workspaceData = response.data;

    // Server-side logging
    console.log('[Favicon API] Workspace data:', JSON.stringify(workspaceData, null, 2));

    if (workspaceData?.data?.logo) {
      console.log(
        '[Favicon API] Redirecting to workspace logo:',
        workspaceData.data.workspaceFavicon,
      );
      // If workspace has a logo, redirect to it
      return NextResponse.redirect(workspaceData.data.workspaceFavicon);
    }

    console.log('[Favicon API] No workspace logo found, using default favicon');
    // If no logo, return the default favicon
    return NextResponse.redirect('/favicon.ico');
  } catch (error) {
    // Server-side error logging
    console.error('[Favicon API] Error:', error);
    // On error, return the default favicon
    return NextResponse.redirect('/favicon.ico');
  }
}
