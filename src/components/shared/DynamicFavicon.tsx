'use client';

import { getMockWorkspace, hasMockWorkspace } from '@/lib/mock';
import { useEffect } from 'react';

export function DynamicFavicon({ subdomain }: { subdomain: string | null }) {
  useEffect(() => {
    if (!subdomain) return;

    // Check for CMS/mock data first in development
    if (process.env.NODE_ENV === 'development') {
      // For development, map domain to workspace slug
      const workspaceSlug = subdomain === 'www' ? 'printscala' : subdomain;

      if (hasMockWorkspace(workspaceSlug)) {
        const mockData = getMockWorkspace(workspaceSlug);
        if (mockData?.settings?.favicon?.url) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
          if (link) {
            link.href = mockData.settings.favicon.url;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = mockData.settings.favicon.url;
            document.head.appendChild(newLink);
          }
          return; // Exit early if CMS favicon is used
        }
      }
    }

    // Fallback to API call for non-CMS workspaces
    fetch(`https://api.hourblock.com/api/workspaces/logo`, {
      headers: { origin: window.location.host },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data?.data?.logo) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
          if (link) {
            link.href = data.data.logo;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = data.data.logo;
            document.head.appendChild(newLink);
          }
        }
      })
      .catch(() => {
        // Silently fail if API is unavailable
      });
  }, [subdomain]);
  return null;
}
