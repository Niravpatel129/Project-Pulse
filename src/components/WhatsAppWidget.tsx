'use client';

import { useWorkspaceCMS } from '@/contexts/WorkspaceCMSContext';
import Script from 'next/script';
import { useEffect } from 'react';

export default function WhatsAppWidget() {
  const { cmsData } = useWorkspaceCMS();

  // Check if the workspace has WhatsApp chat widget enabled
  const whatsappConfig = cmsData?.settings?.customWidgets?.whatsappChat;

  // Add CSS to hide the anchor tag and JavaScript to remove it
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .FloatingWindow__Container-sc-ef30a58d-0.fJiePE a {
        display: none !important;
        pointer-events: none !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -9999px !important;
      }
    `;
    document.head.appendChild(style);

    // Function to remove anchor tags from the widget
    const removeAnchorTags = () => {
      const container = document.querySelector('.FloatingWindow__Container-sc-ef30a58d-0.fJiePE');
      if (container) {
        const anchorTags = container.querySelectorAll('a');
        anchorTags.forEach((anchor) => {
          anchor.remove();
        });
      }
    };

    // Try to remove anchor tags periodically until the widget loads
    const interval = setInterval(() => {
      removeAnchorTags();
    }, 1000);

    // Also try after a delay to catch late-loading elements
    const timeout = setTimeout(() => {
      removeAnchorTags();
      clearInterval(interval);
    }, 10000);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!whatsappConfig?.enabled || !whatsappConfig?.script || !whatsappConfig?.widgetId) {
    return null;
  }

  return (
    <>
      {/* Elfsight WhatsApp Chat Script */}
      <Script
        src={whatsappConfig.script}
        strategy='lazyOnload'
        async
        onLoad={() => {
          // Also try to remove anchor tags after script loads
          setTimeout(() => {
            const container = document.querySelector(
              '.FloatingWindow__Container-sc-ef30a58d-0.fJiePE',
            );
            if (container) {
              const anchorTags = container.querySelectorAll('a');
              anchorTags.forEach((anchor) => {
                anchor.remove();
              });
            }
          }, 2000);
        }}
      />

      {/* WhatsApp Chat Widget */}
      <div className={whatsappConfig.widgetId} data-elfsight-app-lazy />
    </>
  );
}
