import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { VscChevronDown } from 'react-icons/vsc';

import {
  CiBoxes,
  CiCalendar,
  CiFolderOn,
  CiHome,
  CiLogout,
  CiMenuBurger,
  CiSettings,
  CiUser,
  CiViewBoard,
} from 'react-icons/ci';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

// Desktop navigation item with underline animation
function DesktopNavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 px-3 py-2 text-sm transition-all relative group',
        isActive ? 'font-semibold text-[#484848]' : 'text-muted-foreground font-normal',
      )}
    >
      <div className='scale-80'>{icon}</div>
      <span className='transition-colors duration-200 group-hover:text-[#484848] text-xs h-4 flex items-center text-[#484848]'>
        {label}
      </span>
      <span
        className={cn(
          'absolute bottom-0 left-1/2 h-0.5 bg-primary transform transition-all duration-300',
          isActive
            ? 'w-full left-0 opacity-100'
            : 'w-0 opacity-0 group-hover:w-full group-hover:left-0 group-hover:opacity-50',
        )}
      />
    </Link>
  );
}

// Mobile navigation item for bottom bar
function MobileBottomNavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center py-2 px-1 text-xs transition-all',
        isActive ? 'text-[#484848] font-semibold' : 'text-muted-foreground',
      )}
    >
      <div className={cn('mb-1', isActive ? 'text-[#484848]' : 'text-muted-foreground')}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}

// Mobile navigation item for side menu (user settings)
function MobileMenuNavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-all',
        isActive
          ? 'bg-[#484848] text-white'
          : 'text-muted-foreground hover:bg-muted hover:text-[#484848]',
      )}
    >
      <div className='flex items-center justify-center w-6'>{icon}</div>
      <span className='font-medium text-sm'>{label}</span>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { workspace } = useWorkspace();
  const isProd = process.env.NODE_ENV === 'production';

  const navigation = [
    {
      href: '/',
      label: 'Home',
      icon: <CiHome className='h-5 w-5' />,
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: <CiViewBoard className='h-5 w-5' />,
    },
    {
      href: '/leads',
      label: 'Leads',
      icon: <CiFolderOn className='h-5 w-5' />,
    },
    // {
    //   href: '/invoices',
    //   label: 'Invoices',
    //   icon: <CiViewTimeline className='h-5 w-5' />,
    // },
    {
      href: '/database',
      label: 'Database',
      icon: <CiBoxes className='h-5 w-5' />,
    },
    {
      href: '/calendar',
      label: 'Calendar',
      icon: <CiCalendar className='h-5 w-5' />,
      hidden: isProd,
    },
  ];

  // User settings navigation items
  const userNavigation = [
    {
      href: '/profile',
      label: 'Profile',
      icon: <CiUser className='h-4 w-4' />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <CiSettings className='h-4 w-4' />,
    },
  ];

  // Checks if a navigation item is active
  const isNavItemActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Filter out hidden navigation items
  const visibleNavigation = navigation.filter((item) => {
    return !item.hidden;
  });

  return (
    <>
      {/* Wrapper div that includes both the navigation and spacer */}
      <div>
        {/* Spacers for fixed elements */}
        <div className='h-16 w-full'></div>

        {/* Top header - fixed for all devices */}
        <header className='fixed top-0 z-30 flex h-16 items-center bg-background px-4 md:px-6 w-full border-b'>
          <div className='w-full mx-auto flex items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center'>
              <Link href='/' className='flex items-center gap-2 text-[#000000]'>
                <span className='font-medium font-sans'>{workspace?.name}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className='hidden lg:flex items-center justify-center space-x-3 mx-auto'>
              {visibleNavigation.map((item) => {
                return (
                  <DesktopNavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isNavItemActive(item.href)}
                  />
                );
              })}
            </nav>

            {/* User Profile (visible on all devices) */}
            <div className='flex items-center'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='relative h-10 w-10 p-0 overflow-visible focus:bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                  >
                    <Avatar className='h-8 w-8'>
                      {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user?.name || 'User'} />
                      ) : null}
                      <AvatarFallback className='bg-white text-xs text-[#484848]'>
                        <CiUser className='h-4 w-4' />
                        <VscChevronDown className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium text-[#484848]'>{user?.name || 'User'}</p>
                      <p className='text-xs text-muted-foreground'>
                        {user?.email || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {userNavigation.map((item) => {
                      return (
                        <DropdownMenuItem key={item.href} asChild className='text-sm'>
                          <Link href={item.href} className='text-[#484848]'>
                            {item.icon}
                            <span className='ml-2'>{item.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className='text-sm text-[#484848]'>
                    <CiLogout className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Navigation Bar */}
        <div className='lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background border-t'>
          <nav className='flex justify-around items-center h-16'>
            {visibleNavigation.slice(0, 5).map((item) => {
              return (
                <MobileBottomNavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isNavItemActive(item.href)}
                />
              );
            })}

            {/* More menu for additional items */}
            {visibleNavigation.length > 5 && (
              <Sheet>
                <SheetTrigger asChild>
                  <button className='flex flex-col items-center justify-center py-2 px-1 text-xs text-muted-foreground'>
                    <CiMenuBurger className='h-5 w-5 mb-1' />
                    <span>More</span>
                  </button>
                </SheetTrigger>
                <SheetContent side='bottom' className='h-auto max-h-[40vh] pb-safe'>
                  <div className='pt-6 pb-2'>
                    <div className='flex justify-center pb-4 border-b'>
                      <div className='h-1 w-12 bg-muted-foreground/30 rounded-full'></div>
                    </div>
                    <div className='grid grid-cols-4 gap-4 pt-4'>
                      {visibleNavigation.slice(5).map((item) => {
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className='flex flex-col items-center space-y-1 text-xs'
                          >
                            <div className='bg-muted rounded-full p-3'>{item.icon}</div>
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                      {userNavigation.map((item) => {
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className='flex flex-col items-center space-y-1 text-xs'
                          >
                            <div className='bg-muted rounded-full p-3'>{item.icon}</div>
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
