import WorkspacePublicPage from '@/components/WorkspacePublicPage';
import { DevPanel } from '@/lib/mock';
import { getWorkspaceConfig } from '@/utils/workspace';
import { headers } from 'next/headers';

interface HomePageProps {
  searchParams: { workspace?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Get the hostname from headers to determine workspace
  const headersList = await headers();
  const hostname = headersList.get('host') || '';

  // Parse subdomain to get workspace
  const subdomain = hostname.split('.')[0];
  const isCustomSubdomain =
    process.env.NODE_ENV === 'production'
      ? !['www', 'localhost:3000', 'pulse-app', 'hourblock'].includes(subdomain)
      : true;

  // If we have a custom subdomain/domain (workspace), show their public branded page
  if (isCustomSubdomain) {
    // In development, allow workspace override via URL param
    const workspaceSlug =
      process.env.NODE_ENV === 'development' && searchParams.workspace
        ? searchParams.workspace
        : 'bolocreate'; // Default for testing

    console.log(`[DEV] Using workspace: ${workspaceSlug}`);

    try {
      // Fetch workspace data from backend or mock
      const workspaceData = await getWorkspaceConfig(workspaceSlug);

      return (
        <>
          <WorkspacePublicPage workspace={workspaceSlug} pageType='home' data={workspaceData} />
          {process.env.NODE_ENV === 'development' && <DevPanel currentWorkspace={workspaceSlug} />}
        </>
      );
    } catch (error) {
      console.error('Error loading workspace:', error);
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
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>Welcome to Pulse</h1>
        <p className='text-xl text-gray-600 mb-8'>Multi-tenant CMS Platform</p>
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
