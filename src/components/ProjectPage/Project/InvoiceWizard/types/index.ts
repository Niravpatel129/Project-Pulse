import { Client as BaseClient, InvoiceItem } from '@/hooks/useInvoiceWizard';

export type { InvoiceItem };

export interface Client extends BaseClient {
  avatar?: string;
  company?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  _id?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  carrier: string;
  estimatedDays: string;
  price: number;
}
