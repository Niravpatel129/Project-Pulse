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

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
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
  status: 'partially_paid' | 'paid' | 'unpaid';
  dueDate: string;
  notes: string;
  currency: string;
  deliveryOptions: string;
  workspace: string;
  createdBy: string;
  requireDeposit: boolean;
  depositPercentage: number;
  teamNotes: string;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  dateSent: string;
  paymentIntentId: string;
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
