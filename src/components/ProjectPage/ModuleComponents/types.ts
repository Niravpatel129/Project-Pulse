export type ElementType = 'file' | 'invoice' | 'custom';

export interface BaseElement {
  type: ElementType;
  name: string;
  description?: string;
}

export interface FileElement extends BaseElement {
  type: 'file';
  elementType: string;
  uploadedAt: string;
  createdAt: string;
  version: number;
  moduleId: string;
  _id: string;
  files: any;
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export type Element = FileElement;

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
