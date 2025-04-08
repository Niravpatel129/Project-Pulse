'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { FormPreview } from './FormPreview';

export interface BrandingSettings {
  logoUrl: string;
  companyName: string;
  primaryColor: string;
  accentColor: string;
  faviconUrl: string;
  headerTitle: string;
  headerSubtext: string;
  backgroundImageUrl: string;
  formAlignment: 'center' | 'left';
  fontStyle: 'system' | 'custom';
  customFontUrl: string;
  successMessage: string;
  redirectUrl: string;
  customSubdomain: string;
  metaTitle: string;
  metaDescription: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
}

export function FormSettings() {
  const [settings, setSettings] = useState<BrandingSettings>({
    logoUrl: '',
    companyName: '',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    faviconUrl: '',
    headerTitle: '',
    headerSubtext: '',
    backgroundImageUrl: '',
    formAlignment: 'center',
    fontStyle: 'system',
    customFontUrl: '',
    successMessage: '',
    redirectUrl: '',
    customSubdomain: '',
    metaTitle: '',
    metaDescription: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
  });

  const handleImageUpload = async (field: 'logoUrl' | 'faviconUrl' | 'backgroundImageUrl') => {
    // TODO: Implement image upload
    console.log('Uploading image for:', field);
  };

  return (
    <div className='flex h-[calc(100vh-8rem)] overflow-hidden'>
      {/* Settings Panel */}
      <div className='w-1/2 overflow-y-auto border-r border-gray-100'>
        <div className='p-8 space-y-8'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-medium text-gray-900'>Form Settings</h1>
            <p className='text-sm text-gray-500'>
              Customize your form&apos;s appearance and behavior
            </p>
          </div>

          <Tabs defaultValue='branding' className='space-y-6'>
            <TabsList className='grid grid-cols-4 w-full'>
              <TabsTrigger value='branding' className='text-sm'>
                Branding
              </TabsTrigger>
              <TabsTrigger value='form' className='text-sm'>
                Form
              </TabsTrigger>
              <TabsTrigger value='success' className='text-sm'>
                Success
              </TabsTrigger>
              <TabsTrigger value='advanced' className='text-sm'>
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value='branding' className='space-y-6'>
              <Card className='border-0 shadow-none'>
                <CardHeader className='px-0'>
                  <CardTitle className='text-base font-medium'>Company Branding</CardTitle>
                </CardHeader>
                <CardContent className='px-0 space-y-6'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm text-gray-600'>Company Logo</Label>
                      <div className='flex items-center gap-3'>
                        {settings.logoUrl && (
                          <img
                            src={settings.logoUrl}
                            alt='Company logo'
                            className='h-12 w-12 object-contain rounded'
                          />
                        )}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            return handleImageUpload('logoUrl');
                          }}
                          className='text-sm'
                        >
                          Upload Logo
                        </Button>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-sm text-gray-600'>Company Name</Label>
                      <Input
                        value={settings.companyName}
                        onChange={(e) => {
                          return setSettings({ ...settings, companyName: e.target.value });
                        }}
                        placeholder='Your Company Name'
                        className='text-sm'
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label className='text-sm text-gray-600'>Primary Color</Label>
                        <div className='flex gap-2'>
                          <Input
                            type='color'
                            value={settings.primaryColor}
                            onChange={(e) => {
                              return setSettings({ ...settings, primaryColor: e.target.value });
                            }}
                            className='w-10 h-10 p-1 rounded'
                          />
                          <Input
                            value={settings.primaryColor}
                            onChange={(e) => {
                              return setSettings({ ...settings, primaryColor: e.target.value });
                            }}
                            className='text-sm'
                          />
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label className='text-sm text-gray-600'>Accent Color</Label>
                        <div className='flex gap-2'>
                          <Input
                            type='color'
                            value={settings.accentColor}
                            onChange={(e) => {
                              return setSettings({ ...settings, accentColor: e.target.value });
                            }}
                            className='w-10 h-10 p-1 rounded'
                          />
                          <Input
                            value={settings.accentColor}
                            onChange={(e) => {
                              return setSettings({ ...settings, accentColor: e.target.value });
                            }}
                            className='text-sm'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-0 shadow-none'>
                <CardHeader className='px-0'>
                  <CardTitle className='text-base font-medium'>Header Content</CardTitle>
                </CardHeader>
                <CardContent className='px-0 space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm text-gray-600'>Header Title</Label>
                    <Input
                      value={settings.headerTitle}
                      onChange={(e) => {
                        return setSettings({ ...settings, headerTitle: e.target.value });
                      }}
                      placeholder='Welcome to Our Form'
                      className='text-sm'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm text-gray-600'>Header Subtext</Label>
                    <Textarea
                      value={settings.headerSubtext}
                      onChange={(e) => {
                        return setSettings({ ...settings, headerSubtext: e.target.value });
                      }}
                      placeholder='Please fill out the form below to get started'
                      className='text-sm min-h-[80px]'
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='form' className='space-y-6'>
              <Card className='border-0 shadow-none'>
                <CardHeader className='px-0'>
                  <CardTitle className='text-base font-medium'>Form Page Settings</CardTitle>
                </CardHeader>
                <CardContent className='px-0 space-y-6'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm text-gray-600'>Background Image</Label>
                      <div className='flex items-center gap-3'>
                        {settings.backgroundImageUrl && (
                          <img
                            src={settings.backgroundImageUrl}
                            alt='Background'
                            className='h-16 w-16 object-cover rounded'
                          />
                        )}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            return handleImageUpload('backgroundImageUrl');
                          }}
                          className='text-sm'
                        >
                          Upload Background
                        </Button>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label className='text-sm text-gray-600'>Form Alignment</Label>
                      <div className='flex gap-2'>
                        <Button
                          variant={settings.formAlignment === 'center' ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => {
                            return setSettings({ ...settings, formAlignment: 'center' });
                          }}
                          className='text-sm'
                        >
                          Center
                        </Button>
                        <Button
                          variant={settings.formAlignment === 'left' ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => {
                            return setSettings({ ...settings, formAlignment: 'left' });
                          }}
                          className='text-sm'
                        >
                          Left
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='success' className='space-y-6'>
              <Card className='border-0 shadow-none'>
                <CardHeader className='px-0'>
                  <CardTitle className='text-base font-medium'>Success Page Settings</CardTitle>
                </CardHeader>
                <CardContent className='px-0 space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm text-gray-600'>Success Message</Label>
                    <Textarea
                      value={settings.successMessage}
                      onChange={(e) => {
                        return setSettings({ ...settings, successMessage: e.target.value });
                      }}
                      placeholder="Thank you for your submission! We'll be in touch soon."
                      className='text-sm min-h-[80px]'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm text-gray-600'>Redirect URL (optional)</Label>
                    <Input
                      value={settings.redirectUrl}
                      onChange={(e) => {
                        return setSettings({ ...settings, redirectUrl: e.target.value });
                      }}
                      placeholder='https://example.com/thank-you'
                      className='text-sm'
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='advanced' className='space-y-6'>
              <Card className='border-0 shadow-none'>
                <CardHeader className='px-0'>
                  <CardTitle className='text-base font-medium'>Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className='px-0 space-y-4'>
                  <div className='space-y-2'>
                    <Label className='text-sm text-gray-600'>Custom Subdomain</Label>
                    <Input
                      value={settings.customSubdomain}
                      onChange={(e) => {
                        return setSettings({ ...settings, customSubdomain: e.target.value });
                      }}
                      placeholder='leads.yourcompany.com'
                      className='text-sm'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm text-gray-600'>Meta Title</Label>
                    <Input
                      value={settings.metaTitle}
                      onChange={(e) => {
                        return setSettings({ ...settings, metaTitle: e.target.value });
                      }}
                      placeholder='Contact Us - Your Company Name'
                      className='text-sm'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm text-gray-600'>Meta Description</Label>
                    <Textarea
                      value={settings.metaDescription}
                      onChange={(e) => {
                        return setSettings({ ...settings, metaDescription: e.target.value });
                      }}
                      placeholder='Fill out our contact form to get in touch with our team.'
                      className='text-sm min-h-[80px]'
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className='flex justify-end'>
            <Button size='sm' className='text-sm'>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className='w-1/2  overflow-hidden'>
        <div className='h-full flex items-center justify-center p-8'>
          <div className='w-full max-w-xl'>
            <div className='relative bg-white rounded-lg shadow-sm h-[calc(100vh-14rem)]'>
              {/* Browser Frame */}
              <div className='absolute inset-0 border border-gray-200 rounded-lg pointer-events-none' />
              <div className='absolute top-0 left-0 right-0 h-8 bg-gray-100 rounded-t-lg border-b border-gray-200 flex items-center px-3 gap-2 z-10'>
                <div className='flex gap-1.5'>
                  <div className='w-2 h-2 rounded-full bg-red-500' />
                  <div className='w-2 h-2 rounded-full bg-yellow-500' />
                  <div className='w-2 h-2 rounded-full bg-green-500' />
                </div>
                <div className='flex-1 mx-3'>
                  <div className='h-4 bg-gray-200 rounded-full' />
                </div>
              </div>

              {/* Preview Content */}
              <div className='pt-8 pb-4 h-full overflow-y-auto'>
                <div className='scale-[0.7] origin-top'>
                  <FormPreview
                    settings={settings}
                    fields={[
                      {
                        id: 'name',
                        label: 'Full Name',
                        type: 'text',
                        required: true,
                      },
                      {
                        id: 'email',
                        label: 'Email Address',
                        type: 'email',
                        required: true,
                      },
                      {
                        id: 'message',
                        label: 'Message',
                        type: 'textarea',
                        required: false,
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
