import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Invoices | Dashboard',
  description: 'Manage and track your Invoices and expenses in one place',
  keywords: 'Invoices, expenses, financial management, dashboard',
  openGraph: {
    title: 'Invoices | Dashboard',
    description: 'Manage and track your Invoices and expenses in one place',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invoices | Dashboard',
    description: 'Manage and track your bills and expenses in one place',
  },
};

const BillsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className='w-full'>{children}</div>;
};

export default BillsLayout;
