import Providers from '@/components/Providers';
import { DynamicFavicon } from '@/components/shared/DynamicFavicon';
import { Toaster } from '@/components/ui/toaster';
import { getMockWorkspace, hasMockWorkspace } from '@/lib/mock';
import { cn } from '@/lib/utils';
import { CMSSettings } from '@/types/cms';
import { fetchCMSSettings } from '@/utils/cms';
import { newRequest } from '@/utils/newRequest';
import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Workspace-specific colors
const workspaceColors = {
  projects: '#0066FF',
  sales: '#00C484',
  marketing: '#FF6B35',
  hr: '#8A4FFF',
  finance: '#00A3E0',
  default: '#0066FF',
};

// Helper function to generate metadata from CMS settings
function generateMetadataFromCMS(settings: CMSSettings, workspaceName: string): Metadata {
  const seo = settings.seo || {};
  const favicons = settings.favicons || {};

  return {
    title: {
      template: seo.ogSiteName ? `%s | ${seo.ogSiteName}` : '%s | Hour Block',
      default: seo.ogTitle || settings.siteName || workspaceName,
    },
    description:
      seo.ogDescription || settings.siteDescription || 'Professional services and solutions',
    keywords: seo.keywords || [],
    authors: seo.author ? [{ name: seo.author }] : [{ name: 'Hour Block Team' }],
    creator: seo.author || 'Hour Block',
    publisher: seo.ogSiteName || 'Hour Block',
    applicationName: seo.applicationName || settings.siteName || workspaceName,
    robots: seo.robots || 'index, follow',
    formatDetection: {
      telephone: false,
    },
    metadataBase: new URL(seo.canonical || 'https://hourblock.com'),
    alternates: {
      canonical: seo.canonical || '/',
    },
    manifest: seo.manifestPath || '/manifest.json',
    openGraph: {
      title: seo.ogTitle || settings.siteName || workspaceName,
      description:
        seo.ogDescription || settings.siteDescription || 'Professional services and solutions',
      url: seo.ogUrl || 'https://hourblock.com',
      siteName: seo.ogSiteName || settings.siteName || 'Hour Block',
      locale: 'en_US',
      type: (seo.ogType as any) || 'website',
      images: seo.ogImage
        ? [
            {
              url: seo.ogImage.url,
              width: seo.ogImage.width || 1200,
              height: seo.ogImage.height || 630,
              alt: seo.ogImage.alt || `${settings.siteName} - Professional Services`,
            },
          ]
        : [
            {
              url: '/og-image-home.jpg',
              width: 1200,
              height: 630,
              alt: 'Hour Block Project Management',
            },
          ],
    },
    twitter: {
      card: seo.twitterCard || 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || settings.siteName || workspaceName,
      description:
        seo.twitterDescription ||
        seo.ogDescription ||
        settings.siteDescription ||
        'Professional services and solutions',
      creator: seo.twitterCreator,
      site: seo.twitterSite,
      images: seo.twitterImage ? [seo.twitterImage.url] : ['/og-image-home.jpg'],
    },
    icons: {
      icon: 'https://i.ibb.co/B5k7ydqP/Chat-GPT-Image-Jun-18-2025-10-41-36-PM.png',
      shortcut: favicons.icon16 || '/favicon-16x16.png',
      apple: favicons.appleTouchIcon || '/apple-touch-icon.png',
      other: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: favicons.icon32 || '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          url: favicons.icon16 || '/favicon-16x16.png',
        },
        {
          rel: 'mask-icon',
          url: favicons.safariPinnedTab || '/safari-pinned-tab.svg',
          color: seo.themeColor || settings.theme?.primaryColor || '#0070f3',
        },
      ],
    },
    other: {
      'theme-color': seo.themeColor || settings.theme?.primaryColor || '#0070f3',
      'msapplication-TileColor':
        seo.msapplicationTileColor || settings.theme?.primaryColor || '#0070f3',
      'msapplication-TileImage': favicons.msapplicationTileImage || '/mstile-144x144.png',
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  // Get the hostname from the request headers
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hostname = host.split(':')[0];

  // In development, treat localhost as printscala workspace
  let domain: string;
  let subdomain: string;
  let isSubdomain: boolean;

  if (process.env.NODE_ENV === 'development' && hostname === 'localhost') {
    // Force localhost to act as printscala workspace
    domain = 'printscala.com';
    subdomain = 'printscala';
    isSubdomain = true;
  } else {
    // Use similar logic to useGetWorkspaceFromUrl.ts
    domain = process.env.NODE_ENV === 'development' ? 'www.printscala.com' : hostname;
    subdomain = domain.split('.')[0];
    isSubdomain = domain !== 'localhost' && subdomain !== 'www' && subdomain !== 'hour-block';
  }

  const themeColor = isSubdomain
    ? workspaceColors[subdomain as keyof typeof workspaceColors] || workspaceColors.default
    : '#0070f3';

  // Default values for HourBlock main site
  let appName = 'Hour Block';
  let siteDescription =
    'Streamline your workflows, manage projects, and collaborate with your team effectively using Hour Block.';

  // Try to fetch workspace data for any domain (similar to useGetWorkspaceFromUrl logic)
  try {
    console.log(
      `[Metadata] Attempting to fetch workspace for domain: ${domain}, subdomain: ${subdomain}`,
    );

    const response = await newRequest.get(`/workspaces/url`, {
      params: {
        domain,
        subdomain,
      },
    });

    const workspaceName = response.data.data.name;
    console.log(`[Metadata] Found workspace: ${workspaceName}`);

    // Then fetch CMS settings for the workspace
    const settings = await fetchCMSSettings(workspaceName);
    if (settings) {
      appName = settings.siteName || workspaceName;
      siteDescription = settings.siteDescription || siteDescription;

      // Use comprehensive metadata from CMS settings if available
      return generateMetadataFromCMS(settings, workspaceName);
    } else {
      appName = workspaceName;
    }
  } catch (error) {
    console.log(`[Metadata] No workspace found for domain ${domain}, using defaults:`, error);

    // Fallback to mock data in development if available
    if (process.env.NODE_ENV === 'development') {
      // Use the subdomain we determined above, or default to printscala
      const workspaceSlug = subdomain === 'www' ? 'printscala' : subdomain;

      // Check if we have mock data for this workspace
      if (hasMockWorkspace(workspaceSlug)) {
        console.log(`[DEV] Using mock data for workspace: ${workspaceSlug}`);
        const mockData = getMockWorkspace(workspaceSlug);
        if (mockData) {
          // Use comprehensive metadata from mock CMS settings if available
          return generateMetadataFromCMS(mockData.settings, workspaceSlug);
        }
      }
    }

    // If we still don't have custom data and it's a subdomain, use subdomain as name
    if (isSubdomain && appName === 'Hour Block') {
      appName = subdomain;
    }
  }

  return {
    title: {
      template: '%s | Hour Block',
      default: appName,
    },
    description: siteDescription,
    keywords: ['project management', 'team collaboration', 'workflow', 'dashboard', 'productivity'],
    authors: [{ name: 'Hour Block Team' }],
    creator: 'Hour Block',
    publisher: 'Hour Block',
    applicationName: appName,
    formatDetection: {
      telephone: false,
    },
    metadataBase: new URL('https://hourblock.com'),
    alternates: {
      canonical: '/',
    },
    manifest: isSubdomain ? `/api/manifest/${subdomain}` : '/manifest.json',
    openGraph: {
      title: appName,
      description: siteDescription,
      url: 'https://hourblock.com',
      siteName: 'Hour Block',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/og-image-home.jpg',
          width: 1200,
          height: 630,
          alt: 'Hour Block Project Management',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: appName,
      description: siteDescription,
      creator: '@HourBlock',
      images: ['/og-image-home.jpg'],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
      other: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          url: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          url: '/favicon-16x16.png',
        },
        {
          rel: 'mask-icon',
          url: '/safari-pinned-tab.svg',
          color: themeColor,
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get subdomain for DynamicFavicon using the same logic as metadata
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hostname = host.split(':')[0];

  // In development, always treat localhost as printscala workspace
  let subdomain: string | null = null;
  if (process.env.NODE_ENV === 'development' && hostname === 'localhost') {
    subdomain = 'printscala'; // Force printscala workspace for localhost in development
    console.log('[Layout] Localhost detected, forcing subdomain to:', subdomain);
  } else {
    const clientDomain = process.env.NODE_ENV === 'development' ? 'www.printscala.com' : hostname;
    const clientSubdomain = clientDomain.split('.')[0];
    const isClientSubdomain =
      clientDomain !== 'localhost' && clientSubdomain !== 'www' && clientSubdomain !== 'hour-block';
    subdomain = isClientSubdomain ? clientSubdomain : null;
    console.log('[Layout] Non-localhost, hostname:', hostname, 'subdomain:', subdomain);
  }
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta name='application-name' content='Hour Block App' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Hour Block' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='theme-color' content='#0070f3' />

        {/* Service Worker Registration */}
        <Script id='register-service-worker' strategy='afterInteractive'>
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                // Get hostname and check if it's a subdomain
                var hostname = window.location.hostname;
                var subdomain = hostname.split('.')[0];
                var isSubdomain = hostname !== 'localhost' && subdomain !== 'www' && subdomain !== 'hour-block';
                
                // Choose the service worker URL based on whether it's a subdomain
                var swUrl = isSubdomain ? '/api/sw' : '/sw.js';
                
                // Try to register the service worker with proper error handling
                navigator.serviceWorker.register(swUrl, { 
                  scope: '/' 
                }).then(
                  function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    // If registration fails, log the error and try to unregister existing service workers
                    console.log('Service Worker registration failed: ', err);
                    
                    if (err.name === 'TypeError' && err.message.includes('failed to register')) {
                      console.log('Attempting to unregister existing service workers');
                      navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for(let registration of registrations) {
                          registration.unregister();
                          console.log('Service worker unregistered');
                        }
                      });
                    }
                  }
                );
              });
            }
          `}
        </Script>
        <Script id='workspace-colors' strategy='beforeInteractive'>
          {`
            :root {
              --workspace-primary: ${workspaceColors.default};
              --workspace-secondary: ${workspaceColors.default};
              --workspace-accent: ${workspaceColors.default};
            }
          `}
        </Script>
        <DynamicFavicon subdomain={subdomain} />
      </head>
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
