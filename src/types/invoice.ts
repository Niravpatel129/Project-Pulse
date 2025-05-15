interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface Contact {
  firstName: string;
  lastName: string;
}

interface User {
  name: string;
  email: string;
}

interface Client {
  deletedAt: string | null;
  _id: string;
  user: User;
  workspace: string;
  phone: string;
  address: Address;
  shippingAddress: Address;
  contact: Contact;
  taxId: string;
  accountNumber: string;
  fax: string;
  mobile: string;
  tollFree: string;
  website: string;
  internalNotes: string;
  customFields: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface InvoiceItem {
  name: string;
  description: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  taxName: string;
  _id: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: {
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
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
    discount: number;
    tax: number;
    taxName: string;
    _id: string;
  }>;
  selectedItems: any[];
  discount: number;
  discountAmount: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  taxAmount: number;
  taxId: string;
  showTaxId: boolean;
  shippingTotal: number;
  total: number;
  status: string;
  dueDate: string;
  notes: string;
  currency: string;
  deliveryOptions: string;
  workspace: string;
  createdBy: {
    _id: string;
    name: string;
  };
  requireDeposit: boolean;
  depositPercentage: number;
  teamNotes: string;
  createdAt: string;
  updatedAt: string;
  paymentIntentId?: string;
  paidAt?: string;
  starred?: boolean;
  __v?: number;
  dateSent?: string;
}

interface Payment {
  _id: string;
  invoice: Invoice;
  amount: number;
  date: string;
  method: string;
  memo: string;
  workspace: string;
  createdBy: string;
  paymentNumber: number;
  remainingBalance: number;
  status: 'completed' | 'pending' | 'failed';
  type: string;
  appliedTo: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type { Address, Client, Contact, Invoice, InvoiceItem, Payment, User };
