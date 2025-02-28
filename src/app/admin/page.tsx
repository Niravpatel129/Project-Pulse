'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <ProtectedRoute requiredRole='admin'>
      <div className='container mx-auto py-12 px-4 max-w-6xl'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
          <p className='text-gray-600'>
            Welcome back, <span className='font-semibold'>{user?.name}</span>
          </p>
        </div>

        <Tabs defaultValue='users' onValueChange={setActiveTab} value={activeTab}>
          <TabsList className='mb-6'>
            <TabsTrigger value='users'>Users</TabsTrigger>
            <TabsTrigger value='settings'>System Settings</TabsTrigger>
            <TabsTrigger value='logs'>Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value='users'>
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage system users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='border rounded-lg p-4'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <h3 className='font-medium'>Admin User</h3>
                        <p className='text-sm text-gray-500'>admin@example.com</p>
                      </div>
                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm'>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className='border rounded-lg p-4'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <h3 className='font-medium'>Regular User</h3>
                        <p className='text-sm text-gray-500'>user@example.com</p>
                      </div>
                      <div className='flex gap-2'>
                        <Button variant='outline' size='sm'>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                  <p className='text-sm text-gray-500 mt-4'>
                    * This is a mock admin interface. In a real application, you would connect to a
                    backend API for user management.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='settings'>
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure application settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-gray-500'>
                  System settings would be configured here in a real application.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='logs'>
            <Card>
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>View system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-gray-500'>
                  Activity logs would appear here in a real application.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
