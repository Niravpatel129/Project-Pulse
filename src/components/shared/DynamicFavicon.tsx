'use client';

import { useEffect } from 'react';

export function DynamicFavicon({ subdomain }: { subdomain: string | null }) {
  useEffect(() => {
    if (!subdomain) return;
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
      });
  }, [subdomain]);
  return null;
}
