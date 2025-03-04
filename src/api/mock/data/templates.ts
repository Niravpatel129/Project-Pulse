import { Template } from '../../models';

/**
 * Mock templates data for the mock API
 */
export const mockTemplates: Template[] = [
  {
    id: 'template-1',
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
        placeholder: 'Enter banner title',
        defaultValue: '',
        validations: {
          minLength: 3,
          maxLength: 50,
        },
      },
      {
        id: 'f2',
        name: 'Description',
        type: 'textarea',
        required: false,
        description: 'Additional text to display on the banner',
        placeholder: 'Enter description (optional)',
        defaultValue: '',
        validations: {
          maxLength: 200,
        },
      },
      {
        id: 'f3',
        name: 'Banner Type',
        type: 'select',
        required: true,
        description: 'Select the physical banner type',
        options: [
          { value: 'inventory-1', label: 'Standard Roll-up (85x200cm)' },
          { value: 'inventory-2', label: 'Premium Roll-up (100x200cm)' },
          { value: 'inventory-3', label: 'Desktop Banner (A3)' },
        ],
        defaultValue: 'inventory-1',
        linkedToInventory: true,
      },
      {
        id: 'f4',
        name: 'Logo',
        type: 'file',
        required: true,
        description: 'Upload your logo (PNG or JPG, min 300dpi)',
        acceptTypes: ['image/png', 'image/jpeg'],
        validations: {
          maxSize: 5000000, // 5MB
        },
      },
      {
        id: 'f5',
        name: 'Background Color',
        type: 'color',
        required: false,
        description: 'Choose a background color',
        defaultValue: '#ffffff',
      },
    ],
  },
  {
    id: 'template-2',
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
        placeholder: 'Enter full name',
        defaultValue: '',
        validations: {
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
        placeholder: 'Enter job title',
        defaultValue: '',
        validations: {
          maxLength: 40,
        },
      },
      {
        id: 'f3',
        name: 'Phone Number',
        type: 'text',
        required: true,
        description: 'Contact phone number',
        placeholder: 'Enter phone number',
        defaultValue: '',
        validations: {
          pattern: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$',
        },
      },
      {
        id: 'f4',
        name: 'Email',
        type: 'email',
        required: true,
        description: 'Contact email address',
        placeholder: 'Enter email address',
        defaultValue: '',
        validations: {
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        },
      },
      {
        id: 'f5',
        name: 'Card Type',
        type: 'select',
        required: true,
        description: 'Select the business card type',
        options: [
          { value: 'inventory-4', label: 'Standard (90x50mm)' },
          { value: 'inventory-5', label: 'Premium (90x50mm, rounded corners)' },
          { value: 'inventory-6', label: 'Folded (90x50mm folded)' },
        ],
        defaultValue: 'inventory-4',
        linkedToInventory: true,
      },
    ],
  },
  {
    id: 'template-3',
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
        placeholder: 'Enter brochure title',
        defaultValue: '',
        validations: {
          minLength: 3,
          maxLength: 50,
        },
      },
      {
        id: 'f2',
        name: 'Content Sections',
        type: 'array',
        required: true,
        description: 'Content sections for the brochure',
        minItems: 1,
        maxItems: 5,
        validations: {
          itemFields: [
            {
              id: 'section_title',
              name: 'Section Title',
              type: 'text',
              required: true,
              validations: {
                maxLength: 30,
              },
            },
            {
              id: 'section_content',
              name: 'Section Content',
              type: 'textarea',
              required: true,
              validations: {
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
        multiple: true,
        description: 'Upload images for the brochure (PNG or JPG, min 300dpi)',
        acceptTypes: ['image/png', 'image/jpeg'],
        validations: {
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
        options: [
          { value: 'inventory-7', label: 'Standard Gloss (150gsm)' },
          { value: 'inventory-8', label: 'Premium Matte (170gsm)' },
          { value: 'inventory-9', label: 'Recycled (120gsm)' },
        ],
        defaultValue: 'inventory-7',
        linkedToInventory: true,
      },
    ],
  },
];
