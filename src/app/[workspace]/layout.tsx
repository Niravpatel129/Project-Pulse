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
  const workspaceParams = await params;
  const host = headersList.get('host') || '';
  const workspace = workspaceParams?.workspace;

  try {
    const response = await newRequest.get(`/workspaces/logo`, {
      headers: {
        origin: host,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch workspace logo');
    }

    const data = await response.data.data;
    const logoUrl = data.logo;
    const workspaceName = data.name || workspace;

    return {
      title: {
        template: `%s`,
        default: `${workspaceName}`,
      },
      description: `Manage your ${workspaceName} workspace with Pulse - Streamline workflows and collaborate effectively.`,
      applicationName: `${workspaceName}`,
      manifest: `/api/manifest/${workspaceName}`,
      icons: {
        icon: logoUrl,
        apple: logoUrl,
        shortcut: logoUrl,
      },
      openGraph: {
        title: `${workspaceName}`,
        description: `Manage your ${workspaceName} workspace with Pulse - Streamline workflows and collaborate effectively.`,
        url: `https://${workspaceName}.hourblock.com`,
        siteName: `${workspaceName}`,
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: logoUrl,
            width: 1200,
            height: 630,
            alt: `${workspaceName} Workspace`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${workspaceName}`,
        description: `Manage your ${workspaceName} workspace with Pulse - Streamline workflows and collaborate effectively.`,
        creator: '@PulseApp',
        images: [logoUrl],
      },
    };
  } catch (error) {
    // Fallback to default metadata if API call fails
    return {
      title: {
        template: `%s`,
        default: `${workspace}`,
      },
      description: `Manage your ${workspace} workspace with Pulse - Streamline workflows and collaborate effectively.`,
      applicationName: `${workspace}`,
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

export default function WorkspaceLayout({ children }: Props) {
  return <ClientLayout>{children}</ClientLayout>;
}
