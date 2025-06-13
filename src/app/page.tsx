import WorkspacePublicPage from '@/components/WorkspacePublicPage';
import { DevPanel } from '@/lib/mock';
import { getWorkspaceConfig } from '@/utils/workspace';
import { headers } from 'next/headers';

interface HomePageProps {
  searchParams: Promise<{ workspace?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  console.log(`[Page] Starting page load`);
  // Await the searchParams promise
  const resolvedSearchParams = await searchParams;

  // Get the hostname from headers to determine workspace
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  console.log(`[Page] Starting page load for hostname: ${hostname}`);

  // Parse subdomain to get workspace
  const domainParts = hostname.split('.');
  const subdomain = domainParts[0];
  const isMainDomain = domainParts.length === 2;
  const isWWW = subdomain === 'www';
  const workspaceSlug = isWWW
    ? hostname.replace('www.', '').replace('.com', '')
    : isMainDomain
    ? hostname.replace('.com', '')
    : subdomain;

  console.log(`[Page] Hostname: ${hostname}`);
  console.log(`[Page] Subdomain: ${subdomain}`);
  console.log(`[Page] Is main domain: ${isMainDomain}`);
  console.log(`[Page] Is WWW: ${isWWW}`);
  console.log(`[Page] Workspace slug: ${workspaceSlug}`);

  const isCustomSubdomain =
    process.env.NODE_ENV === 'production'
      ? !['localhost:3000', 'pulse-app', 'hourblock'].includes(workspaceSlug)
      : true;

  console.log(`[Page] Is custom subdomain: ${isCustomSubdomain}`);
  console.log(`[Page] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[Page] Production check: ${process.env.NODE_ENV === 'production'}`);
  console.log(
    `[Page] Subdomain check: ${!['www', 'localhost:3000', 'pulse-app', 'hourblock'].includes(
      subdomain,
    )}`,
  );
  console.log(`[Page] Domain parts check: ${hostname.split('.').length > 2}`);

  // If we have a custom subdomain/domain (workspace), show their public branded page
  if (isCustomSubdomain) {
    console.log(`[Page] Entering custom subdomain branch`);
    // In development, allow workspace override via URL param
    const workspaceSlug =
      process.env.NODE_ENV === 'development' && resolvedSearchParams.workspace
        ? resolvedSearchParams.workspace
        : 'bolocreate'; // Default for testing

    console.log(`[Page] Using workspace slug: ${workspaceSlug}`);

    try {
      // Fetch workspace data from backend or mock
      console.log(`[Page] Attempting to fetch workspace config for: ${workspaceSlug}`);
      const workspaceData = await getWorkspaceConfig(workspaceSlug);
      console.log(`[Page] Successfully fetched workspace config for: ${workspaceSlug}`);

      return (
        <>
          <WorkspacePublicPage workspace={workspaceSlug} pageType='home' data={workspaceData} />
          {process.env.NODE_ENV === 'development' && <DevPanel currentWorkspace={workspaceSlug} />}
        </>
      );
    } catch (error) {
      console.error('[Page] Error loading workspace:', error);
      return (
        <div className='min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-red-700 mb-4'>Error Loading Workspace</h1>
            <p className='text-red-600 mb-4'>Failed to load workspace: {workspaceSlug}</p>
            {process.env.NODE_ENV === 'development' && (
              <p className='text-sm text-gray-500'>
                Try switching to a different workspace using the dev panel
              </p>
            )}
          </div>
          {process.env.NODE_ENV === 'development' && <DevPanel currentWorkspace={workspaceSlug} />}
        </div>
      );
    }
  }

  // If no workspace subdomain, show workspace selection/onboarding
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          Welcome, you are not on a workspace
        </h1>
        <p className='text-xl text-gray-600 mb-8'></p>
        {process.env.NODE_ENV === 'development' && (
          <div className='bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto'>
            <h2 className='text-lg font-semibold mb-4'>Development Mode</h2>
            <p className='text-sm text-gray-600 mb-4'>
              Click the dev panel to test different workspaces
            </p>
          </div>
        )}
      </div>
      {process.env.NODE_ENV === 'development' && <DevPanel />}
    </div>
  );
}
