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
import { useState } from 'react';

interface DeliverableContentTabProps {
  formData: any;
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

const DeliverableContentTab = ({
  formData,
  editingFieldId,
  setEditingFieldId,
  addCustomField,
  removeCustomField,
  moveFieldUp,
  moveFieldDown,
  updateFieldProperty,
  setHasUnsavedChanges,
}: DeliverableContentTabProps) => {
  const [newLinkText, setNewLinkText] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newListItem, setNewListItem] = useState('');

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

  // Add a list item
  const addListItem = (field: any) => {
    if (!newListItem.trim()) return;

    const updatedItems = [...(field.items || []), newListItem];
    updateFieldProperty(field.id, 'items', updatedItems);
    setNewListItem('');
  };

  // Remove a list item
  const removeListItem = (field: any, index: number) => {
    const updatedItems = [...(field.items || [])];
    updatedItems.splice(index, 1);
    updateFieldProperty(field.id, 'items', updatedItems);
  };

  // Update a list item
  const updateListItem = (field: any, index: number, value: string) => {
    const updatedItems = [...(field.items || [])];
    updatedItems[index] = value;
    updateFieldProperty(field.id, 'items', updatedItems);
  };

  // Save link data
  const saveLink = (field: any) => {
    updateFieldProperty(field.id, 'text', newLinkText);
    updateFieldProperty(field.id, 'url', newLinkUrl);
    setNewLinkText('');
    setNewLinkUrl('');
  };

  // Render edit mode content based on field type
  const renderEditMode = (field: any) => {
    switch (field.type) {
      case 'shortText':
        return (
          <Input
            value={field.content || ''}
            onChange={(e) => {
              return updateFieldProperty(field.id, 'content', e.target.value);
            }}
            placeholder='Enter short text'
            className='w-full border-none shadow-none focus-visible:ring-0 px-0 text-base'
          />
        );

      case 'longText':
        return (
          <Textarea
            value={field.content || ''}
            onChange={(e) => {
              return updateFieldProperty(field.id, 'content', e.target.value);
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
                value={newListItem}
                onChange={(e) => {
                  return setNewListItem(e.target.value);
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
                disabled={!newListItem.trim()}
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
                value={newLinkText || field.text || ''}
                onChange={(e) => {
                  return setNewLinkText(e.target.value);
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
                value={newLinkUrl || field.url || ''}
                onChange={(e) => {
                  return setNewLinkUrl(e.target.value);
                }}
                placeholder='https://example.com'
                className='border-none shadow-none focus-visible:ring-0 px-0'
              />
            </div>

            <Button
              type='button'
              size='sm'
              className='mt-1'
              disabled={!newLinkUrl.trim()}
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
              return updateFieldProperty(field.id, 'content', e.target.value);
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

      {/* Content fields list */}
      <div className='space-y-5 mb-6'>
        {formData.customFields.length > 0 ? (
          formData.customFields.map((field: any, index: number) => {
            return (
              <div
                key={field.id}
                className={`content-item bg-white rounded-lg border ${
                  editingFieldId === field.id
                    ? 'border-blue-300 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300'
                } transition-all duration-150 overflow-hidden`}
              >
                <div className='flex justify-between items-start p-4'>
                  {/* Label/header area */}
                  <div className='flex-1'>
                    {editingFieldId === field.id ? (
                      <Input
                        value={field.label}
                        onChange={(e) => {
                          return updateFieldProperty(field.id, 'label', e.target.value);
                        }}
                        className='font-medium border-none shadow-none focus-visible:ring-0 px-0 text-base'
                      />
                    ) : (
                      <h4
                        className='font-medium text-neutral-900 cursor-pointer'
                        onClick={() => {
                          return setEditingFieldId(field.id);
                        }}
                      >
                        {field.label}
                      </h4>
                    )}
                  </div>

                  {/* Actions area */}
                  <div className='flex items-center gap-1'>
                    {editingFieldId === field.id ? (
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
                              return setEditingFieldId(field.id);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              return moveFieldUp(index);
                            }}
                            disabled={index === 0}
                          >
                            <ChevronUp size={14} className='mr-2' />
                            Move Up
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              return moveFieldDown(index);
                            }}
                            disabled={index === formData.customFields.length - 1}
                          >
                            <ChevronDown size={14} className='mr-2' />
                            Move Down
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              return removeCustomField(field.id);
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
                  {editingFieldId === field.id ? (
                    renderEditMode(field)
                  ) : (
                    <div
                      className='text-neutral-700 cursor-pointer'
                      onClick={() => {
                        return setEditingFieldId(field.id);
                      }}
                    >
                      {getFormattedContent(field)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className='text-center py-8 bg-neutral-50 rounded-lg border border-dashed border-neutral-200'>
            <p className='text-neutral-500 mb-2'>No content sections added yet</p>
            <p className='text-sm text-neutral-400'>
              Use the &quot;Add Content&quot; button below to add sections to your deliverable
            </p>
          </div>
        )}
      </div>

      {/* Add content button */}
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
                  return addCustomField(type.id);
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
  );
};

export default DeliverableContentTab;
