'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/useProfile';
import { BellRing, Camera, CreditCard, Lock, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const {
    formData,
    notificationPreferences,
    isLoading,
    handleInputChange,
    handleNotificationChange,
    saveProfile,
    getInitials,
  } = useProfile();

  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className='bg-white'>
      <div className='container mx-auto py-6 space-y-8'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Profile</h1>
            <p className='text-muted-foreground mt-1'>
              Manage your account settings and preferences
            </p>
          </div>
          <Button onClick={saveProfile} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Sidebar */}
          <Card className='col-span-1'>
            <CardContent className='p-6'>
              <div className='flex flex-col items-center'>
                <div className='relative mb-4'>
                  <Avatar className='h-24 w-24'>
                    <AvatarImage src={formData.avatar} alt={formData.name} />
                    <AvatarFallback className='text-2xl'>
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size='icon'
                    variant='outline'
                    className='absolute bottom-0 right-0 rounded-full h-8 w-8'
                  >
                    <Camera className='h-4 w-4' />
                    <span className='sr-only'>Change avatar</span>
                  </Button>
                </div>
                <h2 className='text-xl font-semibold'>{formData.name}</h2>
                <p className='text-sm text-muted-foreground'>{formData.jobTitle}</p>

                <div className='w-full mt-6 space-y-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => {
                      return setActiveTab('general');
                    }}
                  >
                    <User className='mr-2 h-4 w-4' />
                    General
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => {
                      return setActiveTab('notifications');
                    }}
                  >
                    <BellRing className='mr-2 h-4 w-4' />
                    Notifications
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => {
                      return setActiveTab('security');
                    }}
                  >
                    <Lock className='mr-2 h-4 w-4' />
                    Security
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => {
                      return setActiveTab('billing');
                    }}
                  >
                    <CreditCard className='mr-2 h-4 w-4' />
                    Billing
                  </Button>
                </div>

                <div className='w-full mt-6 pt-6 border-t'>
                  <p className='text-xs text-muted-foreground mb-2'>
                    Member since{' '}
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className='col-span-1 lg:col-span-3'>
            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <CardHeader className='pb-0'>
                <TabsList className='w-full sm:w-auto'>
                  <TabsTrigger value='general'>General</TabsTrigger>
                  <TabsTrigger value='notifications'>Notifications</TabsTrigger>
                  <TabsTrigger value='security'>Security</TabsTrigger>
                  <TabsTrigger value='billing'>Billing</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className='pt-6'>
                <TabsContent value='general' className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Personal Information</h3>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='name'>Full Name</Label>
                        <Input id='name' value={formData.name} onChange={handleInputChange} />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='jobTitle'>Job Title</Label>
                        <Input
                          id='jobTitle'
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                          id='email'
                          type='email'
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='phone'>Phone</Label>
                        <Input
                          id='phone'
                          type='tel'
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='bio'>Bio</Label>
                      <Textarea
                        id='bio'
                        className='min-h-24'
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                      />
                      <p className='text-xs text-muted-foreground'>
                        Brief description for your profile. This will be displayed publicly.
                      </p>
                    </div>

                    <Separator className='my-6' />
                  </div>
                </TabsContent>

                <TabsContent value='notifications' className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Email Notifications</h3>
                    <p className='text-sm text-muted-foreground'>
                      Choose what types of emails you want to receive
                    </p>

                    <div className='space-y-4'>
                      {notificationPreferences.map((pref) => {
                        return (
                          <div key={pref.id} className='flex items-start space-x-4'>
                            <div className='pt-0.5'>
                              <input
                                type='checkbox'
                                id={pref.id}
                                checked={pref.enabled}
                                onChange={handleNotificationChange}
                                className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                              />
                            </div>
                            <div>
                              <Label htmlFor={pref.id} className='font-medium'>
                                {pref.label}
                              </Label>
                              <p className='text-sm text-muted-foreground'>{pref.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator className='my-6' />

                    <h3 className='text-lg font-medium'>Notification Delivery</h3>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-4'>
                        <div className='rounded-full p-2 bg-primary/10'>
                          <Mail className='h-5 w-5 text-primary' />
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium'>Email Notifications</div>
                          <div className='text-sm text-muted-foreground'>
                            Receive daily summary emails
                          </div>
                        </div>
                        <Button variant='outline' size='sm'>
                          Configure
                        </Button>
                      </div>

                      <div className='flex items-center gap-4'>
                        <div className='rounded-full p-2 bg-primary/10'>
                          <Phone className='h-5 w-5 text-primary' />
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium'>SMS Notifications</div>
                          <div className='text-sm text-muted-foreground'>
                            Get urgent alerts via text message
                          </div>
                        </div>
                        <Button variant='outline' size='sm'>
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='security' className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Change Password</h3>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='current-password'>Current Password</Label>
                        <Input id='current-password' type='password' />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='new-password'>New Password</Label>
                        <Input id='new-password' type='password' />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='confirm-password'>Confirm New Password</Label>
                        <Input id='confirm-password' type='password' />
                      </div>
                      <Button>Update Password</Button>
                    </div>

                    <Separator className='my-6' />

                    <h3 className='text-lg font-medium'>Two-Factor Authentication</h3>
                    <p className='text-sm text-muted-foreground'>
                      Add an extra layer of security to your account
                    </p>
                    <Button variant='outline'>Enable Two-Factor Auth</Button>

                    <Separator className='my-6' />

                    <h3 className='text-lg font-medium'>Sessions</h3>
                    <div className='rounded-md border p-4'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='font-medium'>Current Session</p>
                          <p className='text-sm text-muted-foreground mt-1'>
                            MacOS • Chrome • New York, USA
                          </p>
                          <p className='text-xs text-muted-foreground mt-1'>Started 2 hours ago</p>
                        </div>
                        <div className='rounded-full px-2 py-1 bg-green-100 text-green-800 text-xs font-medium'>
                          Active Now
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='billing' className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Payment Methods</h3>
                    <div className='rounded-md border p-4'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-3'>
                          <CreditCard className='h-8 w-8 text-primary' />
                          <div>
                            <p className='font-medium'>Visa ending in 4242</p>
                            <p className='text-sm text-muted-foreground'>Expires 12/2025</p>
                          </div>
                        </div>
                        <Button variant='ghost' size='sm'>
                          Edit
                        </Button>
                      </div>
                    </div>
                    <Button variant='outline'>Add Payment Method</Button>

                    <Separator className='my-6' />

                    <h3 className='text-lg font-medium'>Billing Information</h3>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='company'>Company Name</Label>
                        <Input id='company' defaultValue='Acme Inc.' />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='address'>Billing Address</Label>
                        <Textarea
                          id='address'
                          className='min-h-20'
                          defaultValue='123 Business St.&#10;Suite 200&#10;New York, NY 10001&#10;United States'
                        />
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='tax-id'>Tax ID</Label>
                          <Input id='tax-id' defaultValue='US123456789' />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='billing-email'>Billing Email</Label>
                          <Input id='billing-email' type='email' defaultValue='billing@acme.com' />
                        </div>
                      </div>
                      <Button>Update Billing Info</Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
