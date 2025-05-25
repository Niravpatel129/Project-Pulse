'use client';

import Sidebar from '@/components/Main/Sidebar/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatProvider } from '@/contexts/ChatContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { GeistSans } from 'geist/font/sans';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname?.includes('/dashboard');

  const content = (
    <div
      className={`relative flex min-h-screen w-full bg-background text-foreground ${GeistSans.className}`}
    >
      {showSidebar && <Sidebar />}
      {children}
    </div>
  );

  return (
    <ThemeProvider defaultTheme='dark' enableSystem={false}>
      <SidebarProvider defaultOpen>
        <ProjectProvider projectId=''>
          {showSidebar ? <ChatProvider>{content}</ChatProvider> : content}
        </ProjectProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
