import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  FileCode,
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
  Link as LinkIcon,
  List,
  ListChecks,
  Maximize2,
  MoreHorizontal,
  Paperclip,
  Plus,
  Type,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface DeliverableContentTabProps {
  formData: any;
  errors: any;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  addCustomField: (type: string) => void;
  removeCustomField: (id: string) => void;
  moveFieldUp: (index: number) => void;
  moveFieldDown: (index: number) => void;
  updateFieldProperty: (id: string, property: string, value: string | boolean | any[]) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

// Define custom field types for dropdown menu
const FIELD_TYPES = [
  { id: 'shortText', label: 'Short Text', icon: <Type className='mr-2' size={16} /> },
  { id: 'longText', label: 'Long Text', icon: <FileText className='mr-2' size={16} /> },
  { id: 'bulletList', label: 'Bullet List', icon: <List className='mr-2' size={16} /> },
  { id: 'numberList', label: 'Numbered List', icon: <ListChecks className='mr-2' size={16} /> },
  { id: 'link', label: 'Link', icon: <LinkIcon className='mr-2' size={16} /> },
  { id: 'attachment', label: 'Attachment', icon: <Paperclip className='mr-2' size={16} /> },
  { id: 'specification', label: 'Specification', icon: <AlertCircle className='mr-2' size={16} /> },
  { id: 'databaseItem', label: 'Database Item', icon: <Database className='mr-2' size={16} /> },
];

const getFieldError = (field: any, errors: any) => {
  if (!errors) return null;

  // Find errors related to this field
  const fieldErrors = Object.keys(errors)
    .filter((key) => {
      return key.includes(`customField_`) && key.includes(field.id);
    })
    .map((key) => {
      return errors[key];
    });

  return fieldErrors.length > 0 ? fieldErrors[0] : null;
};

// Function to check if file is an image
const isImageFile = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
};

// Function to get file icon based on file type
const getFileIcon = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return <FileImage size={20} className='text-indigo-500' />;
  }

  // Document files
  if (['pdf'].includes(extension)) {
    return <FileText size={20} className='text-red-500' />;
  }

  // Word files
  if (['doc', 'docx', 'rtf', 'txt'].includes(extension)) {
    return <FileText size={20} className='text-blue-500' />;
  }

  // Spreadsheet files
  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return <FileSpreadsheet size={20} className='text-green-500' />;
  }

  // Code files
  if (['json', 'xml', 'html', 'css', 'js'].includes(extension)) {
    return <FileCode size={20} className='text-amber-500' />;
  }

  // Video files
  if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
    return <FileVideo size={20} className='text-purple-500' />;
  }

  // Presentation files
  if (['ppt', 'pptx'].includes(extension)) {
    return <FileType size={20} className='text-orange-500' />;
  }

  // Default for other files
  return <FileIcon size={20} className='text-gray-500' />;
};

// Function to get file type label
const getFileTypeLabel = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'Image';
  } else if (['pdf'].includes(extension)) {
    return 'PDF';
  } else if (['doc', 'docx'].includes(extension)) {
    return 'Document';
  } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'Spreadsheet';
  } else if (['ppt', 'pptx'].includes(extension)) {
    return 'Presentation';
  } else if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
    return 'Video';
  }

  return extension.toUpperCase();
};

// Function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Define a new interface for the preview modal
interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: any;
}

// Preview Modal Component for larger file previews
const PreviewModal = ({ isOpen, onClose, attachment }: PreviewModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70'
      onClick={onClose}
    >
      <div
        className='relative max-w-4xl w-full bg-white rounded-lg shadow-xl p-1'
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-3 border-b'>
          <div className='flex items-center space-x-3'>
            <div className='shrink-0'>{getFileIcon(attachment.name)}</div>
            <div>
              <h3 className='font-medium'>{attachment.name}</h3>
              <p className='text-xs text-neutral-500'>{formatFileSize(attachment.size)}</p>
            </div>
          </div>
          <Button variant='ghost' size='icon' className='rounded-full' onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Preview Content */}
        <div
          className='p-4 flex justify-center items-center bg-neutral-50'
          style={{ minHeight: '400px' }}
        >
          {isImageFile(attachment.name) ? (
            <img
              src={attachment.url}
              alt={attachment.name}
              className='max-h-[70vh] max-w-full object-contain'
            />
          ) : (
            <div className='text-center'>
              <div className='mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-neutral-100 rounded-full'>
                {getFileIcon(attachment.name)}
              </div>
              <p className='text-neutral-600 mb-2'>Preview not available</p>
              <Button
                variant='outline'
                size='sm'
                className='mt-2'
                onClick={() => {
                  return window.open(attachment.url, '_blank');
                }}
              >
                <Download size={14} className='mr-1.5' />
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Type definitions for database items
interface ProductItem {
  id: string;
  name: string;
  sku: string;
  price: string;
  category: string;
  status: string;
  description: string;
  imageUrl: string;
}

interface CustomerItem {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: string;
  description: string;
  imageUrl: string;
}

interface ProjectItem {
  id: string;
  name: string;
  client: string;
  deadline: string;
  status: string;
  description: string;
  imageUrl: string;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: string;
  date: string;
  status: string;
  description: string;
  imageUrl: string;
  name?: string;
}

type DatabaseItem = ProductItem | CustomerItem | ProjectItem | InvoiceItem;

interface DatabaseItems {
  products: ProductItem[];
  customers: CustomerItem[];
  projects: ProjectItem[];
  invoices: InvoiceItem[];
}

// Mock products for database item type
const mockDatabases = [
  {
    id: 'products',
    name: 'Product Catalog',
    description: 'All available products and services',
    icon: 'cube',
  },
  {
    id: 'customers',
    name: 'Customer Database',
    description: 'Client and customer information',
    icon: 'users',
  },
  {
    id: 'projects',
    name: 'Project Repository',
    description: 'All active and completed projects',
    icon: 'folder',
  },
  {
    id: 'invoices',
    name: 'Invoice Records',
    description: 'Billing and payment information',
    icon: 'receipt',
  },
];

// Mock database items
const mockDatabaseItems: DatabaseItems = {
  products: [
    {
      id: 'p1',
      name: 'Premium Widget',
      sku: 'WDG-001',
      price: '$99.99',
      category: 'Widgets',
      status: 'In Stock',
      description: 'High-quality widget with premium features and extended warranty.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
    },
    {
      id: 'p2',
      name: 'Basic Gadget',
      sku: 'GDG-101',
      price: '$49.99',
      category: 'Gadgets',
      status: 'In Stock',
      description: 'Affordable gadget for everyday use with standard features.',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
    },
    {
      id: 'p3',
      name: 'Deluxe Gizmo',
      sku: 'GZM-202',
      price: '$129.99',
      category: 'Gizmos',
      status: 'Low Stock',
      description: 'Deluxe edition gizmo with advanced functionality and premium materials.',
      imageUrl: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=300&h=300&fit=crop',
    },
    {
      id: 'p4',
      name: 'Smart Doohickey',
      sku: 'DHK-505',
      price: '$79.99',
      category: 'Smart Devices',
      status: 'In Stock',
      description: 'Intelligent doohickey with smart connectivity and voice control.',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&h=300&fit=crop',
    },
  ],
  customers: [
    {
      id: 'c1',
      name: 'Acme Corporation',
      contactPerson: 'John Smith',
      email: 'john@acme.com',
      phone: '(555) 123-4567',
      status: 'Active',
      description: 'Large enterprise client with multiple ongoing projects.',
      imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&h=300&fit=crop',
    },
    {
      id: 'c2',
      name: 'TechStart Inc.',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@techstart.io',
      phone: '(555) 987-6543',
      status: 'Active',
      description: 'Emerging tech startup focused on AI applications.',
      imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300&h=300&fit=crop',
    },
    {
      id: 'c3',
      name: 'Global Logistics Ltd.',
      contactPerson: 'Michael Chen',
      email: 'mchen@globallogistics.com',
      phone: '(555) 456-7890',
      status: 'Inactive',
      description: 'International shipping and logistics company.',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=300&fit=crop',
    },
  ],
  projects: [
    {
      id: 'pr1',
      name: 'Website Redesign',
      client: 'Acme Corporation',
      deadline: '2023-12-15',
      status: 'In Progress',
      description: 'Complete overhaul of corporate website with new branding and features.',
      imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=300&fit=crop',
    },
    {
      id: 'pr2',
      name: 'Mobile App Development',
      client: 'TechStart Inc.',
      deadline: '2024-01-30',
      status: 'Planning',
      description: 'Cross-platform mobile application for product management.',
      imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=300&fit=crop',
    },
    {
      id: 'pr3',
      name: 'ERP Integration',
      client: 'Global Logistics Ltd.',
      deadline: '2023-11-10',
      status: 'Completed',
      description: 'Integration of shipping systems with enterprise resource planning software.',
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&h=300&fit=crop',
    },
  ],
  invoices: [
    {
      id: 'inv1',
      invoiceNumber: 'INV-2023-101',
      client: 'Acme Corporation',
      amount: '$12,500.00',
      date: '2023-09-15',
      status: 'Paid',
      description: 'Website design phase 1 milestone payment.',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=300&fit=crop',
    },
    {
      id: 'inv2',
      invoiceNumber: 'INV-2023-102',
      client: 'TechStart Inc.',
      amount: '$8,750.00',
      date: '2023-10-01',
      status: 'Pending',
      description: 'Mobile app development initial payment.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop',
    },
    {
      id: 'inv3',
      invoiceNumber: 'INV-2023-103',
      client: 'Global Logistics Ltd.',
      amount: '$15,000.00',
      date: '2023-08-22',
      status: 'Overdue',
      description: 'ERP integration final payment.',
      imageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=300&h=300&fit=crop',
    },
  ],
};

const DeliverableContentTab = ({
  formData,
  errors,
  editingFieldId,
  setEditingFieldId,
  addCustomField,
  removeCustomField,
  moveFieldUp,
  moveFieldDown,
  updateFieldProperty,
  setHasUnsavedChanges,
}: DeliverableContentTabProps) => {
  // Track temporary state for current editing field only
  const [tempLinkText, setTempLinkText] = useState('');
  const [tempLinkUrl, setTempLinkUrl] = useState('');
  const [tempListItem, setTempListItem] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<any>(null);

  // Database item specific states
  const [dbSearchTerm, setDbSearchTerm] = useState('');
  const [dbSelectedItem, setDbSelectedItem] = useState<any>(null);
  const [dbTempAlignment, setDbTempAlignment] = useState('left');
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);

  // Database modal state
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [editingDatabaseFieldId, setEditingDatabaseFieldId] = useState<string | null>(null);

  // Flag to temporarily block edit mode toggling
  const preventEditToggle = useRef<boolean>(false);

  // Track the last added field for auto-editing
  const [lastAddedField, setLastAddedField] = useState<string | null>(null);
  const prevFieldsLengthRef = useRef(0);

  // Keep track of when field focus has been initialized
  const focusInitializedRef = useRef<boolean>(false);
  const activeFieldIdRef = useRef<string | null>(null);

  // Function to safely block toggling edit mode temporarily
  const temporarilyPreventEditToggle = () => {
    preventEditToggle.current = true;
    setTimeout(() => {
      preventEditToggle.current = false;
    }, 300); // Block for 300ms after a selection
  };

  // Open database selection modal for a specific field
  const openDatabaseModal = (fieldId: string) => {
    const field = formData.customFields.find((f: any) => {
      return f.id === fieldId;
    });
    if (field && field.type === 'databaseItem') {
      // Load current field values into temporary state
      setDbSelectedItem(field.selectedItem || null);
      setSelectedDatabaseId(field.selectedDatabaseId || null);
      setDbTempAlignment(field.alignment || 'left');
      setDbSearchTerm('');

      // Set the field we're editing
      setEditingDatabaseFieldId(fieldId);

      // Open the modal
      setIsDatabaseModalOpen(true);
    }
  };

  // Save database selections from modal
  const saveDatabaseSelections = () => {
    if (editingDatabaseFieldId) {
      safeUpdateFieldProperty(editingDatabaseFieldId, 'selectedItem', dbSelectedItem);
      safeUpdateFieldProperty(editingDatabaseFieldId, 'selectedDatabaseId', selectedDatabaseId);
      safeUpdateFieldProperty(editingDatabaseFieldId, 'alignment', dbTempAlignment);

      // Close the modal
      setIsDatabaseModalOpen(false);
      setEditingDatabaseFieldId(null);
    }
  };

  // Cancel database selection
  const cancelDatabaseSelection = () => {
    setIsDatabaseModalOpen(false);
    setEditingDatabaseFieldId(null);
  };

  // Handle field property updates safely without affecting which field is selected
  const safeUpdateFieldProperty = (fieldId: string, property: string, value: any) => {
    // Verify this is a valid field ID
    const fieldExists = formData.customFields.some((field: any) => {
      return field.id === fieldId;
    });
    if (!fieldExists) {
      console.error(`Attempted to update non-existent field: ${fieldId}`);
      return;
    }

    // Update the field property
    updateFieldProperty(fieldId, property, value);
    setHasUnsavedChanges(true);
  };

  // Reset temporary state when editing field changes
  useEffect(() => {
    if (editingFieldId) {
      // Update active field tracking
      activeFieldIdRef.current = editingFieldId;
      // Reset focus initialized flag for the new field
      focusInitializedRef.current = false;

      const field = formData.customFields.find((f: any) => {
        return f.id === editingFieldId;
      });

      if (field) {
        // Clear all temporary state first
        setTempListItem('');

        // Set link-specific state if needed
        if (field.type === 'link') {
          setTempLinkText(field.text || '');
          setTempLinkUrl(field.url || '');
        } else {
          // Reset link state when not editing a link
          setTempLinkText('');
          setTempLinkUrl('');
        }
      }
    } else {
      // No field is being edited
      activeFieldIdRef.current = null;
      focusInitializedRef.current = false;
    }
  }, [editingFieldId, formData.customFields]);

  // Handle focus initialization separately
  useEffect(() => {
    // Only focus if we have an editing field and haven't focused already
    if (editingFieldId && !focusInitializedRef.current) {
      // Mark focus as initialized
      focusInitializedRef.current = true;

      // Focus with a small delay
      setTimeout(() => {
        // Only focus if still on the same field
        if (activeFieldIdRef.current === editingFieldId) {
          const input = document.querySelector(
            `.content-item[data-field-id="${editingFieldId}"] input, .content-item[data-field-id="${editingFieldId}"] textarea`,
          );
          if (input) {
            (input as HTMLElement).focus();
          }
        }
      }, 50);
    }
  }, [editingFieldId]);

  // Handle field completion - save any pending changes
  const completeFieldEdit = () => {
    if (editingFieldId) {
      const field = formData.customFields.find((f: any) => {
        return f.id === editingFieldId;
      });

      // Save any unsaved link data when completing edit
      if (field?.type === 'link' && tempLinkUrl.trim()) {
        safeUpdateFieldProperty(field.id, 'text', tempLinkText);
        safeUpdateFieldProperty(field.id, 'url', tempLinkUrl);
      }

      // Close the editor
      setEditingFieldId(null);
    }
  };

  // Handler for click outside content items (to auto-exit editing)
  const handleContentItemClickOutside = (e: MouseEvent) => {
    if (!editingFieldId) return;

    // Get the currently editing field
    const field = formData.customFields.find((f: any) => {
      return f.id === editingFieldId;
    });

    // Skip this auto-exit behavior for database items - they need explicit completion
    if (field?.type === 'databaseItem') return;

    const contentItemElement = document.querySelector(
      `.content-item[data-field-id="${editingFieldId}"]`,
    );

    // Check if the click is outside the content item
    if (contentItemElement && !contentItemElement.contains(e.target as Node)) {
      completeFieldEdit();
    }
  };

  // Add document click listener for outside clicks
  useEffect(() => {
    document.addEventListener('mousedown', handleContentItemClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleContentItemClickOutside);
    };
  }, [editingFieldId, formData.customFields]);

  // Detect newly added fields and auto-edit them
  useEffect(() => {
    const currentFieldsLength = formData.customFields.length;

    if (currentFieldsLength > prevFieldsLengthRef.current && currentFieldsLength > 0) {
      // Get the last field
      const lastField = formData.customFields[currentFieldsLength - 1];

      if (lastField) {
        // Track this as the last added field
        setLastAddedField(lastField.id);

        // Automatically set the new field to edit mode
        setEditingFieldId(lastField.id);
      }
    }

    prevFieldsLengthRef.current = currentFieldsLength;
  }, [formData.customFields.length, setEditingFieldId]);

  // Function to get database icon
  const getDatabaseIcon = (iconName: string) => {
    switch (iconName) {
      case 'cube':
        return <FileType className='h-4 w-4 mr-2' />;
      case 'users':
        return <FileText className='h-4 w-4 mr-2' />;
      case 'folder':
        return <FileIcon className='h-4 w-4 mr-2' />;
      case 'receipt':
        return <FileText className='h-4 w-4 mr-2' />;
      default:
        return <Database className='h-4 w-4 mr-2' />;
    }
  };

  // Function to format field content based on type for display in view mode
  const getFormattedContent = (field: any) => {
    switch (field.type) {
      case 'shortText':
      case 'longText':
        return <p className='whitespace-pre-wrap'>{field.content}</p>;

      case 'bulletList':
        return (
          <ul className='list-disc pl-5 space-y-1'>
            {field.items?.map((item: string, i: number) => {
              return <li key={i}>{item}</li>;
            })}
          </ul>
        );

      case 'numberList':
        return (
          <ol className='list-decimal pl-5 space-y-1'>
            {field.items?.map((item: string, i: number) => {
              return <li key={i}>{item}</li>;
            })}
          </ol>
        );

      case 'link':
        return (
          <div>
            <a
              href={field.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline flex items-center'
            >
              <LinkIcon size={14} className='mr-1.5' />
              {field.text || field.url}
            </a>
          </div>
        );

      case 'attachment':
        return (
          <div className='space-y-3'>
            {field.attachments && field.attachments.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {field.attachments.map((attachment: any, i: number) => {
                  return (
                    <div
                      key={i}
                      className='group relative rounded-lg shadow-sm border border-neutral-200 overflow-hidden transition-all hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 duration-200'
                    >
                      {/* Preview area */}
                      <div
                        className='relative bg-neutral-50 h-32 flex items-center justify-center cursor-pointer'
                        onClick={() => {
                          return setPreviewAttachment(attachment);
                        }}
                      >
                        {isImageFile(attachment.name) ? (
                          <div className='relative w-full h-full overflow-hidden'>
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className='h-full w-full object-cover'
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100'>
                              <Maximize2 className='text-white drop-shadow-md' size={22} />
                            </div>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center justify-center h-full w-full group-hover:scale-105 transition-transform'>
                            <div className='mb-2 transform group-hover:scale-110 transition-transform'>
                              {getFileIcon(attachment.name)}
                            </div>
                            <div className='text-xs font-medium bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-full'>
                              {getFileTypeLabel(attachment.name)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File info area */}
                      <div className='px-3 py-2.5 bg-white border-t border-neutral-100'>
                        <div className='text-sm font-medium text-neutral-800 truncate pb-0.5 group-hover:text-blue-600 transition-colors'>
                          {attachment.name}
                        </div>
                        <div className='text-xs text-neutral-500 flex items-center'>
                          <span className='inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5'></span>
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-neutral-500 text-sm italic'>No attachments</div>
            )}
          </div>
        );

      case 'specification':
        return (
          <div className='flex items-start space-x-2 text-amber-700 bg-amber-50 p-3 rounded-md'>
            <AlertCircle size={18} className='mt-0.5 shrink-0' />
            <div className='text-sm'>{field.content}</div>
          </div>
        );

      case 'databaseItem':
        return (
          <div>
            {field.selectedItem ? (
              <div
                className={`w-full ${
                  field.alignment === 'center'
                    ? 'flex justify-center'
                    : field.alignment === 'right'
                    ? 'flex justify-end'
                    : ''
                }`}
              >
                <div
                  className={`flex items-center gap-3 ${
                    field.alignment === 'center' || field.alignment === 'right'
                      ? 'inline-flex'
                      : 'w-full'
                  }`}
                >
                  {field.selectedItem.imageUrl && (
                    <div className='relative w-12 h-12 rounded overflow-hidden flex-shrink-0'>
                      <img
                        src={field.selectedItem.imageUrl}
                        alt={
                          'name' in field.selectedItem
                            ? field.selectedItem.name
                            : 'invoiceNumber' in field.selectedItem
                            ? field.selectedItem.invoiceNumber
                            : ''
                        }
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}
                  <div className='flex-1'>
                    <div className='font-medium text-neutral-900'>
                      {'name' in field.selectedItem
                        ? field.selectedItem.name
                        : 'invoiceNumber' in field.selectedItem
                        ? field.selectedItem.invoiceNumber
                        : ''}
                    </div>
                    <div className='text-xs text-neutral-600'>
                      {field.selectedDatabaseId === 'products' && 'sku' in field.selectedItem
                        ? `SKU: ${field.selectedItem.sku}`
                        : field.selectedDatabaseId === 'customers' &&
                          'contactPerson' in field.selectedItem
                        ? `Contact: ${field.selectedItem.contactPerson}`
                        : field.selectedDatabaseId === 'projects' && 'client' in field.selectedItem
                        ? `Client: ${field.selectedItem.client}`
                        : field.selectedDatabaseId === 'invoices' && 'client' in field.selectedItem
                        ? `Client: ${field.selectedItem.client}`
                        : ''}
                    </div>
                  </div>
                  {field.selectedDatabaseId === 'products' && 'price' in field.selectedItem && (
                    <div className='text-sm font-medium'>{field.selectedItem.price}</div>
                  )}
                  {field.selectedDatabaseId === 'invoices' && 'amount' in field.selectedItem && (
                    <div className='text-sm font-medium'>{field.selectedItem.amount}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className='italic text-neutral-500 text-sm'>No database item selected</div>
            )}
          </div>
        );

      default:
        return <p>{field.content}</p>;
    }
  };

  // Render edit mode content based on field type
  const renderEditMode = (field: any) => {
    const fieldError = getFieldError(field, errors);

    switch (field.type) {
      case 'shortText':
        return (
          <>
            <Input
              value={field.content || ''}
              onChange={(e) => {
                safeUpdateFieldProperty(field.id, 'content', e.target.value);
              }}
              placeholder='Enter short text'
              className={`w-full border-none shadow-none focus-visible:ring-0 px-0 text-base ${
                fieldError ? 'border-red-300' : ''
              }`}
              aria-invalid={!!fieldError}
            />
            {fieldError && <p className='text-xs text-red-500 mt-1'>{fieldError}</p>}
          </>
        );

      case 'longText':
        return (
          <Textarea
            value={field.content || ''}
            onChange={(e) => {
              safeUpdateFieldProperty(field.id, 'content', e.target.value);
            }}
            placeholder='Enter detailed text'
            className='w-full resize-none border-none shadow-none focus-visible:ring-0 px-0'
            rows={4}
          />
        );

      case 'bulletList':
      case 'numberList':
        return (
          <div className='space-y-3'>
            {field.items?.map((item: string, index: number) => {
              return (
                <div key={index} className='flex items-center gap-2'>
                  <Input
                    value={item}
                    onChange={(e) => {
                      return updateListItem(field, index, e.target.value);
                    }}
                    className='flex-1 border-none shadow-none focus-visible:ring-0 px-0'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      return removeListItem(field, index);
                    }}
                    className='h-8 w-8 shrink-0'
                  >
                    <X size={16} />
                  </Button>
                </div>
              );
            })}

            <div className='flex items-center gap-2 pt-1'>
              <Input
                value={tempListItem}
                onChange={(e) => {
                  return setTempListItem(e.target.value);
                }}
                placeholder='Add new item'
                className='flex-1 border-none shadow-none focus-visible:ring-0 px-0'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addListItem(field);
                  }
                }}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => {
                  return addListItem(field);
                }}
                className='h-8 w-8 shrink-0'
                disabled={!tempListItem.trim()}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        );

      case 'link':
        return (
          <div className='space-y-3'>
            <div className='space-y-1'>
              <Label
                htmlFor={`link-text-${field.id}`}
                className='text-xs font-medium text-neutral-600'
              >
                Link Text
              </Label>
              <Input
                id={`link-text-${field.id}`}
                value={tempLinkText}
                onChange={(e) => {
                  return setTempLinkText(e.target.value);
                }}
                placeholder='Display text for the link'
                className='border-none shadow-none focus-visible:ring-0 px-0'
              />
            </div>

            <div className='space-y-1'>
              <Label
                htmlFor={`link-url-${field.id}`}
                className='text-xs font-medium text-neutral-600'
              >
                URL
              </Label>
              <Input
                id={`link-url-${field.id}`}
                value={tempLinkUrl}
                onChange={(e) => {
                  return setTempLinkUrl(e.target.value);
                }}
                placeholder='https://example.com'
                className='border-none shadow-none focus-visible:ring-0 px-0'
              />
            </div>
          </div>
        );

      case 'attachment':
        return (
          <div className='space-y-4'>
            {/* Display existing attachments */}
            {field.attachments && field.attachments.length > 0 && (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {field.attachments.map((attachment: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className='group relative rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md hover:border-neutral-300 transition-all hover:-translate-y-0.5 duration-200'
                    >
                      {/* Preview area */}
                      <div className='relative bg-neutral-50 h-32 flex items-center justify-center'>
                        {isImageFile(attachment.name) ? (
                          <div className='relative w-full h-full overflow-hidden'>
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className='h-full w-full object-cover'
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors'></div>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center justify-center h-full w-full group-hover:scale-105 transition-transform'>
                            <div className='mb-2'>{getFileIcon(attachment.name)}</div>
                            <div className='text-xs font-medium bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-full'>
                              {getFileTypeLabel(attachment.name)}
                            </div>
                          </div>
                        )}

                        {/* Overlay actions */}
                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                          <Button
                            type='button'
                            variant='secondary'
                            size='sm'
                            className='h-9 w-9 rounded-full p-0'
                            onClick={() => {
                              return setPreviewAttachment(attachment);
                            }}
                          >
                            <Maximize2 size={15} />
                          </Button>
                          <Button
                            type='button'
                            variant='destructive'
                            size='sm'
                            className='h-9 w-9 rounded-full p-0'
                            onClick={() => {
                              const updatedAttachments = [...(field.attachments || [])];
                              updatedAttachments.splice(index, 1);
                              safeUpdateFieldProperty(field.id, 'attachments', updatedAttachments);
                            }}
                          >
                            <X size={15} />
                          </Button>
                        </div>
                      </div>

                      {/* File info area */}
                      <div className='px-3 py-2.5 bg-white border-t border-neutral-100'>
                        <div className='text-sm font-medium text-neutral-800 truncate pb-0.5'>
                          {attachment.name}
                        </div>
                        <div className='text-xs text-neutral-500 flex items-center'>
                          <span className='inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5'></span>
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload new attachment button */}
            <div className='pt-2'>
              <label htmlFor={`attachment-upload-${field.id}`} className='cursor-pointer block'>
                <div className='border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all group'>
                  <div className='w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors'>
                    <Paperclip className='text-blue-500' size={22} />
                  </div>
                  <p className='text-sm font-medium text-neutral-700 mb-1 group-hover:text-blue-600 transition-colors'>
                    Upload Attachments
                  </p>
                  <p className='text-xs text-neutral-500'>Drop files here or click to browse</p>
                  <p className='text-xs text-neutral-400 mt-2'>
                    Accepts documents, images, spreadsheets, and more
                  </p>
                </div>
                <input
                  id={`attachment-upload-${field.id}`}
                  type='file'
                  accept='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.jpg,.jpeg,.png,.gif,.svg,.mp4,.mov,.avi,.webm'
                  multiple
                  className='hidden'
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;

                    // Process files and create temporary URLs
                    const newAttachments = Array.from(files).map((file) => {
                      return {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: URL.createObjectURL(file),
                        file: file, // Keep reference to the file for actual upload
                      };
                    });

                    const currentAttachments = field.attachments || [];
                    safeUpdateFieldProperty(field.id, 'attachments', [
                      ...currentAttachments,
                      ...newAttachments,
                    ]);

                    // Reset input value to allow uploading the same file again if needed
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          </div>
        );

      case 'specification':
        return (
          <Textarea
            value={field.content || ''}
            onChange={(e) => {
              safeUpdateFieldProperty(field.id, 'content', e.target.value);
            }}
            placeholder='Enter important specification or requirement'
            className='w-full resize-none border-none shadow-none focus-visible:ring-0 px-0'
            rows={3}
          />
        );

      case 'databaseItem':
        return (
          <div className='space-y-4'>
            <div
              className='min-h-[120px] border-2 border-dashed border-neutral-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 hover:border-blue-300 transition-colors'
              onClick={() => {
                return openDatabaseModal(field.id);
              }}
            >
              {field.selectedItem ? (
                <div className='w-full'>
                  <div className='flex items-center gap-3'>
                    {field.selectedItem.imageUrl && (
                      <div className='relative w-12 h-12 rounded overflow-hidden flex-shrink-0'>
                        <img
                          src={field.selectedItem.imageUrl}
                          alt={
                            'name' in field.selectedItem
                              ? field.selectedItem.name
                              : 'invoiceNumber' in field.selectedItem
                              ? field.selectedItem.invoiceNumber
                              : ''
                          }
                          className='w-full h-full object-cover'
                        />
                      </div>
                    )}
                    <div className='flex-1'>
                      <div className='font-medium text-neutral-900'>
                        {'name' in field.selectedItem
                          ? field.selectedItem.name
                          : 'invoiceNumber' in field.selectedItem
                          ? field.selectedItem.invoiceNumber
                          : ''}
                      </div>
                      <div className='text-xs text-neutral-600'>
                        {field.selectedDatabaseId === 'products' && 'sku' in field.selectedItem
                          ? `SKU: ${field.selectedItem.sku}`
                          : field.selectedDatabaseId === 'customers' &&
                            'contactPerson' in field.selectedItem
                          ? `Contact: ${field.selectedItem.contactPerson}`
                          : field.selectedDatabaseId === 'projects' &&
                            'client' in field.selectedItem
                          ? `Client: ${field.selectedItem.client}`
                          : field.selectedDatabaseId === 'invoices' &&
                            'client' in field.selectedItem
                          ? `Client: ${field.selectedItem.client}`
                          : ''}
                      </div>
                    </div>
                    {field.selectedDatabaseId === 'products' && 'price' in field.selectedItem && (
                      <div className='text-sm font-medium'>{field.selectedItem.price}</div>
                    )}
                    {field.selectedDatabaseId === 'invoices' && 'amount' in field.selectedItem && (
                      <div className='text-sm font-medium'>{field.selectedItem.amount}</div>
                    )}
                  </div>

                  <Button
                    size='sm'
                    variant='outline'
                    className='w-full mt-4 border-dashed'
                    onClick={(e) => {
                      e.stopPropagation();
                      openDatabaseModal(field.id);
                    }}
                  >
                    <Database className='w-4 h-4 mr-2' />
                    Change Database Item
                  </Button>
                </div>
              ) : (
                <div className='text-center'>
                  <Database className='h-12 w-12 mx-auto text-neutral-400 mb-3' />
                  <p className='text-neutral-600 font-medium mb-2'>Select a Database Item</p>
                  <p className='text-neutral-500 text-sm mb-4'>
                    Choose from products, customers, projects, or invoices
                  </p>
                  <Button>
                    <Database className='w-4 h-4 mr-2' />
                    Browse Database Items
                  </Button>
                </div>
              )}
            </div>

            {field.selectedItem && (
              <div className='pt-1 pb-2'>
                <Label className='text-sm text-neutral-700 mb-1 block'>Display Alignment</Label>
                <div className='flex flex-wrap gap-1'>
                  <Button
                    type='button'
                    size='sm'
                    variant={field.alignment === 'left' ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      safeUpdateFieldProperty(field.id, 'alignment', 'left');
                    }}
                    className='h-8'
                  >
                    Left
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant={field.alignment === 'center' ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      safeUpdateFieldProperty(field.id, 'alignment', 'center');
                    }}
                    className='h-8'
                  >
                    Center
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant={field.alignment === 'right' ? 'default' : 'outline'}
                    onClick={(e) => {
                      e.stopPropagation();
                      safeUpdateFieldProperty(field.id, 'alignment', 'right');
                    }}
                    className='h-8'
                  >
                    Right
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Add a list item
  const addListItem = (field: any) => {
    if (!tempListItem.trim()) return;

    const updatedItems = [...(field.items || []), tempListItem];
    safeUpdateFieldProperty(field.id, 'items', updatedItems);
    setTempListItem('');
  };

  // Remove a list item
  const removeListItem = (field: any, index: number) => {
    const updatedItems = [...(field.items || [])];
    updatedItems.splice(index, 1);
    safeUpdateFieldProperty(field.id, 'items', updatedItems);
  };

  // Update a list item
  const updateListItem = (field: any, index: number, value: string) => {
    const updatedItems = [...(field.items || [])];
    updatedItems[index] = value;
    safeUpdateFieldProperty(field.id, 'items', updatedItems);
  };

  // Handler to select a field for editing
  const handleSelectFieldForEdit = (fieldId: string) => {
    // Don't do anything if this field is already being edited
    if (editingFieldId === fieldId) return;

    // If we're switching from another field that was being edited
    if (editingFieldId) {
      // Save any pending link changes
      const currentField = formData.customFields.find((f: any) => {
        return f.id === editingFieldId;
      });
      if (currentField?.type === 'link' && tempLinkUrl.trim()) {
        safeUpdateFieldProperty(currentField.id, 'text', tempLinkText);
        safeUpdateFieldProperty(currentField.id, 'url', tempLinkUrl);
      }
    }

    // Set the new field as editing
    setEditingFieldId(fieldId);
  };

  return (
    <div className='max-w-3xl mx-auto'>
      {previewAttachment && (
        <PreviewModal
          isOpen={!!previewAttachment}
          onClose={() => {
            return setPreviewAttachment(null);
          }}
          attachment={previewAttachment}
        />
      )}

      {/* Instruction text */}
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-neutral-900 mb-2'>Deliverable Content</h3>
        <p className='text-neutral-600 text-sm'>
          Add sections to describe what&apos;s included in this deliverable. These details will help
          your clients understand exactly what they&apos;re receiving.
        </p>
      </div>

      {/* Empty state */}
      {formData.customFields.length === 0 && (
        <div className='text-center py-10 bg-neutral-50 rounded-lg border border-dashed border-neutral-200 mb-6'>
          <FileText className='mx-auto h-10 w-10 text-neutral-300 mb-3' />
          <p className='text-neutral-600 font-medium mb-2'>No content sections yet</p>
          <p className='text-sm text-neutral-500 max-w-md mx-auto mb-4'>
            Add sections to describe what&apos;s included in this deliverable. These details will
            help your clients understand what they&apos;re receiving.
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='mt-2'>
                <Plus size={16} className='mr-1.5' />
                Add First Section
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='center' className='w-48'>
              {FIELD_TYPES.map((type) => {
                return (
                  <DropdownMenuItem
                    key={type.id}
                    onClick={() => {
                      addCustomField(type.id);
                      setHasUnsavedChanges(true);
                    }}
                  >
                    {type.icon}
                    {type.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Content fields list */}
      {formData.customFields.length > 0 && (
        <>
          <div className='bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6 shadow-sm'>
            {formData.customFields.map((field: any, index: number) => {
              const isNewField = lastAddedField === field.id;
              const isEditing = editingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  data-field-id={field.id}
                  className={`content-item ${
                    isEditing ? 'bg-blue-50/30' : ''
                  } transition-all duration-150 ${isNewField ? 'animate-fadeIn' : ''} ${
                    index !== 0 ? 'border-t border-neutral-200' : ''
                  }`}
                >
                  <div
                    className={`flex justify-between items-start p-4 ${isEditing ? 'pb-2' : ''}`}
                  >
                    {/* Label/header area */}
                    <div className='flex-1'>
                      {isEditing ? (
                        <Input
                          value={field.label || ''}
                          onChange={(e) => {
                            safeUpdateFieldProperty(field.id, 'label', e.target.value);
                          }}
                          className='font-medium border-none shadow-none focus-visible:ring-0 px-0 text-base bg-transparent'
                          placeholder={`Enter ${
                            FIELD_TYPES.find((t) => {
                              return t.id === field.type;
                            })?.label || 'Section'
                          } title`}
                        />
                      ) : (
                        <h4
                          className='font-medium text-neutral-900 cursor-pointer'
                          onClick={() => {
                            return handleSelectFieldForEdit(field.id);
                          }}
                        >
                          {field.label ||
                            `Untitled ${
                              FIELD_TYPES.find((t) => {
                                return t.id === field.type;
                              })?.label || 'Section'
                            }`}
                        </h4>
                      )}
                    </div>

                    {/* Actions area */}
                    <div className='flex items-center gap-1'>
                      {isEditing ? (
                        <Button
                          type='button'
                          size='sm'
                          onClick={completeFieldEdit}
                          className='text-xs'
                        >
                          <Check size={14} className='mr-1' />
                          Done
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8'>
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-48'>
                            <DropdownMenuItem
                              onClick={() => {
                                return handleSelectFieldForEdit(field.id);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                moveFieldUp(index);
                                setHasUnsavedChanges(true);
                              }}
                              disabled={index === 0}
                            >
                              <ChevronUp size={14} className='mr-2' />
                              Move Up
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                moveFieldDown(index);
                                setHasUnsavedChanges(true);
                              }}
                              disabled={index === formData.customFields.length - 1}
                            >
                              <ChevronDown size={14} className='mr-2' />
                              Move Down
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                removeCustomField(field.id);
                                setHasUnsavedChanges(true);
                              }}
                              className='text-red-600'
                            >
                              <X size={14} className='mr-2' />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Content area */}
                  <div className='px-4 pb-4'>
                    {isEditing ? (
                      renderEditMode(field)
                    ) : (
                      <div
                        className='text-neutral-700 cursor-pointer'
                        onClick={() => {
                          return handleSelectFieldForEdit(field.id);
                        }}
                      >
                        {getFormattedContent(field)}
                      </div>
                    )}
                  </div>

                  {isEditing && index !== formData.customFields.length - 1 && (
                    <div className='h-2 border-t border-dashed border-blue-200'></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add content button for non-empty state */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                id='addContentMenu'
                className='border-dashed border-neutral-300'
              >
                <Plus size={16} className='mr-1.5' />
                Add Content
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-48'>
              {FIELD_TYPES.map((type) => {
                return (
                  <DropdownMenuItem
                    key={type.id}
                    onClick={() => {
                      addCustomField(type.id);
                      setHasUnsavedChanges(true);
                    }}
                  >
                    {type.icon}
                    {type.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      {/* Database selection modal */}
      {isDatabaseModalOpen && (
        <div
          className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center'
          onClick={cancelDatabaseSelection}
        >
          <div
            className='bg-white rounded-lg shadow-xl border border-neutral-200 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col'
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            <div className='p-4 border-b border-neutral-200 flex justify-between items-center'>
              <h3 className='font-medium text-lg'>Select Database Item</h3>
              <Button
                variant='ghost'
                size='icon'
                onClick={cancelDatabaseSelection}
                className='h-8 w-8 rounded-full'
              >
                <X size={16} />
              </Button>
            </div>

            <div className='p-4 border-b border-neutral-100 bg-neutral-50'>
              {/* Database type selector */}
              <div className='mb-2'>
                <Label className='text-sm text-neutral-700'>Database Type</Label>
                <select
                  value={selectedDatabaseId || ''}
                  onChange={(e) => {
                    return setSelectedDatabaseId(e.target.value || null);
                  }}
                  className='w-full h-10 px-3 mt-1 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>Select a database</option>
                  {mockDatabases.map((database) => {
                    return (
                      <option key={database.id} value={database.id}>
                        {database.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className='p-4 flex-grow overflow-auto'>
              {selectedDatabaseId ? (
                <>
                  <div className='mb-4'>
                    <Input
                      type='text'
                      placeholder={`Search ${selectedDatabaseId}...`}
                      value={dbSearchTerm}
                      onChange={(e) => {
                        return setDbSearchTerm(e.target.value);
                      }}
                    />
                  </div>

                  <div className='grid grid-cols-1 gap-2'>
                    {mockDatabaseItems[selectedDatabaseId as keyof typeof mockDatabaseItems]
                      .filter((item) => {
                        const searchLower = dbSearchTerm.toLowerCase();
                        return (
                          item.name?.toLowerCase().includes(searchLower) ||
                          ('invoiceNumber' in item &&
                            item.invoiceNumber.toLowerCase().includes(searchLower)) ||
                          ('sku' in item && item.sku.toLowerCase().includes(searchLower))
                        );
                      })
                      .map((item) => {
                        return (
                          <div
                            key={item.id}
                            className={`p-3 border rounded-md flex items-center gap-3 cursor-pointer hover:bg-neutral-50 transition-colors ${
                              dbSelectedItem?.id === item.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => {
                              return setDbSelectedItem(item);
                            }}
                          >
                            {item.imageUrl && (
                              <div className='relative w-10 h-10 rounded overflow-hidden flex-shrink-0'>
                                <img
                                  src={item.imageUrl}
                                  alt={
                                    'name' in item
                                      ? item.name
                                      : 'invoiceNumber' in item
                                      ? item.invoiceNumber
                                      : ''
                                  }
                                  className='w-full h-full object-cover'
                                />
                              </div>
                            )}
                            <div className='flex-1 min-w-0'>
                              <div className='font-medium truncate'>
                                {'name' in item
                                  ? item.name
                                  : 'invoiceNumber' in item
                                  ? item.invoiceNumber
                                  : ''}
                              </div>
                              <div className='text-xs text-neutral-500 truncate'>
                                {'sku' in item
                                  ? `SKU: ${item.sku}`
                                  : 'client' in item
                                  ? `Client: ${item.client}`
                                  : 'contactPerson' in item
                                  ? `Contact: ${item.contactPerson}`
                                  : ''}
                              </div>
                            </div>
                            {selectedDatabaseId === 'products' && 'price' in item && (
                              <div className='text-sm font-medium'>{item.price}</div>
                            )}
                            {selectedDatabaseId === 'invoices' && 'amount' in item && (
                              <div className='text-sm font-medium'>{item.amount}</div>
                            )}
                            {dbSelectedItem?.id === item.id && (
                              <div className='h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center'>
                                <Check className='h-3 w-3 text-white' />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <div className='text-center py-8'>
                  <Database className='h-12 w-12 mx-auto text-neutral-300 mb-3' />
                  <p className='text-neutral-600 font-medium'>Select a database type</p>
                  <p className='text-neutral-500 text-sm mt-1'>Choose from the dropdown above</p>
                </div>
              )}
            </div>

            <div className='p-4 border-t border-neutral-200 flex justify-between'>
              <div className='flex items-center gap-2'>
                <Label className='text-xs text-neutral-500'>Alignment:</Label>
                <div className='flex flex-wrap gap-1'>
                  <Button
                    type='button'
                    size='sm'
                    variant={dbTempAlignment === 'left' ? 'default' : 'outline'}
                    onClick={() => {
                      return setDbTempAlignment('left');
                    }}
                    className='h-7 text-xs'
                  >
                    Left
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant={dbTempAlignment === 'center' ? 'default' : 'outline'}
                    onClick={() => {
                      return setDbTempAlignment('center');
                    }}
                    className='h-7 text-xs'
                  >
                    Center
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    variant={dbTempAlignment === 'right' ? 'default' : 'outline'}
                    onClick={() => {
                      return setDbTempAlignment('right');
                    }}
                    className='h-7 text-xs'
                  >
                    Right
                  </Button>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button variant='outline' onClick={cancelDatabaseSelection}>
                  Cancel
                </Button>
                <Button onClick={saveDatabaseSelections} disabled={!dbSelectedItem}>
                  Select Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverableContentTab;
