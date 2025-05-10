'use client';

import Sidebar from '@/components/Main/Sidebar/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function Main() {
  return (
    <ThemeProvider defaultTheme='dark' enableSystem={false}>
      <div className='relative flex min-h-screen bg-background text-foreground'>
        <Sidebar />
        <main className='flex-1 pl-64'>
          <div className='container mx-auto p-6'>
            <h1 className='text-2xl font-bold'>Dashboard</h1>
            {/* Add your main content here */}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
