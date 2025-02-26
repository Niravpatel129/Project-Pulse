import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import {
  FieldType,
  InventoryCategory,
  mockInventoryCategories,
  Template,
  TemplateField,
} from '@/lib/mock/projectFiles';
import { ArrowDown, ArrowUp, Package, PlusCircle, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface TemplateCreationModalProps {
  onClose: () => void;
  onSave: (template: Template) => void;
  inventoryCategories?: InventoryCategory[];
}

const TemplateCreationModal: React.FC<TemplateCreationModalProps> = ({
  onClose,
  onSave,
  inventoryCategories = mockInventoryCategories,
}) => {
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

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedFields = [...fields];
    const field = updatedFields[index];

    updatedFields.splice(index, 1);
    updatedFields.splice(newIndex, 0, field);

    setFields(updatedFields);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (fields.length === 0) {
      alert('Please add at least one field');
      return;
    }

    // Validate all fields have names
    for (const field of fields) {
      if (!field.name.trim()) {
        alert('All fields must have names');
        return;
      }
    }

    const newTemplate: Template = {
      id: `template-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      createdBy: 'Current User', // Would come from auth in a real app
      dateCreated: new Date().toISOString(),
      fields: fields,
    };

    onSave(newTemplate);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Define a new template with custom fields for your project items.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col space-y-4 flex-1 overflow-hidden'>
          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='template-name'>Template Name</Label>
              <Input
                id='template-name'
                placeholder='e.g., Clothing Print Template'
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='template-description'>Description (Optional)</Label>
              <Textarea
                id='template-description'
                placeholder='Describe what this template is for...'
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className='space-y-2 flex-1 overflow-hidden'>
            <div className='flex items-center justify-between'>
              <Label>Fields</Label>
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={addField}
                className='flex items-center gap-1'
              >
                <PlusCircle className='h-4 w-4' />
                Add Field
              </Button>
            </div>

            <div className='space-y-4 max-h-[350px] overflow-y-auto pr-2'>
              {fields.map((field, index) => (
                <div key={field.id} className='border rounded-md p-3 bg-card'>
                  <div className='flex items-start gap-2'>
                    <div className='flex flex-col gap-1 mt-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={index === 0}
                        onClick={() => moveField(index, 'up')}
                        className='h-6 w-6'
                      >
                        <ArrowUp className='h-4 w-4' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        disabled={index === fields.length - 1}
                        onClick={() => moveField(index, 'down')}
                        className='h-6 w-6'
                      >
                        <ArrowDown className='h-4 w-4' />
                      </Button>
                    </div>

                    <div className='flex-1 space-y-3'>
                      <div className='flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2'>
                        <div className='flex-1'>
                          <Label htmlFor={`field-name-${index}`} className='text-xs'>
                            Field Name
                          </Label>
                          <Input
                            id={`field-name-${index}`}
                            placeholder='e.g., Image, Size, Color'
                            value={field.name}
                            onChange={(e) => updateField(index, { name: e.target.value })}
                            className='mt-1'
                          />
                        </div>
                        <div className='w-full sm:w-1/3'>
                          <Label htmlFor={`field-type-${index}`} className='text-xs'>
                            Field Type
                          </Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateField(index, { type: value as FieldType })
                            }
                          >
                            <SelectTrigger className='mt-1'>
                              <SelectValue placeholder='Select type' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='text'>Text</SelectItem>
                              <SelectItem value='number'>Number</SelectItem>
                              <SelectItem value='file'>File</SelectItem>
                              <SelectItem value='enum'>Options/Enum</SelectItem>
                              <SelectItem value='link'>Link/URL</SelectItem>
                              <SelectItem value='date'>Date</SelectItem>
                              <SelectItem value='price'>Price</SelectItem>
                              <SelectItem value='dimension'>Dimension</SelectItem>
                              <SelectItem value='inventory_item'>
                                <div className='flex items-center'>
                                  <Package className='h-4 w-4 mr-2 text-gray-500' />
                                  <span>Inventory Item</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {field.type === 'enum' && (
                        <div>
                          <Label htmlFor={`field-options-${index}`} className='text-xs'>
                            Options (comma separated)
                          </Label>
                          <Input
                            id={`field-options-${index}`}
                            placeholder='e.g., Small, Medium, Large'
                            value={field.options?.join(', ') || ''}
                            onChange={(e) =>
                              updateField(index, {
                                options: e.target.value.split(',').map((item) => item.trim()),
                              })
                            }
                            className='mt-1'
                          />
                        </div>
                      )}

                      {field.type === 'file' && (
                        <div>
                          <Label htmlFor={`field-filetypes-${index}`} className='text-xs'>
                            Allowed File Types (comma separated)
                          </Label>
                          <Input
                            id={`field-filetypes-${index}`}
                            placeholder='e.g., png, jpg, pdf'
                            value={field.fileTypes?.join(', ') || ''}
                            onChange={(e) =>
                              updateField(index, {
                                fileTypes: e.target.value.split(',').map((item) => item.trim()),
                              })
                            }
                            className='mt-1'
                          />
                        </div>
                      )}

                      {(field.type === 'price' || field.type === 'dimension') && (
                        <div>
                          <Label htmlFor={`field-unit-${index}`} className='text-xs'>
                            Unit {field.type === 'price' ? '(formula)' : ''}
                          </Label>
                          <Input
                            id={`field-unit-${index}`}
                            placeholder={
                              field.type === 'price' ? 'e.g., W*H*($/sqin)' : 'e.g., inches, cm'
                            }
                            value={field.type === 'price' ? field.formula || '' : field.unit || ''}
                            onChange={(e) =>
                              updateField(index, {
                                [field.type === 'price' ? 'formula' : 'unit']: e.target.value,
                              })
                            }
                            className='mt-1'
                          />
                        </div>
                      )}

                      {field.type === 'inventory_item' && (
                        <div>
                          <Label htmlFor={`field-inventory-category-${index}`} className='text-xs'>
                            Filter by Category (Optional)
                          </Label>
                          <Select
                            value={field.inventoryCategory || ''}
                            onValueChange={(value) =>
                              updateField(index, {
                                inventoryCategory: value === 'all' ? undefined : value,
                              })
                            }
                          >
                            <SelectTrigger className='mt-1'>
                              <SelectValue placeholder='All Categories' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='all'>All Categories</SelectItem>
                              {inventoryCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className='text-xs text-muted-foreground mt-1'>
                            This field will let users select items from inventory when filling out
                            this template.
                          </p>
                        </div>
                      )}

                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id={`field-required-${index}`}
                          checked={field.required || false}
                          onCheckedChange={(checked) => updateField(index, { required: !!checked })}
                        />
                        <Label
                          htmlFor={`field-required-${index}`}
                          className='text-xs cursor-pointer'
                        >
                          Required field
                        </Label>
                      </div>
                    </div>

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeField(index)}
                      className='text-destructive hover:text-destructive/90 hover:bg-destructive/10'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' type='button' onClick={onClose}>
            Cancel
          </Button>
          <Button type='button' onClick={handleSave}>
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateCreationModal;
