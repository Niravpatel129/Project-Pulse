import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage and track your dashboard in one place',
  keywords: 'Dashboard, financial management, dashboard',
  openGraph: {
    title: 'Dashboard',
    description: 'Manage and track your dashboard in one place',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard',
    description: 'Manage and track your dashboard in one place',
  },
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className='w-full'>{children}</div>;
};

export default DashboardLayout;
