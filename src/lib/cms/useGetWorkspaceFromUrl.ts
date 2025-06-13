import { newRequest } from '@/utils/newRequest';
import { useEffect, useState } from 'react';
import { EnhancedCMSPage, getWorkspaceCMS, getWorkspacePage, WorkspaceCMSData } from '.';

const useGetWorkspaceFromUrl = () => {
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [cms, setCms] = useState<WorkspaceCMSData | null>(null);
  const [page, setPage] = useState<EnhancedCMSPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getWorkspaceFromUrl = async () => {
      try {
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

        setCms(cms);
        setPage(page);
        setWorkspace(response.data.workspace);
      } catch (error) {
        // its okay if the workspace is not found, we will just show the main home page
        console.log('Error fetching workspace from url:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getWorkspaceFromUrl();
  }, []);

  return { workspace, cms, page, isLoading };
};

export default useGetWorkspaceFromUrl;
