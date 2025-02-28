import { AppProvider } from '@/contexts';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import ClientLayout from './ClientLayout';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Pulse',
  description: 'A platform for photographers to collaborate with clients and share project files',
  keywords: ['photography', 'collaboration', 'file sharing', 'client portal'],
  authors: [{ name: 'Pulse Team' }],
  creator: 'Pulse',
  publisher: 'Pulse',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

// Configure the initial API settings - with default values for production
const initialApiConfig = {
  useMock: process.env.NODE_ENV !== 'production', // Use mock API in non-production environments
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Use key prop to ensure AppProvider remounts on environment changes */}
        <AppProvider initialApiConfig={initialApiConfig} key={process.env.NODE_ENV}>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
      </body>
    </html>
  );
}
