export type ElementType = 'file' | 'invoice' | 'custom';

export interface BaseElement {
  type: ElementType;
  name: string;
  description?: string;
  version: number;
  moduleId: string;
  _id: string;
  createdAt: string;
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
  elementType: string;
  uploadedAt: string;
  files: FileData[];
}

export interface FileData {
  name: string;
  originalName?: string;
  size: number;
  type: string;
  mimeType?: string;
  url: string;
  path?: string;
  uploadedAt: string;
}

export interface FileElement extends BaseElement {
  type: 'file';
  elementType: string;
  uploadedAt: string;
  files: FileData[];
}

export interface InvoiceElement extends BaseElement {
  type: 'invoice';
  status: string;
  clientName: string;
  clientEmail: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface CustomElement extends BaseElement {
  type: 'custom';
  content: string;
}

export type Element = BaseElement | FileElement | InvoiceElement | CustomElement;

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
  type: 'file' | 'template' | 'figma';
  createdAt: string;
  updatedAt: string;
  version: {
    current: number;
    total: number;
  };
  approvalStatus: 'not_requested' | 'pending' | 'approved' | 'rejected';
  approvedBy: {
    _id: string;
    name: string;
    email: string;
    time: string;
  };
  fileDetails: {
    size: number;
    type: string;
    url: string;
    previewUrl?: string;
  };
  templateDetails: {
    sections: {
      title: string;
      questions: {
        question: string;
        answer: string;
      }[];
    }[];
  };
  content?: {
    figmaUrl?: string;
    thumbnailUrl?: string;
    fileId?: {
      downloadURL: string;
      contentType: string;
    };
  };
}
