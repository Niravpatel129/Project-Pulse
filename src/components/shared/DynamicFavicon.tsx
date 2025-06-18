'use client';

import { getMockWorkspace, hasMockWorkspace } from '@/lib/mock';
import { useEffect } from 'react';

export function DynamicFavicon({ subdomain }: { subdomain: string | null }) {
  useEffect(() => {
    console.log('[DynamicFavicon] Component mounted, subdomain:', subdomain);
    console.log('[DynamicFavicon] NODE_ENV:', process.env.NODE_ENV);
    console.log(
      '[DynamicFavicon] Window location:',
      typeof window !== 'undefined' ? window.location.href : 'SSR',
    );

    //
    if (!subdomain) {
      console.log('[DynamicFavicon] No subdomain provided, exiting');
      return;
    }

    // TEMPORARY: Force favicon for localhost debugging
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('[DynamicFavicon] LOCALHOST DETECTED - Force setting printscala favicon');
      const faviconUrl = 'https://i.ibb.co/1tfTHZYj/android-chrome-512x512.png';

      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach((link) => {
        return link.remove();
      });

      // Add new favicon
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.type = 'image/png';
      newLink.href = faviconUrl;
      document.head.appendChild(newLink);

      console.log('[DynamicFavicon] FORCE SET favicon to:', faviconUrl);
      return; // Exit early
    }

    // Check for CMS/mock data first in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[DynamicFavicon] Development mode, checking for mock data');

      // Use the subdomain directly as workspace slug
      const workspaceSlug = subdomain;
      console.log('[DynamicFavicon] Workspace slug:', workspaceSlug);

      if (workspaceSlug && hasMockWorkspace(workspaceSlug)) {
        console.log('[DynamicFavicon] Found mock workspace for:', workspaceSlug);
        const mockData = getMockWorkspace(workspaceSlug);

        if (mockData?.settings?.favicon?.url) {
          const faviconUrl = mockData.settings.favicon.url;
          console.log('[DynamicFavicon] Setting favicon to:', faviconUrl);

          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
          if (link) {
            console.log('[DynamicFavicon] Updating existing favicon link');
            link.href = faviconUrl;
          } else {
            console.log('[DynamicFavicon] Creating new favicon link');
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = faviconUrl;
            document.head.appendChild(newLink);
          }
          return; // Exit early if CMS favicon is used
        } else {
          console.log('[DynamicFavicon] No favicon URL in mock data');
        }
      } else {
        console.log('[DynamicFavicon] No mock workspace found for:', workspaceSlug);
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
