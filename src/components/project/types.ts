export type Item = {
  id: string;
  name: string;
  description: string;
  quantity: string;
  price: string;
  currency?: string;
  taxRate?: number;
  taxName?: string;
  taxable?: boolean;
  discount?: number;
};

export type ExtendedItem = Item;

export type Client = {
  _id: string;
  user: {
    name: string;
    email: string;
  };
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
  allowDiscount: boolean;
  defaultDiscountRate: number;
  invoiceNotes?: string;
  teamNotes?: string;
};
