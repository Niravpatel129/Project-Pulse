'use client';

import { newRequest } from '@/utils/newRequest';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  EnhancedCMSPage,
  getWorkspaceCMS,
  getWorkspacePage,
  hasLocationPage,
  WorkspaceCMSData,
} from '.';

const useGetWorkspaceFromUrl = () => {
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [cms, setCms] = useState<WorkspaceCMSData | null>(null);
  const [page, setPage] = useState<EnhancedCMSPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationExists, setLocationExists] = useState(false);
  const [locationSlug, setLocationSlug] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const getWorkspaceFromUrl = async () => {
      try {
        const locationSlug = searchParams.get('locationSlug');
        const domain =
          process.env.NODE_ENV === 'development' ? 'www.bolocreate.com' : window.location.hostname;
        const subdomain = domain.split('.')[0];

        const response = await newRequest.get(`/workspaces/url`, {
          params: {
            domain,
            subdomain,
          },
        });
        console.log('🚀 response:', response);
        const workspaceName = response.data.data.name;
        console.log('🚀 workspaceName:', workspaceName);

        const cms = await getWorkspaceCMS(workspaceName);
        const page = await getWorkspacePage(workspaceName, 'home');
        const locationExists = await hasLocationPage(workspaceName, locationSlug);
        setLocationExists(locationExists);
        setLocationSlug(locationSlug);
        setCms(cms);
        setPage(page);
        setWorkspace(response.data.data.workspace);
      } catch (error) {
        // its okay if the workspace is not found, we will just show the main home page
        console.log('Error fetching workspace from url:', error);
        setError('Error fetching workspace from url');
      } finally {
        setIsLoading(false);
      }
    };

    getWorkspaceFromUrl();
  }, [searchParams]);

  return { workspace, cms, page, isLoading, error, locationExists, locationSlug };
};

export default useGetWorkspaceFromUrl;
