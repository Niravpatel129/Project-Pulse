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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  // Use try-catch to safely extract auth context
  let authValues = {
    isAuthenticated: false,
    user: null,
    logout: () => {},
    loading: false,
  };

  try {
    const auth = useAuth();
    if (auth) {
      authValues = {
        isAuthenticated: !!auth.isAuthenticated,
        user: auth.user || null,
        logout: auth.logout || (() => {}),
        loading: !!auth.loading,
      };
    }
  } catch (error) {
    console.warn('Error accessing auth context in Header:', error);
  }

  const { isAuthenticated, user, logout } = authValues;
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Only run on client, avoids hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if the current path is login or register
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // If we're on an auth page, don't show the header
  if (isAuthPage) {
    return null;
  }

  // While not mounted or loading, show a simplified header
  if (!mounted) {
    return (
      <header className='border-b'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <Link href='/' className='font-semibold text-lg'>
            Pulse App
          </Link>
          <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse'></div>
        </div>
      </header>
    );
  }

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
              <Link href='/projects' className='text-sm font-medium hover:text-primary'>
                Projects
              </Link>
            </li>
            {isAuthenticated && user?.role === 'admin' && (
              <li>
                <Link href='/admin' className='text-sm font-medium hover:text-primary'>
                  Admin
                </Link>
              </li>
            )}
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
                    <Button variant='ghost' size='icon' className='rounded-full'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback>
                          {user?.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href='/profile'>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href='/settings'>Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>Sign Out</DropdownMenuItem>
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
