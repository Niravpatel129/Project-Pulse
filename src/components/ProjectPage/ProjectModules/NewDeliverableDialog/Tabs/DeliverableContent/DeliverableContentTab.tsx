import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

// Import UI components
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

// Import icons
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  Link as LinkIcon,
  Maximize2,
  MoreHorizontal,
  Paperclip,
  Plus,
  X,
} from 'lucide-react';

// Import components
import DatabaseItemDialog from './components/DatabaseItemDialog';
import PreviewModal from './components/PreviewModal';
import SharedDisplayItemDetails from './components/SharedDisplayItemDetails';

// Import context
import { useDeliverableForm } from '../../DeliverableFormContext';

// Import utils
import { FIELD_TYPES } from './utils/constants';
import { formatFileSize, getFileIcon, getFileTypeLabel, isImageFile } from './utils/file-utils';
import { getFieldError, getIconForTableType } from './utils/helpers';

// Main component
const DeliverableContentTab = () => {
  const {
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
    setErrors,
  } = useDeliverableForm();

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
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

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

  // Fetch tables using React Query
  const { data: tables = [] } = useQuery<any[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await newRequest.get('/tables/workspace');
      return response.data.data;
    },
  });

  // Fetch items for selected database
  const { data: databaseItemsRaw = [] } = useQuery({
    queryKey: ['tableItems', selectedDatabaseId],
    queryFn: async () => {
      if (!selectedDatabaseId) return [];
      const response = await newRequest.get(`/tables/${selectedDatabaseId}/records`);
      return response.data.data;
    },
    enabled: !!selectedDatabaseId,
  });

  // Also fetch column definitions to understand what each field represents
  const { data: tableColumns = [] } = useQuery<any[]>({
    queryKey: ['tableColumns', selectedDatabaseId],
    queryFn: async () => {
      if (!selectedDatabaseId) return [];
      const response = await newRequest.get(`/tables/${selectedDatabaseId}`);
      return response.data.data?.columns || [];
    },
    enabled: !!selectedDatabaseId,
  });

  // Set up initial column visibility when columns change
  useEffect(() => {
    if (tableColumns.length > 0) {
      const initialVisibility: Record<string, boolean> = {};
      tableColumns.forEach((column: any) => {
        // By default show all columns except internal/system ones
        const isSystem = ['id', 'position', '_id', '__v', 'createdAt', 'updatedAt'].includes(
          column.name,
        );
        initialVisibility[column.id] = !isSystem;
      });
      setVisibleColumns(initialVisibility);
    }
  }, [tableColumns]);

  // Process raw records into usable format
  const databaseItems = databaseItemsRaw.map((row: any) => {
    // Create a base item with row ID
    const item: any = {
      id: row.rowId,
      position: row.position,
    };

    // Process each record and combine values
    row.records.forEach((record: any) => {
      // Find the column definition to get the column name
      const column = tableColumns.find((col: any) => {
        return col.id === record.columnId;
      });
      if (column && record.values[record.columnId] !== undefined) {
        // Use column name as the key if available, otherwise use columnId
        const key = column.name || record.columnId;
        item[key] = record.values[record.columnId];

        // If this is the first column or marked as primary, also set it as name for convenience
        if (column.isPrimaryKey || column.order === 0) {
          item.name = record.values[record.columnId];
        }
      }
    });

    return item;
  });

  // Transform tables into the format expected by the component
  const databases = tables.map((table: any) => {
    return {
      id: table._id,
      name: table.name,
      description: table.description || 'No description',
      icon: getIconForTableType(table.name),
    };
  });

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

      // Load saved column visibility settings if they exist
      if (field.visibleColumns) {
        setVisibleColumns(field.visibleColumns);
      }

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
      // Save the selected item
      safeUpdateFieldProperty(editingDatabaseFieldId, 'selectedItem', dbSelectedItem);

      // Save the database ID
      safeUpdateFieldProperty(editingDatabaseFieldId, 'selectedDatabaseId', selectedDatabaseId);

      // Save the alignment
      safeUpdateFieldProperty(editingDatabaseFieldId, 'alignment', dbTempAlignment);

      // Save visible columns configuration
      safeUpdateFieldProperty(editingDatabaseFieldId, 'visibleColumns', visibleColumns);

      // Save the table metadata for future reference
      const selectedTable = tables.find((table: any) => {
        return table._id === selectedDatabaseId;
      });
      if (selectedTable) {
        safeUpdateFieldProperty(editingDatabaseFieldId, 'selectedTableName', selectedTable.name);
      }

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

      if (field) {
        // Check if field has a label before completing
        const fieldIndex = formData.customFields.findIndex((f: any) => {
          return f.id === field.id;
        });
        const labelErrorKey = `customField_${fieldIndex}_label`;

        // If field has no label, don't exit edit mode
        if (!field.label || field.label.trim() === '') {
          setErrors({ ...errors, [labelErrorKey]: 'Field label is required' });
          return; // Don't close the editor
        }

        // Save any unsaved link data when completing edit
        if (field.type === 'link' && tempLinkUrl.trim()) {
          safeUpdateFieldProperty(field.id, 'text', tempLinkText);
          safeUpdateFieldProperty(field.id, 'url', tempLinkUrl);
        }
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
                  className={`${
                    field.alignment === 'center' || field.alignment === 'right'
                      ? 'inline-block'
                      : 'w-full'
                  }`}
                >
                  <SharedDisplayItemDetails
                    item={field.selectedItem}
                    useFieldVisibility={true}
                    tableColumns={tableColumns}
                    visibleColumns={field.visibleColumns || {}}
                  />
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

  // Helper function to find a good display value for an item
  const findDisplayValue = (item: any) => {
    // Try to find a string field other than id or position
    const stringFields = Object.entries(item)
      .filter(([key, value]) => {
        return typeof value === 'string' && key !== 'id' && key !== 'position';
      })
      .map(([_, value]) => {
        return value;
      });

    return stringFields[0] || `Item ${item.id}`;
  };

  // Reset visibility settings when database selection changes
  useEffect(() => {
    if (selectedDatabaseId) {
      // If editing an existing field with this database and saved visibility settings
      if (editingDatabaseFieldId) {
        const field = formData.customFields.find((f: any) => {
          return f.id === editingDatabaseFieldId;
        });
        if (field && field.selectedDatabaseId === selectedDatabaseId && field.visibleColumns) {
          // Use saved visibility settings
          setVisibleColumns(field.visibleColumns);
          return;
        }
      }

      // Default visibility - wait for columns to load first
      if (tableColumns.length > 0) {
        const initialVisibility: Record<string, boolean> = {};
        tableColumns.forEach((column: any) => {
          // By default show all columns except internal/system ones
          const isSystem = ['id', 'position', '_id', '__v', 'createdAt', 'updatedAt'].includes(
            column.name,
          );
          initialVisibility[column.id] = !isSystem;
        });
        setVisibleColumns(initialVisibility);
      }
    }
  }, [selectedDatabaseId, tableColumns, editingDatabaseFieldId, formData.customFields]);

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
          <>
            <Textarea
              value={field.content || ''}
              onChange={(e) => {
                safeUpdateFieldProperty(field.id, 'content', e.target.value);
              }}
              placeholder='Enter detailed text'
              className={`w-full resize-none border-none shadow-none focus-visible:ring-0 px-0 ${
                fieldError ? 'text-red-500' : ''
              }`}
              rows={4}
              aria-invalid={!!fieldError}
            />
            {fieldError && <p className='text-xs text-red-500 mt-1'>{fieldError}</p>}
          </>
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
                className={`flex-1 border-none shadow-none focus-visible:ring-0 px-0 ${
                  fieldError && (!field.items || field.items.length === 0) ? 'text-red-500' : ''
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addListItem(field);
                  }
                }}
                aria-invalid={!!fieldError && (!field.items || field.items.length === 0)}
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

            {fieldError && (!field.items || field.items.length === 0) && (
              <p className='text-xs text-red-500 mt-1'>{fieldError}</p>
            )}
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
                className={`border-none shadow-none focus-visible:ring-0 px-0 ${
                  fieldError ? 'text-red-500' : ''
                }`}
                aria-invalid={!!fieldError}
              />
              {fieldError && <p className='text-xs text-red-500 mt-1'>{fieldError}</p>}
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
          <>
            <Textarea
              value={field.content || ''}
              onChange={(e) => {
                safeUpdateFieldProperty(field.id, 'content', e.target.value);
              }}
              placeholder='Enter important specification or requirement'
              className={`w-full resize-none border-none shadow-none focus-visible:ring-0 px-0 ${
                fieldError ? 'text-red-500' : ''
              }`}
              rows={3}
              aria-invalid={!!fieldError}
            />
            {fieldError && <p className='text-xs text-red-500 mt-1'>{fieldError}</p>}
          </>
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
                  <div className='flex items-center'>
                    <div className='flex-1'>
                      <SharedDisplayItemDetails
                        item={field.selectedItem}
                        useFieldVisibility={true}
                        tableColumns={tableColumns}
                        visibleColumns={field.visibleColumns || {}}
                      />
                    </div>
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
                    Choose from available database tables
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
                        <>
                          <Input
                            value={field.label || ''}
                            onChange={(e) => {
                              safeUpdateFieldProperty(field.id, 'label', e.target.value);
                            }}
                            className={`font-medium border-none shadow-none focus-visible:ring-0 px-0 text-base bg-transparent ${
                              errors[`customField_${index}_label`] ? 'text-red-500' : ''
                            }`}
                            placeholder={`Enter ${
                              FIELD_TYPES.find((t) => {
                                return t.id === field.type;
                              })?.label || 'Section'
                            } title`}
                            aria-invalid={!!errors[`customField_${index}_label`]}
                          />
                          {errors[`customField_${index}_label`] && (
                            <p className='text-xs text-red-500 mt-1'>
                              {errors[`customField_${index}_label`]}
                            </p>
                          )}
                        </>
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
                          className={`text-xs ${
                            errors[`customField_${index}_label`]
                              ? 'border-red-500 bg-red-50 hover:bg-red-100 text-red-600'
                              : ''
                          }`}
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
            <DropdownMenuContent align='start' className='w-48' sideOffset={4}>
              {FIELD_TYPES.map((type) => {
                return (
                  <DropdownMenuItem
                    key={type.id}
                    onClick={() => {
                      // Add a slight delay to allow dropdown animation to complete
                      // before changing the layout with the new field
                      setTimeout(() => {
                        addCustomField(type.id);
                        setHasUnsavedChanges(true);
                      }, 150);
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
        <DatabaseItemDialog
          isOpen={isDatabaseModalOpen}
          onClose={cancelDatabaseSelection}
          selectedDatabaseId={selectedDatabaseId}
          setSelectedDatabaseId={setSelectedDatabaseId}
          selectedItem={dbSelectedItem}
          onSelectItem={(item) => {
            setDbSelectedItem(item);
          }}
          onSave={saveDatabaseSelections}
          alignment={dbTempAlignment}
          setAlignment={(alignment) => {
            safeUpdateFieldProperty(editingDatabaseFieldId, 'alignment', alignment);
          }}
          initialVisibleColumns={visibleColumns}
        />
      )}
    </div>
  );
};

export default DeliverableContentTab;
