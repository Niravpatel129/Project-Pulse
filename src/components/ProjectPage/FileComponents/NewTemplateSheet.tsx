import { FieldType, Template, TemplateField } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';

// Mock data for testing
const mockDatabases = [
  {
    id: 'inventory',
    name: 'Inventory',
    icon: '📦',
    description: 'Product inventory and stock levels',
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: '👥',
    description: 'Customer information and orders',
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: '🛍️',
    description: 'Order tracking and management',
  },
];

const mockFields = [
  {
    id: 'text',
    name: 'Single line text',
    icon: '📝',
    description: 'A single line of text',
  },
  {
    id: 'longtext',
    name: 'Long text',
    icon: '📄',
    description: 'Multiple lines of text',
  },
  {
    id: 'number',
    name: 'Number',
    icon: '🔢',
    description: 'Numeric values',
  },
  {
    id: 'date',
    name: 'Date',
    icon: '📅',
    description: 'Date and time values',
  },
  {
    id: 'select',
    name: 'Single select',
    icon: '📋',
    description: 'Select one option from a list',
  },
  {
    id: 'multiselect',
    name: 'Multiple select',
    icon: '📑',
    description: 'Select multiple options from a list',
  },
  {
    id: 'file',
    name: 'File attachment',
    icon: '📎',
    description: 'Attach files and images',
  },
  {
    id: 'relation',
    name: 'Link to another record',
    icon: '🔗',
    description: 'Link to records in another table',
  },
];

// Add mock fields for each database
interface DatabaseField {
  id: string;
  name: string;
  type: string;
  lookup?: boolean;
}

const mockDatabaseFields: Record<string, DatabaseField[]> = {
  inventory: [
    { id: 'name', name: 'Name', type: 'text' },
    { id: 'brand', name: 'Brand', type: 'text' },
    { id: 'price', name: 'Price', type: 'number' },
    { id: 'stock', name: 'Stock', type: 'number' },
  ],
  customers: [
    { id: 'name', name: 'Name', type: 'text' },
    { id: 'email', name: 'Email', type: 'text' },
    { id: 'phone', name: 'Phone', type: 'text' },
    { id: 'company', name: 'Company', type: 'text' },
  ],
  orders: [
    { id: 'orderNumber', name: 'Order Number', type: 'text' },
    { id: 'total', name: 'Total', type: 'number' },
    { id: 'status', name: 'Status', type: 'text' },
    { id: 'date', name: 'Date', type: 'date' },
  ],
};

interface NewTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export default function NewTemplateSheet({ isOpen, onClose, onSave }: NewTemplateSheetProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [lookupFields, setLookupFields] = useState<Record<string, boolean>>({});
  const [newTableName, setNewTableName] = useState('');
  const [newTableDescription, setNewTableDescription] = useState('');
  const [newTableFields, setNewTableFields] = useState<TemplateField[]>([
    {
      id: `field-${Date.now()}`,
      name: '',
      type: 'text' as FieldType,
      required: false,
      options: [],
    },
  ]);
  const [fields, setFields] = useState<TemplateField[]>([
    {
      id: `field-${Date.now()}`,
      name: '',
      type: 'text' as FieldType,
      required: false,
      options: [],
    },
  ]);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `field-${Date.now()}-${fields.length}`,
        name: '',
        type: 'text' as FieldType,
        required: false,
        options: [],
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFields(items);
  };

  const handleSave = () => {
    if (!templateName.trim()) return;
    onSave({
      name: templateName,
      description: templateDescription,
      fields: fields.filter((field) => {
        if (!field.name.trim()) return false;
        if (field.type === 'select' && (!field.options || field.options.length === 0)) return false;
        return true;
      }),
    });
    setTemplateName('');
    setTemplateDescription('');
    setFields([
      {
        id: `field-${Date.now()}`,
        name: '',
        type: 'text' as FieldType,
        required: false,
        options: [],
      },
    ]);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='h-full sm:max-w-[800px]'>
        <SheetHeader>
          <SheetTitle>Create New Database</SheetTitle>
        </SheetHeader>

        <div className='mt-6 space-y-6 overflow-scroll h-full pb-36 scrollbar-hide'>
          {/* Basic Info */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='template-name'>Database Name</Label>
              <Input
                id='template-name'
                value={templateName}
                onChange={(e) => {
                  return setTemplateName(e.target.value);
                }}
                placeholder='e.g., Product Catalog'
                className='w-full'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='template-description'>Description</Label>
              <Textarea
                id='template-description'
                value={templateDescription}
                onChange={(e) => {
                  return setTemplateDescription(e.target.value);
                }}
                placeholder='What is this database for?'
                className='w-full'
              />
            </div>
          </div>

          {/* Fields */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label>Fields</Label>
              <Button variant='outline' size='sm' onClick={addField}>
                <Plus className='h-4 w-4 mr-2' />
                Add Field
              </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId='fields'>
                {(provided) => {
                  return (
                    <div {...provided.droppableProps} ref={provided.innerRef} className='space-y-2'>
                      {fields.map((field, index) => {
                        return (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided) => {
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className='group flex items-start gap-2 p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors'
                                >
                                  <div {...provided.dragHandleProps} className='mt-2'>
                                    <GripVertical className='h-4 w-4 text-muted-foreground' />
                                  </div>
                                  <div className='flex-1 space-y-3'>
                                    <div className='flex items-center gap-2'>
                                      <Input
                                        value={field.name}
                                        onChange={(e) => {
                                          return updateField(index, { name: e.target.value });
                                        }}
                                        placeholder='Field name'
                                        className='flex-1'
                                      />
                                      <Select
                                        value={field.type}
                                        onValueChange={(value) => {
                                          if (value === 'relation') {
                                            updateField(index, { type: 'relation' });
                                            setIsLinkModalOpen(true);
                                            return;
                                          }
                                          return updateField(index, { type: value as FieldType });
                                        }}
                                      >
                                        <SelectTrigger className='w-[200px]'>
                                          <SelectValue placeholder='Field type'>
                                            {field.type === 'relation' && field.relationType ? (
                                              <div className='flex items-center gap-2'>
                                                <span>🔗</span>
                                                <span>
                                                  {
                                                    mockDatabases.find((db) => {
                                                      return db.id === field.relationType;
                                                    })?.name
                                                  }
                                                </span>
                                              </div>
                                            ) : (
                                              mockFields.find((type) => {
                                                return type.id === field.type;
                                              })?.name
                                            )}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {mockFields.map((type) => {
                                            return (
                                              <SelectItem
                                                key={type.id}
                                                value={type.id}
                                                onClick={(e) => {
                                                  if (type.id === 'relation') {
                                                    e.preventDefault();
                                                    setIsLinkModalOpen(true);
                                                  }
                                                }}
                                              >
                                                <div className='flex items-center gap-2'>
                                                  <span>{type.icon}</span>
                                                  <span>{type.name}</span>
                                                </div>
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => {
                                          return updateField(index, { required: !field.required });
                                        }}
                                        className={
                                          field.required ? 'text-primary' : 'text-muted-foreground'
                                        }
                                      >
                                        Required
                                      </Button>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => {
                                          return removeField(index);
                                        }}
                                        className='text-destructive opacity-0 group-hover:opacity-100 transition-opacity'
                                      >
                                        <Trash2 className='h-4 w-4' />
                                      </Button>
                                    </div>

                                    <Collapsible>
                                      <CollapsibleTrigger asChild>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          className='w-full justify-start'
                                        >
                                          <Settings2 className='h-4 w-4 mr-2' />
                                          Field Settings
                                        </Button>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent className='space-y-4 pt-2'>
                                        <div className='space-y-2'>
                                          <Label>Description</Label>
                                          <Input
                                            value={field.description || ''}
                                            onChange={(e) => {
                                              return updateField(index, {
                                                description: e.target.value,
                                              });
                                            }}
                                            placeholder='Field description'
                                          />
                                        </div>

                                        {field.type === 'select' && (
                                          <div className='space-y-2'>
                                            <Label>Options (one per line)</Label>
                                            <Textarea
                                              value={field.options?.join('\n') || ''}
                                              onChange={(e) => {
                                                const newOptions = e.target.value
                                                  .split('\n')
                                                  .filter((line) => {
                                                    return line.trim();
                                                  });
                                                updateField(index, { options: newOptions });
                                              }}
                                              placeholder={`Option 1
Option 2
Option 3`}
                                              className='h-20 text-sm min-h-[80px] resize-y'
                                            />
                                          </div>
                                        )}

                                        <div className='flex items-center space-x-2'>
                                          <Switch
                                            checked={field.multiple || false}
                                            onCheckedChange={(checked) => {
                                              return updateField(index, { multiple: checked });
                                            }}
                                          />
                                          <Label>Allow multiple values</Label>
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                </div>
                              );
                            }}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Link Modal */}
        <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Link to another record</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Select Database</Label>
                <Select
                  value={selectedDatabase}
                  onValueChange={(value) => {
                    if (value === 'create-new') {
                      setIsCreateTableModalOpen(true);
                      return;
                    }
                    setSelectedDatabase(value);
                  }}
                >
                  <SelectTrigger className='text-left h-14'>
                    <SelectValue placeholder='Choose a database' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='create-new'>
                      <div className='flex gap-2'>
                        <span>➕</span>
                        <div className='flex flex-col'>
                          <span>Create New Table</span>
                          <span className='text-xs text-muted-foreground'>
                            Create a new table to link to
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                    {mockDatabases.map((db) => {
                      return (
                        <SelectItem key={db.id} value={db.id}>
                          <div className='flex gap-2'>
                            <span>{db.icon}</span>
                            <div className='flex flex-col'>
                              <span>{db.name}</span>
                              <span className='text-xs text-muted-foreground'>
                                {db.description}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedDatabase && (
                <div className='space-y-4'>
                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <Label className='text-sm font-medium'>Lookup Fields</Label>
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-xs h-7 px-2'
                          onClick={() => {
                            const allFields = mockDatabaseFields[selectedDatabase].map((field) => {
                              return field.id;
                            });
                            setLookupFields(
                              allFields.reduce((acc, fieldId) => {
                                return { ...acc, [fieldId]: true };
                              }, {}),
                            );
                          }}
                        >
                          Select All
                        </Button>
                        <span className='text-muted-foreground'>•</span>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-xs h-7 px-2'
                          onClick={() => {
                            const firstField = mockDatabaseFields[selectedDatabase][0].id;
                            setLookupFields({ [firstField]: true });
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    <p className='text-sm text-muted-foreground mb-3'>
                      Choose which fields to display from linked records
                    </p>

                    <div className='bg-background border rounded-lg p-3 max-h-[240px] overflow-y-auto'>
                      <div className='grid gap-2'>
                        {mockDatabaseFields[selectedDatabase].map((field) => {
                          return (
                            <div
                              key={field.id}
                              className='flex items-center justify-between py-1 px-2 hover:bg-accent/40 rounded-md transition-colors'
                            >
                              <Label
                                htmlFor={`lookup-${field.id}`}
                                className='flex items-center gap-2 cursor-pointer text-sm'
                              >
                                <span>{field.name}</span>
                                <span className='text-xs text-muted-foreground'>
                                  ({field.type})
                                </span>
                              </Label>
                              <Switch
                                id={`lookup-${field.id}`}
                                checked={lookupFields[field.id] || false}
                                onCheckedChange={(checked) => {
                                  // If trying to uncheck the last field, prevent it
                                  const currentCheckedCount =
                                    Object.values(lookupFields).filter(Boolean).length;
                                  if (!checked && currentCheckedCount <= 1) {
                                    return;
                                  }
                                  setLookupFields((prev) => {
                                    return {
                                      ...prev,
                                      [field.id]: checked,
                                    };
                                  });
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='multiple'
                    checked={allowMultiple}
                    onCheckedChange={setAllowMultiple}
                  />
                  <Label htmlFor='multiple'>Allow multiple records</Label>
                </div>
                <Button
                  onClick={() => {
                    if (!selectedDatabase) return;

                    const selectedDb = mockDatabases.find((db) => {
                      return db.id === selectedDatabase;
                    });
                    if (!selectedDb) return;

                    // Find the current field being edited
                    const currentFieldIndex = fields.findIndex((field) => {
                      return field.type === 'relation' && !field.relationType;
                    });
                    if (currentFieldIndex === -1) return;

                    // Update the current field
                    updateField(currentFieldIndex, {
                      type: 'relation',
                      relationType: selectedDb.id as 'inventory' | 'customers' | 'orders',
                      multiple: allowMultiple,
                      lookupFields: Object.entries(lookupFields)
                        .filter(([_, checked]) => {
                          return checked;
                        })
                        .map(([fieldId]) => {
                          return fieldId;
                        }),
                    });

                    setIsLinkModalOpen(false);
                    setSelectedDatabase('');
                    setAllowMultiple(false);
                    setLookupFields({});
                  }}
                  disabled={!selectedDatabase}
                >
                  Add Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create New Table Modal */}
        <Dialog open={isCreateTableModalOpen} onOpenChange={setIsCreateTableModalOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Create New Table</DialogTitle>
              <DialogDescription>
                Create a new table to link to. This will create a new database entry and fields for
                the table.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label>Table Name</Label>
                <Input
                  value={newTableName}
                  onChange={(e) => {
                    return setNewTableName(e.target.value);
                  }}
                  placeholder='e.g., Suppliers'
                  className='w-full'
                />
              </div>
              <div className='space-y-2'>
                <Label>Description</Label>
                <Textarea
                  value={newTableDescription}
                  onChange={(e) => {
                    return setNewTableDescription(e.target.value);
                  }}
                  placeholder='What is this table for?'
                  className='w-full'
                />
              </div>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label>Fields</Label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setNewTableFields([
                        ...newTableFields,
                        {
                          id: `field-${Date.now()}-${newTableFields.length}`,
                          name: '',
                          type: 'text' as FieldType,
                          required: false,
                          options: [],
                        },
                      ]);
                    }}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Field
                  </Button>
                </div>

                <div className='space-y-2'>
                  {newTableFields.map((field, index) => {
                    return (
                      <div
                        key={field.id}
                        className='flex items-center gap-2 p-3 border rounded-lg bg-background'
                      >
                        <Input
                          value={field.name}
                          onChange={(e) => {
                            const updatedFields = [...newTableFields];
                            updatedFields[index] = { ...field, name: e.target.value };
                            setNewTableFields(updatedFields);
                          }}
                          placeholder='Field name'
                          className='flex-1'
                        />
                        <Select
                          value={field.type}
                          onValueChange={(value) => {
                            const updatedFields = [...newTableFields];
                            updatedFields[index] = { ...field, type: value as FieldType };
                            setNewTableFields(updatedFields);
                          }}
                        >
                          <SelectTrigger className='w-[200px]'>
                            <SelectValue placeholder='Field type'>
                              {
                                mockFields.find((type) => {
                                  return type.id === field.type;
                                })?.name
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {mockFields.map((type) => {
                              return (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className='flex items-center gap-2'>
                                    <span>{type.icon}</span>
                                    <span>{type.name}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            const updatedFields = [...newTableFields];
                            updatedFields.splice(index, 1);
                            setNewTableFields(updatedFields);
                          }}
                          className='text-destructive'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    return setIsCreateTableModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!newTableName.trim()) return;

                    // Create a new database entry
                    const newDb = {
                      id: newTableName.toLowerCase().replace(/\s+/g, '-'),
                      name: newTableName,
                      icon: '📊',
                      description: newTableDescription,
                    };

                    // Add the new database to mockDatabases
                    mockDatabases.push(newDb);

                    // Create fields for the new database
                    mockDatabaseFields[newDb.id] = newTableFields.map((field) => {
                      return {
                        id: field.name.toLowerCase().replace(/\s+/g, '-'),
                        name: field.name,
                        type: field.type,
                      };
                    });

                    // Set the selected database to the new one
                    setSelectedDatabase(newDb.id);

                    // Reset the form
                    setNewTableName('');
                    setNewTableDescription('');
                    setNewTableFields([
                      {
                        id: `field-${Date.now()}`,
                        name: '',
                        type: 'text' as FieldType,
                        required: false,
                        options: [],
                      },
                    ]);

                    setIsCreateTableModalOpen(false);
                  }}
                  disabled={!newTableName.trim()}
                >
                  Create Table
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className='absolute bottom-0 left-0 right-0 p-4 border-t bg-background'>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!templateName.trim()}>
              Create Database
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
