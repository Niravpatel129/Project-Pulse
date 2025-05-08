import { Invoice } from '@/api/models';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, CreditCard, Info, MoreHorizontal, Send } from 'lucide-react';

interface InvoiceTabProps {
  invoice: Invoice;
}

export function InvoiceTab({ invoice }: InvoiceTabProps) {
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
          <div className='flex items-center gap-2'>
            <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
            <span className='text-muted-foreground text-sm'>
              Customer:{' '}
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
        <div className='flex flex-col items-end gap-2'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1'>
              <span className='text-sm font-medium'>Online Payments</span>
              <Switch checked={false} disabled className='scale-90' />
              <span className='ml-1 text-xs font-semibold text-red-600'>OFF</span>
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
            <Button variant='outline' size='sm'>
              Create another invoice
            </Button>
          </div>
          <div className='flex items-center gap-6 mt-2'>
            <div className='text-lg font-semibold'>${invoice.total.toFixed(2)}</div>
            <div className='text-sm text-muted-foreground'>
              Due <span className='font-medium'>{dueDaysAgo} days ago</span>
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
            <div className='rounded-full bg-primary/10 p-2'>
              <CheckCircle2 className='w-6 h-6 text-primary' />
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
            <div className='rounded-full bg-primary/10 p-2'>
              <Send className='w-6 h-6 text-primary' />
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
              <Button size='sm'>Resend invoice</Button>
            </div>
          </div>
          <Separator />
          {/* Manage Payments Step */}
          <div className='flex items-center gap-4 mt-8'>
            <div className='rounded-full bg-primary/10 p-2'>
              <CreditCard className='w-6 h-6 text-primary' />
            </div>
            <div>
              <div className='font-medium'>Manage payments</div>
              <div className='text-sm text-muted-foreground'>
                Amount due: <span className='font-mono'>${invoice.total.toFixed(2)}</span> —{' '}
                <span className='text-primary cursor-pointer underline underline-offset-2'>
                  Record a payment
                </span>{' '}
                manually
              </div>
              <div className='text-sm mt-1'>
                Status: <span className='font-medium'>Your invoice is {invoice.status}</span>
              </div>
            </div>
            <div className='ml-auto'>
              <Button size='sm'>Record a payment</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
