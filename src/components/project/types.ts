export type Item = {
  id: string;
  name: string;
  description: string;
  quantity: string;
  price: string;
  currency?: string;
  tax?: number;
  taxRate?: number;
  taxable?: boolean;
  discount?: number;
  taxName?: string;
};

export type ExtendedItem = Item;

export interface Client {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  workspace: string;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  contact?: {
    firstName?: string;
    lastName?: string;
  };
  taxId?: string;
  accountNumber?: string;
  fax?: string;
  mobile?: string;
  tollFree?: string;
  website?: string;
  internalNotes?: string;
  customFields?: Record<string, any>;
}

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
