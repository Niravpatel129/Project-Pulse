import type { Metadata } from 'next';

// This is a server component that exports metadata for the projects page
export const metadata: Metadata = {
  title: 'Projects',
  description: 'Manage and track all your client projects in one place',
};

// The actual page component is in page.tsx (client component)
export default function ProjectsPageServer() {
  return null; // This component doesn't render anything
}
