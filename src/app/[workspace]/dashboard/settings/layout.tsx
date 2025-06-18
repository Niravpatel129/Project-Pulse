import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Settings | Dashboard',
  description: 'Manage and track your settings in one place',
  keywords: 'Settings, financial management, dashboard',
  openGraph: {
    title: 'Settings | Dashboard',
    description: 'Manage and track your settings in one place',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Settings | Dashboard',
    description: 'Manage and track your settings in one place',
  },
};

const BillsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className='w-full'>{children}</div>;
};

export default BillsLayout;
