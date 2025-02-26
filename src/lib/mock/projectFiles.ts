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
  | 'file_item';

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
