import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeftIcon, CheckIcon } from 'lucide-react';
import React from 'react';

// Types and Interfaces
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

// Constants
const services: Service[] = [
  { name: 'Professional Resume Writing', price: '$99', subtitle: '2-3 business days' },
  { name: 'Same-Day Rush Service', price: '$49', subtitle: 'Delivered today' },
  { name: 'Specialized Industries', price: '$129', subtitle: '1 session' },
  { name: 'Free Consulting', price: 'Free', subtitle: '20 mins' },
];

// Common Components
const PriceTag = ({
  price,
  isSelected,
  isAdditionalService,
}: {
  price: string;
  isSelected?: boolean;
  isAdditionalService?: boolean;
}) => {
  return (
    <span
      className={`absolute rounded-l-lg bottom-4 right-0 px-4 py-1 text-sm font-semibold shadow-sm ${
        isSelected
          ? isAdditionalService
            ? 'bg-white text-gray-800'
            : price === 'Free'
            ? 'bg-white text-green-600'
            : 'bg-gray-200 text-gray-800'
          : price === 'Free'
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      {price}
    </span>
  );
};

const ServiceCard = ({
  service,
  isSelected,
  onClick,
  showRemoveButton,
  onRemove,
  isAdditionalService = false,
}: {
  service: Service;
  isSelected: boolean;
  onClick?: () => void;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  isAdditionalService?: boolean;
}) => {
  return (
    <div
      className={`relative group border rounded-xl px-4 py-4 text-left flex items-start flex-col font-medium transition-all duration-300 ease-in-out ${
        isSelected
          ? isAdditionalService
            ? 'border-none bg-[#e0e0e0] text-gray-900'
            : 'border-none bg-black text-white'
          : 'border-gray-200'
      } min-h-[100px] ${
        onClick
          ? `hover:${
              isAdditionalService ? 'bg-[#e0e0e0]' : 'bg-gray-100'
            } transition cursor-pointer`
          : ''
      }`}
      onClick={onClick}
    >
      <span className={isSelected && !isAdditionalService ? 'text-white' : ''}>{service.name}</span>
      <span
        className={`text-sm ${
          isSelected ? (isAdditionalService ? 'text-gray-700' : 'text-gray-300') : 'text-gray-500'
        }`}
      >
        {service.subtitle}
      </span>
      <PriceTag
        price={service.price}
        isSelected={isSelected}
        isAdditionalService={isAdditionalService}
      />
      {showRemoveButton && (
        <button
          type='button'
          className='absolute top-0 right-0 font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center p-0 border border-gray-200 shadow-sm transition-all duration-300 ease-in-out'
          style={{ lineHeight: 1, transform: 'translate(50%,-50%)' }}
          onClick={(e) => {
            e.stopPropagation();
            if (document.activeElement) (document.activeElement as HTMLElement).blur();
            onRemove?.();
          }}
          aria-label='Start over'
        >
          <span className='text-black group-hover:hidden'>
            <CheckIcon className='w-4 h-4' />
          </span>
          <span className='text-gray-400 group-hover:text-black hidden group-hover:inline'>×</span>
        </button>
      )}
    </div>
  );
};

// Add Cart Summary Component
const CartSummary = ({
  selectedService,
  additionalServices,
}: {
  selectedService: string | null;
  additionalServices: string[];
}) => {
  const allServices = [selectedService, ...additionalServices].filter(Boolean);
  const total = allServices.reduce((sum, serviceName) => {
    const service = services.find((s) => {
      return s.name === serviceName;
    });
    if (!service) return sum;
    return sum + (service.price === 'Free' ? 0 : parseInt(service.price.replace('$', '')));
  }, 0);

  return (
    <div className='border-t pt-4 mt-4'>
      <div className='text-sm font-medium mb-2'>Selected Services:</div>
      <div className='space-y-1 mb-2'>
        {allServices.map((serviceName) => {
          const service = services.find((s) => {
            return s.name === serviceName;
          });
          if (!service) return null;
          return (
            <div key={serviceName} className='flex justify-between text-sm'>
              <span>{service.name}</span>
              <span>{service.price}</span>
            </div>
          );
        })}
      </div>
      <div className='flex justify-between font-semibold border-t pt-2'>
        <span>Total</span>
        <span>${total}</span>
      </div>
    </div>
  );
};

// Component
export default function OnboardingSheet({
  open,
  onOpenChange,
  buttons = [],
}: OnboardingSheetProps) {
  // State Management
  const [step, setStep] = React.useState(0);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [additionalSelectedServices, setAdditionalSelectedServices] = React.useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = React.useState('');
  const [contactForm, setContactForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
  });
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setStep(0);
      setSelectedService(null);
      setAdditionalSelectedServices([]);
      setAdditionalNotes('');
      setContactForm({ name: '', email: '', phone: '', message: '', consent: false });
      setSubmitted(false);
    }
  }, [open]);

  const getPrimaryButtonText = () => {
    if (!selectedService) return 'Continue';
    const total = [selectedService, ...additionalSelectedServices]
      .filter(Boolean)
      .reduce((sum, serviceName) => {
        const service = services.find((s) => {
          return s.name === serviceName;
        });
        if (!service) return sum;
        return sum + (service.price === 'Free' ? 0 : parseInt(service.price.replace('$', '')));
      }, 0);
    return `View Order $${total}`;
  };

  const renderStep = () => {
    if (submitted) {
      return (
        <div className='flex flex-col items-center justify-center h-full'>
          <div className='text-2xl font-bold mb-2'>Thank you!</div>
          <div className='text-muted-foreground mb-4'>
            We received your request. We&apos;ll be in touch soon.
          </div>
          <Button
            onClick={() => {
              return onOpenChange(false);
            }}
          >
            Close
          </Button>
        </div>
      );
    }

    switch (step) {
      case 0:
        return (
          <div className='flex flex-col h-full'>
            <div className='flex-1'>
              {!selectedService ? (
                <div className='flex flex-col gap-3'>
                  {services.map((service) => {
                    return (
                      <ServiceCard
                        key={service.name}
                        service={service}
                        isSelected={false}
                        onClick={() => {
                          return setSelectedService(service.name);
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <>
                  <ServiceCard
                    service={
                      services.find((s) => {
                        return s.name === selectedService;
                      }) as Service
                    }
                    isSelected={true}
                    showRemoveButton
                    onRemove={() => {
                      setSelectedService(null);
                      setAdditionalSelectedServices([]);
                    }}
                  />
                  <div className='mb-2 mt-6 text-base font-semibold'>
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
                          <ServiceCard
                            key={service.name}
                            service={service}
                            isSelected={isSelected}
                            isAdditionalService={true}
                            onClick={() => {
                              setAdditionalSelectedServices((prev) => {
                                return isSelected
                                  ? prev.filter((s) => {
                                      return s !== service.name;
                                    })
                                  : [...prev, service.name];
                              });
                            }}
                          />
                        );
                      })}
                  </div>
                </>
              )}
            </div>
            <div className='mt-auto border-t pt-4 mb-6'>
              <Button
                className={`w-full min-h-[44px] bg-black hover:bg-black/80 ${
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
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
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
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Name *</label>
                <input
                  className='w-full border rounded p-2'
                  placeholder='Jane Smith'
                  value={contactForm.name}
                  onChange={(e) => {
                    return setContactForm((f) => {
                      return { ...f, name: e.target.value };
                    });
                  }}
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Email address *</label>
                <input
                  className='w-full border rounded p-2'
                  placeholder='email@website.com'
                  type='email'
                  value={contactForm.email}
                  onChange={(e) => {
                    return setContactForm((f) => {
                      return { ...f, email: e.target.value };
                    });
                  }}
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Phone number *</label>
                <input
                  className='w-full border rounded p-2'
                  placeholder='555-555-5555'
                  type='tel'
                  value={contactForm.phone}
                  onChange={(e) => {
                    return setContactForm((f) => {
                      return { ...f, phone: e.target.value };
                    });
                  }}
                  required
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Message</label>
                <textarea
                  className='w-full border rounded p-2 min-h-[100px]'
                  placeholder='Your message here...'
                  value={contactForm.message}
                  onChange={(e) => {
                    return setContactForm((f) => {
                      return { ...f, message: e.target.value };
                    });
                  }}
                />
              </div>
              <div className='flex items-start gap-2'>
                <input
                  type='checkbox'
                  id='consent'
                  checked={contactForm.consent}
                  onChange={(e) => {
                    return setContactForm((f) => {
                      return { ...f, consent: e.target.checked };
                    });
                  }}
                  required
                  className='mt-1'
                />
                <label htmlFor='consent' className='text-sm'>
                  I allow this website to store my submission so they can respond to my inquiry. *
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderNavigation = () => {
    if (submitted || step === 0) return null;

    return (
      <div className='mt-auto border-t pt-4 mb-6'>
        <div className='flex gap-2'>
          {step > 0 && buttons.length > 0 && (
            <div className='flex gap-2'>
              {buttons.map((btn, i) => {
                if (btn.type === 'skip') {
                  return (
                    <Button
                      key={i}
                      variant='secondary'
                      onClick={() => {
                        if (btn.action === 'closeSheet') onOpenChange(false);
                        else if (btn.action === 'nextStep')
                          setStep((s) => {
                            return Math.min(s + 1, 2);
                          });
                      }}
                    >
                      {btn.text}
                    </Button>
                  );
                }

                return null;
              })}
            </div>
          )}

          {step === 1 && (
            <Button
              onClick={() => {
                return setSubmitted(true);
              }}
              disabled={
                !contactForm.name ||
                !contactForm.email ||
                !contactForm.phone ||
                !contactForm.consent
              }
              className='w-full min-h-[44px]'
            >
              Submit
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-[800px] !max-w-[600px] fixed right-4 top-4 bottom-4 px-12 bg-background max-h-[calc(100vh-2rem)] overflow-y-auto border rounded-lg shadow-lg [&>button]:hidden scrollbar-hide flex flex-col p-8'
      >
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-1'>
            {step === 1 && (
              <ArrowLeftIcon
                className='w-4 h-4 cursor-pointer mr-1 hover:text-gray-500'
                onClick={() => {
                  return setStep(0);
                }}
              />
            )}
            <SheetTitle>{step === 0 ? 'Choose a Service' : 'Contact Details'}</SheetTitle>
          </div>
          {buttons.find((btn) => {
            return btn.type === 'callOrText' && btn.url;
          }) && (
            <a
              href={
                buttons.find((btn) => {
                  return btn.type === 'callOrText' && btn.url;
                })?.url
              }
              className='border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 transition px-4 py-2 rounded shadow-none font-medium text-sm'
              style={{ minHeight: 36 }}
            >
              📞 Prefer to Talk? Call or Text
            </a>
          )}
        </div>
        <div className='flex-1 flex flex-col'>
          {renderStep()}
          {renderNavigation()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
