import { Template } from '../../models';

/**
 * Mock templates data for the mock API
 */
export const mockTemplates: Template[] = [
  {
    _id: 'template-1',
    name: 'Banner Design',
    description: 'Template for creating customized banners',
    category: 'signage',
    createdAt: '2023-07-02T15:30:00Z',
    updatedAt: '2023-07-02T15:30:00Z',
    createdBy: 'user-4',
    fields: [
      {
        id: 'f1',
        name: 'Banner Title',
        type: 'text',
        required: true,
        description: 'The title to display on the banner',
        defaultValue: '',
        fieldSettings: {
          minLength: 3,
          maxLength: 50,
        },
      },
      {
        id: 'f2',
        name: 'Description',
        type: 'text',
        required: false,
        description: 'Additional text to display on the banner',
        defaultValue: '',
        fieldSettings: {
          maxLength: 200,
        },
      },
      {
        id: 'f3',
        name: 'Banner Type',
        type: 'select',
        required: true,
        description: 'Select the physical banner type',
        options: ['inventory-1', 'inventory-2', 'inventory-3'],
        defaultValue: 'inventory-1',
        linkedToInventory: true,
      },
      {
        id: 'f4',
        name: 'Logo',
        type: 'file',
        required: true,
        description: 'Upload your logo (PNG or JPG, min 300dpi)',
        fieldSettings: {
          maxSize: 5000000, // 5MB
        },
      },
      {
        id: 'f5',
        name: 'Background Color',
        type: 'text',
        required: false,
        description: 'Choose a background color',
        defaultValue: '#ffffff',
      },
    ],
  },
  {
    _id: 'template-2',
    name: 'Business Card',
    description: 'Template for business cards',
    category: 'print',
    createdAt: '2023-07-10T09:15:00Z',
    updatedAt: '2023-07-10T09:15:00Z',
    createdBy: 'user-1',
    fields: [
      {
        id: 'f1',
        name: 'Full Name',
        type: 'text',
        required: true,
        description: 'Name to display on the business card',
        defaultValue: '',
        fieldSettings: {
          minLength: 2,
          maxLength: 40,
        },
      },
      {
        id: 'f2',
        name: 'Job Title',
        type: 'text',
        required: true,
        description: 'Your job title',
        defaultValue: '',
        fieldSettings: {
          maxLength: 40,
        },
      },
      {
        id: 'f3',
        name: 'Phone Number',
        type: 'text',
        required: true,
        description: 'Contact phone number',
        defaultValue: '',
        fieldSettings: {
          pattern: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$',
        },
      },
      {
        id: 'f4',
        name: 'Email',
        type: 'text',
        required: true,
        description: 'Contact email address',
        defaultValue: '',
        fieldSettings: {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        },
      },
      {
        id: 'f5',
        name: 'Card Type',
        type: 'select',
        required: true,
        description: 'Select the business card type',
        options: ['inventory-4', 'inventory-5', 'inventory-6'],
        defaultValue: 'inventory-4',
        linkedToInventory: true,
      },
    ],
  },
  {
    _id: 'template-3',
    name: 'Brochure',
    description: 'Template for tri-fold brochures',
    category: 'print',
    createdAt: '2023-07-15T14:20:00Z',
    updatedAt: '2023-07-15T14:20:00Z',
    createdBy: 'user-2',
    fields: [
      {
        id: 'f1',
        name: 'Brochure Title',
        type: 'text',
        required: true,
        description: 'Main title of the brochure',
        defaultValue: '',
        fieldSettings: {
          minLength: 3,
          maxLength: 50,
        },
      },
      {
        id: 'f2',
        name: 'Content Sections',
        type: 'relation',
        required: true,
        description: 'Content sections for the brochure',
        fieldSettings: {
          minItems: 1,
          maxItems: 5,
          itemFields: [
            {
              id: 'section_title',
              name: 'Section Title',
              type: 'text',
              required: true,
              fieldSettings: {
                maxLength: 30,
              },
            },
            {
              id: 'section_content',
              name: 'Section Content',
              type: 'text',
              required: true,
              fieldSettings: {
                maxLength: 300,
              },
            },
          ],
        },
      },
      {
        id: 'f3',
        name: 'Images',
        type: 'file',
        required: true,
        description: 'Upload images for the brochure (PNG or JPG, min 300dpi)',
        fieldSettings: {
          maxSize: 10000000, // 10MB
          minItems: 1,
          maxItems: 5,
        },
      },
      {
        id: 'f4',
        name: 'Paper Type',
        type: 'select',
        required: true,
        description: 'Select the brochure paper type',
        options: ['inventory-7', 'inventory-8', 'inventory-9'],
        defaultValue: 'inventory-7',
        linkedToInventory: true,
      },
    ],
  },
];
