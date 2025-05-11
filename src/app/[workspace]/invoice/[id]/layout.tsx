import { newRequest } from '@/utils/newRequest';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { id: string; workspace: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id, workspace } = params;

  try {
    // Fetch invoice data
    const response = await newRequest.get(`/invoices/${id}/public`);
    const invoice = response.data.data;

    const title = `Invoice #${invoice.invoiceNumber}`;
    const description = `Invoice for ${invoice.client.user.name} - ${
      invoice.currency
    }${invoice.total.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    return {
      title,
      description,
      applicationName: 'Invoice',
      authors: [{ name: invoice.createdBy.name }],
      keywords: ['invoice', 'payment', 'billing', 'finance'],
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: 'Invoice',
        locale: 'en_US',
        images: [
          {
            url: '/og-image-invoice.jpg',
            width: 1200,
            height: 630,
            alt: `Invoice #${invoice.invoiceNumber}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image-invoice.jpg'],
      },
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: `https://pulse-app.com/${workspace}/invoice/${id}`,
      },
      other: {
        'invoice-status': invoice.status,
        'invoice-due-date': invoice.dueDate,
        'invoice-currency': invoice.currency,
      },
    };
  } catch (error) {
    // Fallback metadata if invoice fetch fails
    return {
      title: 'Invoice',
      description: 'View and manage your invoice details',
    };
  }
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return <div className='min-h-screen bg-[#141414] antialiased w-full'>{children}</div>;
}
