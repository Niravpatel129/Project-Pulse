import type { Metadata } from 'next';

// This is a server component that exports metadata for the dashboard layout
export const metadata: Metadata = {
  title: {
    template: '%s | Pulse Dashboard',
    default: 'Dashboard',
  },
  description: 'Manage your business with our comprehensive dashboard',
};

// The actual layout component is in layout.tsx (client component)
export default function DashboardLayoutServer() {
  return null; // This component doesn't render anything
}
