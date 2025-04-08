'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BrandingSettings } from './FormSettings';

interface FormPreviewProps {
  settings: BrandingSettings;
  fields: Array<{
    id: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'file';
    required: boolean;
  }>;
}

export function FormPreview({ settings, fields }: FormPreviewProps) {
  const formStyles = {
    '--primary-color': settings.primaryColor,
    '--accent-color': settings.accentColor,
  } as React.CSSProperties;

  return (
    <div
      className={`min-h-screen ${settings.backgroundImageUrl ? 'bg-cover bg-center' : 'bg-white'}`}
      style={{
        backgroundImage: settings.backgroundImageUrl
          ? `url(${settings.backgroundImageUrl})`
          : undefined,
      }}
    >
      <div
        className={`container mx-auto px-4 py-8 ${
          settings.formAlignment === 'center' ? 'text-center' : 'text-left'
        }`}
        style={formStyles}
      >
        {/* Header */}
        <div className='mb-8'>
          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt={settings.companyName}
              className='h-16 w-auto mx-auto mb-4'
            />
          )}
          <h1 className='text-3xl font-bold mb-2' style={{ color: settings.primaryColor }}>
            {settings.headerTitle || 'Contact Us'}
          </h1>
          {settings.headerSubtext && (
            <p className='text-gray-600 max-w-2xl mx-auto'>{settings.headerSubtext}</p>
          )}
        </div>

        {/* Form */}
        <div
          className={`bg-white rounded-lg shadow-lg p-6 max-w-2xl ${
            settings.formAlignment === 'center' ? 'mx-auto' : ''
          }`}
        >
          <form className='space-y-4'>
            {fields.map((field) => {
              return (
                <div key={field.id} className='space-y-2'>
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className='text-red-500 ml-1'>*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.id}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      required={field.required}
                      className='w-full'
                    />
                  ) : field.type === 'file' ? (
                    <Input id={field.id} type='file' required={field.required} className='w-full' />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      required={field.required}
                      className='w-full'
                    />
                  )}
                </div>
              );
            })}

            <Button
              type='submit'
              className='w-full'
              style={{
                backgroundColor: settings.primaryColor,
                color: 'white',
              }}
            >
              Submit
            </Button>
          </form>
        </div>

        {/* Success Message Preview */}
        {settings.successMessage && (
          <div
            className={`mt-8 bg-white rounded-lg shadow-lg p-6 max-w-2xl ${
              settings.formAlignment === 'center' ? 'mx-auto' : ''
            }`}
          >
            <div className='text-center'>
              <div
                className='w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'
                style={{ backgroundColor: settings.primaryColor }}
              >
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold mb-2' style={{ color: settings.primaryColor }}>
                Thank You!
              </h2>
              <p className='text-gray-600'>{settings.successMessage}</p>
              {settings.redirectUrl && (
                <p className='text-sm text-gray-500 mt-2'>
                  You will be redirected to: {settings.redirectUrl}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Custom Font */}
        {settings.fontStyle === 'custom' && settings.customFontUrl && (
          <link href={settings.customFontUrl} rel='stylesheet' />
        )}
      </div>
    </div>
  );
}
