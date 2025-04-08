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

// Extended settings interface for form preview
interface ExtendedBrandingSettings extends BrandingSettings {
  textColor?: string;
  backgroundColor?: string;
  inputBackground?: string;
  inputBorderColor?: string;
  buttonHoverColor?: string;
  formTheme?: 'standard' | 'minimal' | 'dark' | 'glass';
  buttonStyle?: 'filled' | 'outline' | 'rounded' | 'text';
  inputStyle?: 'standard' | 'underlined' | 'filled' | 'rounded';
  cardStyle?: 'shadow' | 'flat' | 'bordered' | 'floating';
  formBorderRadius?: string;
  formBackgroundColor?: string;
  formBorderColor?: string;
  headerColor?: string;
  pageBackgroundColor?: string;
  submitButtonText?: string;
  successTitle?: string;
}

export function FormPreview({ settings, fields }: FormPreviewProps) {
  const extendedSettings = settings as ExtendedBrandingSettings;

  const formStyles = {
    '--primary-color': extendedSettings.primaryColor,
    '--accent-color': extendedSettings.accentColor,
    '--text-color': extendedSettings.textColor || '#333333',
    '--background-color': extendedSettings.backgroundColor || '#ffffff',
    '--input-background': extendedSettings.inputBackground || '#f9fafb',
    '--input-border-color': extendedSettings.inputBorderColor || '#e5e7eb',
    '--button-hover-color':
      extendedSettings.buttonHoverColor || adjustColor(extendedSettings.primaryColor, -20),
    fontFamily:
      extendedSettings.fontStyle === 'custom' ? 'CustomFont, sans-serif' : 'system-ui, sans-serif',
  } as React.CSSProperties;

  // Helper function to darken/lighten colors for hover states
  function adjustColor(color: string, amount: number): string {
    return color; // This is a placeholder - in a real implementation, this would adjust the color
  }

  const formTheme = extendedSettings.formTheme || 'standard';
  const buttonStyle = extendedSettings.buttonStyle || 'filled';
  const inputStyle = extendedSettings.inputStyle || 'standard';
  const cardStyle = extendedSettings.cardStyle || 'shadow';

  // Theme-specific classes
  const getThemeClasses = () => {
    switch (formTheme) {
      case 'minimal':
        return 'bg-transparent';
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'glass':
        return 'bg-white/80 backdrop-blur-md';
      default:
        return 'bg-white';
    }
  };

  const getButtonClasses = () => {
    switch (buttonStyle) {
      case 'outline':
        return 'bg-transparent border-2 hover:bg-opacity-10';
      case 'rounded':
        return 'rounded-full';
      case 'text':
        return 'bg-transparent shadow-none hover:bg-opacity-10';
      default:
        return '';
    }
  };

  const getInputClasses = () => {
    switch (inputStyle) {
      case 'underlined':
        return 'border-0 border-b-2 rounded-none bg-transparent';
      case 'filled':
        return 'border-0 bg-gray-100';
      case 'rounded':
        return 'rounded-full';
      default:
        return '';
    }
  };

  const getCardClasses = () => {
    switch (cardStyle) {
      case 'flat':
        return 'shadow-none border';
      case 'bordered':
        return 'shadow-none border-2';
      case 'floating':
        return 'shadow-xl';
      default:
        return 'shadow-lg';
    }
  };

  return (
    <div
      className={`min-h-screen ${extendedSettings.backgroundImageUrl ? 'bg-cover bg-center' : ''}`}
      style={{
        backgroundImage: extendedSettings.backgroundImageUrl
          ? `url(${extendedSettings.backgroundImageUrl})`
          : undefined,
        backgroundColor: extendedSettings.pageBackgroundColor || '#ffffff',
        ...formStyles,
      }}
    >
      <div
        className={`container mx-auto px-4 py-8 ${
          extendedSettings.formAlignment === 'center'
            ? 'text-center'
            : extendedSettings.formAlignment === 'left'
            ? 'text-left'
            : 'text-left'
        }`}
      >
        {/* Header */}
        <div className='mb-8'>
          {extendedSettings.logoUrl && (
            <img
              src={extendedSettings.logoUrl}
              alt={extendedSettings.companyName}
              className={`h-16 w-auto ${
                extendedSettings.formAlignment === 'center'
                  ? 'mx-auto'
                  : extendedSettings.formAlignment === 'left'
                  ? 'mr-auto'
                  : 'mr-auto'
              } mb-4`}
            />
          )}
          <h1
            className={`text-3xl font-bold mb-2 ${formTheme === 'dark' ? 'text-white' : ''}`}
            style={{ color: extendedSettings.headerColor || extendedSettings.primaryColor }}
          >
            {extendedSettings.headerTitle || 'Contact Us'}
          </h1>
          {extendedSettings.headerSubtext && (
            <p
              className={`max-w-2xl ${
                extendedSettings.formAlignment === 'center'
                  ? 'mx-auto'
                  : extendedSettings.formAlignment === 'left'
                  ? ''
                  : ''
              } 
                          ${formTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
            >
              {extendedSettings.headerSubtext}
            </p>
          )}
        </div>

        {/* Form */}
        <div
          className={`${getThemeClasses()} ${getCardClasses()} p-6 max-w-2xl ${
            extendedSettings.formAlignment === 'center'
              ? 'mx-auto'
              : extendedSettings.formAlignment === 'left'
              ? ''
              : ''
          } ${
            extendedSettings.formBorderRadius
              ? `rounded-${extendedSettings.formBorderRadius}`
              : 'rounded-lg'
          }`}
          style={{
            backgroundColor:
              extendedSettings.formBackgroundColor ||
              (formTheme === 'dark' ? '#1f2937' : '#ffffff'),
            borderColor: extendedSettings.formBorderColor || '#e5e7eb',
          }}
        >
          <form className='space-y-4'>
            {fields.map((field) => {
              return (
                <div key={field.id} className='space-y-2'>
                  <Label htmlFor={field.id} className={formTheme === 'dark' ? 'text-white' : ''}>
                    {field.label}
                    {field.required && <span className='text-red-500 ml-1'>*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.id}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      required={field.required}
                      className={`w-full ${getInputClasses()}`}
                      style={{
                        backgroundColor:
                          extendedSettings.inputBackground ||
                          (formTheme === 'dark' ? '#374151' : '#f9fafb'),
                        borderColor: extendedSettings.inputBorderColor || '#e5e7eb',
                        color:
                          formTheme === 'dark'
                            ? '#ffffff'
                            : extendedSettings.textColor || '#333333',
                      }}
                    />
                  ) : field.type === 'file' ? (
                    <Input
                      id={field.id}
                      type='file'
                      required={field.required}
                      className={`w-full ${getInputClasses()}`}
                      style={{
                        backgroundColor:
                          extendedSettings.inputBackground ||
                          (formTheme === 'dark' ? '#374151' : '#f9fafb'),
                        borderColor: extendedSettings.inputBorderColor || '#e5e7eb',
                        color:
                          formTheme === 'dark'
                            ? '#ffffff'
                            : extendedSettings.textColor || '#333333',
                      }}
                    />
                  ) : (
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      required={field.required}
                      className={`w-full ${getInputClasses()}`}
                      style={{
                        backgroundColor:
                          extendedSettings.inputBackground ||
                          (formTheme === 'dark' ? '#374151' : '#f9fafb'),
                        borderColor: extendedSettings.inputBorderColor || '#e5e7eb',
                        color:
                          formTheme === 'dark'
                            ? '#ffffff'
                            : extendedSettings.textColor || '#333333',
                      }}
                    />
                  )}
                </div>
              );
            })}

            <Button
              type='submit'
              className={`w-full ${getButtonClasses()}`}
              style={{
                backgroundColor:
                  buttonStyle === 'outline' || buttonStyle === 'text'
                    ? 'transparent'
                    : extendedSettings.primaryColor,
                color:
                  buttonStyle === 'outline' || buttonStyle === 'text'
                    ? extendedSettings.primaryColor
                    : 'white',
                borderColor:
                  buttonStyle === 'outline' ? extendedSettings.primaryColor : 'transparent',
              }}
            >
              {extendedSettings.submitButtonText || 'Submit'}
            </Button>
          </form>
        </div>

        {/* Success Message Preview */}
        {extendedSettings.successMessage && (
          <div
            className={`mt-8 ${getThemeClasses()} ${getCardClasses()} p-6 max-w-2xl ${
              extendedSettings.formAlignment === 'center'
                ? 'mx-auto'
                : extendedSettings.formAlignment === 'left'
                ? ''
                : ''
            } ${
              extendedSettings.formBorderRadius
                ? `rounded-${extendedSettings.formBorderRadius}`
                : 'rounded-lg'
            }`}
            style={{
              backgroundColor:
                extendedSettings.formBackgroundColor ||
                (formTheme === 'dark' ? '#1f2937' : '#ffffff'),
              borderColor: extendedSettings.formBorderColor || '#e5e7eb',
            }}
          >
            <div className='text-center'>
              <div
                className='w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'
                style={{ backgroundColor: extendedSettings.primaryColor }}
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
              <h2
                className={`text-2xl font-bold mb-2 ${formTheme === 'dark' ? 'text-white' : ''}`}
                style={{ color: extendedSettings.headerColor || extendedSettings.primaryColor }}
              >
                {extendedSettings.successTitle || 'Thank You!'}
              </h2>
              <p className={formTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                {extendedSettings.successMessage}
              </p>
              {extendedSettings.redirectUrl && (
                <p
                  className={`text-sm mt-2 ${
                    formTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  You will be redirected to: {extendedSettings.redirectUrl}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Custom Font */}
        {extendedSettings.fontStyle === 'custom' && extendedSettings.customFontUrl && (
          <link href={extendedSettings.customFontUrl} rel='stylesheet' />
        )}
      </div>
    </div>
  );
}
