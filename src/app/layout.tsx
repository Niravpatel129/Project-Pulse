import { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, IBM_Plex_Sans } from 'next/font/google';
import Script from 'next/script';
import ClientLayout from './ClientLayout';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Pulse',
  },
  description:
    'Streamline your workflows, manage projects, and collaborate with your team effectively using Pulse.',
  keywords: ['project management', 'team collaboration', 'workflow', 'dashboard', 'productivity'],
  authors: [{ name: 'Pulse Team' }],
  creator: 'Pulse',
  publisher: 'Pulse',
  applicationName: 'Pulse',
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL('https://pulse-app.com'),
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Pulse',
    description:
      'Streamline your workflows, manage projects, and collaborate with your team effectively.',
    url: 'https://pulse-app.com',
    siteName: 'Pulse',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Pulse Project Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse',
    description:
      'Streamline your workflows, manage projects, and collaborate with your team effectively.',
    creator: '@PulseApp',
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
        color: '#6366f1',
      },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <meta name='application-name' content='Pulse App' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Pulse' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='theme-color' content='#0066FF' />

        {/* Dynamic manifest for workspace subdomains */}
        <Script id='dynamic-manifest' strategy='beforeInteractive'>
          {`
            (function() {
              // Get hostname and extract subdomain
              var hostname = window.location.hostname;
              var subdomain = hostname.split('.')[0];
              
              // If it's a subdomain (not localhost, www or main domain)
              if (hostname !== 'localhost' && subdomain !== 'www' && subdomain !== 'pulse-app') {
                // Create a link element for the manifest
                var link = document.createElement('link');
                link.rel = 'manifest';
                link.href = '/api/manifest/' + subdomain;
                
                // Remove any existing manifest link
                var existingManifest = document.querySelector('link[rel="manifest"]');
                if (existingManifest) {
                  existingManifest.parentNode.removeChild(existingManifest);
                }
                
                // Add the new manifest link to the head
                document.head.appendChild(link);
                
                // Set workspace-specific meta tags
                document.querySelector('meta[name="application-name"]').content = subdomain + ' - Pulse App';
                document.querySelector('meta[name="apple-mobile-web-app-title"]').content = subdomain;
                
                // Update theme color to make each workspace visually distinct
                var colors = {
                  // Add some predefined colors for common workspace names
                  projects: '#0066FF', 
                  sales: '#00C484',
                  marketing: '#FF6B35',
                  hr: '#8A4FFF',
                  finance: '#00A3E0',
                  // Default color if workspace name doesn't match
                  default: '#0066FF'
                };
                
                var themeColor = colors[subdomain] || colors.default;
                document.querySelector('meta[name="theme-color"]').content = themeColor;
              }
            })();
          `}
        </Script>

        {/* Service Worker Registration */}
        <Script id='register-service-worker' strategy='afterInteractive'>
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                // Get hostname and check if it's a subdomain
                var hostname = window.location.hostname;
                var subdomain = hostname.split('.')[0];
                var isSubdomain = hostname !== 'localhost' && subdomain !== 'www' && subdomain !== 'pulse-app';
                
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSans.className} antialiased scrollbar-hide`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
