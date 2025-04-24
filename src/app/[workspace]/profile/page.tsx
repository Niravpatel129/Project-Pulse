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
import { BellRing, Camera, Lock, User } from 'lucide-react';
import { useRef, useState } from 'react';

export default function ProfilePage() {
  const {
    formData,
    notificationPreferences,
    isLoading,
    isUploadingAvatar,
    isUpdatingPassword,
    passwordError,
    passwordForm,
    handleInputChange,
    handleNotificationChange,
    handleAvatarUpload,
    handlePasswordChange,
    updatePassword,
    saveProfile,
    getInitials,
  } = useProfile();

  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle camera button click
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

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
                    {formData.avatar ? (
                      <AvatarImage src={formData.avatar} alt={formData.name} />
                    ) : null}
                    <AvatarFallback className='text-2xl'>
                      {getInitials(formData.name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Hidden file input */}
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept='image/jpeg,image/png,image/gif,image/webp'
                    className='hidden'
                  />
                  <Button
                    size='icon'
                    variant='outline'
                    className='absolute bottom-0 right-0 rounded-full h-8 w-8'
                    onClick={handleCameraClick}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                    ) : (
                      <Camera className='h-4 w-4' />
                    )}
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
                </div>

                <div className='w-full mt-6 pt-6 border-t'>
                  <p className='text-xs text-muted-foreground mb-2'>
                    Member since{' '}
                    {new Date(formData.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
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
                  </div>
                </TabsContent>

                <TabsContent value='security' className='space-y-6'>
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium'>Change Password</h3>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='currentPassword'>Current Password</Label>
                        <Input
                          id='currentPassword'
                          type='password'
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='newPassword'>New Password</Label>
                        <Input
                          id='newPassword'
                          type='password'
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                        <Input
                          id='confirmPassword'
                          type='password'
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                        />
                      </div>
                      {passwordError && <p className='text-sm text-destructive'>{passwordError}</p>}
                      <Button onClick={updatePassword} disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
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
