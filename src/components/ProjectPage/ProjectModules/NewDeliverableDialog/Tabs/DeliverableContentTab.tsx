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
  FileText,
  Link as LinkIcon,
  List,
  ListChecks,
  MoreHorizontal,
  Plus,
  Type,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  { id: 'specification', label: 'Specification', icon: <AlertCircle className='mr-2' size={16} /> },
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

interface FieldEditorState {
  linkText: string;
  linkUrl: string;
  listItem: string;
}

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
  // Single editor state object to track temporary edit values
  const [editorState, setEditorState] = useState<Record<string, FieldEditorState>>({});
  const [fieldsWithAnimation, setFieldsWithAnimation] = useState<string[]>([]);
  const prevFieldsLengthRef = useRef(0);

  // Safe way to get the current editor state for a field
  const getEditorStateForField = useCallback(
    (fieldId: string): FieldEditorState => {
      return (
        editorState[fieldId] || {
          linkText: '',
          linkUrl: '',
          listItem: '',
        }
      );
    },
    [editorState],
  );

  // Safe way to update editor state for a specific field and property
  const updateEditorState = useCallback(
    (fieldId: string, key: keyof FieldEditorState, value: string) => {
      setEditorState((prev) => {
        return {
          ...prev,
          [fieldId]: {
            ...getEditorStateForField(fieldId),
            [key]: value,
          },
        };
      });
    },
    [getEditorStateForField],
  );

  // Safely update field property with validation
  const safeUpdateFieldProperty = useCallback(
    (fieldId: string, property: string, value: any) => {
      // Verify that this field exists before updating
      const fieldExists = formData.customFields.some((field: any) => {
        return field.id === fieldId;
      });
      if (!fieldExists) {
        console.error(`Attempted to update non-existent field: ${fieldId}`);
        return;
      }

      updateFieldProperty(fieldId, property, value);
      setHasUnsavedChanges(true);
    },
    [formData.customFields, updateFieldProperty, setHasUnsavedChanges],
  );

  // Initialize editor state when entering edit mode
  useEffect(() => {
    if (editingFieldId) {
      const field = formData.customFields.find((f: any) => {
        return f.id === editingFieldId;
      });

      if (field) {
        // Initialize editor state for this field
        setEditorState((prev) => {
          return {
            ...prev,
            [field.id]: {
              linkText: field.text || '',
              linkUrl: field.url || '',
              listItem: '',
            },
          };
        });

        // Find and focus the first input
        setTimeout(() => {
          const input = document.querySelector(
            `.content-item[data-field-id="${editingFieldId}"] input, .content-item[data-field-id="${editingFieldId}"] textarea`,
          );
          if (input) {
            (input as HTMLElement).focus();
          }
        }, 50);
      }
    }
  }, [editingFieldId, formData.customFields]);

  // Animation effect for new fields
  useEffect(() => {
    const currentFieldsLength = formData.customFields.length;

    if (currentFieldsLength > prevFieldsLengthRef.current && currentFieldsLength > 0) {
      const lastField = formData.customFields[currentFieldsLength - 1];

      if (lastField && !fieldsWithAnimation.includes(lastField.id)) {
        setFieldsWithAnimation((prev) => {
          return [...prev, lastField.id];
        });

        const timer = setTimeout(() => {
          setFieldsWithAnimation((prev) => {
            return prev.filter((id) => {
              return id !== lastField.id;
            });
          });
        }, 500);

        return () => {
          return clearTimeout(timer);
        };
      }
    }

    prevFieldsLengthRef.current = currentFieldsLength;
  }, [formData.customFields, fieldsWithAnimation]);

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

      case 'specification':
        return (
          <div className='flex items-start space-x-2 text-amber-700 bg-amber-50 p-3 rounded-md'>
            <AlertCircle size={18} className='mt-0.5 shrink-0' />
            <div className='text-sm'>{field.content}</div>
          </div>
        );

      default:
        return <p>{field.content}</p>;
    }
  };

  // Add a list item to a field
  const addListItem = useCallback(
    (field: any) => {
      const state = getEditorStateForField(field.id);
      if (!state.listItem.trim()) return;

      const updatedItems = [...(field.items || []), state.listItem];
      safeUpdateFieldProperty(field.id, 'items', updatedItems);
      updateEditorState(field.id, 'listItem', '');
    },
    [getEditorStateForField, safeUpdateFieldProperty, updateEditorState],
  );

  // Remove a list item from a field
  const removeListItem = useCallback(
    (field: any, index: number) => {
      const updatedItems = [...(field.items || [])];
      updatedItems.splice(index, 1);
      safeUpdateFieldProperty(field.id, 'items', updatedItems);
    },
    [safeUpdateFieldProperty],
  );

  // Update a list item in a field
  const updateListItem = useCallback(
    (field: any, index: number, value: string) => {
      const updatedItems = [...(field.items || [])];
      updatedItems[index] = value;
      safeUpdateFieldProperty(field.id, 'items', updatedItems);
    },
    [safeUpdateFieldProperty],
  );

  // Save link data for a field
  const saveLink = useCallback(
    (field: any) => {
      const state = getEditorStateForField(field.id);
      if (!state.linkUrl.trim()) return;

      safeUpdateFieldProperty(field.id, 'text', state.linkText);
      safeUpdateFieldProperty(field.id, 'url', state.linkUrl);
    },
    [getEditorStateForField, safeUpdateFieldProperty],
  );

  // Render edit mode content based on field type
  const renderEditMode = (field: any) => {
    const fieldError = getFieldError(field, errors);
    const fieldState = getEditorStateForField(field.id);

    switch (field.type) {
      case 'shortText':
        return (
          <>
            <Input
              value={field.content || ''}
              onChange={(e) => {
                return safeUpdateFieldProperty(field.id, 'content', e.target.value);
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
              return safeUpdateFieldProperty(field.id, 'content', e.target.value);
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
                value={fieldState.listItem}
                onChange={(e) => {
                  return updateEditorState(field.id, 'listItem', e.target.value);
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
                disabled={!fieldState.listItem.trim()}
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
                value={fieldState.linkText}
                onChange={(e) => {
                  return updateEditorState(field.id, 'linkText', e.target.value);
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
                value={fieldState.linkUrl}
                onChange={(e) => {
                  return updateEditorState(field.id, 'linkUrl', e.target.value);
                }}
                placeholder='https://example.com'
                className='border-none shadow-none focus-visible:ring-0 px-0'
              />
            </div>

            <Button
              type='button'
              size='sm'
              className='mt-1'
              disabled={!fieldState.linkUrl.trim()}
              onClick={() => {
                return saveLink(field);
              }}
            >
              Save Link
            </Button>
          </div>
        );

      case 'specification':
        return (
          <Textarea
            value={field.content || ''}
            onChange={(e) => {
              return safeUpdateFieldProperty(field.id, 'content', e.target.value);
            }}
            placeholder='Enter important specification or requirement'
            className='w-full resize-none border-none shadow-none focus-visible:ring-0 px-0'
            rows={3}
          />
        );

      default:
        return null;
    }
  };

  // Handle field selection for editing
  const handleSelectFieldForEdit = (fieldId: string) => {
    // Check if it's a different field than currently editing
    if (editingFieldId && editingFieldId !== fieldId) {
      // Save any pending changes before switching fields
      const previousField = formData.customFields.find((f: any) => {
        return f.id === editingFieldId;
      });
      if (previousField?.type === 'link') {
        const prevState = getEditorStateForField(editingFieldId);
        if (prevState.linkUrl.trim()) {
          safeUpdateFieldProperty(editingFieldId, 'text', prevState.linkText);
          safeUpdateFieldProperty(editingFieldId, 'url', prevState.linkUrl);
        }
      }
    }

    setEditingFieldId(fieldId);
  };

  return (
    <div className='max-w-3xl mx-auto'>
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
          <div className='space-y-5 mb-6'>
            {formData.customFields.map((field: any, index: number) => {
              const isAnimated = fieldsWithAnimation.includes(field.id);
              const isEditing = editingFieldId === field.id;

              return (
                <div
                  key={field.id}
                  data-field-id={field.id}
                  className={`content-item bg-white rounded-lg border ${
                    isEditing
                      ? 'border-blue-300 shadow-sm ring-1 ring-blue-200'
                      : 'border-neutral-200 hover:border-neutral-300'
                  } transition-all duration-150 overflow-hidden ${
                    isAnimated ? 'animate-fadeIn' : ''
                  }`}
                >
                  <div className='flex justify-between items-start p-4'>
                    {/* Label/header area */}
                    <div className='flex-1'>
                      {isEditing ? (
                        <Input
                          value={field.label || ''}
                          onChange={(e) => {
                            return safeUpdateFieldProperty(field.id, 'label', e.target.value);
                          }}
                          className='font-medium border-none shadow-none focus-visible:ring-0 px-0 text-base'
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
                          onClick={() => {
                            return setEditingFieldId(null);
                          }}
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
    </div>
  );
};

export default DeliverableContentTab;
