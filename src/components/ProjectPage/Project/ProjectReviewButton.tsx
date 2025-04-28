import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCardIcon,
  DollarSign,
  Edit,
  FileText,
  Info,
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

interface Deliverable {
  id: string;
  name: string;
  description: string;
  aiSuggestedPrice: number;
  aiReasoning: string;
  selected: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  hours: number;
  rate: number;
  status: 'completed' | 'in-progress' | 'planned';
  selected: boolean;
}

interface InvoicePreview {
  subtotal: number;
  tax: number;
  total: number;
  items: {
    type: 'deliverable' | 'task';
    id: string;
    name: string;
    amount: number;
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
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      id: '1',
      name: 'Website Design',
      description: 'Complete website design with responsive layouts',
      aiSuggestedPrice: 2500,
      aiReasoning: 'Based on complexity, industry standards, and similar projects',
      selected: true,
    },
    {
      id: '2',
      name: 'Content Creation',
      description: 'Website copy and blog content',
      aiSuggestedPrice: 1200,
      aiReasoning: 'Based on word count and content complexity',
      selected: true,
    },
    {
      id: '3',
      name: 'SEO Optimization',
      description: 'On-page and technical SEO implementation',
      aiSuggestedPrice: 800,
      aiReasoning: 'Based on keyword research and optimization scope',
      selected: true,
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Initial Design Phase',
      description: 'Wireframing and mockups',
      hours: 20,
      rate: 100,
      status: 'completed',
      selected: true,
    },
    {
      id: '2',
      title: 'Development',
      description: 'Frontend and backend implementation',
      hours: 40,
      rate: 100,
      status: 'completed',
      selected: true,
    },
    {
      id: '3',
      title: 'Content Writing',
      description: 'Website copy and blog posts',
      hours: 15,
      rate: 80,
      status: 'completed',
      selected: true,
    },
  ]);

  const [invoicePreview, setInvoicePreview] = useState<InvoicePreview>({
    subtotal: 0,
    tax: 0,
    total: 0,
    items: [],
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

  // Update invoice preview when selections change
  useEffect(() => {
    const selectedDeliverables = deliverables.filter((d) => {
      return d.selected;
    });
    const selectedTasks = tasks.filter((t) => {
      return t.selected;
    });

    const items = [
      ...selectedDeliverables.map((d) => {
        return {
          type: 'deliverable' as const,
          id: d.id,
          name: d.name,
          amount: d.aiSuggestedPrice,
        };
      }),
      ...selectedTasks.map((t) => {
        return {
          type: 'task' as const,
          id: t.id,
          name: t.title,
          amount: t.hours * t.rate,
        };
      }),
    ];

    const subtotal = items.reduce((sum, item) => {
      return sum + item.amount;
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    setInvoicePreview({
      subtotal,
      tax,
      total,
      items,
    });
  }, [deliverables, tasks]);

  const steps = [
    {
      title: 'Select Deliverables',
      description: 'Choose which deliverables to include in the invoice',
      content: (
        <div className='grid grid-cols-2 gap-6 h-[calc(100vh-250px)]'>
          <div className='space-y-4 overflow-y-auto pr-4'>
            {deliverables.map((deliverable) => {
              return (
                <div
                  key={deliverable.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all',
                    deliverable.selected ? 'border-blue-200 bg-blue-50' : 'border-gray-200',
                  )}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3'>
                      <input
                        type='checkbox'
                        checked={deliverable.selected}
                        onChange={(e) => {
                          setDeliverables(
                            deliverables.map((d) => {
                              return d.id === deliverable.id
                                ? { ...d, selected: e.target.checked }
                                : d;
                            }),
                          );
                        }}
                        className='mt-1 h-4 w-4 rounded border-gray-300'
                      />
                      <div>
                        <h3 className='font-medium'>{deliverable.name}</h3>
                        <p className='text-sm text-muted-foreground'>{deliverable.description}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>${deliverable.aiSuggestedPrice}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className='h-4 w-4 text-blue-500' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>AI Pricing Analysis:</p>
                            <p className='text-sm'>{deliverable.aiReasoning}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className='border-l pl-6'>
            <h3 className='font-medium mb-4'>Invoice Preview</h3>
            <div className='space-y-4'>
              {invoicePreview.items.map((item) => {
                return (
                  <div key={`${item.type}-${item.id}`} className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{item.name}</span>
                    <span>${item.amount}</span>
                  </div>
                );
              })}
              <div className='border-t pt-4 space-y-2'>
                <div className='flex justify-between'>
                  <span>Subtotal</span>
                  <span>${invoicePreview.subtotal}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax (10%)</span>
                  <span>${invoicePreview.tax}</span>
                </div>
                <div className='flex justify-between font-medium'>
                  <span>Total</span>
                  <span>${invoicePreview.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Select Tasks & Hours',
      description: 'Choose which tasks and hours to include in the invoice',
      content: (
        <div className='grid grid-cols-2 gap-6 h-[calc(100vh-250px)]'>
          <div className='space-y-4 overflow-y-auto pr-4'>
            {tasks.map((task) => {
              return (
                <div
                  key={task.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all',
                    task.selected ? 'border-blue-200 bg-blue-50' : 'border-gray-200',
                  )}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3'>
                      <input
                        type='checkbox'
                        checked={task.selected}
                        onChange={(e) => {
                          setTasks(
                            tasks.map((t) => {
                              return t.id === task.id ? { ...t, selected: e.target.checked } : t;
                            }),
                          );
                        }}
                        className='mt-1 h-4 w-4 rounded border-gray-300'
                      />
                      <div>
                        <h3 className='font-medium'>{task.title}</h3>
                        <p className='text-sm text-muted-foreground'>{task.description}</p>
                        <div className='flex items-center gap-2 mt-1'>
                          <Clock className='h-3 w-3 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            {task.hours} hours @ ${task.rate}/hr
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>${task.hours * task.rate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className='border-l pl-6'>
            <h3 className='font-medium mb-4'>Invoice Preview</h3>
            <div className='space-y-4'>
              {invoicePreview.items.map((item) => {
                return (
                  <div key={`${item.type}-${item.id}`} className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{item.name}</span>
                    <span>${item.amount}</span>
                  </div>
                );
              })}
              <div className='border-t pt-4 space-y-2'>
                <div className='flex justify-between'>
                  <span>Subtotal</span>
                  <span>${invoicePreview.subtotal}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax (10%)</span>
                  <span>${invoicePreview.tax}</span>
                </div>
                <div className='flex justify-between font-medium'>
                  <span>Total</span>
                  <span>${invoicePreview.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Invoice Details',
      description: 'Finalize your invoice details',
      content: (
        <div className='grid grid-cols-2 gap-6 h-[calc(100vh-250px)]'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium'>Invoice Number</label>
                <input
                  type='text'
                  defaultValue='INV-2024-001'
                  className='w-full rounded-md border p-2 mt-1'
                />
              </div>
              <div>
                <label className='text-sm font-medium'>Due Date</label>
                <input type='date' className='w-full rounded-md border p-2 mt-1' />
              </div>
              <div>
                <label className='text-sm font-medium'>Notes</label>
                <textarea
                  className='w-full rounded-md border p-2 mt-1 h-24'
                  placeholder='Add any additional notes or terms...'
                />
              </div>
            </div>
          </div>
          <div className='border-l pl-6'>
            <h3 className='font-medium mb-4'>Final Invoice</h3>
            <div className='space-y-4'>
              {invoicePreview.items.map((item) => {
                return (
                  <div key={`${item.type}-${item.id}`} className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{item.name}</span>
                    <span>${item.amount}</span>
                  </div>
                );
              })}
              <div className='border-t pt-4 space-y-2'>
                <div className='flex justify-between'>
                  <span>Subtotal</span>
                  <span>${invoicePreview.subtotal}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax (10%)</span>
                  <span>${invoicePreview.tax}</span>
                </div>
                <div className='flex justify-between font-medium text-lg'>
                  <span>Total</span>
                  <span>${invoicePreview.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[95vw] w-[95vw] h-[95vh] max-h-[95vh]'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle>{steps[currentStep].title}</DialogTitle>
              <DialogDescription>{steps[currentStep].description}</DialogDescription>
            </div>
            <div className='flex items-center gap-2'>
              {currentStep > 0 && (
                <Button
                  variant='outline'
                  onClick={() => {
                    return setCurrentStep(currentStep - 1);
                  }}
                  className='gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => {
                    return setCurrentStep(currentStep + 1);
                  }}
                  className='gap-2'
                >
                  Next
                  <ArrowRight className='h-4 w-4' />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // Here you would handle the actual invoice generation
                    onOpenChange(false);
                  }}
                  className='gap-2'
                >
                  Generate Invoice
                  <Check className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        {steps[currentStep].content}
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
