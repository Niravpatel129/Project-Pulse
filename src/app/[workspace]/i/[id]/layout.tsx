import { newRequest } from '@/utils/newRequest';
import { Metadata } from 'next';
import React from 'react';

type Props = {
  params: {
    id: string;
    workspace: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

type LayoutProps = {
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; workspace: string }>;
}): Promise<Metadata> {
  const { id, workspace } = await params;

  try {
    const response = await newRequest.get(`/invoices2/${id}`);
    const invoice = response.data.data.invoice;

    const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og?title=${encodeURIComponent(
      invoice.invoiceTitle || 'Invoice',
    )}&invoiceNumber=${encodeURIComponent(invoice.invoiceNumber)}&customerName=${encodeURIComponent(
      invoice.customer?.name || invoice.to,
    )}`;

    return {
      title: `${invoice.invoiceTitle || 'Invoice'} - ${invoice.customer?.name || invoice.to}`,
      description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer?.name || invoice.to}`,
      openGraph: {
        title: `Invoice ${invoice.invoiceNumber} | ${invoice.invoiceTitle || 'Invoice'} - ${
          invoice.customer?.name || invoice.to
        }`,
        description: `View invoice details for ${
          invoice.customer?.name || invoice.to
        }. Invoice number: ${invoice.invoiceNumber}`,
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `Invoice ${invoice.invoiceNumber} for ${invoice.customer?.name || invoice.to}`,
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
