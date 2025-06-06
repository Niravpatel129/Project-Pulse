import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Geist, Geist_Mono, IBM_Plex_Sans, Inter } from 'next/font/google';
import { headers } from 'next/headers';
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

export async function generateMetadata(): Promise<Metadata> {
  // Get the hostname from the request headers
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hostname = host.split(':')[0];
  const subdomain = hostname.split('.')[0];
  const isSubdomain = hostname !== 'localhost' && subdomain !== 'www' && subdomain !== 'pulse-app';

  let logoUrl = '/favicon.ico';

  if (isSubdomain) {
    try {
      // Create a new request instance for server-side
      const response = await fetch(`https://api.hourblock.com/api/workspaces/logo`, {
        headers: {
          origin: host,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.data?.logo) {
          logoUrl = data.data.logo;
        }
      }
    } catch (error) {
      console.error('Error fetching workspace logo:', error);
    }
  }

  const themeColor = isSubdomain
    ? workspaceColors[subdomain as keyof typeof workspaceColors] || workspaceColors.default
    : '#0070f3';
  const appName = isSubdomain ? `${subdomain}` : 'Pulse';

  return {
    title: {
      template: '%s | Pulse',
      default: appName,
    },
    description:
      'Streamline your workflows, manage projects, and collaborate with your team effectively using Pulse.',
    keywords: ['project management', 'team collaboration', 'workflow', 'dashboard', 'productivity'],
    authors: [{ name: 'Pulse Team' }],
    creator: 'Pulse',
    publisher: 'Pulse',
    applicationName: appName,
    formatDetection: {
      telephone: false,
    },
    metadataBase: new URL('https://pulse-app.com'),
    alternates: {
      canonical: '/',
    },
    manifest: isSubdomain ? `/api/manifest/${subdomain}` : '/manifest.json',
    openGraph: {
      title: appName,
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
      title: appName,
      description:
        'Streamline your workflows, manage projects, and collaborate with your team effectively.',
      creator: '@PulseApp',
      images: ['/og-image-home.jpg'],
    },
    icons: {
      icon: logoUrl,
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
        <meta name='theme-color' content='#0070f3' />

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
        <Script id='workspace-colors' strategy='beforeInteractive'>
          {`
            :root {
              --workspace-primary: ${workspaceColors.default};
              --workspace-secondary: ${workspaceColors.default};
              --workspace-accent: ${workspaceColors.default};
            }
          `}
        </Script>
      </head>
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
          <AuthProvider>
            <ClientLayout>
              {children}
              <Toaster />
            </ClientLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
