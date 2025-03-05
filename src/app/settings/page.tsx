'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    twoFactorAuth: false,
    autoSave: true,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => {return {
      ...prev,
      [setting]: !prev[setting],
    }});
  };

  return (
    <ProtectedRoute>
      <div className='container mx-auto py-12 px-4 max-w-3xl'>
        <h1 className='text-3xl font-bold mb-2'>Settings</h1>
        <p className='text-gray-500 mb-8'>Customize your application preferences</p>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='dark-mode'>Dark Mode</Label>
                <p className='text-sm text-gray-500'>Toggle dark mode on or off</p>
              </div>
              <Switch
                id='dark-mode'
                checked={settings.darkMode}
                onCheckedChange={() => {return handleToggle('darkMode')}}
              />
            </div>
          </CardContent>
        </Card>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='email-notifications'>Email Notifications</Label>
                <p className='text-sm text-gray-500'>
                  Receive email notifications for important updates
                </p>
              </div>
              <Switch
                id='email-notifications'
                checked={settings.emailNotifications}
                onCheckedChange={() => {return handleToggle('emailNotifications')}}
              />
            </div>
            <Separator />
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='auto-save'>Auto-Save</Label>
                <p className='text-sm text-gray-500'>Automatically save changes while working</p>
              </div>
              <Switch
                id='auto-save'
                checked={settings.autoSave}
                onCheckedChange={() => {return handleToggle('autoSave')}}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='two-factor'>Two-Factor Authentication</Label>
                <p className='text-sm text-gray-500'>
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id='two-factor'
                checked={settings.twoFactorAuth}
                onCheckedChange={() => {return handleToggle('twoFactorAuth')}}
              />
            </div>
          </CardContent>
          <CardFooter>
            <p className='text-xs text-gray-500'>
              Note: All settings shown here are mock implementations and will not persist between
              page refreshes. In a real application, these would be saved to your user profile.
            </p>
          </CardFooter>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
