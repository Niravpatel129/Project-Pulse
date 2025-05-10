'use client';

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
          <main className='flex-1 w-full overflow-auto bg-background'>123</main>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
