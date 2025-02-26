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
  | 'dimension';

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
    id: 't1',
    name: 'Clothing Print',
    description: 'Template for clothing print specifications',
    icon: 'shirt',
    createdBy: 'Hitarth',
    dateCreated: '2023-12-01',
    fields: [
      {
        id: 'f1',
        name: 'Image',
        type: 'file',
        required: true,
        fileTypes: ['png', 'svg'],
        description: 'Print image file',
      },
      {
        id: 'f2',
        name: 'Print Location',
        type: 'enum',
        required: true,
        options: ['front', 'back', 'sleeve', 'neck tag'],
        description: 'Location of the print on the garment',
      },
      {
        id: 'f3',
        name: 'Print Type',
        type: 'enum',
        required: true,
        options: ['DTG', 'DTF', 'Emb'],
        description: 'Type of printing technique',
      },
      {
        id: 'f4',
        name: 'Position',
        type: 'enum',
        options: ['X', 'Y'],
        description: 'Position coordinates',
      },
      {
        id: 'f5',
        name: 'Width Size',
        type: 'dimension',
        required: true,
        options: ['inches', 'cm'],
        description: 'Width of the print',
      },
      {
        id: 'f6',
        name: 'Figma',
        type: 'link',
        description: 'Link to Figma design',
      },
      {
        id: 'f7',
        name: 'Price',
        type: 'price',
        formula: 'W*H*($/sqin)',
        description: 'Calculated price based on dimensions',
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
    ],
    attachments: [],
    comments: [],
  },
];
