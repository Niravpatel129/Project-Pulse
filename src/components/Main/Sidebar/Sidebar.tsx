import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

export default function AppSidebar() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '#',
      current: true,
    },
    {
      name: 'Projects',
      href: '#',
      current: false,
    },
    {
      name: 'Tasks',
      href: '#',
      current: false,
    },
    {
      name: 'Calendar',
      href: '#',
      current: false,
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className='lg:hidden fixed top-4 left-4 z-50'>
        <Button
          variant='ghost'
          size='icon'
          className='lg:hidden'
          onClick={() => {
            return setIsOpen(!isOpen);
          }}
        >
          <Menu className='h-6 w-6' />
          <span className='sr-only'>Open sidebar</span>
        </Button>
      </div>

      <Sidebar>
        <SidebarHeader>
          <h1 className='text-xl font-semibold'>Pulse</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navigation.map((item) => {
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={item.current} tooltip={item.name}>
                      <a href={item.href}>{item.name}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className='flex items-center space-x-3'>
            <div className='h-8 w-8 rounded-full bg-accent'></div>
            <div>
              <p className='text-sm font-medium'>User Name</p>
              <p className='text-xs text-muted-foreground'>user@example.com</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
