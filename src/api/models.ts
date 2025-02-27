/**
 * This file contains TypeScript interfaces that correspond to MongoDB collections
 * These interfaces define the shape of data exchanged with the API
 */

// Base model with common fields for all documents
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// File types supported by the system
export type FileType =
  | 'proposal'
  | 'invoice'
  | 'contract'
  | 'questionnaire'
  | 'upload'
  | 'sales_product'
  | 'service'
  | 'file'
  | 'file_item'
  | 'template'
  | 'custom_template_item'
  | 'invoice_item';

// Field types for templates
export type FieldType =
  | 'text'
  | 'number'
  | 'file'
  | 'enum'
  | 'link'
  | 'date'
  | 'price'
  | 'dimension'
  | 'inventory_item';

// ===================
// Template Models
// ===================

export interface TemplateField {
  id: string;
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // For enum type fields
  defaultValue?: string | number;
  description?: string;
  fileTypes?: string[]; // For file type fields (e.g., ['png', 'svg'])
  unit?: string; // For dimension or measurement fields (e.g., 'inches', 'cm')
  formula?: string; // For calculated fields (e.g., price calculation formula)
  inventoryCategory?: string; // For inventory_item fields, can filter by category
}

export interface Template extends BaseModel {
  name: string;
  description?: string;
  icon?: string; // Icon identifier to represent this template
  fields: TemplateField[];
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

export interface FileVersion extends BaseModel {
  versionNumber: number;
  changeDescription: string;
  size: string;
  url: string;
  isCurrent: boolean;
}

export interface TemplateItemVersion extends BaseModel {
  changes: string;
  data: Partial<ProjectFile>; // Snapshot of the template item at this version
}

export interface Attachment extends BaseModel {
  name: string;
  size: string;
  type: string; // file extension or mime type
  url: string;
  thumbnailUrl?: string;
  versions?: FileVersion[];
}

export interface Comment extends BaseModel {
  text: string;
  authorRole: string;
  avatarUrl?: string;
}

export interface ProjectFile extends BaseModel {
  name: string;
  type: FileType;
  size: string;
  status?: 'draft' | 'sent' | 'signed' | 'paid' | 'viewed' | 'awaiting_approval' | 'active';
  attachments: Attachment[];
  comments: Comment[];
  description?: string;
  clientEmail?: string;
  needsApproval?: boolean;
  emailSent?: boolean;
  emailSentDate?: string;
  variation?: string;
  latestVersion?: string;
  products?: Product[]; // Products associated with this file item
  templateId?: string; // Reference to template if this is a custom_template_item
  templateValues?: TemplateFieldValue[]; // Values for template fields if this is a custom_template_item
  isTemplate?: boolean; // Flag to identify if this file is a template itself
  templateItems?: ProjectFile[]; // Template items associated with this file item
  lastModified?: string; // Timestamp of the last modification
  versions?: TemplateItemVersion[]; // Version history for template items
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

export interface Invoice extends BaseModel {
  number: string; // Invoice number (e.g., INV-2023-001)
  date: string;
  dueDate: string;
  projectId?: string; // Optional reference to a project
  clientId: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  notes?: string;
  terms?: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
  paymentMethod?: string;
}

export interface InventoryCategory extends BaseModel {
  name: string;
  description?: string;
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

export interface InventoryItem extends BaseModel {
  name: string;
  sku: string;
  description?: string;
  category: string; // References a category id
  price: number;
  stock: number;
  imageUrl?: string;
  attributes?: Record<string, string | number>; // Custom attributes
  variants?: Variant[]; // Add variants support for items like shirts with sizes
  isComposite?: boolean; // Whether this item is made of other items
  components?: Array<{ itemId: string; quantity: number }>; // For composite items (Bill of Materials)
  productionInfo?: ProductionInfo; // Information related to production of this item
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
  search?: string;
  status?: string;
  type?: string;
  from?: string;
  to?: string;
}

// Common paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
