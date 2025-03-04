'use client';

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
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  Factory,
  Home,
  Layers,
  LogOut,
  Menu,
  Package,
  Settings,
  UserCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

// Desktop navigation item
function DesktopNavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

// Mobile navigation item
function MobileNavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <div className='flex items-center justify-center w-6'>{icon}</div>
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, loading, user, logout } = useAuth();

  // Check if user is logged in
  useEffect(() => {
    if (
      !loading &&
      !isAuthenticated &&
      !pathname.includes('/login') &&
      !pathname.includes('/register')
    ) {
      router.push('/login');
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Check if the current path is login or register
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  // If we're on the login/register page or still loading, only render the children without the layout
  if (isAuthPage || isLoading || loading) {
    return <div className='min-h-screen flex'>{children}</div>;
  }

  const navigation = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className='h-4 w-4' />,
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: <Layers className='h-4 w-4' />,
    },
    {
      href: '/production',
      label: 'Production',
      icon: <Factory className='h-4 w-4' />,
    },
    {
      href: '/customers',
      label: 'Customers',
      icon: <Users className='h-4 w-4' />,
    },
    {
      href: '/inventory',
      label: 'Inventory',
      icon: <Package className='h-4 w-4' />,
    },
    {
      href: '/calendar',
      label: 'Calendar',
      icon: <Calendar className='h-4 w-4' />,
    },
    {
      href: '/payments',
      label: 'Payments',
      icon: <CreditCard className='h-4 w-4' />,
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: <BarChart3 className='h-4 w-4' />,
    },
  ];

  // User settings navigation items - separated to put in a different dropdown
  const userNavigation = [
    {
      href: '/profile',
      label: 'Profile',
      icon: <UserCircle className='h-4 w-4' />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className='h-4 w-4' />,
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

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Top Navigation Bar */}
      <header className='sticky top-0 z-30 flex h-16 items-center border-b bg-background px-4 sm:px-6 shadow-sm'>
        <div className='container mx-auto flex items-center justify-between'>
          {/* Logo and Mobile Menu */}
          <div className='flex items-center gap-2'>
            {/* Mobile Navigation Trigger */}
            <div className='md:hidden mr-2'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <Menu className='h-5 w-5' />
                    <span className='sr-only'>Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side='left' className='w-[85%] max-w-[300px] p-0'>
                  <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </VisuallyHidden>
                  <div className='flex h-14 items-center border-b px-4'>
                    <Link href='/' className='flex items-center gap-2 font-semibold'>
                      <Layers className='h-6 w-6' />
                    </Link>
                  </div>
                  <div className='overflow-y-auto max-h-[calc(100vh-3.5rem)]'>
                    <nav className='grid gap-1 p-2'>
                      {[...navigation, ...userNavigation].map((item) => (
                        <MobileNavItem
                          key={item.href}
                          href={item.href}
                          label={item.label}
                          icon={item.icon}
                          isActive={isNavItemActive(item.href)}
                        />
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link href='/' className='flex items-center gap-2 font-semibold'>
              <Layers className='h-6 w-6' />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-1 ml-6 flex-1'>
            {navigation.map((item) => (
              <DesktopNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isNavItemActive(item.href)}
              />
            ))}
          </nav>

          {/* Right Side - Notifications & User Profile */}
          <div className='flex items-center gap-3'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='relative'>
                  <Bell className='h-5 w-5' />
                  <span className='absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground'>
                    3
                  </span>
                  <span className='sr-only'>Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-80'>
                <DropdownMenuLabel className='flex items-center justify-between'>
                  Notifications
                  <Button variant='ghost' size='sm' className='text-xs h-8'>
                    Mark all as read
                  </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className='max-h-80 overflow-y-auto'>
                  <div className='flex gap-4 p-3 hover:bg-muted/50 rounded-md cursor-pointer'>
                    <div className='flex-shrink-0 mt-1'>
                      <div className='w-2 h-2 bg-primary rounded-full'></div>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>
                        New comment on &quot;Enterprise CRM Implementation&quot;
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Sarah Johnson left a comment on your project
                      </p>
                      <p className='text-xs text-muted-foreground mt-2'>2 hours ago</p>
                    </div>
                  </div>

                  <div className='flex gap-4 p-3 hover:bg-muted/50 rounded-md cursor-pointer'>
                    <div className='flex-shrink-0 mt-1'>
                      <div className='w-2 h-2 bg-primary rounded-full'></div>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Project milestone completed</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        E-commerce Platform Upgrade - Phase 1 completed
                      </p>
                      <p className='text-xs text-muted-foreground mt-2'>Yesterday</p>
                    </div>
                  </div>

                  <div className='flex gap-4 p-3 hover:bg-muted/50 rounded-md cursor-pointer'>
                    <div className='flex-shrink-0 mt-1'>
                      <div className='w-2 h-2 bg-primary rounded-full'></div>
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Invoice paid</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Global Retail paid invoice #INV-2024-042
                      </p>
                      <p className='text-xs text-muted-foreground mt-2'>Yesterday</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className='justify-center'>
                  <Link href='/dashboard/notifications'>View all notifications</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='relative rounded-full h-8 w-8 border'
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src='/avatars/sarah.jpg' alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name?.substring(0, 2) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel className='font-normal'>
                  <div className='flex flex-col space-y-1'>
                    <p className='text-sm font-medium'>{user?.name || 'User'}</p>
                    <p className='text-xs text-muted-foreground'>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {userNavigation.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>
                        {item.icon}
                        <span className='ml-2'>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className='flex-1 p-4 sm:p-6 md:p-8'>{children}</main>
    </div>
  );
}
