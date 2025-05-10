'use client';

import InvoicePreview from '@/components/Main/Invoices/InvoicePreview';
import Invoices from '@/components/Main/Invoices/Invoices';
import Sidebar from '@/components/Main/Sidebar/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { GeistSans } from 'geist/font/sans';
export default function Main() {
  return (
    <ThemeProvider defaultTheme='dark' enableSystem={false}>
      <SidebarProvider defaultOpen>
        <div
          className={`relative flex min-h-screen w-full bg-background text-foreground ${GeistSans.className}`}
        >
          <Sidebar />
          <main className='flex-1 w-full overflow-auto bg-background h-screen'>
            <div className='flex h-full'>
              <div className='w-full h-full overflow-auto'>
                <Invoices />
              </div>
              <div className='w-full border-l border-l-gray-800 h-full overflow-auto'>
                <InvoicePreview />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
