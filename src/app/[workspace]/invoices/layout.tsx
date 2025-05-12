import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Invoices | Dashboard',
  description: 'Manage your invoices, track payments, and generate new invoices for your clients.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
