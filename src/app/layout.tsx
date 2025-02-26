import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/contexts';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Configure the initial API settings
  const initialApiConfig = {
    useMock: process.env.NODE_ENV !== 'production', // Use mock API in non-production environments
  };

  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider initialApiConfig={initialApiConfig}>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
