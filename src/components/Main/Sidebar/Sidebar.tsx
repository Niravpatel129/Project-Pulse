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
} from '@/components/ui/sidebar';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import {
  RiBarChartFill,
  RiCalendarFill,
  RiCheckboxFill,
  RiDashboardFill,
  RiFolderFill,
  RiMenuFill,
  RiSettingsFill,
  RiTeamFill,
} from 'react-icons/ri';

export default function AppSidebar() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    {
      name: 'Core',
      items: [
        {
          name: 'Dashboard',
          href: '#',
          current: true,
          icon: RiDashboardFill,
        },
        {
          name: 'Projects',
          href: '#',
          current: false,
          icon: RiFolderFill,
        },
        {
          name: 'Analytics',
          href: '#',
          current: false,
          icon: RiBarChartFill,
        },
      ],
    },
    {
      name: 'Management',
      items: [
        {
          name: 'Tasks',
          href: '#',
          current: false,
          icon: RiCheckboxFill,
        },
        {
          name: 'Calendar',
          href: '#',
          current: false,
          icon: RiCalendarFill,
        },
        {
          name: 'Team',
          href: '#',
          current: false,
          icon: RiTeamFill,
        },
        {
          name: 'Settings',
          href: '#',
          current: false,
          icon: RiSettingsFill,
        },
      ],
    },
  ];

  return (
    <>
      <div className='lg:hidden fixed top-4 left-4 z-50'>
        <Button
          variant='ghost'
          size='icon'
          className='lg:hidden'
          onClick={() => {
            return setIsOpen(!isOpen);
          }}
        >
          <RiMenuFill className='h-6 w-6' />
          <span className='sr-only'>Open sidebar</span>
        </Button>
      </div>

      <Sidebar>
        <SidebarHeader className='dark:bg-[#141414]'>
          <div className='flex items-center space-x-3 px-2 py-1'>
            <div>
              <p className='text-sm font-medium text-white'>Nirav</p>
              <p className='text-xs text-white/60'>niravpatelp129@gmail.com</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className='dark:bg-[#141414] px-2'>
          <Button className='w-full mb-4 bg-white/10 hover:bg-white/20 text-[#f7f7f7]'>
            New Invoice
          </Button>
          <SidebarGroup>
            <SidebarMenu>
              {navigation.map((section) => {
                return (
                  <div key={section.name} className='mb-4'>
                    <h3 className='px-4 text-xs font-semibold text-white/60 uppercase tracking-wider mb-2'>
                      {section.name}
                    </h3>
                    {section.items.map((item) => {
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            asChild
                            isActive={item.current}
                            tooltip={item.name}
                            className='text-white hover:bg-white/10 data-[active=true]:bg-white/10'
                          >
                            <a
                              href={item.href}
                              className='flex items-center gap-3 px-4 text-[#f7f7f7]'
                            >
                              <item.icon className='h-4 w-4 text-[#858585]' />
                              {item.name}
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter></SidebarFooter>
      </Sidebar>
    </>
  );
}
