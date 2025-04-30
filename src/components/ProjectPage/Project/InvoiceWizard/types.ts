export interface InvoiceItem {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  status?: string;
  type?: string;
  date?: string;
  createdAt?: string;
  labels?: string[];
  fields?: Record<string, any>;
  attachments?: Array<{
    type: string;
    url: string;
    title: string;
  }>;
  isTask?: boolean;
}
