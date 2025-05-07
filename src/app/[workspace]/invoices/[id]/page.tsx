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

export default function page() {
  // Mock invoice data
  const invoice = {
    id: 1,
    status: 'Overdue',
    customer: 'sfs',
    amountDue: 55.0,
    dueDaysAgo: 6,
    createdAt: 'May 1, 2025 at 3:09 PM EDT',
    lastSent: 'today',
    isOnlinePayments: false,
    steps: [
      {
        key: 'create',
        label: 'Create',
        description: 'Created',
        date: 'May 1, 2025 at 3:09 PM EDT',
      },
      { key: 'send', label: 'Send', description: 'Marked as sent today.' },
      { key: 'manage', label: 'Manage payments', description: 'Your invoice is awaiting payment' },
    ],
  };

  return (
    <div className='bg-white min-h-screen'>
      <div className='max-w-2xl mx-auto py-10'>
        {/* Header */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-2xl font-bold mb-1'>Invoice #{invoice.id}</h1>
            <div className='flex items-center gap-2'>
              <Badge variant='destructive'>{invoice.status}</Badge>
              <span className='text-muted-foreground text-sm'>
                Customer:{' '}
                <span className='text-primary font-medium cursor-pointer underline underline-offset-2'>
                  {invoice.customer}
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
                <Switch checked={invoice.isOnlinePayments} disabled className='scale-90' />
                <span
                  className={`ml-1 text-xs font-semibold ${
                    invoice.isOnlinePayments ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {invoice.isOnlinePayments ? 'ON' : 'OFF'}
                </span>
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
              <div className='text-lg font-semibold'>${invoice.amountDue.toFixed(2)}</div>
              <div className='text-sm text-muted-foreground'>
                Due <span className='font-medium'>{invoice.dueDaysAgo} days ago</span>
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
                  Created: <span className='font-mono'>on {invoice.createdAt}</span>
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
                  Last sent: <span className='font-mono'>Marked as sent {invoice.lastSent}.</span>{' '}
                  <span className='text-primary cursor-pointer underline underline-offset-2'>
                    Edit date
                  </span>
                </div>
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
                  Amount due: <span className='font-mono'>${invoice.amountDue.toFixed(2)}</span> —{' '}
                  <span className='text-primary cursor-pointer underline underline-offset-2'>
                    Record a payment
                  </span>{' '}
                  manually
                </div>
                <div className='text-sm mt-1'>
                  Status: <span className='font-medium'>Your invoice is awaiting payment</span>
                </div>
              </div>
              <div className='ml-auto'>
                <Button size='sm'>Record a payment</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* (Optional) Invoice Items Table - can be added here if needed */}
        {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Service A</TableCell>
                <TableCell>1</TableCell>
                <TableCell>$55.00</TableCell>
                <TableCell>$55.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
      </div>
    </div>
  );
}
