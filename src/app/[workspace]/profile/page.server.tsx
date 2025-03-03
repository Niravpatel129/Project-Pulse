import type { Metadata } from 'next';

// This is a server component that exports metadata for the profile page
export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your account settings and preferences',
};

// The actual page component is in page.tsx (client component)
export default function ProfilePageServer() {
  return null; // This component doesn't render anything
}
