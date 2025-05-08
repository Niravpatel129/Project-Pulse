import { Invoice } from '@/api/models';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CalendarIcon,
  CheckCircle2,
  CreditCard,
  DownloadCloud,
  Info,
  Link as LinkIcon,
  MoreHorizontal,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InvoiceTabProps {
  invoice: Invoice;
}

export function InvoiceTab({ invoice }: InvoiceTabProps) {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [paymentAmount, setPaymentAmount] = useState(invoice.total.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');
  const [paymentMemo, setPaymentMemo] = useState('');
  const queryClient = useQueryClient();

  const markAsSentMutation = useMutation({
    mutationFn: async () => {
      // Assuming the API expects a PATCH or PUT to /invoices/:id with status: 'sent'
      await newRequest.put(`/invoices/${invoice.id}`, { status: 'sent' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Invoice marked as sent');
      setIsSendDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark invoice as sent');
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async () => {
      await newRequest.post(`/invoices/${invoice.id}/payments`, {
        date: paymentDate,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        account: paymentAccount,
        memo: paymentMemo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success('Payment recorded successfully');
      setIsPaymentDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      case 'sent':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getDueDaysAgo = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const dueDaysAgo = getDueDaysAgo(invoice.dueDate);

  return (
    <>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl font-bold mb-1'>Invoice #{invoice.invoiceNumber}</h1>
          <div className='flex items-center gap-6 mt-2'>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Status</span>
              <Badge
                variant={getStatusColor(invoice.status)}
                className={`px-3 rounded capitalize ${
                  invoice.status.toLowerCase() === 'paid'
                    ? 'bg-green-100 text-green-700 hover:bg-green-100'
                    : invoice.status.toLowerCase() === 'overdue'
                    ? 'bg-red-100 text-red-700 hover:bg-red-100'
                    : invoice.status.toLowerCase() === 'sent'
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {invoice.status}
              </Badge>
            </div>
            <div className='flex flex-col'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Customer</span>
              <span className='text-muted-foreground text-sm'>
                <span className='text-primary font-medium cursor-pointer underline underline-offset-2'>
                  {invoice.clientName}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='inline ml-1 w-4 h-4 text-muted-foreground align-middle cursor-pointer' />
                    </TooltipTrigger>
                    <TooltipContent>Customer info</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>
          </div>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1 bg-white rounded-full border p-1 px-2'>
              <span className='text-sm font-medium'>Stripe Invoice Payments</span>
              <Switch
                checked={true}
                disabled
                className='scale-90 bg-green-600 data-[state=checked]:bg-green-600'
              />
              <span className='ml-1 text-xs font-semibold text-green-600'>ON</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='px-3'>
                  <MoreHorizontal className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                <DropdownMenuItem>Download PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='flex items-center gap-6 mt-2'>
            <div className='flex flex-col items-end'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Amount</span>
              <div className='text-lg font-semibold'>${invoice.total.toFixed(2)}</div>
            </div>
            <div className='flex flex-col items-end'>
              <span className='text-xs text-muted-foreground font-medium mb-0.5'>Due Date</span>
              <div className='text-sm text-muted-foreground'>
                Due <span className='font-medium'>{dueDaysAgo} days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Separator className='mb-6' />

      {/* Steps */}
      <Card className='mb-6'>
        <CardContent className='py-6'>
          {/* Create Step */}
          <div className='flex items-center gap-4 mb-8'>
            <div className='rounded-full bg-green-100 p-2'>
              <CheckCircle2 className='w-6 h-6 text-green-600' />
            </div>
            <div>
              <div className='font-medium'>Create</div>
              <div className='text-sm text-muted-foreground'>
                Created:{' '}
                <span className='font-mono'>on {new Date(invoice.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className='ml-auto'>
              <Button variant='outline' size='sm'>
                Edit invoice
              </Button>
            </div>
          </div>
          <Separator />
          {/* Send Step */}
          <div className='flex items-center gap-4 my-8'>
            <div className='rounded-full bg-blue-100 p-2'>
              <Send className='w-6 h-6 text-blue-600' />
            </div>
            <div>
              <div className='font-medium'>Send</div>
              <div className='text-sm text-muted-foreground'>
                Last sent:{' '}
                <span className='font-mono'>
                  Marked as sent {new Date(invoice.updatedAt).toLocaleString()}.
                </span>{' '}
                <span className='text-primary cursor-pointer underline underline-offset-2'>
                  Edit date
                </span>
              </div>
              {invoice.status === 'overdue' && (
                <div className='mt-2'>
                  <Alert className='p-2 bg-muted/50 border-0'>
                    <AlertDescription>
                      <span className='font-semibold'>
                        Overdue invoices are{' '}
                        <span className='text-primary'>3x more likely to get paid</span>
                      </span>{' '}
                      when you send reminders.{' '}
                      <span className='text-primary cursor-pointer underline underline-offset-2'>
                        Schedule reminders.
                      </span>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
            <div className='ml-auto'>
              <Button
                size='sm'
                variant={invoice.status === 'sent' ? 'outline' : 'default'}
                onClick={() => {
                  return setIsSendDialogOpen(true);
                }}
              >
                {invoice.status === 'sent' ? 'Resend invoice' : 'Send invoice'}
              </Button>
            </div>
          </div>
          <Separator />
          {/* Manage Payments Step */}
          <div className='flex items-center gap-4 mt-8'>
            <div className='rounded-full bg-purple-100 p-2'>
              <CreditCard className='w-6 h-6 text-purple-600' />
            </div>
            <div>
              <div className='font-medium'>Manage payments</div>
              <div className='text-sm text-muted-foreground'>
                Amount due: <span className='font-mono'>${invoice.total.toFixed(2)}</span> —{' '}
                <span
                  className='text-primary cursor-pointer underline underline-offset-2'
                  onClick={() => {
                    return setIsPaymentDialogOpen(true);
                  }}
                >
                  Record a payment
                </span>{' '}
                manually
              </div>
            </div>
            <div className='ml-auto'>
              <Button
                size='sm'
                onClick={() => {
                  return setIsPaymentDialogOpen(true);
                }}
              >
                Record a payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className='sm:max-w-[700px]'>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>
              Share invoice #{invoice.invoiceNumber} with {invoice.clientName}
            </DialogDescription>
          </DialogHeader>
          <div className='py-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div
                className='cursor-pointer border rounded-2xl p-8 flex flex-col items-center justify-center transition-shadow hover:shadow-md hover:border-primary group bg-blue-50'
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                <LinkIcon className='h-8 w-8 mb-4 text-blue-600 group-hover:text-blue-700' />
                <div className='font-bold text-lg mb-1 text-center'>Copy link</div>
                <div className='text-center text-muted-foreground text-base'>
                  A link to your invoice with all details included
                </div>
              </div>
              <div
                className='cursor-pointer border rounded-2xl p-8 flex flex-col items-center justify-center transition-shadow hover:shadow-md hover:border-primary group bg-indigo-50'
                onClick={() => {
                  // TODO: Implement download PDF functionality
                }}
              >
                <DownloadCloud className='h-8 w-8 mb-4 text-indigo-600 group-hover:text-indigo-700' />
                <div className='font-bold text-lg mb-1 text-center'>Download PDF</div>
                <div className='text-center text-muted-foreground text-base'>
                  Your invoice all in one document
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                return setIsSendDialogOpen(false);
              }}
            >
              {invoice.status === 'sent' ? 'Close' : 'Cancel'}
            </Button>
            {invoice.status !== 'sent' && (
              <Button
                onClick={() => {
                  return markAsSentMutation.mutate();
                }}
                disabled={markAsSentMutation.isPending}
              >
                {markAsSentMutation.isPending ? 'Marking...' : 'Mark invoice as sent'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className='sm:max-w-[450px]' forceMount>
          <DialogHeader>
            <DialogTitle>Record a payment for this invoice</DialogTitle>
          </DialogHeader>
          <form className='space-y-4'>
            <div>
              <Label>Date</Label>
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={
                      'w-full justify-start text-left font-normal' +
                      (!paymentDate ? ' text-muted-foreground' : '')
                    }
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {paymentDate ? format(paymentDate, 'yyyy-MM-dd') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0 min-w-[300px]' align='start'>
                  <Calendar
                    mode='single'
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type='number'
                min='0'
                step='any'
                value={paymentAmount}
                onChange={(e) => {
                  return setPaymentAmount(e.target.value);
                }}
                placeholder='$0.00'
              />
              <div className='text-xs text-green-700 mt-1'>Invoice will be fully paid</div>
            </div>
            <div>
              <Label>Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a payment method...' />
                </SelectTrigger>
                <SelectContent className='z-[100]'>
                  <SelectItem value='credit-card'>Credit Card</SelectItem>
                  <SelectItem value='bank-transfer'>Bank Transfer</SelectItem>
                  <SelectItem value='cash'>Cash</SelectItem>
                  <SelectItem value='check'>Check</SelectItem>
                  <SelectItem value='other'>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Account</Label>
              <Select value={paymentAccount} onValueChange={setPaymentAccount}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a payment account...' />
                </SelectTrigger>
                <SelectContent className='z-[100]'>
                  <SelectItem value='main-checking'>Main Checking</SelectItem>
                  <SelectItem value='business-savings'>Business Savings</SelectItem>
                  <SelectItem value='petty-cash'>Petty Cash</SelectItem>
                </SelectContent>
              </Select>
              <div className='text-xs text-muted-foreground mt-1'>
                Any account into which you deposit and withdraw funds from.
              </div>
            </div>
            <div>
              <Label>Memo / notes</Label>
              <Textarea
                value={paymentMemo}
                onChange={(e) => {
                  return setPaymentMemo(e.target.value);
                }}
                placeholder='Optional notes about this payment...'
              />
            </div>
          </form>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                return setIsPaymentDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={
                !paymentDate ||
                !paymentAmount ||
                !paymentMethod ||
                !paymentAccount ||
                recordPaymentMutation.isPending
              }
              onClick={(e) => {
                e.preventDefault();
                recordPaymentMutation.mutate();
              }}
            >
              {recordPaymentMutation.isPending ? 'Recording...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
