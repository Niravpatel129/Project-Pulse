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
  quantity?: number; // Quantity for inventory items, defaults to 1
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

// Specialized printing templates
export const printingTemplates: Template[] = [
  {
    id: 'template-tshirt-printing',
    name: 'T-Shirt Printing Order',
    description: 'Custom t-shirt printing order form with size selection',
    icon: 'shirt',
    createdBy: 'System',
    dateCreated: '2023-07-15T09:00:00Z',
    fields: [
      {
        id: 'tshirt-field-customer',
        name: 'Customer Name',
        type: 'text',
        required: true,
        description: 'Full name of the customer ordering printed shirts',
      },
      {
        id: 'tshirt-field-shirt',
        name: 'Shirt Type',
        type: 'inventory_item',
        required: true,
        description: 'Select the base shirt for printing',
        inventoryCategory: 'cat-apparel',
      },
      {
        id: 'tshirt-field-quantity',
        name: 'Quantity',
        type: 'number',
        required: true,
        description: 'Number of shirts to print',
        defaultValue: 1,
      },
      {
        id: 'tshirt-field-print-location',
        name: 'Print Location',
        type: 'enum',
        required: true,
        options: ['Front Only', 'Back Only', 'Front and Back', 'Left Chest', 'Full Front & Back'],
        defaultValue: 'Front Only',
        description: 'Where the design should be printed on the shirt',
      },
      {
        id: 'tshirt-field-design',
        name: 'Design File',
        type: 'file',
        required: true,
        description: 'Upload the design to be printed (AI, EPS, PDF, or high-res PNG)',
        fileTypes: ['ai', 'eps', 'pdf', 'png', 'jpg', 'jpeg'],
      },
      {
        id: 'tshirt-field-print-colors',
        name: 'Number of Colors',
        type: 'number',
        required: true,
        description: 'Number of distinct colors in the design',
        defaultValue: 1,
      },
      {
        id: 'tshirt-field-special-instructions',
        name: 'Special Instructions',
        type: 'text',
        description: 'Any special requirements or notes for this order',
      },
      {
        id: 'tshirt-field-due-date',
        name: 'Required By Date',
        type: 'date',
        required: true,
        description: 'When the order needs to be completed',
      },
    ],
  },
  {
    id: 'template-banner-production',
    name: 'Banner Production Order',
    description: 'Custom banner production specifications and requirements',
    icon: 'image',
    createdBy: 'System',
    dateCreated: '2023-07-20T11:30:00Z',
    fields: [
      {
        id: 'banner-field-customer',
        name: 'Customer Name',
        type: 'text',
        required: true,
        description: 'Full name of the customer ordering the banner',
      },
      {
        id: 'banner-field-stand',
        name: 'Banner Stand',
        type: 'inventory_item',
        required: true,
        description: 'Select the banner stand hardware',
        inventoryCategory: 'cat-signage',
      },
      {
        id: 'banner-field-design',
        name: 'Design File',
        type: 'file',
        required: true,
        description: 'Upload the banner design (PDF, AI, or high-res JPEG/PNG)',
        fileTypes: ['pdf', 'ai', 'jpg', 'jpeg', 'png'],
      },
      {
        id: 'banner-field-width',
        name: 'Custom Width (if needed)',
        type: 'dimension',
        unit: 'cm',
        description: 'Only if different from standard banner stand width',
      },
      {
        id: 'banner-field-height',
        name: 'Custom Height (if needed)',
        type: 'dimension',
        unit: 'cm',
        description: 'Only if different from standard banner stand height',
      },
      {
        id: 'banner-field-finish',
        name: 'Banner Finish',
        type: 'enum',
        options: ['Matte', 'Glossy', 'Semi-Gloss'],
        defaultValue: 'Matte',
        description: 'Finish type for the banner material',
      },
      {
        id: 'banner-field-quantity',
        name: 'Quantity',
        type: 'number',
        required: true,
        defaultValue: 1,
        description: 'Number of identical banners to produce',
      },
      {
        id: 'banner-field-due-date',
        name: 'Required By Date',
        type: 'date',
        required: true,
        description: 'When the banner needs to be completed',
      },
      {
        id: 'banner-field-special-instructions',
        name: 'Special Instructions',
        type: 'text',
        description: 'Any special requirements or notes for production',
      },
    ],
  },
];

// Add the printing templates to the existing templates
export const mockTemplates: Template[] = [
  ...printingTemplates,
  // ... existing templates ...
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

export interface Variant {
  id: string;
  name: string; // e.g., "Small", "Medium", "Large"
  sku: string; // Variant-specific SKU
  stock: number;
  price?: number; // Variant-specific price (optional)
  attributes?: { [key: string]: string | number }; // Variant-specific attributes
}

export interface ProductionInfo {
  timeRequired: number; // Time in minutes
  laborCost: number;
  materialCost: number;
  setupTime: number;
  machineId?: string; // Which machine/equipment is needed
  notes?: string;
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
  variants?: Variant[]; // Add variants support for items like shirts with sizes
  isComposite?: boolean; // Whether this item is made of other items
  components?: Array<{ itemId: string; quantity: number }>; // For composite items (Bill of Materials)
  productionInfo?: ProductionInfo; // Information related to production of this item
}

// Add printing business categories
export const mockPrintingCategories: InventoryCategory[] = [
  {
    id: 'cat-apparel',
    name: 'Apparel',
    description: 'Clothing items for printing and embroidery',
  },
  {
    id: 'cat-signage',
    name: 'Signage & Banners',
    description: 'Banner stands, signs, and display materials',
  },
  {
    id: 'cat-promotional',
    name: 'Promotional Items',
    description: 'Branded merchandise and giveaways',
  },
  {
    id: 'cat-supplies',
    name: 'Print Supplies',
    description: 'Inks, transfer papers, and other printing supplies',
  },
];

// Add to existing categories
export const mockInventoryCategories: InventoryCategory[] = [
  ...mockPrintingCategories,
  // ... existing categories ...
];

// Add printing business inventory items
export const mockPrintingItems: InventoryItem[] = [
  // T-shirts with variants
  {
    id: 'item-tshirt-black',
    name: 'Basic Black T-Shirt',
    sku: 'TS-BLK-BASE',
    description: 'Cotton black t-shirt for screen printing and heat transfer',
    category: 'cat-apparel',
    price: 8.99,
    stock: 0, // Overall stock (actual stock is in variants)
    imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=200',
    dateAdded: '2023-01-15T12:00:00Z',
    lastUpdated: '2023-08-10T15:30:00Z',
    variants: [
      {
        id: 'tshirt-black-s',
        name: 'Small',
        sku: 'TS-BLK-S',
        stock: 25,
      },
      {
        id: 'tshirt-black-m',
        name: 'Medium',
        sku: 'TS-BLK-M',
        stock: 40,
      },
      {
        id: 'tshirt-black-l',
        name: 'Large',
        sku: 'TS-BLK-L',
        stock: 35,
      },
      {
        id: 'tshirt-black-xl',
        name: 'X-Large',
        sku: 'TS-BLK-XL',
        stock: 20,
      },
      {
        id: 'tshirt-black-xxl',
        name: '2X-Large',
        sku: 'TS-BLK-2XL',
        stock: 15,
      },
    ],
    productionInfo: {
      timeRequired: 10, // minutes per item
      laborCost: 2.5,
      materialCost: 0.75, // ink cost per print
      setupTime: 30, // minutes for setup
    },
  },
  {
    id: 'item-tshirt-white',
    name: 'Premium White T-Shirt',
    sku: 'TS-WHT-PREM',
    description: 'High-quality white t-shirt ideal for detailed designs',
    category: 'cat-apparel',
    price: 10.99,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=200',
    dateAdded: '2023-01-15T12:00:00Z',
    lastUpdated: '2023-09-05T11:20:00Z',
    variants: [
      {
        id: 'tshirt-white-s',
        name: 'Small',
        sku: 'TS-WHT-S',
        stock: 30,
      },
      {
        id: 'tshirt-white-m',
        name: 'Medium',
        sku: 'TS-WHT-M',
        stock: 45,
      },
      {
        id: 'tshirt-white-l',
        name: 'Large',
        sku: 'TS-WHT-L',
        stock: 40,
      },
      {
        id: 'tshirt-white-xl',
        name: 'X-Large',
        sku: 'TS-WHT-XL',
        stock: 25,
      },
      {
        id: 'tshirt-white-xxl',
        name: '2X-Large',
        sku: 'TS-WHT-2XL',
        stock: 10,
      },
    ],
    productionInfo: {
      timeRequired: 10,
      laborCost: 2.5,
      materialCost: 0.75,
      setupTime: 30,
    },
  },
  // Banner stands
  {
    id: 'item-banner-standard',
    name: 'Standard Roll-Up Banner Stand',
    sku: 'BNR-STD-85',
    description: 'Standard 85x200cm retractable banner stand with aluminum base',
    category: 'cat-signage',
    price: 89.99,
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=200',
    dateAdded: '2023-02-10T09:45:00Z',
    lastUpdated: '2023-07-20T14:15:00Z',
    attributes: {
      width: 85, // cm
      height: 200, // cm
      material: 'Aluminum',
      printArea: '85x200cm',
    },
    isComposite: true,
    components: [
      { itemId: 'item-banner-print', quantity: 1 },
      { itemId: 'item-banner-hardware', quantity: 1 },
    ],
    productionInfo: {
      timeRequired: 45,
      laborCost: 15,
      materialCost: 35,
      setupTime: 20,
      machineId: 'wide-format-printer-1',
    },
  },
  {
    id: 'item-banner-premium',
    name: 'Premium Wide-Base Banner Stand',
    sku: 'BNR-PREM-100',
    description: 'Premium 100x200cm banner stand with wide base for extra stability',
    category: 'cat-signage',
    price: 129.99,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1588858865241-27a02b647555?q=80&w=200',
    dateAdded: '2023-02-15T10:30:00Z',
    lastUpdated: '2023-08-25T13:40:00Z',
    attributes: {
      width: 100, // cm
      height: 200, // cm
      material: 'Steel/Aluminum',
      printArea: '100x200cm',
    },
    isComposite: true,
    components: [
      { itemId: 'item-banner-print-wide', quantity: 1 },
      { itemId: 'item-banner-hardware-premium', quantity: 1 },
    ],
    productionInfo: {
      timeRequired: 60,
      laborCost: 20,
      materialCost: 45,
      setupTime: 25,
      machineId: 'wide-format-printer-1',
    },
  },
  // Components (not directly selectable in templates)
  {
    id: 'item-banner-print',
    name: 'Standard Banner Print',
    sku: 'BNR-PRT-85',
    description: 'Standard 85x200cm banner print on scrim vinyl',
    category: 'cat-supplies',
    price: 45.99,
    stock: 25,
    dateAdded: '2023-02-10T09:45:00Z',
    attributes: {
      width: 85, // cm
      height: 200, // cm
      material: 'Scrim Vinyl 440gsm',
    },
  },
  {
    id: 'item-banner-hardware',
    name: 'Standard Banner Hardware',
    sku: 'BNR-HW-85',
    description: 'Hardware for 85cm roll-up banner stand',
    category: 'cat-supplies',
    price: 39.99,
    stock: 20,
    dateAdded: '2023-02-10T09:45:00Z',
  },
];

// Add to existing inventory items
export const mockInventoryItems: InventoryItem[] = [
  ...mockPrintingItems,
  // ... existing inventory items ...
];
