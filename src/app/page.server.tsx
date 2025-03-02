import type { Metadata } from 'next';

// This is a server component that exports metadata for the home page
export const metadata: Metadata = {
  title: 'Welcome',
  description: 'Start managing your projects more efficiently with Pulse',
};

// The actual page component is in page.tsx (client component)
export default function HomePageServer() {
  return null; // This component doesn't render anything
}
