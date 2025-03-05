'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { newRequest } from '@/utils/newRequest';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function OnboardPage() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWorkspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setWorkspaceName(name);
    // Generate slug from workspace name
    setWorkspaceSlug(
      name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workspaceName || !workspaceSlug) {
      setError('Workspace name and slug are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock API call - in a real app, you would call your API here
      await newRequest.post('/workspaces', {
        name: workspaceName,
      });

      toast.success('Workspace created successfully');
    } catch (err) {
      setError('Failed to create workspace. Please try again.');
      console.error('Error creating workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Create Your Workspace</CardTitle>
          <CardDescription>Set up your organizations workspace to get started</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='workspaceName'>Workspace Name</Label>
              <Input
                id='workspaceName'
                placeholder='Acme Inc.'
                value={workspaceName}
                onChange={handleWorkspaceNameChange}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='workspaceSlug'>Workspace URL</Label>
              <div className='flex items-center'>
                <span className='text-sm text-muted-foreground mr-2'>toastify.io/</span>
                <Input
                  id='workspaceSlug'
                  placeholder='acme'
                  value={workspaceSlug}
                  onChange={(e) => {return setWorkspaceSlug(e.target.value)}}
                  required
                />
              </div>
              <p className='text-xs text-muted-foreground'>
                This will be your unique workspace URL
              </p>
            </div>

            {error && <p className='text-sm text-red-500'>{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
