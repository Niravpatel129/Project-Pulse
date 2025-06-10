'use client';

import { getWorkspaceCMS, getWorkspacePage } from '@/lib/cms';
import '@/styles/workspace-public.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import HomePage from './HomePage';
import LocationPage from './LocationPage';

export interface WorkspacePublicPageProps {
  workspace: string;
  pageType?: 'home' | 'location';
  locationSlug?: string;
  data?: any; // Legacy prop for backward compatibility
}

export default function WorkspacePublicPage({
  workspace,
  pageType = 'home',
  locationSlug,
  data,
}: WorkspacePublicPageProps) {
  const [cmsData, setCmsData] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch workspace CMS data
        const workspaceCMS = await getWorkspaceCMS(workspace);
        if (!workspaceCMS) {
          throw new Error(`Workspace '${workspace}' not found`);
        }

        setCmsData(workspaceCMS);

        // Fetch specific page data
        const page = await getWorkspacePage(workspace, pageType, locationSlug);
        if (!page) {
          if (pageType === 'location' && locationSlug) {
            throw new Error(
              `Location page '${locationSlug}' not found for workspace '${workspace}'`,
            );
          }
          throw new Error(`Page not found`);
        }

        setPageData(page);
      } catch (err) {
        console.error('Error fetching workspace data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [workspace, pageType, locationSlug]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Page Not Found</h1>
          <p className='text-gray-600 mb-8'>{error}</p>
          <Link
            href='/'
            className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!cmsData || !pageData) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <p className='text-gray-600'>No content available</p>
        </div>
      </div>
    );
  }

  // Render appropriate page component based on page type
  if (pageType === 'location' && locationSlug) {
    return (
      <LocationPage
        workspace={workspace}
        locationSlug={locationSlug}
        cmsData={cmsData}
        pageData={pageData}
      />
    );
  }

  return <HomePage workspace={workspace} cmsData={cmsData} pageData={pageData} />;
}
