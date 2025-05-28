import { newRequest } from '@/utils/newRequest';
import { Metadata } from 'next';
import React from 'react';

type MetadataProps = {
  params: {
    id: string;
    workspace: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

type LayoutProps = {
  children: React.ReactNode;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const id = params.id;

  try {
    const response = await newRequest.get(`/invoices2/${id}`);
    const invoice = response.data.data.invoice;

    const ogImageUrl = `/api/og?title=${encodeURIComponent(
      invoice.invoiceTitle || 'Invoice',
    )}&invoiceNumber=${encodeURIComponent(invoice.invoiceNumber)}&customerName=${encodeURIComponent(
      invoice.customer?.name || invoice.to,
    )}`;

    return {
      title: `${invoice.invoiceTitle || 'Invoice'} - ${invoice.customer?.name || invoice.to}`,
      description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer?.name || invoice.to}`,
      openGraph: {
        title: `${invoice.invoiceTitle || 'Invoice'} - ${invoice.customer?.name || invoice.to}`,
        description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer?.name || invoice.to}`,
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: 'Invoice Preview',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${invoice.invoiceTitle || 'Invoice'} - ${invoice.customer?.name || invoice.to}`,
        description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer?.name || invoice.to}`,
        images: [ogImageUrl],
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

export default function InvoiceLayout({ children }: LayoutProps) {
  return <div className='w-full'>{children}</div>;
}
