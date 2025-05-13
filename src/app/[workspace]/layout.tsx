import { newRequest } from '@/utils/newRequest';
import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import ClientLayout from './ClientLayout';

type Props = {
  children: React.ReactNode;
  params: { workspace: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const workspace = params.workspace;

  try {
    const response = await newRequest.get(`/workspaces/logo`, {
      headers: {
        host,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch workspace logo');
    }

    const data = await response.data.data;
    const logoUrl = data.logo;

    return {
      title: {
        template: `%s - ${workspace}`,
        default: `${workspace} - Pulse`,
      },
      description: `Manage your ${workspace} workspace with Pulse - Streamline workflows and collaborate effectively.`,
      applicationName: `${workspace} - Pulse`,
      manifest: `/api/manifest/${workspace}`,
      icons: {
        icon: logoUrl,
        apple: logoUrl,
        shortcut: logoUrl,
      },
      openGraph: {
        title: `${workspace} - Pulse`,
        description: `Manage your ${workspace} workspace with Pulse - Streamline workflows and collaborate effectively.`,
        url: `https://${workspace}.pulse-app.com`,
        siteName: `${workspace} - Pulse`,
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: logoUrl,
            width: 1200,
            height: 630,
            alt: `${workspace} - Pulse Workspace`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${workspace} - Pulse`,
        description: `Manage your ${workspace} workspace with Pulse - Streamline workflows and collaborate effectively.`,
        creator: '@PulseApp',
        images: [logoUrl],
      },
    };
  } catch (error) {
    console.log('🚀 error:', error);
    // Fallback to default metadata if API call fails
    return {
      title: {
        template: `%s - ${workspace}`,
        default: `${workspace} - Pulse`,
      },
      description: `Manage your ${workspace} workspace with Pulse - Streamline workflows and collaborate effectively.`,
      applicationName: `${workspace} - Pulse`,
      manifest: `/api/manifest/${workspace}`,
      icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
        shortcut: '/favicon.ico',
      },
    };
  }
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

export default function RootLayout({ children, params }: Props) {
  return <ClientLayout>{children}</ClientLayout>;
}
