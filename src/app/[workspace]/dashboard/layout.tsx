'use client';

import { ChatProvider } from '@/contexts/ChatContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}
