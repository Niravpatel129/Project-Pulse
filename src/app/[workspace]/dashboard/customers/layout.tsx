import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Customers | Dashboard',
  description: 'Manage and track your customers in one place',
  keywords: 'Customers, financial management, dashboard',
  openGraph: {
    title: 'Customers | Dashboard',
    description: 'Manage and track your customers in one place',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customers | Dashboard',
    description: 'Manage and track your customers in one place',
  },
};

const BillsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className='w-full'>{children}</div>;
};

export default BillsLayout;
