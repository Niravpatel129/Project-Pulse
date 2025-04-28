import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { useInvoices } from '@/contexts/InvoicesContext';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Clock, Info, Save, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Custom invoice item interface that matches what the API expects
interface ApiInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
  projectFileId?: string;
}

// API Invoice interface
interface ApiInvoice {
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
  project?: string;
  items: ApiInvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  notes?: string;
  paymentTerms?: string;
  currency?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
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

interface CustomLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
}

interface InvoicePreview {
  subtotal: number;
  tax: number;
  total: number;
  items: {
    type: 'deliverable' | 'task' | 'custom';
    id: string;
    name: string;
    amount: number;
  }[];
}

interface InvoiceWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  clients: Client[];
}

export function InvoiceWizardDialog({
  open,
  onOpenChange,
  projectId,
  clients = [],
}: InvoiceWizardDialogProps) {
  const { toast } = useToast();
  const { createInvoice, sendInvoice } = useInvoices();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [paymentTerms, setPaymentTerms] = useState('30');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(10);
  const [notes, setNotes] = useState('');
  const [customLineItems, setCustomLineItems] = useState<CustomLineItem[]>([]);
  const [newCustomItem, setNewCustomItem] = useState<Partial<CustomLineItem>>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 10,
    discount: 0,
  });

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
      ...customLineItems.map((item) => {
        return {
          type: 'custom' as const,
          id: item.id,
          name: item.description,
          amount: item.total,
        };
      }),
    ];

    const subtotal = items.reduce((sum, item) => {
      return sum + item.amount;
    }, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    setInvoicePreview({
      subtotal,
      tax,
      total,
      items,
    });
  }, [deliverables, tasks, customLineItems, taxRate]);

  const handleAddCustomItem = () => {
    if (!newCustomItem.description || !newCustomItem.quantity || !newCustomItem.unitPrice) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields for the custom item.',
        variant: 'destructive',
      });
      return;
    }

    const total =
      newCustomItem.quantity! *
      newCustomItem.unitPrice! *
      (1 - (newCustomItem.discount || 0) / 100);

    setCustomLineItems([
      ...customLineItems,
      {
        id: Date.now().toString(),
        description: newCustomItem.description!,
        quantity: newCustomItem.quantity!,
        unitPrice: newCustomItem.unitPrice!,
        taxRate: newCustomItem.taxRate!,
        discount: newCustomItem.discount || 0,
        total,
      },
    ]);

    setNewCustomItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 10,
      discount: 0,
    });
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomLineItems(
      customLineItems.filter((item) => {
        return item.id !== id;
      }),
    );
  };

  const handleSaveDraft = async () => {
    if (!selectedClient) {
      toast({
        title: 'Missing Client',
        description: 'Please select a client before saving.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert to the expected Invoice format
      const items: ApiInvoiceItem[] = invoicePreview.items.map((item) => {
        return {
          id: item.id,
          description: item.name,
          quantity: 1,
          unitPrice: item.amount,
          tax: taxRate,
          discount: 0,
          total: item.amount,
        };
      });

      const invoice: ApiInvoice = {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        project: projectId,
        items,
        subtotal: invoicePreview.subtotal,
        tax: invoicePreview.tax,
        total: invoicePreview.total,
        status: 'draft' as InvoiceStatus,
        dueDate: new Date(Date.now() + parseInt(paymentTerms) * 24 * 60 * 60 * 1000).toISOString(),
        notes,
        paymentTerms,
        currency,
      };

      await createInvoice(invoice);
      toast({
        title: 'Draft Saved',
        description: 'Your invoice has been saved as a draft.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the invoice draft.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedClient) {
      toast({
        title: 'Missing Client',
        description: 'Please select a client before sending.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      // Convert to the expected Invoice format
      const items: ApiInvoiceItem[] = invoicePreview.items.map((item) => {
        return {
          id: item.id,
          description: item.name,
          quantity: 1,
          unitPrice: item.amount,
          tax: taxRate,
          discount: 0,
          total: item.amount,
        };
      });

      const invoice: ApiInvoice = {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        project: projectId,
        items,
        subtotal: invoicePreview.subtotal,
        tax: invoicePreview.tax,
        total: invoicePreview.total,
        status: 'sent' as InvoiceStatus,
        dueDate: new Date(Date.now() + parseInt(paymentTerms) * 24 * 60 * 60 * 1000).toISOString(),
        notes,
        paymentTerms,
        currency,
      };

      const createdInvoice = await createInvoice(invoice);
      await sendInvoice(createdInvoice.id, {
        to: selectedClient.email,
        subject: `Invoice for ${selectedClient.name}`,
        message: notes,
      });

      toast({
        title: 'Invoice Sent',
        description: 'Your invoice has been sent successfully.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send the invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

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
                  <span>Tax ({taxRate}%)</span>
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
                  <span>Tax ({taxRate}%)</span>
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
      title: 'Add Custom Items',
      description: 'Add any additional items to the invoice',
      content: (
        <div className='grid grid-cols-2 gap-6 h-[calc(100vh-250px)]'>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  value={newCustomItem.description}
                  onChange={(e) => {
                    return setNewCustomItem({ ...newCustomItem, description: e.target.value });
                  }}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='quantity'>Quantity</Label>
                  <Input
                    id='quantity'
                    type='number'
                    min='1'
                    value={newCustomItem.quantity}
                    onChange={(e) => {
                      return setNewCustomItem({
                        ...newCustomItem,
                        quantity: parseInt(e.target.value),
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor='unitPrice'>Unit Price</Label>
                  <Input
                    id='unitPrice'
                    type='number'
                    min='0'
                    value={newCustomItem.unitPrice}
                    onChange={(e) => {
                      return setNewCustomItem({
                        ...newCustomItem,
                        unitPrice: parseFloat(e.target.value),
                      });
                    }}
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='taxRate'>Tax Rate (%)</Label>
                  <Input
                    id='taxRate'
                    type='number'
                    min='0'
                    value={newCustomItem.taxRate}
                    onChange={(e) => {
                      return setNewCustomItem({
                        ...newCustomItem,
                        taxRate: parseFloat(e.target.value),
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor='discount'>Discount (%)</Label>
                  <Input
                    id='discount'
                    type='number'
                    min='0'
                    max='100'
                    value={newCustomItem.discount}
                    onChange={(e) => {
                      return setNewCustomItem({
                        ...newCustomItem,
                        discount: parseFloat(e.target.value),
                      });
                    }}
                  />
                </div>
              </div>
              <Button onClick={handleAddCustomItem} className='w-full'>
                Add Item
              </Button>
            </div>
            <div className='space-y-4'>
              <h4 className='font-medium'>Custom Items</h4>
              {customLineItems.map((item) => {
                return (
                  <div
                    key={item.id}
                    className='flex items-center justify-between p-3 border rounded-lg'
                  >
                    <div>
                      <p className='font-medium'>{item.description}</p>
                      <p className='text-sm text-muted-foreground'>
                        {item.quantity} × ${item.unitPrice}
                      </p>
                    </div>
                    <div className='flex items-center gap-4'>
                      <span className='font-medium'>${item.total}</span>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          return handleRemoveCustomItem(item.id);
                        }}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
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
                  <span>Tax ({taxRate}%)</span>
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
                <Label htmlFor='client'>Client</Label>
                <Select
                  value={selectedClient?.id}
                  onValueChange={(value) => {
                    const client = clients.find((c) => {
                      return c.id === value;
                    });
                    setSelectedClient(client || null);
                  }}
                >
                  <SelectTrigger id='client'>
                    <SelectValue placeholder='Select a client' />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => {
                      return (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='paymentTerms'>Payment Terms</Label>
                  <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                    <SelectTrigger id='paymentTerms'>
                      <SelectValue placeholder='Select terms' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='7'>Net 7</SelectItem>
                      <SelectItem value='14'>Net 14</SelectItem>
                      <SelectItem value='30'>Net 30</SelectItem>
                      <SelectItem value='60'>Net 60</SelectItem>
                      <SelectItem value='due_on_receipt'>Due on Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='currency'>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id='currency'>
                      <SelectValue placeholder='Select currency' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='USD'>USD ($)</SelectItem>
                      <SelectItem value='EUR'>EUR (€)</SelectItem>
                      <SelectItem value='GBP'>GBP (£)</SelectItem>
                      <SelectItem value='CAD'>CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor='taxRate'>Tax Rate (%)</Label>
                <Input
                  id='taxRate'
                  type='number'
                  min='0'
                  value={taxRate}
                  onChange={(e) => {
                    return setTaxRate(parseFloat(e.target.value));
                  }}
                />
              </div>
              <div>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  value={notes}
                  onChange={(e) => {
                    return setNotes(e.target.value);
                  }}
                  placeholder='Add any additional notes or terms...'
                  className='h-24'
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
                  <span>Tax ({taxRate}%)</span>
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
              <Button
                variant='outline'
                onClick={() => {
                  return setShowPreview(!showPreview);
                }}
                className='gap-2'
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
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
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={handleSaveDraft}
                    className='gap-2'
                    disabled={isSaving}
                  >
                    <Save className='h-4 w-4' />
                    Save Draft
                  </Button>
                  <Button onClick={handleSendInvoice} className='gap-2' disabled={isSending}>
                    <Send className='h-4 w-4' />
                    Send Invoice
                  </Button>
                </div>
              )}
            </div>
          </div>
          <Progress value={(currentStep + 1) * (100 / steps.length)} className='mt-4' />
        </DialogHeader>
        {steps[currentStep].content}
      </DialogContent>
    </Dialog>
  );
}
