import { Metadata } from 'next';

// This is a server component that exports metadata for the production tracking page
export const metadata: Metadata = {
  title: 'Production Tracking',
  description: 'Monitor and manage production status of your client projects',
  openGraph: {
    title: 'Production Tracking - Pulse Dashboard',
    description:
      'Track and manage production status of your client projects with comprehensive tools and analytics.',
    images: [
      {
        url: '/og-production.jpg',
        width: 1200,
        height: 630,
        alt: 'Production Tracking Dashboard',
      },
    ],
  },
  twitter: {
    title: 'Production Tracking - Pulse Dashboard',
    description:
      'Track and manage production status of your client projects with comprehensive tools and analytics.',
    images: [
      {
        url: '/og-production.jpg',
        width: 1200,
        height: 630,
        alt: 'Production Tracking Dashboard',
      },
    ],
  },
};

// The actual page component is in page.tsx (client component)
export default function ProductionTrackingPageServer() {
  return null; // This component doesn't render anything
}
