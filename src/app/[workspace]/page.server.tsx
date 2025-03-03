import type { Metadata } from 'next';

// This is a server component that exports metadata for the main dashboard page
export const metadata: Metadata = {
  title: 'Overview',
};

// The actual page component is in page.tsx (client component)
export default function DashboardPageServer() {
  return null; // This component doesn't render anything
}
