'use client';

import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

interface ClientAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface Client {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  phone: string;
  address: ClientAddress;
  shippingAddress: ClientAddress;
  contact: {
    firstName: string;
    lastName: string;
  };
  taxId: string;
  website: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  taxName: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'unpaid' | 'open';
  dueDate: string;
  notes: string;
  currency: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  remainingBalance?: number;
  totalPaid?: number;
  payments?: Array<{
    _id: string;
    amount: number;
    date: string;
    method: string;
    memo?: string;
    status?: string;
  }>;
  businessInfo?: {
    name: string;
    address: string;
    taxId: string;
    showTaxId: boolean;
    logo: string | null;
    currency: string;
  };
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const { data: invoiceSettings } = useInvoiceSettings();

  const { data: invoice } = useQuery<Invoice>({
    queryKey: ['invoice', params.id],
    queryFn: () => {
      return newRequest.get(`/invoices2/${params.id}`);
    },
  });

  if (!invoice) {
    return null;
  }

  return children;
}
