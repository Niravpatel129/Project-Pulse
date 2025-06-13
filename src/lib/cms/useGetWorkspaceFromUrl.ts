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
        const domain = window.location.hostname;
        const subdomain = domain.split('.')[0];

        const response = await newRequest.get(`/workspaces/url`, {
          params: {
            domain,
            subdomain,
          },
        });

        const cms = await getWorkspaceCMS(response.data.workspace.name);
        const page = await getWorkspacePage(response.data.workspace.name, 'home');
        const locationExists = await hasLocationPage(response.data.workspace.name, locationSlug);
        setLocationExists(locationExists);
        setLocationSlug(locationSlug);
        setCms(cms);
        setPage(page);
        setWorkspace(response.data.workspace);
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
