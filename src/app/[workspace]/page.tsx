'use client';

import { redirect, usePathname } from 'next/navigation';

export default function MainPage() {
  const pathname = usePathname();

  // Only redirect if we're at the root path
  if (pathname === '/') {
    redirect('/dashboard/invoices');
  }

  return null;
}
