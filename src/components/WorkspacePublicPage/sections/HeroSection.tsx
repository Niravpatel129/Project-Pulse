import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { StarFilledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

interface HeroSectionButton {
  type: 'skip' | 'callOrText';
  text: string;
  url?: string; // for call/text
  action?: string; // for skip or custom
}

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonUrl?: string;
  backgroundImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  id?: string;

  // Generic configuration options
  variant?: 'default' | 'location' | 'minimal';
  highlights?: string[]; // For location highlights or key points
  overlayOpacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  minHeight?: string;
  additionalContent?: React.ReactNode;
  buttonAction?: string;
  buttons?: HeroSectionButton[];
}

export default function HeroSection({
  title,
  subtitle,
  buttonText,
  buttonUrl,
  backgroundImage,
  primaryColor = '#7C3AED',
  secondaryColor = '#2563EB',
  id,
  variant = 'default',
  highlights = [],
  overlayOpacity = 0.5,
  textAlign = 'center',
  minHeight = '600px',
  additionalContent,
  buttonAction,
  buttons = [],
}: HeroSectionProps) {
  const textAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[textAlign];

  // State for onboarding sheet
  const [showSheet, setShowSheet] = React.useState(false);
  const onOpenOnboardingSheet = () => {
    return setShowSheet(true);
  };

  // Onboarding flow state
  const [step, setStep] = React.useState(0);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = React.useState('');
  const [contactForm, setContactForm] = React.useState({ name: '', email: '', phone: '' });
  const [submitted, setSubmitted] = React.useState(false);

  // Example services (could be from CMS)
  const services = [
    'Professional Resume Writing',
    'Same-Day Rush Service',
    'Specialized Industries',
  ];

  // Reset flow when sheet closes
  React.useEffect(() => {
    if (!showSheet) {
      setStep(0);
      setSelectedService(null);
      setAdditionalNotes('');
      setContactForm({ name: '', email: '', phone: '' });
      setSubmitted(false);
    }
  }, [showSheet]);

  // Helper for contextual primary CTA text
  const getPrimaryButtonText = () => {
    if (!selectedService) return 'Continue';
    if (selectedService === 'Professional Resume Writing') return 'Continue to Details';
    if (selectedService === 'Same-Day Rush Service') return 'Rush My Resume';
    if (selectedService === 'Specialized Industries') return 'Start Now';
    return 'Continue';
  };

  // Steps rendering
  const renderStep = () => {
    if (submitted) {
      return (
        <div className='flex flex-col items-center justify-center h-full'>
          <div className='text-2xl font-bold mb-2'>Thank you!</div>
          <div className='text-muted-foreground mb-4'>
            We received your request. We&apos;ll be in touch soon.
          </div>
          <button
            className='mt-2 px-4 py-2 rounded bg-black text-white'
            onClick={() => {
              return setShowSheet(false);
            }}
          >
            Close
          </button>
        </div>
      );
    }
    switch (step) {
      case 0:
        return (
          <div>
            <SheetTitle className='mb-12'>Choose a Service</SheetTitle>
            <div className='flex flex-col gap-3'>
              {services.map((service) => {
                return (
                  <button
                    key={service}
                    className={`border rounded px-4 py-3 text-left hover:bg-gray-100 transition flex items-center justify-between text-lg font-medium ${
                      selectedService === service ? 'border-black bg-gray-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      return setSelectedService(service);
                    }}
                    style={{ minHeight: 44 }}
                  >
                    <span>{service}</span>
                    <span className='text-xl'>{selectedService === service ? '▸' : ''}</span>
                  </button>
                );
              })}
            </div>
            {/* Primary CTA at bottom right, only after selection */}
            <div className='flex justify-end mt-8'>
              <button
                className={`px-8 py-3 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg bg-black text-white min-w-[180px] min-h-[44px] ${
                  selectedService
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                style={{
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '300ms',
                }}
                onClick={() => {
                  return setStep(1);
                }}
                disabled={!selectedService}
                aria-disabled={!selectedService}
              >
                {getPrimaryButtonText()}
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <SheetTitle className='mb-4'>Anything you wish to add?</SheetTitle>
            <textarea
              className='w-full border rounded p-2 min-h-[80px]'
              placeholder='Let us know any details, preferences, or questions...'
              value={additionalNotes}
              onChange={(e) => {
                return setAdditionalNotes(e.target.value);
              }}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <SheetTitle className='mb-4'>Contact Details</SheetTitle>
            <div className='mb-2'>
              Service: <span className='font-semibold'>{selectedService}</span>
            </div>
            {additionalNotes && (
              <div className='mb-2'>
                Notes: <span className='text-muted-foreground'>{additionalNotes}</span>
              </div>
            )}
            <input
              className='w-full border rounded p-2 mb-2'
              placeholder='Full Name'
              value={contactForm.name}
              onChange={(e) => {
                return setContactForm((f) => {
                  return { ...f, name: e.target.value };
                });
              }}
              required
            />
            <input
              className='w-full border rounded p-2 mb-2'
              placeholder='Email'
              type='email'
              value={contactForm.email}
              onChange={(e) => {
                return setContactForm((f) => {
                  return { ...f, email: e.target.value };
                });
              }}
              required
            />
            <input
              className='w-full border rounded p-2 mb-2'
              placeholder='Phone (optional)'
              type='tel'
              value={contactForm.phone}
              onChange={(e) => {
                return setContactForm((f) => {
                  return { ...f, phone: e.target.value };
                });
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Navigation buttons
  const renderNav = () => {
    if (submitted) return null;
    // For step 0, nav row is not shown (handled in renderStep)
    if (step === 0) return null;
    return (
      <div className='flex justify-between items-center mt-8 gap-2'>
        {step > 0 && (
          <button
            className='px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50'
            onClick={() => {
              return setStep((s) => {
                return s - 1;
              });
            }}
          >
            Back
          </button>
        )}
        {/* CMS-driven buttons to the left of Next/Submit for steps > 0 */}
        {step > 0 && buttons.length > 0 && (
          <div className='flex gap-2'>
            {buttons.map((btn, i) => {
              if (btn.type === 'skip') {
                return (
                  <button
                    key={i}
                    className='px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-50'
                    onClick={() => {
                      if (btn.action === 'closeSheet') setShowSheet(false);
                      else if (btn.action === 'nextStep')
                        setStep((s) => {
                          return Math.min(s + 1, 2);
                        });
                    }}
                  >
                    {btn.text}
                  </button>
                );
              }
              if (btn.type === 'callOrText' && btn.url) {
                return (
                  <a
                    key={i}
                    href={btn.url}
                    className='px-4 py-2 rounded bg-black text-white hover:bg-gray-800'
                  >
                    {btn.text}
                  </a>
                );
              }
              return null;
            })}
          </div>
        )}
        <div className='flex-1' />
        {step < 2 && (
          <button
            className='px-4 py-2 rounded bg-black text-white disabled:opacity-50'
            onClick={() => {
              return setStep((s) => {
                return s + 1;
              });
            }}
            disabled={step === 0 && !selectedService}
          >
            Next
          </button>
        )}
        {step === 2 && (
          <button
            className='px-4 py-2 rounded bg-black text-white disabled:opacity-50'
            onClick={() => {
              return setSubmitted(true);
            }}
            disabled={!contactForm.name || !contactForm.email}
          >
            Submit
          </button>
        )}
      </div>
    );
  };

  return (
    <section
      id={id}
      className={`relative flex items-center justify-center text-gray-900 ${textAlignClass}`}
      style={{
        background: backgroundImage
          ? `linear-gradient(#f5f3f0,#fefdfd), url(${backgroundImage})`
          : 'linear-gradient(#f5f3f0,#fefdfd)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight,
      }}
    >
      {/* Content */}
      <div className='relative z-10 container mx-auto px-4'>
        <div className={`max-w-4xl ${textAlign === 'center' ? 'mx-auto' : ''}`}>
          <p className='mb-8 text-[#6b727f] flex items-center gap-1 w-full text-center justify-center text-sm'>
            #1 Top-Rated Software
            <span className='text-gray-500 flex items-center gap-0'>
              <span className='flex items-center gap-0'>
                4.8
                <StarFilledIcon className='w-4 h-4' />
              </span>
              <span className='text-gray-500'>across 279 reviews</span>
            </span>
          </p>
          <h1 className='text-4xl md:text-7xl font-bold mb-6 leading-tight'>{title}</h1>

          {/* <p className='text-xl md:text-2xl mb-8 text-gray-700'>{subtitle}</p> */}

          {/* Highlights (for location variant or key points) */}
          {highlights.length > 0 && (
            <div className='mb-8'>
              <div
                className={`grid ${
                  highlights.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
                } gap-4 max-w-3xl ${textAlign === 'center' ? 'mx-auto' : ''}`}
              >
                {highlights.map((highlight, index) => {
                  return (
                    <div
                      key={index}
                      className='bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-4 border border-gray-200'
                    >
                      <p className='text-sm font-medium text-gray-800'>{highlight}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Content */}
          {additionalContent && <div className='mb-8'>{additionalContent}</div>}

          {/* CTA Button */}
          <div className='space-y-4 flex items-center justify-center flex-col'>
            {/* If buttonAction is present, render a button */}
            {buttonText && buttonAction && (
              <button
                type='button'
                className='inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg bg-black text-white mt-4'
                onClick={onOpenOnboardingSheet}
              >
                {buttonText}
              </button>
            )}
            {/* If buttonUrl is present, render the link */}
            {buttonText && buttonUrl && (
              <Link
                href={buttonUrl}
                className='inline-block px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg bg-black text-white mt-4'
              >
                {buttonText}
              </Link>
            )}
            {variant === 'location' && (
              <p className='text-sm text-gray-600'>
                Call or text anytime • Free consultation • Same-day response
              </p>
            )}
            {variant === 'default' && (
              <p className='text-sm text-gray-600'>
                Get started today • Professional results guaranteed
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Sheet placeholder */}
      <Sheet open={showSheet} onOpenChange={setShowSheet}>
        <SheetContent
          side='right'
          className='w-[800px] !max-w-[600px] fixed right-4 top-4 bottom-4 px-12 bg-background max-h-[calc(100vh-2rem)] overflow-y-auto border rounded-lg shadow-lg [&>button]:hidden scrollbar-hide flex flex-col p-3'
        >
          {/* Prefer to Talk? Call or Text button - top right ghost button */}
          {buttons.find((btn) => {
            return btn.type === 'callOrText' && btn.url;
          }) && (
            <a
              href={
                buttons.find((btn) => {
                  return btn.type === 'callOrText' && btn.url;
                })?.url
              }
              className='absolute top-4 right-4 border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 transition px-4 py-2 rounded shadow-none z-20 font-medium text-sm'
              style={{ minHeight: 36 }}
            >
              📞 Prefer to Talk? Call or Text
            </a>
          )}
          <div className='mt-4 flex-1 flex flex-col'>
            {renderStep()}
            {renderNav()}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
