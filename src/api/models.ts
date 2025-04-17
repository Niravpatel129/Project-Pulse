/**
 * This file contains TypeScript interfaces that correspond to MongoDB collections
 * These interfaces define the shape of data exchanged with the API
 */

// Base model with common fields for all documents
export interface BaseModel {
  _id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Project file types
 */
export type FileType =
  | 'logo'
  | 'banner'
  | 'brochure'
  | 'brochure-cover'
  | 'brochure-inner'
  | 'flyer'
  | 'business-card'
  | 'website'
  | 'social-media'
  | 'email'
  | 'video'
  | 'proposal'
  | 'invoice'
  | 'contract'
  | 'questionnaire'
  | 'other';

/**
 * Project file status
 */
export type FileStatus =
  | 'draft'
  | 'in-progress'
  | 'pending-review'
  | 'review-requested'
  | 'approved'
  | 'completed'
  | 'sent'
  | 'signed'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'archived'
  | 'rejected'
  | 'active'
  | 'viewed'
  | 'awaiting_approval';

// Field types for templates
export type FieldType =
  | 'text'
  | 'longtext'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'file'
  | 'relation'
  | 'files';

// ===================
// Template Models
// ===================

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  icon?: string;
  description?: string;
  options?: string[];
  multiple?: boolean;
  relationType?: 'inventory' | 'customers' | 'orders';
  defaultValue?: string | number;
  fieldSettings?: {
    multipleFiles?: boolean;
    minLength?: number;
    maxLength?: number;
    lookupFields?: string[];
    pattern?: string;
    maxSize?: number;
    minItems?: number;
    maxItems?: number;
    itemFields?: TemplateField[];
  };
  linkedToInventory?: boolean;
}

export interface Template extends BaseModel {
  name: string;
  description?: string;
  icon?: string; // Icon identifier to represent this template
  fields: TemplateField[];
  category?: string; // Category to group templates
  workspace?: string;
  __v?: number;
}

export interface TemplateFieldValue {
  fieldId: string;
  value: string | number | null;
  fileUrl?: string; // For file type fields
  inventoryItemId?: string; // For inventory_item fields, references the item in inventory
  quantity?: number; // Quantity for inventory items, defaults to 1
}

// ===================
// File Models
// ===================

/**
 * File version for an attachment
 */
export interface FileVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl: string;
}

/**
 * Attachment model
 */
export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl: string;
  versions: FileVersion[];
}

/**
 * Comment model
 */
export interface Comment {
  id: string;
  text: string;
  author: string;
  authorName: string;
  createdAt: string;
}

/**
 * Template item version
 */
export interface TemplateItemVersion {
  id: string;
  templateItemId: string;
  versionNumber: number;
  name: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  attachmentId: string;
}

/**
 * Project file model
 */
export interface ProjectFile {
  id: string;
  name: string;
  description?: string;
  type: FileType;
  status: FileStatus;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  clientId?: string;
  clientName?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments: Attachment[];
  comments: Comment[];
  templateId?: string;
  templateItems?: Partial<ProjectFile>[];
}

/**
 * Template model
 */
export interface Template extends BaseModel {
  name: string;
  description?: string;
  icon?: string; // Icon identifier to represent this template
  fields: TemplateField[];
}

// ===================
// Product & Inventory Models
// ===================

export interface Product extends BaseModel {
  name: string;
  price: string;
  description?: string;
  imageUrl?: string;
  variations?: string[];
  sku?: string;
  category?: string;
  cost?: number; // Cost price (for profit calculations)
  taxRate?: number; // Default tax rate for this product
  discountable?: boolean; // Whether this product can be discounted
  unit?: string; // Unit of measurement (each, hour, etc.)
}

export interface InvoiceItem extends BaseModel {
  productId?: string; // Reference to a product
  inventoryItemId?: string; // Reference to inventory item
  templateItemId?: string; // Reference to a template item
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number; // Discount percentage
  taxRate?: number;
  total: number; // Calculated total
}

/**
 * Invoice model
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
    total: number;
    projectFileId?: string;
  }>;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  paymentDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Inventory category model
 */
export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Variant extends BaseModel {
  name: string; // e.g., "Small", "Medium", "Large"
  sku: string; // Variant-specific SKU
  stock: number;
  price?: number; // Variant-specific price (optional)
  attributes?: Record<string, string | number>; // Variant-specific attributes
}

export interface ProductionInfo {
  timeRequired: number; // Time in minutes
  laborCost: number;
  materialCost: number;
  setupTime: number;
  machineId?: string; // Which machine/equipment is needed
  notes?: string;
}

/**
 * Inventory item model
 */
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  sku: string;
  categoryId?: string;
  categoryName?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  unit?: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// ===================
// Project Models
// ===================

export interface Project extends BaseModel {
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  clientId: string;
  clientName: string;
  clientEmail: string;
  startDate: string;
  dueDate?: string;
  completedDate?: string;
  files: ProjectFile[];
}

// ===================
// Client Models
// ===================

export interface Client extends BaseModel {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  notes?: string;
  status: 'active' | 'inactive';
}

// ===================
// API Request/Response Models
// ===================

// Common request parameters for list endpoints
export interface ListRequestParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string | Record<string, string>;
  status?: string;
  type?: string;
  from?: string;
  to?: string;
  filter?: Record<string, string | number | boolean | string[]>;
  fields?: string[];
  include?: string[];
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | Record<string, string | number | boolean | string[]>
    | undefined;
}

// Common paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
