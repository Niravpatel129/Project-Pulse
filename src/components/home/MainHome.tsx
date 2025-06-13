'use client';

import useGetWorkspaceFromUrl from '@/lib/cms/useGetWorkspaceFromUrl';
import { DevPanel } from '@/lib/mock';
import { getWorkspaceConfig } from '@/utils/workspace';
import { useEffect, useState } from 'react';
import WorkspacePublicPage from '../WorkspacePublicPage';

export default function MainHome({
  resolvedSearchParams,
  isCustomSubdomain,
}: {
  resolvedSearchParams: { workspace?: string };
  isCustomSubdomain: boolean;
}) {
  const workspace = useGetWorkspaceFromUrl();
  const [workspaceData, setWorkspaceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setIsLoading(true);
      try {
        const workspaceData = await getWorkspaceConfig(workspace);
        setWorkspaceData(workspaceData);
      } catch (error) {
        console.error('[Page] Error fetching workspace data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaceData();
  }, [workspace]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f5f4] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
        </div>
      </div>
    );
  }

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
      if (workspaceData) {
        return (
          <>
            <WorkspacePublicPage workspace={workspaceSlug} pageType='home' />
            {process.env.NODE_ENV === 'development' && (
              <DevPanel currentWorkspace={workspaceSlug} />
            )}
          </>
        );
      }
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
