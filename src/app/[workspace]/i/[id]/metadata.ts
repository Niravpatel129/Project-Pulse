import { newRequest } from '@/utils/newRequest';
import { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await newRequest.get(`/invoices2/${params.id}`);
    const invoice = response.data.data.invoice;

    return {
      title: `Invoice #${invoice.invoiceNumber} - ${invoice.invoiceTitle}`,
      description: `Invoice details for ${invoice.customer?.name || invoice.to}`,
      openGraph: {
        title: `Invoice #${invoice.invoiceNumber} - ${invoice.invoiceTitle}`,
        description: `Invoice details for ${invoice.customer?.name || invoice.to}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Invoice #${invoice.invoiceNumber} - ${invoice.invoiceTitle}`,
        description: `Invoice details for ${invoice.customer?.name || invoice.to}`,
      },
      robots: {
        index: false,
        follow: true,
      },
      viewport: {
        width: 'device-width',
        initialScale: 1,
      },
      themeColor: '#ffffff',
    };
  } catch (error) {
    return {
      title: 'Invoice Details',
      description: 'View and manage your invoice details',
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}
