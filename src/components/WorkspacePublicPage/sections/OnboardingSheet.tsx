import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { CheckIcon } from 'lucide-react';
import React from 'react';

interface OnboardingSheetButton {
  type: 'skip' | 'callOrText';
  text: string;
  url?: string; // for call/text
  action?: string; // for skip or custom
}

interface OnboardingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttons?: OnboardingSheetButton[];
}

type Service = {
  name: string;
  price: string;
  subtitle: string;
};

const services: Service[] = [
  { name: 'Professional Resume Writing', price: '$99', subtitle: '2-3 business days' },
  { name: 'Same-Day Rush Service', price: '$49', subtitle: 'Delivered today' },
  { name: 'Specialized Industries', price: '$129', subtitle: '1 session' },
  { name: 'Free Consulting', price: 'Free', subtitle: '20 mins' },
];

export default function OnboardingSheet({
  open,
  onOpenChange,
  buttons = [],
}: OnboardingSheetProps) {
  // Onboarding flow state
  const [step, setStep] = React.useState(0);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [additionalSelectedServices, setAdditionalSelectedServices] = React.useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = React.useState('');
  const [contactForm, setContactForm] = React.useState({ name: '', email: '', phone: '' });
  const [submitted, setSubmitted] = React.useState(false);

  // Reset flow when sheet closes
  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setSelectedService(null);
      setAdditionalSelectedServices([]);
      setAdditionalNotes('');
      setContactForm({ name: '', email: '', phone: '' });
      setSubmitted(false);
    }
  }, [open]);

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
              return onOpenChange(false);
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
            {/* If no service selected, show all. If selected, show only that one with checkmark */}
            {!selectedService ? (
              <div className='flex flex-col gap-3'>
                {services.map((service) => {
                  return (
                    <button
                      key={service.name}
                      className={`relative border rounded px-4 py-4 text-left hover:bg-gray-100 transition flex items-start flex-col font-medium border-gray-200 min-h-[100px]`}
                      onClick={() => {
                        setSelectedService(service.name);
                      }}
                    >
                      <span>{service.name}</span>
                      <span className='text-gray-500 text-sm'>{service.subtitle}</span>
                      {/* Price badge attached bottom right */}
                      <span
                        className={`absolute -bottom-2 -right-2 bg-gray-200 border border-gray-300 rounded-full px-4 py-1 text-base font-semibold shadow-sm ${
                          service.price === 'Free' ? 'text-green-600' : 'text-gray-800'
                        }`}
                      >
                        {service.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                {/* Show only selected service with checkmark */}
                <div className='flex flex-col gap-3 mb-6'>
                  {(() => {
                    const service = services.find((s) => {
                      return s.name === selectedService;
                    });
                    if (!service) return null;
                    return (
                      <div
                        className={`relative group border rounded px-4 py-4 text-left flex items-start flex-col font-medium border-black bg-gray-50 min-h-[100px]`}
                      >
                        <span>{service.name}</span>
                        <span className='text-gray-500 text-sm'>{service.subtitle}</span>
                        <span
                          className={`absolute -bottom-2 -right-2 bg-gray-200 border border-gray-300 rounded-full px-4 py-1 text-base font-semibold shadow-sm ${
                            service.price === 'Free' ? 'text-green-600' : 'text-gray-800'
                          }`}
                        >
                          {service.price}
                        </span>
                        <button
                          type='button'
                          className='absolute top-0 right-0 font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center p-0 border border-gray-200 shadow-sm transition-colors'
                          style={{ lineHeight: 1, transform: 'translate(50%,-50%)' }}
                          onClick={() => {
                            if (document.activeElement)
                              (document.activeElement as HTMLElement).blur();
                            setSelectedService(null);
                            setAdditionalSelectedServices([]);
                          }}
                          aria-label='Start over'
                        >
                          <span className='text-black group-hover:hidden'>
                            <CheckIcon className='w-4 h-4' />
                          </span>
                          <span className='text-gray-400 group-hover:text-black hidden group-hover:inline'>
                            ×
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
                {/* Anything else you wish to add? */}
                <div className='mb-2 mt-2 text-base font-semibold'>
                  Anything else you wish to add?
                </div>
                <div className='flex flex-col gap-6 mb-4'>
                  {services
                    .filter((s) => {
                      return s.name !== selectedService;
                    })
                    .map((service) => {
                      const isSelected = additionalSelectedServices.includes(service.name);
                      return (
                        <button
                          key={service.name}
                          type='button'
                          className={`relative border rounded px-4 py-4 text-left flex items-start flex-col font-medium transition min-h-[100px] ${
                            isSelected
                              ? 'border-black bg-gray-300 shadow-inner scale-[0.97] translate-y-[1px] rounded-md'
                              : 'border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setAdditionalSelectedServices((prev) => {
                              return isSelected
                                ? prev.filter((s) => {
                                    return s !== service.name;
                                  })
                                : [...prev, service.name];
                            });
                          }}
                        >
                          <span>{service.name}</span>
                          <span className='text-gray-500 text-sm'>{service.subtitle}</span>
                          <span
                            className={`absolute -bottom-2 -right-2 bg-gray-200 border border-gray-300 rounded-full px-4 py-1 text-base font-semibold shadow-sm ${
                              service.price === 'Free' ? 'text-green-600' : 'text-gray-800'
                            }`}
                          >
                            {service.price}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </>
            )}
            {/* Primary CTA at bottom right, only after selection */}
            <div className='flex justify-end mt-8'>
              <button
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg bg-black text-white min-w-[180px] min-h-[44px] ${
                  selectedService
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                style={{
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '300ms',
                }}
                onClick={() => {
                  setStep(1);
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
              Service(s):{' '}
              <span className='font-semibold'>
                {[selectedService, ...additionalSelectedServices].filter(Boolean).join(', ')}
              </span>
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
                      if (btn.action === 'closeSheet') onOpenChange(false);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
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
  );
}
