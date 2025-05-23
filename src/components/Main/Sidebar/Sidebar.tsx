import CreateInvoiceDialog from '@/components/InvoicesList/CreateInvoiceDialog';
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
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { ArrowLeft, Moon, PencilIcon, Send, Sun, Trash2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  RiChat1Fill,
  RiFileListFill,
  RiMoneyDollarCircleFill,
  RiSettingsFill,
  RiUserFill,
} from 'react-icons/ri';

// Custom hook for media queries
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Prevent SSR issues
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => {
      return setMatches(media.matches);
    };
    media.addEventListener('change', listener);

    return () => {
      return media.removeEventListener('change', listener);
    };
  }, [matches, query]);

  return matches;
}

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
  const { state, toggleSidebar, setOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const isTablet = useMediaQuery('(max-width: 768px)');
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [isChatView, setIsChatView] = useState(false);
  const { sessions, currentSession, setCurrentSession, deleteSession, isLoadingSessions } =
    useChat();
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update chat view state based on pathname
  useEffect(() => {
    setIsChatView(pathname.startsWith('/dashboard/chat'));
  }, [pathname]);

  // Close sidebar when screen size is tablet
  useEffect(() => {
    if (isTablet && state !== 'collapsed') {
      setOpen(false);
    }
  }, [isTablet, state, setOpen]);

  // Return null during server-side rendering or before mounting
  if (!mounted) {
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return nameParts[0][0] + nameParts[1][0];
    }
    return name.substring(0, 2);
  };

  const navigation = [
    {
      name: 'Payments',
      items: [
        {
          name: 'Invoices',
          href: '/dashboard/invoices',
          current: pathname === '/dashboard/invoices',
          icon: RiFileListFill,
        },
        {
          name: 'Payments',
          href: '/dashboard/payments',
          current: pathname === '/dashboard/payments',
          icon: RiMoneyDollarCircleFill,
        },
        {
          name: 'Customers',
          href: '/dashboard/customers',
          current: pathname === '/dashboard/customers',
          icon: RiUserFill,
        },
      ],
    },
    ...(process.env.NODE_ENV === 'development'
      ? [
          {
            name: 'AI',
            items: [
              {
                name: 'Chat',
                href: '/dashboard/chat',
                current: pathname === '/dashboard/chat',
                icon: RiChat1Fill,
              },
            ],
          },
        ]
      : []),
    {
      name: 'Management',
      items: [
        {
          name: 'Settings',
          href: '/dashboard/settings',
          current: pathname === '/dashboard/settings',
          icon: RiSettingsFill,
        },
      ],
    },
  ];

  const handleBackToDashboard = () => {
    router.push('/dashboard/invoices');
    setIsChatView(false);
  };

  const handleChatClick = async (sessionId: string) => {
    try {
      setIsLoadingChat(true);
      const session = sessions.find((s) => {
        return s.id === sessionId;
      });
      if (session) {
        await setCurrentSession(session);
        router.push(`/dashboard/chat/${sessionId}`);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoadingChat(false);
    }
  };

  return (
    <>
      <SidebarToggleContext.Provider value={{ toggleSidebar }}>
        <Sidebar
          collapsible='icon'
          data-state={state}
          className='group-data-[state=collapsed]:w-16'
        >
          <SidebarHeader className='bg-white dark:bg-[#141414] pt-2 group-data-[state=collapsed]:px-2'>
            <div className='flex items-center space-x-3 px-2 py-1'>
              <Avatar className='h-8 w-8 bg-[#E4E4E7] dark:bg-[#373737] rounded-sm'>
                <AvatarFallback className='bg-[#E4E4E7] dark:bg-[#373737] text-[#3F3F46] dark:text-[#9f9f9f] text-xs font-semibold'>
                  {user ? getInitials(user.name) : ''}
                </AvatarFallback>
              </Avatar>
              <div className='group-data-[state=collapsed]:hidden'>
                <p className='text-sm font-medium text-[#3F3F46] dark:text-white'>{user?.name}</p>
                <p className='text-xs text-[#3F3F46]/60 dark:text-white/60'>{user?.email}</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className='bg-white dark:bg-[#141414] px-2 group-data-[state=collapsed]:px-2'>
            {isChatView ? (
              <>
                <div className='flex items-center justify-between px-0 mt-2 mb-4'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleBackToDashboard}
                    className='text-[#3F3F46] dark:text-[#f7f7f7] hover:bg-[#eaeaea] dark:hover:bg-white/10'
                  >
                    <ArrowLeft className='h-4 w-4' />
                    <span className='group-data-[state=collapsed]:hidden ml-2'>
                      Back to Dashboard
                    </span>
                  </Button>
                </div>
                <div className='px-2'>
                  <h3 className='text-xs font-semibold text-[#3F3F46] dark:text-[#898989] text-[13px] uppercase tracking-wider mb-2 group-data-[state=collapsed]:hidden'>
                    Previous Chats
                  </h3>
                  {isLoadingSessions ? (
                    <div className='text-sm text-[#3F3F46] dark:text-[#898989]'>
                      Loading conversations...
                    </div>
                  ) : sessions.length > 0 ? (
                    <div className='space-y-2'>
                      {sessions.map((session) => {
                        return (
                          <div
                            key={session.id}
                            className='flex items-center justify-between p-2 rounded-md hover:bg-[#eaeaea] dark:hover:bg-white/10 cursor-pointer group'
                            onClick={() => {
                              return handleChatClick(session.id);
                            }}
                          >
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-medium text-[#3F3F46] dark:text-[#f7f7f7] truncate'>
                                {session.title}
                              </p>
                              <p className='text-xs text-[#3F3F46]/60 dark:text-[#f7f7f7]/60 truncate'>
                                {new Date(session.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='opacity-0 group-hover:opacity-100 h-8 w-8'
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSession(session.id);
                              }}
                              disabled={isLoadingChat}
                            >
                              <Trash2 className='h-4 w-4 text-[#3F3F46] dark:text-[#f7f7f7]' />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='text-sm text-[#3F3F46] dark:text-[#898989]'>
                      No previous chats
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className='flex items-center justify-center px-2 mt-2'>
                  <Button
                    className='w-full mb-2 bg-white/10 hover:bg-white/20 text-[#3F3F46] dark:text-[#f7f7f7] group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:mx-auto border border-[#E4E4E7] dark:border-none'
                    onClick={() => {
                      return setIsCreateInvoiceOpen(true);
                    }}
                  >
                    <PencilIcon className='h-4 w-4 group-data-[state=collapsed]:hidden' />
                    <span className='group-data-[state=collapsed]:hidden'>New Invoice</span>
                    <Send className='h-4 w-4 group-data-[state=collapsed]:block hidden' />
                  </Button>
                </div>

                <SidebarGroup>
                  <SidebarMenu>
                    {navigation.map((section) => {
                      return (
                        <div key={section.name} className='mb-4'>
                          <h3 className='px-0 text-xs font-semibold text-[#3F3F46] dark:text-[#898989] text-[13px] uppercase tracking-wider mb-2 group-data-[state=collapsed]:hidden'>
                            {section.name}
                          </h3>
                          {section.items.map((item) => {
                            return (
                              <SidebarMenuItem key={item.name}>
                                <SidebarMenuButton
                                  asChild
                                  isActive={item.current}
                                  tooltip={item.name}
                                  className='text-white hover:bg-[#eaeaea] dark:hover:bg-white/10 data-[active=true]:bg-[#eaeaea] dark:data-[active=true]:bg-white/10 mb-1'
                                >
                                  <Link
                                    href={item.href}
                                    className='flex items-center gap-3 px-2 text-[#3F3F46] dark:text-[#fafafa] group-data-[state=collapsed]:justify-center'
                                  >
                                    <item.icon className='h-4 w-4 text-[#3F3F46] dark:text-[#858585]' />
                                    <span className='group-data-[state=collapsed]:hidden text-[#3F3F46] dark:text-[#fafafa]'>
                                      {item.name}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </div>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroup>
              </>
            )}
          </SidebarContent>
          <SidebarFooter className='bg-white dark:bg-[#141414] border-t border-[#E4E4E7] dark:border-[#232428]'>
            <Button
              variant='ghost'
              size='icon'
              className='w-full text-[#8b8b8b] hover:text-[#3F3F46] dark:text-[#8b8b8b] dark:hover:text-white hover:bg-gray-300 dark:hover:bg-white/10'
              onClick={() => {
                return setTheme(theme === 'dark' ? 'light' : 'dark');
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </SidebarFooter>
        </Sidebar>
      </SidebarToggleContext.Provider>

      <CreateInvoiceDialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen} />
    </>
  );
}
