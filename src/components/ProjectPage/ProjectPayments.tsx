'use client';

import { useInvoices } from '@/app/[workspace]/invoices/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import {
  CreditCard,
  DollarSign,
  LucidePiggyBank,
  MoreVertical,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import InvoicesDialog from '../invoices/InvoicesDialog/InvoicesDialog';

// Define invoice types
type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
}

const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'INV-2023-001',
    clientName: 'Sarah Johnson',
    date: '2023-10-15',
    dueDate: '2023-11-15',
    items: [
      {
        id: '1',
        description: 'Wedding Photography Package',
        quantity: 1,
        rate: 2500,
        amount: 2500,
      },
    ],
    subtotal: 2500,
    tax: 200,
    total: 2700,
    status: 'PAID',
  },
  {
    id: '2',
    number: 'INV-2023-002',
    clientName: 'Sarah Johnson',
    date: '2023-11-15',
    dueDate: '2023-12-15',
    items: [
      {
        id: '1',
        description: 'Additional Print Package',
        quantity: 1,
        rate: 500,
        amount: 500,
      },
    ],
    subtotal: 500,
    tax: 40,
    total: 540,
    status: 'SENT',
  },
];

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Status badge component
const StatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const statusConfig = {
    DRAFT: { color: 'bg-gray-200 text-gray-800', label: 'Draft' },
    SENT: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
    PAID: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    OVERDUE: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
  };

  const config = statusConfig[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Create Invoice Form
const CreateInvoiceForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (invoice: Omit<Invoice, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 },
  ]);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>();

  // Calculate item amount
  const calculateAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  // Add new item
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Update item
  const updateItem = (
    index: number,
    field: keyof Omit<InvoiceItem, 'id'>,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      // Recalculate amount if quantity or rate changes
      ...(field === 'quantity' || field === 'rate'
        ? {
            amount: calculateAmount(
              field === 'quantity' ? (value as number) : newItems[index].quantity,
              field === 'rate' ? (value as number) : newItems[index].rate,
            ),
          }
        : {}),
    };
    setItems(newItems);
  };

  // Calculate subtotal
  const subtotal = items.reduce((total, item) => {
    return total + item.amount;
  }, 0);

  // Default tax rate (can be made adjustable)
  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const invoiceData: Omit<Invoice, 'id'> = {
      number: formData.get('invoiceNumber') as string,
      clientName: formData.get('clientName') as string,
      date: format(invoiceDate, 'yyyy-MM-dd'),
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : '',
      items: items.map((item, index) => {
        return {
          id: `item-${index}`,
          ...item,
        };
      }),
      subtotal,
      tax,
      total,
      status: 'DRAFT',
      notes: formData.get('notes') as string,
    };

    onSubmit(invoiceData);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='invoiceNumber'>Invoice Number</Label>
          <Input
            id='invoiceNumber'
            name='invoiceNumber'
            defaultValue={`INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
              .toString()
              .padStart(3, '0')}`}
          />
        </div>

        <div>
          <Label htmlFor='clientName'>Client Name</Label>
          <Input id='clientName' name='clientName' required />
        </div>

        <div>
          <Label htmlFor='date'>Invoice Date</Label>
          <DatePicker
            date={invoiceDate}
            setDate={setInvoiceDate}
            placeholder='Select invoice date'
          />
        </div>

        <div>
          <Label htmlFor='dueDate'>Due Date</Label>
          <DatePicker date={dueDate} setDate={setDueDate} placeholder='Select due date' />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium'>Items</h3>
          <Button type='button' variant='outline' size='sm' onClick={addItem}>
            <Plus className='mr-1 h-4 w-4' /> Add Item
          </Button>
        </div>

        {items.map((item, index) => {
          return (
            <div key={index} className='grid grid-cols-12 gap-2 items-end'>
              <div className='col-span-12 md:col-span-5'>
                <Label htmlFor={`item-desc-${index}`}>Description</Label>
                <Input
                  id={`item-desc-${index}`}
                  value={item.description}
                  onChange={(e) => {
                    return updateItem(index, 'description', e.target.value);
                  }}
                  required
                />
              </div>
              <div className='col-span-3 md:col-span-2'>
                <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                <Input
                  id={`item-qty-${index}`}
                  type='number'
                  min='1'
                  value={item.quantity.toString()}
                  onChange={(e) => {
                    return updateItem(index, 'quantity', parseInt(e.target.value));
                  }}
                  required
                />
              </div>
              <div className='col-span-4 md:col-span-2'>
                <Label htmlFor={`item-rate-${index}`}>Rate</Label>
                <Input
                  id={`item-rate-${index}`}
                  type='number'
                  min='0'
                  step='0.01'
                  value={item.rate.toString()}
                  onChange={(e) => {
                    return updateItem(index, 'rate', parseFloat(e.target.value));
                  }}
                  required
                />
              </div>
              <div className='col-span-4 md:col-span-3'>
                <Label>Amount</Label>
                <div className='p-2 bg-gray-50 rounded border text-right w-full h-9 overflow-hidden text-ellipsis whitespace-nowrap'>
                  {formatCurrency(item.amount)}
                </div>
              </div>
              <div className='col-span-1 md:col-span-auto'>
                {items.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      return removeItem(index);
                    }}
                    className='h-9 w-9'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='md:col-start-2 space-y-2'>
          <div className='flex justify-between py-2'>
            <span className='text-sm text-gray-500'>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className='flex justify-between py-2'>
            <span className='text-sm text-gray-500'>Tax (8%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className='flex justify-between py-2 font-bold'>
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor='notes'>Notes</Label>
        <Textarea id='notes' name='notes' placeholder='Enter any additional information...' />
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit'>Create Invoice</Button>
      </DialogFooter>
    </form>
  );
};

export default function ProjectPayments() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [isInvoicesDialogOpen, setIsInvoicesDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const {
    accountStatus,
    isAccountStatusLoading,
    isInvoicesLoading,
    createStripeAccount,
    isCreatingAccount,
  } = useInvoices();

  // View invoice
  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setOpenViewDialog(true);
  };

  // Create invoice
  const handleCreateInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `invoice-${Date.now()}`,
    };

    setInvoices([...invoices, newInvoice]);
    setOpenCreateDialog(false);

    toast({
      title: 'Invoice Created',
      description: `Invoice ${newInvoice.number} has been created successfully.`,
    });
  };

  // Send reminder
  const sendReminder = (invoiceId: string) => {
    // In a real app, this would make an API call to send a reminder for the specific invoice
    console.log(`Sending reminder for invoice ${invoiceId}`);

    toast({
      title: 'Reminder Sent',
      description: 'Payment reminder has been sent to the client.',
    });
  };

  // Mark as paid
  const markAsPaid = (invoiceId: string) => {
    setInvoices(
      invoices.map((invoice) => {
        return invoice.id === invoiceId ? { ...invoice, status: 'PAID' } : invoice;
      }),
    );

    toast({
      title: 'Invoice Updated',
      description: 'Invoice has been marked as paid.',
    });
  };

  // Delete invoice
  const deleteInvoice = (invoiceId: string) => {
    setInvoices(
      invoices.filter((invoice) => {
        return invoice.id !== invoiceId;
      }),
    );

    toast({
      title: 'Invoice Deleted',
      description: 'Invoice has been deleted successfully.',
    });
  };

  const handleCreateAccount = async () => {
    try {
      const data = await createStripeAccount();
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch (error) {
      console.error('Error creating Stripe account:', error);
    }
  };

  return (
    <>
      <InvoicesDialog open={isInvoicesDialogOpen} onOpenChange={setIsInvoicesDialogOpen} />
      <div className='flex justify-center items-center relative z-10'>
        <div className='flex flex-col justify-center p-6 max-w-2xl text-center mt-[50px]'>
          <div className='relative mb-4'>
            <div className='absolute inset-0 bg-gradient-to-r from-green-100 to-blue-100 rounded-full opacity-30 blur-md'></div>
            <div className='relative flex items-center justify-center'>
              <LucidePiggyBank className='h-16 w-16 mx-auto text-green-500 drop-shadow-md' />
            </div>
          </div>
          <div className='mx-auto'>
            <h2 className='text-3xl font-bold text-gray-800 mb-6'>Easy Invoicing & Payments</h2>
            <p className='text-gray-600 mb-8'>
              Send invoices and accept online payments. Schedule them to send in the future, and
              Bonsai will automatically send client reminders for payment.
            </p>

            <div className='mb-8 flex justify-center'>
              {!accountStatus?.chargesEnabled ? (
                <Button
                  className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                >
                  {isCreatingAccount ? 'Setting up...' : 'Connect Stripe Account'}
                </Button>
              ) : (
                <Button
                  className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
                  onClick={() => {
                    setIsInvoicesDialogOpen(true);
                  }}
                >
                  Create Invoice
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold'>Payments</h2>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-4xl'>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Create a new invoice for your client. Fill in all the required details.
              </DialogDescription>
            </DialogHeader>
            <CreateInvoiceForm
              onSubmit={handleCreateInvoice}
              onCancel={() => {
                return setOpenCreateDialog(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className='max-w-4xl'>
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>Invoice {selectedInvoice.number}</DialogTitle>
                <DialogDescription>
                  Issued to {selectedInvoice.clientName} on{' '}
                  {new Date(selectedInvoice.date).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Invoice Details</h3>
                    <div className='space-y-1'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500'>Invoice Number:</span>
                        <span>{selectedInvoice.number}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500'>Date:</span>
                        <span>{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500'>Due Date:</span>
                        <span>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500'>Status:</span>
                        <StatusBadge status={selectedInvoice.status} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Client Information</h3>
                    <div className='space-y-1'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500'>Client Name:</span>
                        <span>{selectedInvoice.clientName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='text-lg font-medium mb-2'>Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className='text-right'>Quantity</TableHead>
                        <TableHead className='text-right'>Rate</TableHead>
                        <TableHead className='text-right'>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item) => {
                        return (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className='text-right'>{item.quantity}</TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(item.rate)}
                            </TableCell>
                            <TableCell className='text-right'>
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='md:col-start-2 space-y-2'>
                    <div className='flex justify-between py-2'>
                      <span className='text-sm text-gray-500'>Subtotal:</span>
                      <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    <div className='flex justify-between py-2'>
                      <span className='text-sm text-gray-500'>Tax:</span>
                      <span>{formatCurrency(selectedInvoice.tax)}</span>
                    </div>
                    <div className='flex justify-between py-2 font-bold'>
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.total)}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <h3 className='text-lg font-medium mb-2'>Notes</h3>
                    <div className='p-4 bg-gray-50 rounded border'>{selectedInvoice.notes}</div>
                  </div>
                )}
              </div>

              <DialogFooter>
                {selectedInvoice.status !== 'PAID' && (
                  <Button
                    variant='outline'
                    onClick={() => {
                      markAsPaid(selectedInvoice.id);
                      setOpenViewDialog(false);
                    }}
                  >
                    <DollarSign className='mr-2 h-4 w-4' />
                    Mark as Paid
                  </Button>
                )}
                <Button
                  onClick={() => {
                    return setOpenViewDialog(false);
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Manage all your client invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center text-gray-500'>
                      No invoices found. Create your first invoice to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => {
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className='font-medium'>{invoice.number}</div>
                          <div className='text-sm text-gray-500'>{invoice.clientName}</div>
                        </TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className='font-medium'>
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='icon'>
                                <MoreVertical className='h-4 w-4' />
                                <span className='sr-only'>Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  return handleViewInvoice(invoice);
                                }}
                              >
                                <CreditCard className='mr-2 h-4 w-4' />
                                View Invoice
                              </DropdownMenuItem>
                              {invoice.status !== 'PAID' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      return markAsPaid(invoice.id);
                                    }}
                                  >
                                    <DollarSign className='mr-2 h-4 w-4' />
                                    Mark as Paid
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      return sendReminder(invoice.id);
                                    }}
                                  >
                                    <Send className='mr-2 h-4 w-4' />
                                    Send Reminder
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  return deleteInvoice(invoice.id);
                                }}
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
