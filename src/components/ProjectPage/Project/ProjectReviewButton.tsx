import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ChevronDown,
  CreditCardIcon,
  DollarSign,
  Edit,
  FileText,
  Loader2,
  Mail,
  Repeat,
  Sparkle,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

type ProjectState = 'in-progress' | 'invoice-sent' | 'partial-payment' | 'completed';

interface ButtonConfig {
  state: ProjectState;
  label: string;
  icon: ReactNode;
  className: string;
  menuItems: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
    separatorBefore?: boolean;
  }[];
}

interface AIWizardStep {
  title: string;
  description: string;
  content: ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }[];
}

function AIWizardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [scannedData, setScannedData] = useState({
    deliverables: ['Website Design', 'Content Creation', 'SEO Optimization'],
    timeSpent: '45 hours',
    materialsCost: '$1,200',
    suggestedTotal: '$4,500',
  });

  // Simulate AI scanning
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => {
        return clearTimeout(timer);
      };
    }
  }, [open]);

  const steps: AIWizardStep[] = [
    {
      title: 'AI Project Analysis',
      description: 'Scanning project for deliverables, time spent, and costs...',
      content: isLoading ? (
        <div className='flex flex-col items-center justify-center py-8'>
          <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
          <p className='mt-4 text-sm text-muted-foreground'>Analyzing project data...</p>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='rounded-lg border p-4'>
            <h3 className='font-medium'>Deliverables Found</h3>
            <ul className='mt-2 space-y-1'>
              {scannedData.deliverables.map((item, index) => {
                return (
                  <li key={index} className='flex items-center gap-2 text-sm'>
                    <CheckCircle className='h-4 w-4 text-green-500' />
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className='rounded-lg border p-4'>
            <h3 className='font-medium'>Time & Costs</h3>
            <div className='mt-2 grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='text-muted-foreground'>Time Spent</p>
                <p className='font-medium'>{scannedData.timeSpent}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Materials Cost</p>
                <p className='font-medium'>{scannedData.materialsCost}</p>
              </div>
            </div>
          </div>
          <div className='rounded-lg border p-4 bg-blue-50'>
            <h3 className='font-medium'>Suggested Total</h3>
            <p className='mt-2 text-2xl font-bold text-blue-600'>{scannedData.suggestedTotal}</p>
          </div>
        </div>
      ),
      actions: isLoading
        ? undefined
        : [
            {
              label: 'Continue',
              onClick: () => {
                return setCurrentStep(1);
              },
            },
          ],
    },
    {
      title: 'Review & Adjust',
      description: 'Please review and adjust the invoice details as needed',
      content: (
        <div className='space-y-4'>
          <div className='rounded-lg border p-4'>
            <h3 className='font-medium'>Deliverables</h3>
            <div className='mt-2 space-y-2'>
              {scannedData.deliverables.map((item, index) => {
                return (
                  <div key={index} className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      defaultChecked
                      className='h-4 w-4 rounded border-gray-300'
                    />
                    <span className='text-sm'>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className='rounded-lg border p-4'>
            <h3 className='font-medium'>Invoice Amount</h3>
            <div className='mt-2'>
              <input
                type='text'
                defaultValue={scannedData.suggestedTotal}
                className='w-full rounded-md border p-2 text-lg font-medium'
              />
            </div>
          </div>
        </div>
      ),
      actions: [
        {
          label: 'Back',
          onClick: () => {
            return setCurrentStep(0);
          },
          variant: 'outline',
        },
        {
          label: 'Generate Invoice',
          onClick: () => {
            // Here you would handle the actual invoice generation
            onOpenChange(false);
          },
        },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>{steps[currentStep].description}</DialogDescription>
        </DialogHeader>
        {steps[currentStep].content}
        {steps[currentStep].actions && (
          <DialogFooter>
            {steps[currentStep].actions.map((action, index) => {
              return (
                <Button key={index} variant={action.variant} onClick={action.onClick}>
                  {action.label}
                </Button>
              );
            })}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectReviewButton() {
  const [projectState, setProjectState] = useState<ProjectState>('invoice-sent');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAIWizardOpen, setIsAIWizardOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState('recurring');

  const buttonConfigs: ButtonConfig[] = [
    {
      state: 'in-progress',
      label: 'Review & Invoice',
      icon: <FileText className='h-4 w-4 mr-2 text-gray-500' />,
      className:
        'font-light h-9 text-sm tracking-wide text-gray-700 transition-all text-white focus-visible:ring-0 bg-gray-50 text-gray-700 hover:bg-gray-100 font-normal shadow-none px-1',
      menuItems: [
        {
          label: 'Request Upfront Payment',
          icon: <DollarSign className='h-4 w-4 mr-2 text-blue-500' />,
          onClick: () => {
            return setIsPaymentDialogOpen(true);
          },
        },
        {
          label: 'Setup Payment Schedule',
          icon: <Repeat className='h-4 w-4 mr-2 text-purple-500' />,
          onClick: () => {
            setSelectedPaymentType('recurring');
            setIsPaymentDialogOpen(true);
          },
        },
        {
          label: 'Complete & Final Invoice',
          icon: <Sparkle className='h-4 w-4 mr-2 text-green-500' />,
          onClick: () => {
            setIsAIWizardOpen(true);
          },
          separatorBefore: true,
        },
      ],
    },
    {
      state: 'invoice-sent',
      label: 'Awaiting Payment',
      icon: <AlertCircle className='h-4 w-4 mr-2' />,
      className:
        'h-9 text-sm tracking-wide text-amber-600 bg-amber-50 hover:bg-amber-100 transition-all focus-visible:ring-0',
      menuItems: [
        {
          label: 'Edit Project',
          icon: <Edit className='h-4 w-4 mr-2 text-gray-500' />,
          onClick: () => {
            return setProjectState('in-progress');
          },
        },
        {
          label: 'Cancel Invoice',
          icon: <Ban className='h-4 w-4 mr-2 text-red-500' />,
          onClick: () => {
            return setProjectState('in-progress');
          },
        },
        {
          label: 'Mark as Paid',
          icon: <CheckCircle className='h-4 w-4 mr-2 text-green-500' />,
          onClick: () => {
            return setProjectState('completed');
          },
        },
      ],
    },
    {
      state: 'partial-payment',
      label: 'Payment Plan Active',
      icon: <CreditCardIcon className='h-4 w-4 mr-2' />,
      className:
        'h-9 text-sm tracking-wide text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all',
      menuItems: [
        {
          label: 'Edit Project',
          icon: <Edit className='h-4 w-4 mr-2 text-gray-500' />,
          onClick: () => {
            return setProjectState('in-progress');
          },
        },
        {
          label: 'View Payment Schedule',
          icon: <FileText className='h-4 w-4 mr-2 text-blue-500' />,
          onClick: () => {
            return console.log('View Payment Schedule clicked');
          },
        },
        {
          label: 'Complete & Final Invoice',
          icon: <CheckCircle className='h-4 w-4 mr-2 text-green-500' />,
          onClick: () => {
            return console.log('Complete & Final Invoice clicked');
          },
          separatorBefore: true,
        },
      ],
    },
    {
      state: 'completed',
      label: 'Payment Received',
      icon: <CheckCircle className='h-4 w-4 mr-2' />,
      className:
        'h-9 text-sm tracking-wide text-green-600 bg-green-50 hover:bg-green-100 transition-all focus-visible:ring-0',
      menuItems: [
        {
          label: 'Edit Project',
          icon: <Edit className='h-4 w-4 mr-2 text-gray-500' />,
          onClick: () => {
            return setProjectState('in-progress');
          },
        },
        {
          label: 'View Invoice',
          icon: <FileText className='h-4 w-4 mr-2 text-amber-500' />,
          onClick: () => {
            return setProjectState('invoice-sent');
          },
        },
        {
          label: 'Send Receipt',
          icon: <Mail className='h-4 w-4 mr-2 text-blue-500' />,
          onClick: () => {
            return console.log('Send Receipt clicked');
          },
        },
      ],
    },
  ];

  const currentConfig = buttonConfigs.find((config) => {
    return config.state === projectState;
  });

  if (!currentConfig) return null;

  return (
    <div className=''>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='default' className={currentConfig.className}>
            {currentConfig.icon}
            {currentConfig.label}
            <ChevronDown className='h-3 w-3 ml-2 opacity-70' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          className='w-full min-w-[var(--radix-dropdown-menu-trigger-width)]'
        >
          {currentConfig.menuItems.map((item, index) => {
            return (
              <div key={index}>
                {item.separatorBefore && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={item.onClick}>
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AIWizardDialog open={isAIWizardOpen} onOpenChange={setIsAIWizardOpen} />
    </div>
  );
}
