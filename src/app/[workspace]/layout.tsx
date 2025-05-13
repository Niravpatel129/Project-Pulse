import { newRequest } from '@/utils/newRequest';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import ClientLayout from './ClientLayout';

type Props = {
  children: React.ReactNode;
  params: { workspace: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';

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
      icons: {
        icon: logoUrl,
        apple: logoUrl,
        shortcut: logoUrl,
      },
    };
  } catch (error) {
    console.log('🚀 error:', error);
    // Fallback to default favicon if API call fails
    return {
      icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
        shortcut: '/favicon.ico',
      },
    };
  }
}

export default function RootLayout({ children, params }: Props) {
  return <ClientLayout>{children}</ClientLayout>;
}
