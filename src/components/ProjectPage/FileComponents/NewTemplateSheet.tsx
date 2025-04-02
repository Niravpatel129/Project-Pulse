import { FieldType, Template, TemplateField } from '@/api/models';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface NewTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
}

export default function NewTemplateSheet({ isOpen, onClose, onSave }: NewTemplateSheetProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([
    {
      id: `field-${Date.now()}`,
      name: '',
      type: 'text' as FieldType,
      required: false,
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
        return field.name.trim();
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
      },
    ]);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='h-full sm:max-w-[600px]'>
        <SheetHeader>
          <SheetTitle>Create Template</SheetTitle>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Basic Info */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='template-name'>Name</Label>
              <Input
                id='template-name'
                value={templateName}
                onChange={(e) => {
                  return setTemplateName(e.target.value);
                }}
                placeholder='e.g., Bug Report'
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
                                          return updateField(index, { type: value as FieldType });
                                        }}
                                      >
                                        <SelectTrigger className='w-[140px]'>
                                          <SelectValue placeholder='Type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value='text'>Text</SelectItem>
                                          <SelectItem value='textarea'>Text Area</SelectItem>
                                          <SelectItem value='number'>Number</SelectItem>
                                          <SelectItem value='date'>Date</SelectItem>
                                          <SelectItem value='select'>Select</SelectItem>
                                          <SelectItem value='file'>File</SelectItem>
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

                                    {field.type === 'select' && (
                                      <div className='space-y-2'>
                                        <Label className='text-xs text-muted-foreground'>
                                          Options (one per line)
                                        </Label>
                                        <Textarea
                                          value={field.options?.join('\n') || ''}
                                          onChange={(e) => {
                                            return updateField(index, {
                                              options: e.target.value.split('\n').filter(Boolean),
                                            });
                                          }}
                                          placeholder='Option 1&#10;Option 2&#10;Option 3'
                                          className='h-20 text-sm'
                                        />
                                      </div>
                                    )}
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

        <div className='absolute bottom-0 left-0 right-0 p-4 border-t bg-background'>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!templateName.trim()}>
              Create Template
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
