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
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  UserCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

function NavItem({ href, label, icon, isActive }: NavItemProps) {
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
  const { user } = useAuth();

  const navigation = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: <LayoutDashboard className='h-4 w-4' />,
    },
    {
      href: '/dashboard/projects',
      label: 'Projects',
      icon: <Layers className='h-4 w-4' />,
    },
    {
      href: '/dashboard/production',
      label: 'Production',
      icon: <Factory className='h-4 w-4' />,
    },
    {
      href: '/dashboard/customers',
      label: 'Customers',
      icon: <Users className='h-4 w-4' />,
    },
    {
      href: '/dashboard/inventory',
      label: 'Inventory',
      icon: <Package className='h-4 w-4' />,
    },
    {
      href: '/dashboard/calendar',
      label: 'Calendar',
      icon: <Calendar className='h-4 w-4' />,
    },
    {
      href: '/dashboard/payments',
      label: 'Payments',
      icon: <CreditCard className='h-4 w-4' />,
    },
    {
      href: '/dashboard/analytics',
      label: 'Analytics',
      icon: <BarChart3 className='h-4 w-4' />,
    },
    {
      href: '/dashboard/profile',
      label: 'Profile',
      icon: <UserCircle className='h-4 w-4' />,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: <Settings className='h-4 w-4' />,
    },
  ];

  return (
    <div className='flex min-h-screen flex-col'>
      <div className='flex flex-1'>
        {/* Sidebar Navigation - Fixed on desktop */}
        <aside className='hidden border-r bg-muted/40 lg:block fixed inset-y-0 left-0 z-40 w-64 transition-transform'>
          <div className='flex h-full flex-col gap-2'>
            <div className='flex h-14 items-center border-b px-4'>
              <Link href='/dashboard' className='flex items-center gap-2 font-semibold'>
                <Layers className='h-6 w-6' />
                <span>Pulse Dashboard</span>
              </Link>
            </div>
            <div className='flex-1 overflow-y-auto py-2 px-4'>
              <nav className='grid items-start gap-2'>
                {navigation.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={
                      item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href)
                    }
                  />
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content - With left padding on desktop to account for fixed sidebar */}
        <div className='flex flex-1 flex-col w-full lg:pl-64'>
          {/* Top Navigation Bar */}
          <header className='sticky top-0 z-30 flex h-14 items-center border-b bg-background px-4 sm:px-6'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='ghost' size='icon' className='lg:hidden'>
                  <Menu className='h-5 w-5' />
                  <span className='sr-only'>Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side='left' className='w-[85%] max-w-[300px] p-0'>
                <VisuallyHidden>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </VisuallyHidden>
                <div className='flex h-14 items-center border-b px-4'>
                  <Link href='/dashboard' className='flex items-center gap-2 font-semibold'>
                    <Layers className='h-6 w-6' />
                    <span>Pulse Dashboard</span>
                  </Link>
                </div>
                <div className='overflow-y-auto max-h-[calc(100vh-3.5rem)]'>
                  <nav className='grid gap-1 p-2'>
                    {navigation.map((item) => (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={
                          item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href)
                        }
                      />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <div className='flex-1 text-center lg:text-left'></div>

            <div className='flex items-center gap-3 justify-center'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className='mt-2'>
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
                      <AvatarImage src='/avatars/sarah.jpg' alt='Sarah Johnson' />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium'>Sarah Johnson</p>
                      <p className='text-xs text-muted-foreground'>sarah.johnson@example.com</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href='/dashboard/profile'>
                        <UserCircle className='mr-2 h-4 w-4' />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/dashboard/settings'>
                        <Settings className='mr-2 h-4 w-4' />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className='mr-2 h-4 w-4' />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className='flex-1 p-4 sm:p-6 md:p-8'>{children}</main>
        </div>
      </div>
    </div>
  );
}
