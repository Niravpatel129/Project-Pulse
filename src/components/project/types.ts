export type Item = {
  id: string;
  name: string;
  description: string;
  quantity: string;
  price: string;
  taxRate?: number;
  taxName?: string;
  discount?: number;
};

export type ExtendedItem = Item;

export type Client = {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  contact: {
    firstName: string;
    lastName: string;
  };
  taxId: string;
  accountNumber: string;
  fax: string;
  mobile: string;
  tollFree: string;
  website: string;
  internalNotes: string;
  customFields: Record<string, any>;
};

export type AIItem = Item & {
  type: string;
  reasoning: string;
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
  teamNotesAttachments?: Array<{
    id: string;
    name: string;
    url: string;
    size?: string;
    type?: string;
  }>;
};
