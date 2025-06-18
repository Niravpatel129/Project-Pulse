import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useWorkspaceCMS } from '@/contexts/WorkspaceCMSContext';
import { newRequest } from '@/utils/newRequest';
import { AnimatePresence, motion } from 'framer-motion';
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

// Add new interface for callback scheduling
interface CallbackSchedule {
  date: string;
  time: string;
  name: string;
  phone: string;
  notes: string;
  isASAP: boolean;
}

type Service = {
  name: string;
  price: string;
  subtitle: string;
  description?: string;
  features?: string[];
};

type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'date' | 'time' | 'checkbox' | 'file';
  placeholder?: string;
  required: boolean;
  rows?: number;
  showWhen?: string;
  // File-specific properties
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  description?: string;
};

type FormConfig = {
  title: string;
  description: string;
  fields: FormField[];
  consentField?: {
    name: string;
    label: string;
    required: boolean;
  };
  timingOptions?: Array<{
    value: string;
    label: string;
    description: string;
  }>;
};

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.8 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
      mass: 0.4,
      velocity: 2,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -10,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
      mass: 0.4,
      velocity: 2,
      duration: 0.3,
    },
  },
} as const;

// File Upload Component
const FileUploadField = ({
  field,
  files,
  onChange,
  variant = 'default',
}: {
  field: FormField;
  files: File[];
  onChange: (name: string, files: File[]) => void;
  variant?: 'default' | 'callback';
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const maxSize = field.maxSize || 10; // Default 10MB
    const maxFiles = field.maxFiles || (field.multiple ? 5 : 1);

    // Validate file size
    const validFiles = newFiles.filter((file) => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    // Limit number of files
    const finalFiles = field.multiple
      ? [...files, ...validFiles].slice(0, maxFiles)
      : validFiles.slice(0, 1);

    onChange(field.name, finalFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => {
      return i !== index;
    });
    onChange(field.name, newFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const labelClassName =
    variant === 'callback'
      ? 'block text-sm font-medium text-gray-700'
      : 'block text-sm font-medium mb-1.5';

  return (
    <div className={variant === 'callback' ? 'space-y-2' : ''}>
      <label className={labelClassName}>{field.label}</label>

      {field.description && <p className='text-sm text-gray-500 mb-2'>{field.description}</p>}

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${
            dragOver
              ? 'border-black bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          return fileInputRef.current?.click();
        }}
      >
        <div className='space-y-2'>
          <div className='text-4xl text-gray-400'>📄</div>
          <div>
            <p className='text-sm font-medium text-gray-700'>Click to upload or drag and drop</p>
            <p className='text-xs text-gray-500'>
              {field.accept ? `Accepted: ${field.accept}` : 'Any file type'}
              {field.maxSize && ` • Max ${field.maxSize}MB`}
              {field.multiple && ` • Up to ${field.maxFiles || 5} files`}
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept={field.accept}
        multiple={field.multiple}
        onChange={(e) => {
          return handleFileSelect(e.target.files);
        }}
        className='hidden'
      />

      {/* File List */}
      {files.length > 0 && (
        <div className='space-y-2 mt-3'>
          {files.map((file, index) => {
            return (
              <div
                key={`${file.name}-${index}`}
                className='flex items-center justify-between p-2 bg-gray-50 rounded border'
              >
                <div className='flex items-center space-x-2 flex-1 min-w-0'>
                  <span className='text-lg'>📄</span>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>{file.name}</p>
                    <p className='text-xs text-gray-500'>{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className='text-red-500 hover:text-red-700 text-sm font-medium ml-2'
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Common Components
const DynamicFormField = ({
  field,
  value,
  onChange,
  formData,
  variant = 'default',
}: {
  field: FormField;
  value: any;
  onChange: (name: string, value: any) => void;
  formData?: any;
  variant?: 'default' | 'callback';
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue =
      field.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    onChange(field.name, newValue);
  };

  const inputClassName =
    variant === 'callback'
      ? 'w-full border rounded-lg p-3 bg-gray-50 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-base'
      : 'w-full border rounded p-2.5 text-base';

  const labelClassName =
    variant === 'callback'
      ? 'block text-sm font-medium text-gray-700'
      : 'block text-sm font-medium mb-1.5';

  if (field.type === 'file') {
    return (
      <FileUploadField
        field={field}
        files={(value as File[]) || []}
        onChange={onChange}
        variant={variant}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className={variant === 'callback' ? 'space-y-2' : ''}>
        <label className={labelClassName}>{field.label}</label>
        <textarea
          className={`${inputClassName} ${
            field.rows ? `min-h-[${field.rows * 25}px]` : 'min-h-[100px]'
          }`}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={handleChange}
          required={field.required}
          rows={field.rows || 4}
        />
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className='flex items-start gap-2'>
        <input
          type='checkbox'
          id={field.name}
          checked={value || false}
          onChange={handleChange}
          required={field.required}
          className='mt-1'
        />
        <label htmlFor={field.name} className='text-sm'>
          {field.label}
        </label>
      </div>
    );
  }

  return (
    <div className={variant === 'callback' ? 'space-y-2' : ''}>
      <label className={labelClassName}>{field.label}</label>
      <input
        className={inputClassName}
        placeholder={field.placeholder}
        type={field.type}
        value={value || ''}
        onChange={handleChange}
        required={field.required}
        min={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
      />
    </div>
  );
};

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
            : 'bg-gray-200 text-gray-800'
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
            } transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]`
          : ''
      }`}
      onClick={onClick}
    >
      <span className={`text-base ${isSelected && !isAdditionalService ? 'text-white' : ''}`}>
        {service.name}
      </span>
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
          className='absolute top-0 right-0 font-bold bg-white rounded-full w-6 h-6 flex items-center justify-center p-0 border border-gray-200 shadow-sm transition-all duration-300 ease-in-out hover:scale-110 active:scale-95'
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
  services,
}: {
  selectedService: string | null;
  additionalServices: string[];
  services: Service[];
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
      <div className='text-base font-medium mb-2'>Selected Services:</div>
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
      <div className='flex justify-between font-semibold text-base border-t pt-2'>
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
  const [previousStep, setPreviousStep] = React.useState<number | null>(null);
  const [selectedService, setSelectedService] = React.useState<string | null>(null);
  const [additionalSelectedServices, setAdditionalSelectedServices] = React.useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = React.useState('');
  const [contactForm, setContactForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    files: [] as File[],
  });
  const [submitted, setSubmitted] = React.useState(false);
  const [callbackSchedule, setCallbackSchedule] = React.useState<CallbackSchedule>({
    date: '',
    time: '',
    name: '',
    phone: '',
    notes: '',
    isASAP: true,
  });
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [pendingService, setPendingService] = React.useState<string | null>(null);
  const { cmsData } = useWorkspaceCMS();
  const [loading, setLoading] = React.useState(false);

  // Get services and form configurations from CMS data
  const { services, contactFormConfig, callbackFormConfig, callNowConfig } = React.useMemo(() => {
    const onboardingSection = (cmsData?.pages?.home as any)?.sections?.find((section: any) => {
      return section.type === 'onboardingServiceSection';
    });

    const sectionData = onboardingSection?.data;

    return {
      services: (sectionData?.services as Service[]) || [
        // Fallback services if not found in CMS
        { name: 'Professional Resume Writing', price: '$99', subtitle: '2-3 business days' },
        { name: 'Same-Day Rush Service', price: '$49', subtitle: 'Delivered today' },
        { name: 'Specialized Industries', price: '$129', subtitle: '1 session' },
        { name: 'Free Consulting', price: 'Free', subtitle: '20 mins' },
      ],
      contactFormConfig: (sectionData?.forms?.contactForm as FormConfig) || {
        title: 'Contact Details',
        description: 'Please provide your contact information.',
        fields: [
          {
            name: 'name',
            label: 'Name *',
            type: 'text' as const,
            placeholder: 'Jane Smith',
            required: true,
          },
          {
            name: 'email',
            label: 'Email address *',
            type: 'email' as const,
            placeholder: 'email@website.com',
            required: true,
          },
          {
            name: 'phone',
            label: 'Phone number *',
            type: 'tel' as const,
            placeholder: '555-555-5555',
            required: true,
          },
          {
            name: 'files',
            label: 'Upload your current resume (optional)',
            type: 'file' as const,
            required: false,
            accept: '.pdf,.doc,.docx,.txt',
            multiple: true,
            maxSize: 5,
            maxFiles: 3,
            description:
              'Upload your current resume so we can review it and provide better suggestions.',
          },
          {
            name: 'message',
            label: 'Message',
            type: 'textarea' as const,
            placeholder: 'Your message here...',
            required: false,
            rows: 4,
          },
        ],
        consentField: {
          name: 'consent',
          label: 'I allow this website to store my submission so they can respond to my inquiry. *',
          required: true,
        },
      },
      callbackFormConfig: (sectionData?.forms?.callbackForm as FormConfig) || {
        title: 'Schedule a Callback',
        description: 'Choose a time that works for you.',
        fields: [
          {
            name: 'name',
            label: 'Your Name *',
            type: 'text' as const,
            placeholder: 'Jane Smith',
            required: true,
          },
          {
            name: 'phone',
            label: 'Phone Number *',
            type: 'tel' as const,
            placeholder: '555-555-5555',
            required: true,
          },
          {
            name: 'date',
            label: 'Preferred Date *',
            type: 'date' as const,
            required: true,
            showWhen: 'scheduled',
          },
          {
            name: 'time',
            label: 'Preferred Time *',
            type: 'time' as const,
            required: true,
            showWhen: 'scheduled',
          },
          {
            name: 'notes',
            label: 'Additional Notes',
            type: 'textarea' as const,
            placeholder: "Any specific topics you'd like to discuss?",
            required: false,
            rows: 4,
          },
        ],
        timingOptions: [
          {
            value: 'asap',
            label: 'ASAP',
            description: 'We will call you back as soon as possible',
          },
          {
            value: 'scheduled',
            label: 'Schedule',
            description: 'Choose a specific time for your callback',
          },
        ],
      },
      callNowConfig: sectionData?.forms?.callNowSection || {
        title: 'Call Now',
        description: 'Get immediate assistance from our team',
        buttonText: 'Start Call',
        icon: 'phone',
      },
    };
  }, [cmsData]);

  const handleServiceSelect = React.useCallback(
    (serviceName: string) => {
      if (!isAnimating) {
        setIsAnimating(true);
        setSelectedService(serviceName);
      }
    },
    [isAnimating],
  );

  React.useEffect(() => {
    if (selectedService) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 400); // Slightly longer than animation duration to ensure smooth transition
      return () => {
        return clearTimeout(timer);
      };
    }
  }, [selectedService]);

  React.useEffect(() => {
    if (!open) {
      // Add a small delay to allow the closing animation to complete
      const timeoutId = setTimeout(() => {
        setStep(0);
        setSelectedService(null);
        setAdditionalSelectedServices([]);
        setAdditionalNotes('');
        setContactForm({ name: '', email: '', phone: '', message: '', consent: false, files: [] });
        setSubmitted(false);
        setCallbackSchedule({ date: '', time: '', name: '', phone: '', notes: '', isASAP: true });
      }, 300); // Match this with the animation duration

      return () => {
        return clearTimeout(timeoutId);
      };
    }
  }, [open]);

  // Memoize the button text to only update when it actually changes
  const buttonText = React.useMemo(() => {
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
  }, [selectedService, additionalSelectedServices, services]);

  // Helper to submit the contact form (step 1)
  const handleContactSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Check if we have files to upload
      const hasFiles = contactForm.files && contactForm.files.length > 0;

      if (hasFiles) {
        // Use FormData for file uploads
        const formData = new FormData();

        // Add form fields
        formData.append('cmsEmail', cmsData?.settings?.contact?.email || '');
        formData.append('type', 'contact');
        formData.append('selectedService', selectedService || '');
        formData.append('additionalServices', JSON.stringify(additionalSelectedServices));
        formData.append('additionalNotes', additionalNotes);

        // Add contact form data (excluding files)
        Object.entries(contactForm).forEach(([key, value]) => {
          if (key !== 'files') {
            formData.append(`contactForm[${key}]`, String(value));
          }
        });

        // Add files
        contactForm.files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });

        await newRequest.post('/public/inbound', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Use regular JSON for submissions without files
        await newRequest.post('/public/inbound', {
          cmsEmail: cmsData?.settings?.contact?.email,
          type: 'contact',
          selectedService,
          additionalServices: additionalSelectedServices,
          additionalNotes,
          contactForm,
        });
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to submit the callback scheduling form (step 2)
  const handleCallbackSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await newRequest.post('/public/inbound', {
        cmsEmail: cmsData?.settings?.contact?.email,
        type: 'callback',
        selectedService,
        additionalServices: additionalSelectedServices,
        callbackSchedule,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error scheduling callback:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (submitted) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className='flex flex-col items-center justify-center h-full py-12'
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6'
          >
            <CheckIcon className='w-10 h-10 text-green-600' />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='text-3xl font-bold mb-3 text-center'
          >
            Thank You!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='text-muted-foreground text-lg mb-8 text-center max-w-md'
          >
            {step === 2
              ? "We'll call you at your scheduled time. Looking forward to our conversation!"
              : "We've received your request and will be in touch with you shortly."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='w-full max-w-sm'
          >
            <Button
              onClick={() => {
                return onOpenChange(false);
              }}
              className='w-full min-h-[50px] rounded-full bg-black hover:bg-black/80 transition-all duration-300'
            >
              Close
            </Button>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <AnimatePresence mode='wait'>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className='flex-1'
        >
          {(() => {
            switch (step) {
              case 0:
                return (
                  <div className='flex flex-col h-full'>
                    <div className='flex-1'>
                      <AnimatePresence mode='wait'>
                        {!selectedService ? (
                          <motion.div
                            key='service-list'
                            className='flex flex-col gap-3'
                            variants={containerVariants}
                            initial='hidden'
                            animate='show'
                            exit='exit'
                          >
                            {services.map((service, index) => {
                              return (
                                <motion.div
                                  key={service.name}
                                  variants={itemVariants}
                                  layout
                                  custom={index}
                                >
                                  <ServiceCard
                                    service={service}
                                    isSelected={false}
                                    onClick={() => {
                                      return handleServiceSelect(service.name);
                                    }}
                                  />
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        ) : (
                          <motion.div
                            key='selected-service'
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              y: 0,
                              transition: {
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                                mass: 0.4,
                                velocity: 2,
                                duration: 0.3,
                              },
                            }}
                            layout
                          >
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
                            <motion.div
                              className='flex flex-col gap-3 mb-4'
                              variants={containerVariants}
                              initial='hidden'
                              animate='show'
                            >
                              {services
                                .filter((s) => {
                                  return s.name !== selectedService;
                                })
                                .map((service, index) => {
                                  const isSelected = additionalSelectedServices.includes(
                                    service.name,
                                  );
                                  return (
                                    <motion.div
                                      key={service.name}
                                      variants={{
                                        hidden: { opacity: 0, y: 20, scale: 0.95 },
                                        show: {
                                          opacity: 1,
                                          y: 0,
                                          scale: 1,
                                          transition: {
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 20,
                                            mass: 0.5,
                                            delay: index * 0.1,
                                          },
                                        },
                                      }}
                                      layout
                                    >
                                      <ServiceCard
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
                                    </motion.div>
                                  );
                                })}
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className='mt-auto border-t pt-5'>
                      <Button
                        className={`w-full min-h-[50px] rounded-full bg-black hover:bg-black/80 transition-all duration-300 ease-in-out ${
                          selectedService
                            ? 'opacity-100 translate-y-0 pointer-events-auto'
                            : 'opacity-0 pointer-events-none'
                        }`}
                        style={{
                          transitionProperty: 'opacity, transform',
                          transitionDuration: '300ms',
                          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onClick={() => {
                          return setStep(1);
                        }}
                        disabled={!selectedService}
                        aria-disabled={!selectedService}
                      >
                        <motion.div
                          key={buttonText}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          {buttonText}
                        </motion.div>
                      </Button>
                    </div>
                  </div>
                );
              case 1:
                return (
                  <div>
                    <div className='mb-4'>
                      Service(s):{' '}
                      <span className='font-semibold text-base'>
                        {[selectedService, ...additionalSelectedServices]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                    {additionalNotes && (
                      <div className='mb-4'>
                        Notes:{' '}
                        <span className='text-muted-foreground text-sm'>{additionalNotes}</span>
                      </div>
                    )}
                    <div className='space-y-4'>
                      {contactFormConfig.fields.map((field) => {
                        return (
                          <DynamicFormField
                            key={field.name}
                            field={field}
                            value={contactForm[field.name as keyof typeof contactForm]}
                            onChange={(name, value) => {
                              setContactForm((f) => {
                                return { ...f, [name]: value };
                              });
                            }}
                            formData={contactForm}
                          />
                        );
                      })}
                      {contactFormConfig.consentField && (
                        <DynamicFormField
                          field={{
                            ...contactFormConfig.consentField,
                            type: 'checkbox',
                          }}
                          value={contactForm.consent}
                          onChange={(name, value) => {
                            setContactForm((f) => {
                              return { ...f, [name]: value };
                            });
                          }}
                          formData={contactForm}
                        />
                      )}
                    </div>
                  </div>
                );
              case 2:
                return (
                  <div className='space-y-8 max-w-2xl mx-auto'>
                    <div className='space-y-6'>
                      {/* Immediate Call Section */}
                      <div
                        className='border rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-all duration-300 cursor-pointer group'
                        onClick={() => {
                          const phoneNumber = buttons.find((btn) => {
                            return btn.type === 'callOrText' && btn.url;
                          })?.url;
                          if (phoneNumber) {
                            window.location.href = phoneNumber;
                          }
                        }}
                      >
                        <div className='flex items-center gap-4'>
                          <div className='w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-6 w-6 text-white'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                              />
                            </svg>
                          </div>
                          <div className='flex-grow'>
                            <h3 className='text-lg font-semibold mb-1'>{callNowConfig.title}</h3>
                            <p className='text-muted-foreground text-sm'>
                              {callNowConfig.description}
                            </p>
                          </div>
                          <Button
                            className='bg-black hover:bg-black/90 text-white px-6 text-base'
                            size='lg'
                            onClick={(e) => {
                              e.stopPropagation();
                              const phoneNumber = buttons.find((btn) => {
                                return btn.type === 'callOrText' && btn.url;
                              })?.url;
                              if (phoneNumber) {
                                window.location.href = phoneNumber;
                              }
                            }}
                          >
                            {callNowConfig.buttonText}
                          </Button>
                        </div>
                      </div>

                      <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                          <div className='w-full border-t border-gray-200'></div>
                        </div>
                        <div className='relative flex justify-center'>
                          <span className='bg-white px-4 text-sm text-gray-500'>or</span>
                        </div>
                      </div>

                      {/* Schedule Callback Section */}
                      <div className='border rounded-xl p-6 bg-white hover:shadow-lg transition-all duration-300'>
                        <div className='flex items-center gap-4 mb-6'>
                          <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-6 w-6 text-gray-600'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className='text-lg font-semibold mb-1'>
                              {callbackFormConfig.title}
                            </h3>
                            <p className='text-muted-foreground text-sm'>
                              {callbackFormConfig.description}
                            </p>
                          </div>
                        </div>

                        <div className='space-y-4'>
                          {callbackFormConfig.timingOptions && (
                            <div className='flex items-center gap-4 justify-between p-4 bg-gray-50 rounded-lg'>
                              <div className='flex flex-col gap-1'>
                                <h4 className='font-medium text-base'>Callback Timing</h4>
                                <p className='text-sm text-muted-foreground'>
                                  {callbackSchedule.isASAP
                                    ? callbackFormConfig.timingOptions.find((opt) => {
                                        return opt.value === 'asap';
                                      })?.description
                                    : callbackFormConfig.timingOptions.find((opt) => {
                                        return opt.value === 'scheduled';
                                      })?.description}
                                </p>
                              </div>
                              <div className='flex items-center gap-2'>
                                {callbackFormConfig.timingOptions.map((option) => {
                                  return (
                                    <button
                                      key={option.value}
                                      type='button'
                                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200 ${
                                        (option.value === 'asap' && callbackSchedule.isASAP) ||
                                        (option.value === 'scheduled' && !callbackSchedule.isASAP)
                                          ? 'bg-black text-white'
                                          : 'bg-white text-gray-600 hover:bg-gray-100'
                                      }`}
                                      onClick={() => {
                                        setCallbackSchedule((prev) => {
                                          return {
                                            ...prev,
                                            isASAP: option.value === 'asap',
                                          };
                                        });
                                      }}
                                    >
                                      {option.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className='space-y-4'>
                            {callbackFormConfig.fields.map((field) => {
                              // Handle conditional fields
                              if (field.showWhen === 'scheduled' && callbackSchedule.isASAP) {
                                return null;
                              }

                              return (
                                <div
                                  key={field.name}
                                  className={
                                    field.type === 'date' || field.type === 'time'
                                      ? 'space-y-2'
                                      : ''
                                  }
                                >
                                  <DynamicFormField
                                    field={{
                                      ...field,
                                      label: field.label,
                                    }}
                                    value={
                                      callbackSchedule[field.name as keyof typeof callbackSchedule]
                                    }
                                    onChange={(name, value) => {
                                      setCallbackSchedule((prev) => {
                                        return { ...prev, [name]: value };
                                      });
                                    }}
                                    formData={callbackSchedule}
                                    variant='callback'
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderNavigation = () => {
    if (submitted || step === 0) return null;

    return (
      <div className='mt-auto border-t pt-5'>
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
              onClick={handleContactSubmit}
              disabled={
                loading ||
                !contactFormConfig.fields.every((field) => {
                  if (!field.required) return true;

                  const value = contactForm[field.name as keyof typeof contactForm];

                  if (field.type === 'file') {
                    return Array.isArray(value) && value.length > 0;
                  }

                  return value && String(value).trim() !== '';
                }) ||
                (contactFormConfig.consentField?.required && !contactForm.consent)
              }
              className={`w-full min-h-[50px] rounded-full bg-black hover:bg-black/80 ${
                contactFormConfig.fields.every((field) => {
                  if (!field.required) return true;

                  const value = contactForm[field.name as keyof typeof contactForm];

                  if (field.type === 'file') {
                    return Array.isArray(value) && value.length > 0;
                  }

                  return value && String(value).trim() !== '';
                }) &&
                (!contactFormConfig.consentField?.required || contactForm.consent)
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-1 pointer-events-none'
              }`}
              style={{
                transitionProperty: 'opacity, transform',
                transitionDuration: '300ms',
              }}
            >
              Submit
            </Button>
          )}

          {step === 2 && (
            <Button
              onClick={handleCallbackSubmit}
              disabled={
                loading ||
                !callbackFormConfig.fields.every((field) => {
                  // Skip conditional fields when not applicable
                  if (field.showWhen === 'scheduled' && callbackSchedule.isASAP) {
                    return true;
                  }
                  return (
                    !field.required ||
                    (callbackSchedule[field.name as keyof typeof callbackSchedule] &&
                      String(
                        callbackSchedule[field.name as keyof typeof callbackSchedule],
                      ).trim() !== '')
                  );
                })
              }
              className={`w-full min-h-[50px] rounded-full bg-black hover:bg-black/80 ${
                callbackFormConfig.fields.every((field) => {
                  // Skip conditional fields when not applicable
                  if (field.showWhen === 'scheduled' && callbackSchedule.isASAP) {
                    return true;
                  }
                  return (
                    !field.required ||
                    (callbackSchedule[field.name as keyof typeof callbackSchedule] &&
                      String(
                        callbackSchedule[field.name as keyof typeof callbackSchedule],
                      ).trim() !== '')
                  );
                })
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-1 pointer-events-none'
              }`}
              style={{
                transitionProperty: 'opacity, transform',
                transitionDuration: '300ms',
              }}
            >
              Schedule Callback
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
        className='w-full sm:w-[800px] sm:!max-w-[600px] fixed right-0 sm:right-4 top-0 sm:top-4 bottom-0 sm:bottom-4 px-4 sm:px-12 bg-background max-h-[100vh] sm:max-h-[calc(100vh-2rem)] overflow-y-auto border rounded-none sm:rounded-lg shadow-lg [&>button]:hidden scrollbar-hide flex flex-col p-4 sm:p-8'
      >
        {!submitted && (
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-1'>
              {step > 0 ? (
                <ArrowLeftIcon
                  className='w-5 h-5 cursor-pointer mr-1 hover:text-gray-500'
                  onClick={() => {
                    if (step === 2 && previousStep !== null) {
                      setStep(previousStep);
                      setPreviousStep(null);
                    } else {
                      setStep(step - 1);
                    }
                  }}
                />
              ) : (
                <ArrowLeftIcon
                  className='w-5 h-5 cursor-pointer mr-1 hover:text-gray-500 sm:hidden'
                  onClick={() => {
                    return onOpenChange(false);
                  }}
                />
              )}
              <SheetTitle className='text-xl font-semibold'>
                {step === 0
                  ? 'Choose a Service'
                  : step === 1
                  ? contactFormConfig.title
                  : callbackFormConfig.title}
              </SheetTitle>
            </div>
            <button
              onClick={() => {
                setPreviousStep(step);
                setStep(2);
              }}
              className='border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 transition px-4 py-2 rounded shadow-none font-medium text-sm'
              style={{ minHeight: 36 }}
            >
              📞 Skip and Call Us
            </button>
          </div>
        )}
        <div className='flex-1 flex flex-col'>
          {renderStep()}
          {renderNavigation()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
