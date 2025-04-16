import { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, IBM_Plex_Sans } from 'next/font/google';
import ClientLayout from './ClientLayout';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
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
    template: '%s | Pulse',
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
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSans.className} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
