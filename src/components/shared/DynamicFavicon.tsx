'use client';

import { useEffect } from 'react';

export function DynamicFavicon({ subdomain }: { subdomain: string | null }) {
  useEffect(() => {
    //
    if (!subdomain) {
      console.log('[DynamicFavicon] No subdomain provided, exiting');
      return;
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
