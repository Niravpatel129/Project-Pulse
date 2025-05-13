import type { Payment } from '@/types/invoice';
import { newRequest } from '@/utils/newRequest';
import { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await newRequest.get(`/payments/${params.id}`);
    const invoice: Payment = res.data.data;

    return {
      title: `Invoice ${invoice.invoice.invoiceNumber} | ${invoice.invoice.client.user.name}`,
      description: `View invoice details for ${invoice.invoice.client.user.name} - Amount: ${invoice.amount} ${invoice.invoice.currency}`,
      openGraph: {
        title: `Invoice ${invoice.invoice.invoiceNumber}`,
        description: `Invoice for ${invoice.invoice.client.user.name}`,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `Invoice ${invoice.invoice.invoiceNumber}`,
        description: `Invoice for ${invoice.invoice.client.user.name}`,
      },
    };
  } catch (error) {
    return {
      title: 'Invoice Details',
      description: 'View invoice details and payment information',
    };
  }
}

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
