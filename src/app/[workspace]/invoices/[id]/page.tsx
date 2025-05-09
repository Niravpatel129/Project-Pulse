'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ClipboardList, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ClientWorkTab } from './components/ClientWorkTab';
import { Invoice } from './components/Invoice';
import { InvoiceTab } from './components/InvoiceTab';

type InvoiceStatus = 'paid' | 'draft' | 'sent' | 'overdue' | 'cancelled';

interface ClientAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface ClientContact {
  firstName: string;
  lastName: string;
}

interface ClientUser {
  name: string;
  email: string;
}

interface Client {
  _id: string;
  user: ClientUser;
  workspace: string;
  phone: string;
  address: ClientAddress;
  shippingAddress: ClientAddress;
  contact: ClientContact;
  taxId: string;
  accountNumber: string;
  fax: string;
  mobile: string;
  tollFree: string;
  website: string;
  internalNotes: string;
  customFields: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  _id: string;
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
  discount: number;
  tax: number;
}

interface ApiResponse {
  status: string;
  data: {
    _id: string;
    invoiceNumber: string;
    client: Client | null;
    items: InvoiceItem[];
    discount: number;
    discountAmount: number;
    subtotal: number;
    tax: number;
    taxRate: number;
    taxAmount: number;
    taxId: string;
    showTaxId: boolean;
    shippingTotal: number;
    total: number;
    status: InvoiceStatus;
    dueDate: string;
    notes: string;
    currency: string;
    deliveryOptions: string;
    workspace: string;
    createdBy: {
      _id: string;
      name: string;
    };
    requireDeposit: boolean;
    depositPercentage: number;
    teamNotes: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function Page() {
  const params = useParams();
  const invoiceId = params.id as string;

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await newRequest.get<ApiResponse>(`/invoices/${invoiceId}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className='bg-gray-50 min-h-screen'>
        <div className='max-w-[1200px] mx-auto py-10 px-4'>
          <div className='flex items-center gap-2 mb-6'>
            <Link href='/invoices' className='text-gray-400 hover:text-gray-600'>
              <ChevronLeft className='w-5 h-5' />
            </Link>
            <Skeleton className='h-6 w-32' />
          </div>
          <div className='space-y-8'>
            <Skeleton className='h-[400px] w-full' />
            <Skeleton className='h-[600px] w-full' />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-gray-50 min-h-screen'>
        <div className='max-w-[1200px] mx-auto py-10 px-4'>
          <div className='flex items-center gap-2 mb-6'>
            <Link href='/' className='text-gray-400 hover:text-gray-600'>
              <ChevronLeft className='w-5 h-5' />
            </Link>
            <span className='text-red-500'>Error loading invoice</span>
          </div>
        </div>
      </div>
    );
  }

  // Transform API response to match component expectations
  const invoice = {
    _id: response.data._id,
    id: response.data._id,
    invoiceNumber: response.data.invoiceNumber,
    clientName: response.data.client?.user.name || 'Client Name Pending',
    clientId: response.data.client?._id || 'pending',
    status: response.data.status as InvoiceStatus,
    items: response.data.items.map((item) => {
      return {
        id: item._id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        discount: item.discount,
        tax: item.tax,
      };
    }),
    subtotal: response.data.subtotal,
    discount: response.data.discount,
    tax: response.data.tax,
    total: response.data.total,
    dueDate: response.data.dueDate,
    issueDate: response.data.createdAt,
    createdAt: response.data.createdAt,
    updatedAt: response.data.updatedAt,
    notes: response.data.notes || 'No notes provided',
    terms: 'Payment due within 30 days',
    paymentMethod: 'Pending',
    paymentDate: response.data.status === 'paid' ? response.data.updatedAt : null,
    currency: response.data.currency,
    createdBy: response.data.createdBy.name,
    requireDeposit: response.data.requireDeposit,
    depositPercentage: response.data.depositPercentage,
    teamNotes: response.data.teamNotes || 'No team notes provided',
    client: response.data.client
      ? {
          name: response.data.client.user.name,
          email: response.data.client.user.email,
          phone: response.data.client.phone,
          address: response.data.client.address,
          shippingAddress: response.data.client.shippingAddress,
          taxId: response.data.client.taxId,
          website: response.data.client.website,
        }
      : null,
  };

  return (
    <div className='bg-gray-50 min-h-screen'>
      <div className='max-w-[1200px] mx-auto py-10 px-4'>
        <div className='flex items-center gap-2 mb-6'>
          <Link href='/' className='text-gray-400 hover:text-gray-600'>
            <ChevronLeft className='w-5 h-5' />
          </Link>
          <span className='text-gray-900 font-medium'>Invoice #{invoice.invoiceNumber}</span>
          {invoice.depositPercentage && (
            <div className='inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium'>
              <span className='mr-1'>💰</span>
              {invoice.depositPercentage}% Deposit Required
            </div>
          )}
        </div>
        <Tabs defaultValue='invoice' className='w-full'>
          <TabsList>
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
            <div className='space-y-8'>
              <InvoiceTab invoice={invoice} />
              <div className='bg-white rounded-xl shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-20'>Invoice Preview</h2>
                <div className='flex justify-center'>
                  <Invoice invoice={invoice} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='client-work'>
            <ClientWorkTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
