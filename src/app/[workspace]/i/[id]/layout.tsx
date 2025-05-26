import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Invoice Details',
  description: 'View and manage invoice details',
};

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return <div className='w-full'>{children}</div>;
}
