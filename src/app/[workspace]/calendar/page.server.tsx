import type { Metadata } from 'next';

// This is a server component that exports metadata for the calendar page
export const metadata: Metadata = {
  title: 'Calendar',
  description: 'View and manage your schedule, events, and appointments',
};

// The actual page component is in page.tsx (client component)
export default function CalendarPageServer() {
  return null; // This component doesn't render anything
}
