export interface Client {
  _id: string;
  name: string;
  email: string;
  address?: string;
}

export interface CreatedBy {
  _id: string;
  name: string;
}

export interface InvoiceItem {
  _id: string;
  name: string;
  price: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client;
  project?: string;
  items?: InvoiceItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: string;
  dueDate: string;
  notes?: string;
  paymentTerms?: string;
  currency: string;
  deliveryMethod?: string;
  workspace?: string;
  createdBy: string | CreatedBy;
  createdAt: string;
  updatedAt?: string;
}
