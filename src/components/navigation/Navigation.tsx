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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { VscChevronDown } from 'react-icons/vsc';

import {
  CiBoxes,
  CiBoxList,
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

// Mobile navigation item
function MobileNavItem({ href, label, icon, isActive }: NavItemProps) {
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
      hidden: isProd,
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
        {/* Spacer div with the same height as the navigation */}
        <div className='h-16 w-full'></div>
        <header className='fixed top-0 z-30 flex h-16 items-center bg-background px-4 md:px-6 w-full'>
          <div className='w-full mx-auto flex items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center'>
              <Link href='/' className='flex items-center gap-2 text-[#000000]'>
                <span className='font-medium font-sans '>{workspace?.name}</span>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className='lg:hidden'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-9 w-9'>
                    <CiMenuBurger className='h-5 w-5 text-[#484848]' />
                    <span className='sr-only'>Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-[85%] max-w-[300px] p-0'>
                  <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </VisuallyHidden>
                  <div className='flex h-14 items-center border-b px-4'>
                    <Link href='/' className='flex items-center gap-2 font-semibold text-[#484848]'>
                      <CiBoxList className='h-6 w-6' />
                      <span className='text-base'>Pulse</span>
                    </Link>
                  </div>
                  <div className='overflow-y-auto max-h-[calc(100vh-3.5rem)]'>
                    <nav className='grid gap-1 p-2'>
                      {[...visibleNavigation, ...userNavigation].map((item) => {
                        return (
                          <MobileNavItem
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            isActive={isNavItemActive(item.href)}
                          />
                        );
                      })}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
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

            {/* User Profile */}
            <div className='flex items-center'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='relative h-10 w-10 p-0 overflow-visible focus:bg-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
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
      </div>
    </>
  );
}
