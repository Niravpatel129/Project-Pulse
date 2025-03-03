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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardSettingsPage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Settings</h1>
          <p className='text-muted-foreground mt-1'>
            Manage your account and application preferences
          </p>
        </div>
        <Button>Save Changes</Button>
      </div>

      <Tabs defaultValue='account' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-3 md:w-auto md:inline-flex'>
          <TabsTrigger value='account'>Account</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='appearance'>Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value='account' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information and email address.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input id='name' placeholder='John Doe' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input id='email' type='email' placeholder='john@example.com' />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='company'>Company</Label>
                <Input id='company' placeholder='Your Company Name' />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Profile</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password to maintain security.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='current_password'>Current Password</Label>
                <Input id='current_password' type='password' />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='new_password'>New Password</Label>
                  <Input id='new_password' type='password' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirm_password'>Confirm Password</Label>
                  <Input id='confirm_password' type='password' />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between space-y-0'>
                <div className='space-y-0.5'>
                  <Label htmlFor='email_notifications'>Email Notifications</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch id='email_notifications' checked={true} />
              </div>

              <div className='flex items-center justify-between space-y-0'>
                <div className='space-y-0.5'>
                  <Label htmlFor='project_updates'>Project Updates</Label>
                  <p className='text-sm text-muted-foreground'>
                    Get notified when changes are made to your projects
                  </p>
                </div>
                <Switch id='project_updates' checked={true} />
              </div>

              <div className='flex items-center justify-between space-y-0'>
                <div className='space-y-0.5'>
                  <Label htmlFor='payment_notifications'>Payment Updates</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive notifications about invoice status changes
                  </p>
                </div>
                <Switch id='payment_notifications' checked={true} />
              </div>

              <div className='flex items-center justify-between space-y-0'>
                <div className='space-y-0.5'>
                  <Label htmlFor='marketing_emails'>Marketing Emails</Label>
                  <p className='text-sm text-muted-foreground'>
                    Receive updates about new features and promotions
                  </p>
                </div>
                <Switch id='marketing_emails' checked={false} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value='appearance' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>Customize the appearance of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between space-y-0'>
                <div className='space-y-0.5'>
                  <Label htmlFor='dark_mode'>Dark Mode</Label>
                  <p className='text-sm text-muted-foreground'>
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch id='dark_mode' checked={false} />
              </div>

              <div className='flex items-center justify-between space-y-0'>
                <div className='space-y-0.5'>
                  <Label htmlFor='compact_view'>Compact View</Label>
                  <p className='text-sm text-muted-foreground'>
                    Display more content with reduced spacing
                  </p>
                </div>
                <Switch id='compact_view' checked={false} />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Appearance</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
