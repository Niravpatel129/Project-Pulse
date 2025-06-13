import { newRequest } from '@/utils/newRequest';
import { useEffect, useState } from 'react';

const useGetWorkspaceFromUrl = () => {
  const [workspace, setWorkspace] = useState<string | null>(null);

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

        setWorkspace(response.data.workspace);
      } catch (error) {
        console.error('Error fetching workspace from url:', error);
      }
    };

    getWorkspaceFromUrl();
  }, []);

  return workspace;
};

export default useGetWorkspaceFromUrl;
