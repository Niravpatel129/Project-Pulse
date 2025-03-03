'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();

  // Get auth values
  const { isAuthenticated, user, logout } = useAuth();

  // Debug log auth state changes
  useEffect(() => {
    console.log('Header auth state:', {
      isAuthenticated,
      user: user ? `${user.name} (${user.email})` : 'none',
    });
  }, [isAuthenticated, user]);

  // Check if the current path is login or register
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Check if the current path is in the dashboard
  const isDashboardPage = pathname.startsWith('/dashboard');

  // If we're on an auth page, don't show the header
  if (isAuthPage) {
    return null;
  }

  // If we're on a dashboard page, don't show the regular header
  if (isDashboardPage) {
    return null;
  }

  // Handle logout with reload
  const handleLogout = () => {
    logout();
    // Force redirect after logout
    window.location.href = '/';
  };

  return (
    <header className='border-b'>
      <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
        <Link href='/' className='font-semibold text-lg'>
          Pulse App
        </Link>

        <nav>
          <ul className='flex items-center space-x-6'>
            <li>
              <Link href='/' className='text-sm font-medium hover:text-primary'>
                Home
              </Link>
            </li>
            <li>
              <Link href='/' className='text-sm font-medium hover:text-primary flex items-center'>
                <LayoutDashboard className='h-4 w-4 mr-1' />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href='/projects' className='text-sm font-medium hover:text-primary'>
                Projects
              </Link>
            </li>

            {/* Admin link - only for admin users */}
            {isAuthenticated && user?.role === 'admin' && (
              <li>
                <Link href='/admin' className='text-sm font-medium hover:text-primary'>
                  Admin
                </Link>
              </li>
            )}

            {/* Auth buttons or user menu */}
            {!isAuthenticated ? (
              <>
                <li>
                  <Button asChild variant='ghost' size='sm'>
                    <Link href='/login'>Sign In</Link>
                  </Button>
                </li>
                <li>
                  <Button asChild size='sm'>
                    <Link href='/register'>Sign Up</Link>
                  </Button>
                </li>
              </>
            ) : (
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-full relative overflow-hidden'
                    >
                      <Avatar className='h-8 w-8 bg-primary text-primary-foreground border border-border text-black'>
                        <AvatarFallback className='font-semibold'>
                          {user?.name
                            ? user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                            : '?'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel className='flex flex-col gap-1'>
                      <span>{user?.name || 'Unknown User'}</span>
                      <span className='text-xs text-muted-foreground'>
                        {user?.email || 'No email'}
                      </span>
                      <span className='text-xs text-muted-foreground capitalize'>
                        Role: {user?.role || 'unknown'}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href='/dashboard'>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/profile'>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/settings'>Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
