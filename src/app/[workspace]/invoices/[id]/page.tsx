import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, CreditCard } from 'lucide-react';
import { ClientWorkTab } from './components/ClientWorkTab';
import { InvoiceTab } from './components/InvoiceTab';

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
      <div className='max-w-6xl mx-auto py-10 px-4'>
        <Tabs defaultValue='invoice' className='w-full'>
          <TabsList className='mb-6'>
            <TabsTrigger value='invoice' className='flex items-center gap-2'>
              <CreditCard className='w-4 h-4' />
              Invoice
            </TabsTrigger>
            <TabsTrigger value='client-work' className='flex items-center gap-2'>
              <ClipboardList className='w-4 h-4' />
              Client Work
            </TabsTrigger>
          </TabsList>

          <TabsContent value='invoice'>
            <InvoiceTab invoice={invoice} />
          </TabsContent>

          <TabsContent value='client-work'>
            <ClientWorkTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
