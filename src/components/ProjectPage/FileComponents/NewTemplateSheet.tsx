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
import { useTemplates } from '@/hooks/useTemplates';
import { newRequest } from '@/utils/newRequest';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GripVertical, Plus, Settings2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Empty arrays for database and field options
const fieldTypes: Array<{ id: string; name: string; icon: string; description?: string }> = [
  { id: 'text', name: 'Text', icon: '📝' },
  { id: 'number', name: 'Number', icon: '🔢' },
  { id: 'date', name: 'Date', icon: '📅' },
  { id: 'select', name: 'Select', icon: '📋' },
  { id: 'relation', name: 'Relation To Database', icon: '📖' },
  { id: 'files', name: 'File', icon: '📎' },
];

interface NewTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  initialTemplate?: Template;
}

export default function NewTemplateSheet({
  isOpen,
  onClose,
  onSave,
  initialTemplate,
}: NewTemplateSheetProps) {
  const { createTemplate } = useTemplates();
  const [templateName, setTemplateName] = useState(initialTemplate?.name || '');
  const [templateDescription, setTemplateDescription] = useState(
    initialTemplate?.description || '',
  );
  const queryClient = useQueryClient();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [lookupFields, setLookupFields] = useState<Record<string, boolean>>({});
  const [newTableName, setNewTableName] = useState('');
  const [newTableDescription, setNewTableDescription] = useState('');
  const [databaseFields, setDatabaseFields] = useState<
    Record<string, Array<{ id: string; name: string; type: string; lookup?: boolean }>>
  >({});
  const [newTableFields, setNewTableFields] = useState<TemplateField[]>([
    {
      id: `field-${Date.now()}`,
      name: '',
      type: 'text' as FieldType,
      required: false,
      options: [],
    },
  ]);
  const [templateFields, setTemplateFields] = useState<TemplateField[]>(
    initialTemplate?.fields || [
      {
        id: `field-${Date.now()}`,
        name: '',
        type: 'text' as FieldType,
        required: false,
        options: [],
      },
    ],
  );

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTemplateName('');
      setTemplateDescription('');
      setTemplateFields([
        {
          id: `field-${Date.now()}`,
          name: '',
          type: 'text' as FieldType,
          required: false,
          options: [],
        },
      ]);
    }
  }, [isOpen]);

  // Update form when initialTemplate changes
  useEffect(() => {
    if (initialTemplate) {
      setTemplateName(initialTemplate.name);
      setTemplateDescription(initialTemplate.description);

      // Process fields to ensure correct structure with fieldSettings
      const processedFields = initialTemplate.fields.map((field) => {
        const processedField = { ...field };

        // Move lookupFields to fieldSettings for relation type fields
        // @ts-expect-error - Handle potential missing property
        if (field.type === 'relation' && field.lookupFields) {
          if (!processedField.fieldSettings) {
            processedField.fieldSettings = {};
          }

          // @ts-expect-error - Handle potential missing property
          processedField.fieldSettings.lookupFields = [...field.lookupFields];
          // @ts-expect-error - Remove the property after copying
          delete processedField.lookupFields;
        }

        return processedField;
      });

      setTemplateFields(processedFields);
    }
  }, [initialTemplate]);

  // Fetch tables using React Query
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await newRequest.get('/tables/workspace');
      return response.data.data;
    },
  });

  // Fetch fields for selected database
  const { data: selectedTableData } = useQuery({
    queryKey: ['table', selectedDatabase],
    queryFn: async () => {
      if (!selectedDatabase) return null;
      const response = await newRequest.get(`/tables/${selectedDatabase}`);
      return response.data.data;
    },
    enabled: !!selectedDatabase,
  });

  // Update databaseFields when selected table data changes
  useEffect(() => {
    if (selectedTableData?.columns) {
      setDatabaseFields((prev) => {
        const newFields = {
          ...prev,
          [selectedDatabase]: selectedTableData.columns.map((column: any) => {
            return {
              id: column.id,
              name: column.name,
              type: column.type,
              lookup: true, // Default to true for all fields
            };
          }),
        };

        // Set all lookup fields to true by default
        const allFieldsSelected = selectedTableData.columns.reduce(
          (acc: Record<string, boolean>, column: any) => {
            acc[column.id] = true;
            return acc;
          },
          {},
        );
        setLookupFields(allFieldsSelected);

        return newFields;
      });
    }
  }, [selectedTableData, selectedDatabase]);

  // Transform tables into the format expected by the component
  const databases = tables.map((table: any) => {
    return {
      id: table._id,
      name: table.name,
      icon: '📊',
      description: table.description || 'No description',
    };
  });

  const addField = () => {
    setTemplateFields([
      ...templateFields,
      {
        id: `field-${Date.now()}-${templateFields.length}`,
        name: '',
        type: 'text' as FieldType,
        required: false,
        options: [],
        fieldSettings: {
          multipleFiles: false,
        },
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<TemplateField>) => {
    const updatedFields = [...templateFields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setTemplateFields(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = [...templateFields];
    updatedFields.splice(index, 1);
    setTemplateFields(updatedFields);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(templateFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTemplateFields(items);
  };

  const handleSave = async () => {
    if (!templateName.trim()) return;

    const templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      _id: initialTemplate?._id || '',
      name: templateName,
      description: templateDescription,
      fields: templateFields
        .filter((field) => {
          if (!field.name.trim()) return false;
          if (field.type === 'select' && (!field.options || field.options.length === 0))
            return false;
          return true;
        })
        .map((field) => {
          // Create proper field structure with fieldSettings
          const mappedField = { ...field };

          // For relation type fields, ensure lookupFields are in fieldSettings
          if (field.type === 'relation') {
            if (!mappedField.fieldSettings) {
              mappedField.fieldSettings = {};
            }

            // Transfer any lookupFields from field to fieldSettings
            // The property might exist due to the way we're handling data in the UI
            // @ts-expect-error - We'll remove this property after copying
            if (mappedField.lookupFields) {
              // @ts-expect-error - Handle potential missing fieldSettings
              mappedField.fieldSettings.lookupFields = [...mappedField.lookupFields];
              // @ts-expect-error - Remove the property after copying
              delete mappedField.lookupFields;
            }
          }

          // Handle files fields
          if (field.type === 'files' && !mappedField.fieldSettings) {
            mappedField.fieldSettings = {
              multipleFiles: field.fieldSettings?.multipleFiles || false,
            };
          }

          return mappedField;
        }),
    };

    try {
      if (initialTemplate) {
        // Update existing template
        await newRequest.put(`/module-templates/${initialTemplate._id}`, templateData);
        toast.success('Template updated successfully');
      } else {
        // Create new template
        await newRequest.post('/module-templates', templateData);
        toast.success('Template created successfully');
      }
      setTemplateName('');
      setTemplateDescription('');
      setTemplateFields([
        {
          id: `field-${Date.now()}`,
          name: '',
          type: 'text' as FieldType,
          required: false,
          options: [],
        },
      ]);
      onClose();

      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='h-full sm:max-w-[800px]'>
        <SheetHeader>
          <SheetTitle>{initialTemplate ? 'Edit Template' : 'Create New Template'}</SheetTitle>
        </SheetHeader>

        <div className='mt-6 space-y-6 overflow-scroll h-full pb-36 scrollbar-hide p-1'>
          {/* Basic Info */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='template-name'>Template Name</Label>
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
                placeholder='What is this template for?'
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
                      {templateFields.map((field, index) => {
                        return (
                          <Draggable
                            key={field.id || `field-${index}`}
                            draggableId={field.id || `field-${index}`}
                            index={index}
                          >
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
                                        key={`name-${field.id || index}`}
                                        value={field.name}
                                        onChange={(e) => {
                                          return updateField(index, { name: e.target.value });
                                        }}
                                        placeholder='Field name'
                                        className='flex-1'
                                      />
                                      <Select
                                        key={`type-${field.id || index}`}
                                        value={field.type}
                                        onValueChange={(value) => {
                                          if (value === 'relation') {
                                            updateField(index, { type: 'relation' });
                                            setIsLinkModalOpen(true);
                                            return;
                                          }
                                          updateField(index, { type: value as FieldType });
                                        }}
                                      >
                                        <SelectTrigger className='w-[200px]'>
                                          <SelectValue placeholder='Field type'>
                                            {field.type === 'relation' && field.relationType ? (
                                              <div className='flex items-center gap-2'>
                                                <span>
                                                  {databases.find((db) => {
                                                    return db.id === field.relationType;
                                                  })?.icon || '🔗'}
                                                </span>
                                                <span>
                                                  {
                                                    databases.find((db) => {
                                                      return db.id === field.relationType;
                                                    })?.name
                                                  }
                                                </span>
                                              </div>
                                            ) : field.type === 'files' ? (
                                              <div className='flex items-center gap-2'>
                                                <span>📎</span>
                                                <span>
                                                  {field.fieldSettings?.multipleFiles
                                                    ? 'Files'
                                                    : 'File'}
                                                </span>
                                              </div>
                                            ) : (
                                              fieldTypes.find((type) => {
                                                return type.id === field.type;
                                              })?.name
                                            )}
                                          </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                          {fieldTypes.map((type) => {
                                            return (
                                              <SelectItem
                                                key={`type-option-${type.id}`}
                                                value={type.id}
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
                                        key={`required-${field.id || index}`}
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
                                        key={`remove-${field.id || index}`}
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

                                    {field.type === 'select' && (
                                      <div
                                        key={`options-${field.id || index}`}
                                        className='space-y-2 mt-2'
                                      >
                                        <Label>Options (one per line)</Label>
                                        <Textarea
                                          value={field.options?.join('\n') || ''}
                                          onChange={(e) => {
                                            const newOptions = e.target.value
                                              .split('\n')
                                              .map((line) => {
                                                return line.trim();
                                              })
                                              .filter((line) => {
                                                return line.length > 0;
                                              });
                                            updateField(index, { options: newOptions });
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              const textarea = e.target as HTMLTextAreaElement;
                                              const cursorPosition = textarea.selectionStart;
                                              const text = textarea.value;
                                              const newText =
                                                text.slice(0, cursorPosition) +
                                                '\n' +
                                                text.slice(cursorPosition);
                                              textarea.value = newText;
                                              textarea.setSelectionRange(
                                                cursorPosition + 1,
                                                cursorPosition + 1,
                                              );
                                            }
                                          }}
                                          placeholder={`Option 1
Option 2
Option 3`}
                                          className='h-20 text-sm min-h-[80px] resize-y'
                                        />
                                      </div>
                                    )}

                                    {field.type === 'files' && (
                                      <div
                                        key={`files-${field.id || index}`}
                                        className='flex items-center space-x-2 mt-2'
                                      >
                                        <Switch
                                          id={`multiple-files-${field.id || index}`}
                                          checked={field.fieldSettings?.multipleFiles || false}
                                          onCheckedChange={(checked) => {
                                            return updateField(index, {
                                              fieldSettings: {
                                                ...field.fieldSettings,
                                                multipleFiles: checked,
                                              },
                                            });
                                          }}
                                        />
                                        <Label htmlFor={`multiple-files-${field.id || index}`}>
                                          Allow multiple files
                                        </Label>
                                      </div>
                                    )}

                                    <Collapsible
                                      key={`settings-${field.id || index}`}
                                      defaultOpen={field.type === 'files'}
                                    >
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
                    {databases.map((db) => {
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

              {selectedDatabase && databaseFields[selectedDatabase] && (
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
                            const allFields = databaseFields[selectedDatabase].map((field) => {
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
                            const firstField = databaseFields[selectedDatabase][0].id;
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
                        {databaseFields[selectedDatabase].map((field) => {
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

              <div className='flex items-center justify-end'>
                <Button
                  onClick={() => {
                    console.log('selectedDatabase', selectedDatabase);
                    if (!selectedDatabase) return;

                    const selectedDb = databases.find((db) => {
                      console.log('🚀 templateFields:', templateFields);
                      return db.id === selectedDatabase;
                    });
                    if (!selectedDb) return;

                    // Find the current field being edited
                    const currentFieldIndex = templateFields.findIndex((field) => {
                      return field.type === 'relation';
                    });
                    console.log('currentFieldIndex', currentFieldIndex);
                    if (currentFieldIndex === -1) return;

                    // Update the current field
                    updateField(currentFieldIndex, {
                      type: 'relation',
                      relationType: selectedDb.id as 'inventory' | 'customers' | 'orders',
                      multiple: allowMultiple,
                      fieldSettings: {
                        lookupFields: Object.entries(lookupFields)
                          .filter(([_, checked]) => {
                            return checked;
                          })
                          .map(([fieldId]) => {
                            return fieldId;
                          }),
                      },
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
                                templateFields.find((type) => {
                                  return type.id === field.type;
                                })?.name
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {templateFields.map((type) => {
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

                    // Add the new database to databases
                    databases.push(newDb);

                    // Create fields for the new database
                    setDatabaseFields((prev) => {
                      return {
                        ...prev,
                        [newDb.id]: newTableFields.map((field) => {
                          return {
                            id: field.name.toLowerCase().replace(/\s+/g, '-'),
                            name: field.name,
                            type: field.type,
                          };
                        }),
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
              {initialTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
