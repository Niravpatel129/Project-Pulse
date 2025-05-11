import { newRequest } from '@/utils/newRequest';
import { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata(
  { params }: { params: { id: string; workspace: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  try {
    // Fetch invoice data
    const response = await newRequest.get(`/invoices/${params.id}/public`, {
      headers: {
        workspace: params.workspace,
      },
    });
    const invoice = response.data.data;

    // Get parent metadata
    const previousMetadata = await parent;

    return {
      title: `Invoice #${invoice.invoiceNumber}`,
      description: `Invoice for ${invoice.client.user.name} - ${
        invoice.currency
      }${invoice.total.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      applicationName: 'Pulse',
      authors: [{ name: invoice.createdBy.name }],
      keywords: ['invoice', 'payment', 'billing', 'finance'],
      openGraph: {
        title: `Invoice #${invoice.invoiceNumber}`,
        description: `Invoice for ${invoice.client.user.name} - ${
          invoice.currency
        }${invoice.total.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        type: 'website',
        siteName: 'Pulse',
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
        title: `Invoice #${invoice.invoiceNumber}`,
        description: `Invoice for ${invoice.client.user.name} - ${
          invoice.currency
        }${invoice.total.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        images: ['/og-image-invoice.jpg'],
      },
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: `https://pulse-app.com/${params.workspace}/invoice/${params.id}`,
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
