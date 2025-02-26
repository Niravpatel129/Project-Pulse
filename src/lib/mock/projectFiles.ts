// Mock data for project files

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
  | 'custom_template_item';

// Define field types for custom templates
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

// Interface for field definition in a template
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

// Interface for template definition
export interface Template {
  id: string;
  name: string;
  description?: string;
  icon?: string; // Icon identifier to represent this template
  createdBy: string;
  dateCreated: string;
  fields: TemplateField[];
}

// Interface for a field value in a template item
export interface TemplateFieldValue {
  fieldId: string;
  value: string | number | null;
  fileUrl?: string; // For file type fields
  inventoryItemId?: string; // For inventory_item fields, references the item in inventory
}

export interface FileVersion {
  id: string;
  versionNumber: number;
  versionId: string;
  dateCreated: string;
  createdBy: string;
  changeDescription: string;
  size: string;
  url: string;
  isCurrent: boolean;
}

// Define a version type specifically for template items
export interface TemplateItemVersion {
  id: string;
  date: string;
  createdBy: string;
  changes: string;
  data: Partial<ProjectFile>; // Snapshot of the template item at this version
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string; // file extension or mime type
  url: string;
  thumbnailUrl?: string;
  versions?: FileVersion[]; // Add versions to attachments
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorRole: string;
  timestamp: string;
  avatarUrl?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  dateUploaded: string;
  size: string;
  status?: 'draft' | 'sent' | 'signed' | 'paid' | 'viewed' | 'awaiting_approval' | 'active';
  uploadedBy: string;
  attachments: Attachment[];
  comments: Comment[];
  description?: string;
  clientEmail?: string;
  needsApproval?: boolean;
  emailSent?: boolean;
  emailSentDate?: string;
  variation?: string; // Renamed from branch
  latestVersion?: string; // Renamed from latestCommit
  products?: Product[]; // Products associated with this file item
  templateId?: string; // Reference to template if this is a custom_template_item
  templateValues?: TemplateFieldValue[]; // Values for template fields if this is a custom_template_item
  isTemplate?: boolean; // Flag to identify if this file is a template itself
  templateItems?: ProjectFile[]; // Template items associated with this file item
  lastModified?: string; // Timestamp of the last modification
  versions?: TemplateItemVersion[]; // Version history for template items
}

export interface Product {
  id: string;
  name: string;
  price: string;
  description?: string;
  imageUrl?: string;
  variations?: string[];
  sku?: string;
  category?: string;
}

export const mockProjectFiles: ProjectFile[] = [
  {
    id: '1',
    name: 'Wedding Photography Proposal',
    type: 'proposal',
    dateUploaded: '2023-11-15',
    size: '2.4 MB',
    status: 'sent',
    uploadedBy: 'Hitarth',
    variation: 'Main',
    latestVersion: 'v2',
    attachments: [
      {
        id: 'a1',
        name: 'proposal.pdf',
        size: '2.4 MB',
        type: 'pdf',
        url: '#',
        versions: [
          {
            id: 'v1',
            versionNumber: 1,
            versionId: 'a1b2c3d4',
            dateCreated: '2023-11-15T10:30:00Z',
            createdBy: 'Hitarth',
            changeDescription: 'Initial proposal draft',
            size: '2.1 MB',
            url: '#',
            isCurrent: false,
          },
          {
            id: 'v2',
            versionNumber: 2,
            versionId: 'e5f6g7h8',
            dateCreated: '2023-11-15T14:45:00Z',
            createdBy: 'Hitarth',
            changeDescription: 'Updated pricing details',
            size: '2.4 MB',
            url: '#',
            isCurrent: true,
          },
        ],
      },
    ],
    comments: [
      {
        id: 'c1',
        text: 'This looks great! Can we add more details about the engagement shoot?',
        author: 'Shannon',
        authorRole: 'Client',
        timestamp: '2023-11-16T14:30:00Z',
      },
    ],
    clientEmail: 'shannon@example.com',
    emailSent: true,
    emailSentDate: '2023-11-15',
  },
  {
    id: '2',
    name: 'Photography Contract',
    type: 'contract',
    dateUploaded: '2023-11-18',
    size: '1.8 MB',
    status: 'signed',
    uploadedBy: 'Hitarth',
    variation: 'Main',
    latestVersion: 'v1',
    attachments: [
      {
        id: 'a2',
        name: 'contract.pdf',
        size: '1.8 MB',
        type: 'pdf',
        url: '#',
        versions: [
          {
            id: 'v1',
            versionNumber: 1,
            versionId: 'i9j0k1l2',
            dateCreated: '2023-11-18T09:15:00Z',
            createdBy: 'Hitarth',
            changeDescription: 'Initial contract draft',
            size: '1.8 MB',
            url: '#',
            isCurrent: true,
          },
        ],
      },
    ],
    comments: [],
    clientEmail: 'shannon@example.com',
    emailSent: true,
    emailSentDate: '2023-11-18',
  },
  {
    id: '3',
    name: 'Initial Payment Invoice',
    type: 'invoice',
    dateUploaded: '2023-11-20',
    size: '0.5 MB',
    status: 'paid',
    uploadedBy: 'Hitarth',
    attachments: [
      {
        id: 'a3',
        name: 'invoice.pdf',
        size: '0.5 MB',
        type: 'pdf',
        url: '#',
      },
    ],
    comments: [],
    clientEmail: 'shannon@example.com',
    emailSent: true,
    emailSentDate: '2023-11-20',
  },
  {
    id: '4',
    name: 'Wedding Details Questionnaire',
    type: 'questionnaire',
    dateUploaded: '2023-11-21',
    size: '0.8 MB',
    status: 'viewed',
    uploadedBy: 'Sam',
    attachments: [
      {
        id: 'a4',
        name: 'questionnaire.docx',
        size: '0.8 MB',
        type: 'docx',
        url: '#',
      },
    ],
    comments: [],
    clientEmail: 'shannon@example.com',
    emailSent: true,
    emailSentDate: '2023-11-21',
  },
  {
    id: '5',
    name: 'Venue Photos',
    type: 'upload',
    dateUploaded: '2023-11-25',
    size: '15.2 MB',
    uploadedBy: 'Sam',
    attachments: [
      {
        id: 'a5-1',
        name: 'venue-front.jpg',
        size: '4.7 MB',
        type: 'jpg',
        url: '#',
        thumbnailUrl: '/placeholders/venue-thumb-1.jpg',
      },
      {
        id: 'a5-2',
        name: 'venue-garden.jpg',
        size: '5.1 MB',
        type: 'jpg',
        url: '#',
        thumbnailUrl: '/placeholders/venue-thumb-2.jpg',
      },
      {
        id: 'a5-3',
        name: 'venue-hall.jpg',
        size: '5.4 MB',
        type: 'jpg',
        url: '#',
        thumbnailUrl: '/placeholders/venue-thumb-3.jpg',
      },
    ],
    comments: [
      {
        id: 'c2',
        text: 'These are beautiful! Can you get some shots of the back garden area too?',
        author: 'Shannon',
        authorRole: 'Client',
        timestamp: '2023-11-26T10:15:00Z',
      },
      {
        id: 'c3',
        text: "Yes, I'll schedule another visit next week to capture those areas.",
        author: 'Sam',
        authorRole: 'Photographer',
        timestamp: '2023-11-26T11:30:00Z',
      },
    ],
    description: 'Photos from the venue scouting visit on November 25th.',
    clientEmail: 'shannon@example.com',
  },
  {
    id: 'template1',
    name: 'Clothing Print Template',
    type: 'template',
    dateUploaded: '2023-12-01',
    size: '1.5 KB',
    uploadedBy: 'Hitarth',
    isTemplate: true,
    attachments: [],
    comments: [],
    description:
      'Template for clothing print specifications including image, print location, type, and dimensions.',
  },
];

// Add some mock products
export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Wedding Photo Package - Basic',
    price: '1299.99',
    description: 'Coverage of ceremony and reception, 100 digital photos, 1 photographer',
    sku: 'WED-BASIC-001',
  },
  {
    id: 'p2',
    name: 'Wedding Photo Package - Premium',
    price: '2499.99',
    description: 'Full day coverage, 300 digital photos, 2 photographers, photo album',
    sku: 'WED-PREM-001',
  },
  {
    id: 'p3',
    name: 'T-shirt Design - Standard',
    price: '24.99',
    description: 'Custom designed t-shirt with your logo or design',
    variations: ['S', 'M', 'L', 'XL'],
    sku: 'TSHIRT-STD-001',
  },
  {
    id: 'p4',
    name: 'Logo Design Service',
    price: '499.99',
    description: 'Professional logo design with unlimited revisions',
    sku: 'DESIGN-LOGO-001',
  },
];

// Mock templates
export const mockTemplates: Template[] = [
  {
    id: 'template-clothing-print',
    name: 'Clothing Print',
    description: 'Template for creating clothing print designs',
    icon: 'shirt',
    createdBy: 'Hitarth',
    dateCreated: '2023-12-01',
    fields: [
      {
        id: 'name',
        name: 'Design Name',
        type: 'text',
        required: true,
        description: 'The name of the design',
      },
      {
        id: 'description',
        name: 'Description',
        type: 'text',
        required: false,
        description: 'Description of the design',
      },
      {
        id: 'printSize',
        name: 'Print Size',
        type: 'dimension',
        required: true,
        description: 'The dimensions of the print',
        unit: 'inches',
      },
      {
        id: 'designFile',
        name: 'Design File',
        type: 'file',
        required: true,
        description: 'The design file',
        fileTypes: ['png', 'jpg', 'jpeg', 'ai', 'pdf'],
      },
      {
        id: 'colors',
        name: 'Colors',
        type: 'enum',
        required: true,
        description: 'Color scheme of the design',
        options: [
          'CMYK Full Color',
          'Single Color',
          'Two Colors',
          'Three Colors',
          'Four Colors',
          'Custom',
        ],
      },
      {
        id: 'price',
        name: 'Price',
        type: 'price',
        required: false,
        description: 'Price for the design',
      },
    ],
  },
  {
    id: 'template-invoice',
    name: 'Invoice',
    description: 'Template for tracking invoices',
    icon: 'file',
    createdBy: 'Nirav',
    dateCreated: '2023-12-15',
    fields: [
      {
        id: 'invoiceNumber',
        name: 'Invoice Number',
        type: 'text',
        required: true,
        description: 'The invoice number',
      },
      {
        id: 'client',
        name: 'Client',
        type: 'text',
        required: true,
        description: 'Client name',
      },
      {
        id: 'amount',
        name: 'Amount',
        type: 'price',
        required: true,
        description: 'Invoice amount',
      },
      {
        id: 'date',
        name: 'Issue Date',
        type: 'date',
        required: true,
        description: 'Date the invoice was issued',
      },
      {
        id: 'dueDate',
        name: 'Due Date',
        type: 'date',
        required: true,
        description: 'Date the invoice is due',
      },
      {
        id: 'status',
        name: 'Status',
        type: 'enum',
        required: true,
        description: 'Current status of the invoice',
        options: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
      },
      {
        id: 'notes',
        name: 'Notes',
        type: 'text',
        required: false,
        description: 'Additional notes or terms',
      },
      {
        id: 'attachment',
        name: 'Invoice PDF',
        type: 'file',
        required: false,
        description: 'PDF version of the invoice',
        fileTypes: ['pdf'],
      },
    ],
  },
  {
    id: 'template-product-entry',
    name: 'Product Entry',
    description: 'Template for product information with inventory reference',
    icon: 'file',
    createdBy: 'Sarah',
    dateCreated: '2024-01-10',
    fields: [
      {
        id: 'productName',
        name: 'Product Name',
        type: 'text',
        required: true,
        description: 'Name of the product',
      },
      {
        id: 'inventoryItem',
        name: 'Inventory Item',
        type: 'inventory_item',
        required: true,
        description: 'Reference to inventory item',
      },
      {
        id: 'quantity',
        name: 'Quantity',
        type: 'number',
        required: true,
        description: 'Quantity to order',
      },
      {
        id: 'notes',
        name: 'Notes',
        type: 'text',
        required: false,
        description: 'Additional notes or specifications',
      },
      {
        id: 'expectedDelivery',
        name: 'Expected Delivery',
        type: 'date',
        required: false,
        description: 'Expected delivery date',
      },
    ],
  },
];

// Add a template item example
export const mockTemplateItems: ProjectFile[] = [
  {
    id: 'ti1',
    name: 'Summer Collection - Front Logo',
    type: 'custom_template_item',
    dateUploaded: '2023-12-05',
    size: '3.2 MB',
    status: 'active',
    uploadedBy: 'Sam',
    templateId: 't1', // Reference to Clothing Print template
    templateValues: [
      { fieldId: 'f1', value: null, fileUrl: '/placeholders/tshirt-print.png' },
      { fieldId: 'f2', value: 'front' },
      { fieldId: 'f3', value: 'DTG' },
      { fieldId: 'f4', value: 'X' },
      { fieldId: 'f5', value: '5 inches' },
      { fieldId: 'f6', value: 'https://figma.com/file/example' },
      { fieldId: 'f7', value: 24.99 },
      { fieldId: 'f8', value: 'Blank White T-Shirt', inventoryItemId: 'inv1' },
    ],
    attachments: [],
    comments: [],
  },
];

// Inventory related interfaces
export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string; // References a category id
  price: number;
  stock: number;
  imageUrl?: string;
  attributes?: { [key: string]: string | number }; // Custom attributes
  dateAdded: string;
  lastUpdated?: string;
}

// Mock inventory categories
export const mockInventoryCategories: InventoryCategory[] = [
  {
    id: 'cat1',
    name: 'Apparel',
    description: 'Clothing and wearable items',
  },
  {
    id: 'cat2',
    name: 'Print Materials',
    description: 'Papers, cards, and other printable materials',
  },
  {
    id: 'cat3',
    name: 'Equipment',
    description: 'Photography and studio equipment',
  },
];

// Mock inventory items
export const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv1',
    name: 'Blank White T-Shirt',
    sku: 'APP-TS-001',
    description: 'Premium cotton blank white t-shirt for printing',
    category: 'cat1',
    price: 8.99,
    stock: 150,
    imageUrl: '/placeholders/white-tshirt.jpg',
    attributes: {
      material: 'Cotton',
      weight: '180gsm',
      sizes: 'S,M,L,XL',
      color: 'White',
    },
    dateAdded: '2023-06-15',
  },
  {
    id: 'inv2',
    name: 'Blank Black T-Shirt',
    sku: 'APP-TS-002',
    description: 'Premium cotton blank black t-shirt for printing',
    category: 'cat1',
    price: 9.99,
    stock: 120,
    imageUrl: '/placeholders/black-tshirt.jpg',
    attributes: {
      material: 'Cotton',
      weight: '180gsm',
      sizes: 'S,M,L,XL',
      color: 'Black',
    },
    dateAdded: '2023-06-15',
  },
  {
    id: 'inv3',
    name: 'Matte Photo Paper',
    sku: 'PRT-PP-001',
    description: 'High-quality matte photo paper, 8.5x11"',
    category: 'cat2',
    price: 12.5,
    stock: 500,
    attributes: {
      finish: 'Matte',
      size: '8.5x11"',
      weight: '230gsm',
    },
    dateAdded: '2023-05-20',
  },
  {
    id: 'inv4',
    name: 'Canvas Roll',
    sku: 'PRT-CV-001',
    description: 'Artist-grade canvas roll for large format printing',
    category: 'cat2',
    price: 85.0,
    stock: 15,
    attributes: {
      material: 'Cotton/Poly Blend',
      width: '60"',
      length: '30ft',
    },
    dateAdded: '2023-05-25',
  },
  {
    id: 'inv5',
    name: 'Camera Tripod',
    sku: 'EQP-TR-001',
    description: 'Professional-grade aluminum tripod with ball head',
    category: 'cat3',
    price: 129.99,
    stock: 8,
    imageUrl: '/placeholders/tripod.jpg',
    attributes: {
      material: 'Aluminum',
      maxHeight: '72"',
      foldedLength: '24"',
      weight: '3.5lbs',
    },
    dateAdded: '2023-04-10',
    lastUpdated: '2023-07-02',
  },
];
