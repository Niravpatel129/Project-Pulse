'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className='container mx-auto py-12 px-4 max-w-3xl'>
        <h1 className='text-3xl font-bold mb-8'>Your Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <h3 className='text-sm font-medium text-gray-500'>Name</h3>
                <p className='mt-1 text-lg'>{user?.name}</p>
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-500'>Email</h3>
                <p className='mt-1 text-lg'>{user?.email}</p>
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-500'>Account Type</h3>
                <p className='mt-1 text-lg capitalize'>{user?.role}</p>
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-500'>User ID</h3>
                <p className='mt-1 text-lg'>{user?.id}</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className='flex justify-between'>
            <Button variant='outline' onClick={() => router.push('/')}>
              Back to Home
            </Button>
            <Button variant='destructive' onClick={handleLogout}>
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
