export type ElementType = 'file' | 'invoice' | 'custom';

export interface BaseElement {
  type: ElementType;
  name: string;
  description?: string;
}

export interface FileElement extends BaseElement {
  type: 'file';
  files: Array<{
    name: string;
    type: 'document' | 'image' | 'other';
    size: number;
    comment?: string;
    uploadedAt: string;
    url: string;
  }>;
}

export interface InvoiceElement extends BaseElement {
  type: 'invoice';
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
}

export interface CustomElement extends BaseElement {
  type: 'custom';
  fields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'file';
    required: boolean;
    options?: string[];
  }>;
}

export type Element = FileElement | InvoiceElement | CustomElement;

export interface Module {
  _id: string;
  name: string;
  description: string;
  workspace: string;
  project: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  order: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo: string[];
  isTemplate: boolean;
  elements: Element[];
  createdAt: string;
  updatedAt: string;
}
