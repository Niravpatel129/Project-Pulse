'use client';

import InvoicePreview from '@/components/Main/Invoices/InvoicePreview';
import Invoices from '@/components/Main/Invoices/Invoices';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface InvoiceItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
    _id: string;
    user: {
      name: string;
      email: string;
    };
  } | null;
  project?: {
    _id: string;
    name: string;
    description: string;
  };
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'open';
  dueDate: string;
  notes?: string;
  currency: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  dateSent: string;
  starred: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
}

interface ApiResponse {
  status: string;
  results: number;
  data: Invoice[];
}

export default function InvoicesPage() {
  const isMobile = useIsMobile();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = searchParams.get('inv');

  const {
    data: invoicesData,
    isLoading: isLoadingInvoices,
    error: invoicesError,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await newRequest.get<ApiResponse>('/invoices');
      return response.data.data;
    },
  });

  // Fetch specific invoice if ID is in URL
  const { data: specificInvoice, isLoading: isLoadingSpecificInvoice } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const response = await newRequest.get<{ status: string; data: Invoice }>(
        `/invoices/${invoiceId}`,
      );
      return response.data.data;
    },
    enabled: !!invoiceId,
  });

  useEffect(() => {
    if (specificInvoice) {
      setSelectedInvoice(specificInvoice);
      setShowPreview(true);
    }
  }, [specificInvoice]);

  const handlePreviewClick = (invoice: Invoice | null) => {
    if (invoice) {
      const params = new URLSearchParams(searchParams);
      params.set('inv', invoice._id);
      router.push(`?${params.toString()}`);
      setSelectedInvoice(invoice);
      setShowPreview(true);
    } else {
      const params = new URLSearchParams(searchParams);
      params.delete('inv');
      router.push(`?${params.toString()}`);
      setSelectedInvoice(undefined);
      setShowPreview(false);
    }
  };

  const handleClosePreview = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('inv');
    router.push(`?${params.toString()}`);
    setShowPreview(false);
    setSelectedInvoice(undefined);
  };

  const handleInvoiceUpdate = async (invoiceId: string) => {
    await Promise.all([queryClient.invalidateQueries()]);

    // Force refetch the specific invoice
    const response = await queryClient.fetchQuery({
      queryKey: ['invoice', invoiceId],
      queryFn: async () => {
        const res = await newRequest.get<{ status: string; data: Invoice }>(
          `/invoices/${invoiceId}`,
        );
        return res.data;
      },
    });

    // Update the selected invoice with the new data
    setSelectedInvoice(response.data);
  };

  // Add effect to update selectedInvoice when invoices data changes
  useEffect(() => {
    if (selectedInvoice && invoicesData) {
      const updatedInvoice = invoicesData.find((inv) => {
        return inv._id === selectedInvoice._id;
      });
      if (updatedInvoice) {
        setSelectedInvoice(updatedInvoice);
      }
    }
  }, [invoicesData, selectedInvoice]);

  return (
    <main className='flex-1 w-full overflow-auto bg-background h-screen'>
      <div className='flex h-full'>
        <div className='w-full h-full overflow-auto'>
          <Invoices
            invoices={invoicesData}
            onPreviewClick={handlePreviewClick}
            isPreviewOpen={showPreview}
          />
        </div>
        {isMobile ? (
          <Sheet open={showPreview} onOpenChange={setShowPreview}>
            <SheetContent side='right' className='w-full sm:max-w-lg p-0'>
              <SheetHeader className='sr-only'>
                <SheetTitle>Invoice Preview</SheetTitle>
              </SheetHeader>
              <InvoicePreview
                selectedInvoice={selectedInvoice}
                onClose={handleClosePreview}
                onInvoiceUpdate={handleInvoiceUpdate}
              />
            </SheetContent>
          </Sheet>
        ) : (
          <div className='w-full border-l overflow-hidden'>
            <InvoicePreview
              selectedInvoice={selectedInvoice}
              invoiceId={selectedInvoice?._id}
              onClose={handleClosePreview}
              onInvoiceUpdate={handleInvoiceUpdate}
            />
          </div>
        )}
      </div>
    </main>
  );
}
