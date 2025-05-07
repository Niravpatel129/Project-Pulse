export type Item = {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  currency?: string;
  taxRate?: number;
  taxable?: boolean;
  discount?: number;
  taxName?: string;
};

export type ExtendedItem = Item;

export type Client = {
  id: string;
  name: string;
  email: string;
  address?: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  shippingAddress?: {
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contact?: {
    firstName?: string;
    lastName?: string;
  };
  phone?: string;
  taxId?: string;
  accountNumber?: string;
  fax?: string;
  mobile?: string;
  tollFree?: string;
  website?: string;
  internalNotes?: string;
  customFields?: Record<string, string>;
};

export type AIItem = Item & {
  type: string;
  reasoning: string;
  currency?: string;
};

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'voice';
  url?: string;
  size?: number;
  duration?: number;
  mimeType?: string;
}

export type NotificationType = 'success' | 'error' | 'info';

export type Notification = {
  show: boolean;
  message: string;
  type: NotificationType;
};

export type Section = 'items' | 'client' | 'invoice';

export type InvoiceSettings = {
  requireDeposit: boolean;
  depositPercentage: number;
  defaultTaxRate: number;
  taxId?: string;
  paymentTerms?: string;
  invoiceNotes?: string;
  teamNotes?: string;
  allowDiscount: boolean;
  defaultDiscountRate?: number;
};
