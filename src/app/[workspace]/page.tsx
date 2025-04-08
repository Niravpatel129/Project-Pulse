'use client';

import BlockWrapper from '@/components/wrappers/BlockWrapper';

// Mock data for the dashboard
const RECENT_PROJECTS = [
  {
    id: 1,
    name: 'Enterprise CRM Implementation',
    client: 'Acme Corp',
    progress: 65,
    status: 'In Progress',
    deadline: '2024-05-15',
  },
  {
    id: 2,
    name: 'E-commerce Platform Upgrade',
    client: 'Global Retail',
    progress: 80,
    status: 'In Progress',
    deadline: '2024-04-30',
  },
  {
    id: 3,
    name: 'Mobile App Development - Retail',
    client: 'QuickShop',
    progress: 20,
    status: 'In Progress',
    deadline: '2024-06-10',
  },
];

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: 'Client Meeting - Acme Corp',
    type: 'Meeting',
    date: '2024-04-19',
    time: '10:00 - 11:30',
  },
  {
    id: 2,
    title: 'Website Design Review',
    type: 'Internal',
    date: '2024-04-19',
    time: '13:00 - 14:00',
  },
  {
    id: 3,
    title: 'Project Kickoff - Mobile App',
    type: 'Meeting',
    date: '2024-04-20',
    time: '09:30 - 11:00',
  },
];

export default function DashboardPage() {
  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Function to get event type badge styling
  const getEventBadge = (type: string) => {
    switch (type) {
      case 'Meeting':
        return 'bg-blue-100 text-blue-800';
      case 'Internal':
        return 'bg-slate-100 text-slate-800';
      case 'Deadline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className=''>
      <BlockWrapper>
        <div className='min-h-screen'>123</div>
      </BlockWrapper>
    </div>
  );
}
