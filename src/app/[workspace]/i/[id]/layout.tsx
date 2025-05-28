import { newRequest } from '@/utils/newRequest';
import { Metadata } from 'next';
import React from 'react';

type Props = {
  params: { id: string; workspace: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await newRequest.get(`/invoices2/${params.id}`);
    const invoice = response.data.data.invoice;

    return {
      title: `${invoice.invoiceTitle || 'Invoice'} - ${invoice.customer?.name || invoice.to}`,
      description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer?.name || invoice.to}`,
      openGraph: {
        title: `${invoice.invoiceTitle || 'Invoice'} - ${invoice.customer?.name || invoice.to}`,
        description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer?.name || invoice.to}`,
        type: 'website',
        images: invoice.logo
          ? [
              {
                url: invoice.logo,
                width: 1200,
                height: 630,
                alt: 'Invoice Logo',
              },
            ]
          : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${invoice.invoiceTitle || 'Invoice'} - ${invoice.customer?.name || invoice.to}`,
        description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer?.name || invoice.to}`,
        images: invoice.logo ? [invoice.logo] : undefined,
      },
    };
  } catch (error) {
    console.log('🚀 error:', error);
    return {
      title: 'Invoice Details',
      description: 'View and manage invoice details',
    };
  }
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return <div className='w-full'>{children}</div>;
}
