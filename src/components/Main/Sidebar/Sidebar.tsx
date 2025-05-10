import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { PencilIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { createContext, useContext, useState } from 'react';
import {
  RiBarChartFill,
  RiCalendarFill,
  RiCheckboxFill,
  RiDashboardFill,
  RiFileListFill,
  RiFolderFill,
  RiMoneyDollarCircleFill,
  RiSettingsFill,
  RiTeamFill,
  RiUserFill,
} from 'react-icons/ri';

// Create a context for the sidebar toggle function
export const SidebarToggleContext = createContext<{
  toggleSidebar: () => void;
}>({
  toggleSidebar: () => {},
});

export const useSidebarToggle = () => {
  return useContext(SidebarToggleContext);
};

export default function AppSidebar() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { state, toggleSidebar } = useSidebar();

  const navigation = [
    {
      name: 'Payments',
      items: [
        {
          name: 'Invoices',
          href: '#',
          current: true,
          icon: RiFileListFill,
        },
        {
          name: 'Payments',
          href: '#',
          current: false,
          icon: RiMoneyDollarCircleFill,
        },
        {
          name: 'Customers',
          href: '#',
          current: false,
          icon: RiUserFill,
        },
      ],
    },
    {
      name: 'Core',
      items: [
        {
          name: 'Dashboard',
          href: '#',
          current: false,
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
      <SidebarToggleContext.Provider value={{ toggleSidebar }}>
        <Sidebar
          collapsible='icon'
          data-state={state}
          className='group-data-[state=collapsed]:w-16'
        >
          <SidebarHeader className='dark:bg-[#141414] pt-2 group-data-[state=collapsed]:px-2'>
            <div className='flex items-center space-x-3 px-2 py-1'>
              <Avatar className='h-8 w-8 bg-[#373737] rounded-sm'>
                <AvatarFallback className='bg-[#373737] text-[#9f9f9f] text-xs font-semibold'>
                  NP
                </AvatarFallback>
              </Avatar>
              <div className='group-data-[state=collapsed]:hidden'>
                <p className='text-sm font-medium text-white'>Nirav</p>
                <p className='text-xs text-white/60'>niravpatelp129@gmail.com</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className='dark:bg-[#141414] px-2 group-data-[state=collapsed]:px-2'>
            <div className='flex items-center justify-center px-2 mt-2'>
              <Button className='w-full mb-2 bg-white/10 hover:bg-white/20 text-[#f7f7f7] group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:mx-auto mx-8'>
                <PencilIcon className='h-4 w-4' />
                <span className='group-data-[state=collapsed]:hidden'>New Invoice</span>
                <RiFileListFill className='h-4 w-4 group-data-[state=collapsed]:block hidden' />
              </Button>
            </div>

            <SidebarGroup>
              <SidebarMenu>
                {navigation.map((section) => {
                  return (
                    <div key={section.name} className='mb-4'>
                      <h3 className='px-4 text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 group-data-[state=collapsed]:hidden'>
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
                                className='flex items-center gap-3 px-2 text-[#f7f7f7] group-data-[state=collapsed]:justify-center'
                              >
                                <item.icon className='h-4 w-4 text-[#858585]' />
                                <span className='group-data-[state=collapsed]:hidden'>
                                  {item.name}
                                </span>
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
      </SidebarToggleContext.Provider>
    </>
  );
}
