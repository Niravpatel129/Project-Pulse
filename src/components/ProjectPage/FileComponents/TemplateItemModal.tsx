import { Button } from '@/components/ui/button';
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
import {
  InventoryItem,
  ProjectFile,
  Template,
  TemplateField,
  TemplateFieldValue,
} from '@/lib/mock/projectFiles';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface TemplateItemModalProps {
  template: Template;
  onClose: () => void;
  onSave: (item: ProjectFile) => void;
  existingItem?: ProjectFile;
  inventoryItems?: InventoryItem[];
  updateInventoryStock?: (itemId: string, quantity: number) => InventoryItem | undefined;
  trackInventoryUsage?: (
    templateItemId: string,
    inventoryItemId: string,
    projectId?: string,
  ) => void;
}

const TemplateItemModal: React.FC<TemplateItemModalProps> = ({
  template,
  onClose,
  onSave,
  existingItem,
  inventoryItems = [],
  updateInventoryStock,
  trackInventoryUsage,
}) => {
  const [name, setName] = useState(existingItem?.name || `${template.name} Item`);
  const [fieldValues, setFieldValues] = useState<TemplateFieldValue[]>(
    existingItem?.templateValues || [],
  );
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<{ [fieldId: string]: string }>({});

  useEffect(() => {
    // Initialize with existing values if editing
    if (existingItem?.templateValues) {
      setFieldValues(existingItem.templateValues);
    } else {
      // Initialize with default values from template
      const initialValues = template.fields.map((field) => {return {
        fieldId: field.id,
        value: field.defaultValue !== undefined ? field.defaultValue : null,
      }});
      setFieldValues(initialValues);
    }
  }, [existingItem, template.fields]);

  const handleFieldChange = (
    fieldId: string,
    value: string | number | null,
    fileUrl?: string,
    inventoryItemId?: string,
    quantity?: number,
  ) => {
    const newValues = fieldValues.map((field) => {
      if (field.fieldId === fieldId) {
        return {
          ...field,
          value,
          fileUrl,
          inventoryItemId,
          quantity,
        };
      }
      return field;
    });

    // If field wasn't found, add it
    if (!newValues.some((f) => {return f.fieldId === fieldId})) {
      newValues.push({
        fieldId,
        value,
        fileUrl,
        inventoryItemId,
        quantity,
      });
    }

    setFieldValues(newValues);
  };

  const handleFileChange = (fieldId: string, file: File | null) => {
    setFiles({ ...files, [fieldId]: file });

    if (file) {
      // Create a URL for preview
      const fileUrl = URL.createObjectURL(file);
      handleFieldChange(fieldId, file.name, fileUrl);
    } else {
      // Clear the field if file is removed
      handleFieldChange(fieldId, null);
    }
  };

  const handleVariantChange = (fieldId: string, variantId: string) => {
    setSelectedVariants({
      ...selectedVariants,
      [fieldId]: variantId,
    });
  };

  const getFieldValue = (fieldId: string) => {
    const field = fieldValues.find((f) => {return f.fieldId === fieldId});
    return field ? field.value : null;
  };

  const getFieldFileUrl = (fieldId: string) => {
    const field = fieldValues.find((f) => {return f.fieldId === fieldId});
    return field ? field.fileUrl : undefined;
  };

  const validateFields = () => {
    const errors: string[] = [];
    template.fields.forEach((field) => {
      if (field.required) {
        const value = getFieldValue(field.id);
        if (value === null || value === undefined || value === '') {
          errors.push(`${field.name} is required`);
        }
      }
    });
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (!validateFields()) {
      return;
    }

    // Track inventory usage for any inventory items selected
    fieldValues.forEach((fieldValue) => {
      if (fieldValue.inventoryItemId && trackInventoryUsage) {
        const field = template.fields.find((f) => {return f.id === fieldValue.fieldId});

        if (field?.type === 'inventory_item') {
          // Get the quantity (default to 1 if not specified)
          const quantity = fieldValue.quantity || 1;

          // If there's a variant selected for this field, use it for inventory tracking
          const variantId = selectedVariants[fieldValue.fieldId];
          const inventoryItemId = fieldValue.inventoryItemId;
          const item = findInventoryItem(inventoryItemId);

          if (item) {
            if (variantId && item.variants?.some((v) => {return v.id === variantId})) {
              // Decrease the variant stock by the specified quantity
              updateInventoryStock?.(variantId, quantity);
            } else {
              // Decrease the main item stock by the specified quantity
              updateInventoryStock?.(inventoryItemId, quantity);
            }

            // Track the usage
            trackInventoryUsage(
              existingItem?.id || `temp-${Date.now()}`,
              inventoryItemId,
              'current-project',
            );
          }
        }
      }
    });

    const newItem: ProjectFile = {
      id: existingItem?.id || `item-${Date.now()}`,
      name,
      type: 'custom_template_item',
      dateUploaded: existingItem?.dateUploaded || new Date().toISOString(),
      size: existingItem?.size || '0 KB',
      uploadedBy: 'Current User', // Would come from auth in a real app
      templateId: template.id,
      templateValues: fieldValues,
      lastModified: new Date().toISOString(),
      attachments: existingItem?.attachments || [],
      comments: existingItem?.comments || [],
      versions: existingItem?.versions || [],
    };

    // If updating an existing item, add a new version
    if (existingItem) {
      const versionDescription = 'Updated template item';
      const newVersion = {
        id: `v${Date.now()}`,
        date: new Date().toISOString(),
        createdBy: 'Current User', // Would come from auth in a real app
        changes: versionDescription,
        data: { ...existingItem }, // Keep a snapshot of the old data
      };

      newItem.versions = [...(newItem.versions || []), newVersion];
    }

    onSave(newItem);
    onClose();
  };

  const findInventoryItem = (itemId: string): InventoryItem | undefined => {
    return inventoryItems.find((item) => {return item.id === itemId});
  };

  const renderFieldInput = (field: TemplateField) => {
    const currentValue = getFieldValue(field.id);
    const fileUrl = getFieldFileUrl(field.id);

    // Get field-specific props
    const getFieldProps = () => {
      const props: Record<string, unknown> = {
        id: `field-${field.id}`,
        placeholder: `Enter ${field.name}...`,
      };

      if (field.type === 'number') {
        props.type = 'number';
        props.min = 0;
      } else if (field.type === 'date') {
        props.type = 'date';
      } else if (field.type === 'link') {
        props.type = 'url';
      } else if (field.type === 'price') {
        props.type = 'number';
        props.min = 0;
        props.step = 0.01;
      } else if (field.type === 'dimension') {
        props.type = 'text';
        props.placeholder = `Enter dimensions${field.unit ? ` in ${field.unit}` : ''}...`;
      }

      return props;
    };

    // Icon components are imported directly where needed,
    // so no need for a separate function to get icons

    switch (field.type) {
      case 'enum':
        return (
          <Select
            value={currentValue?.toString() || ''}
            onValueChange={(value) => {return handleFieldChange(field.id, value)}}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.name}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => {return (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              )})}
            </SelectContent>
          </Select>
        );

      case 'file':
        return (
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <Input
                type='file'
                onChange={(e) =>
                  {return handleFileChange(
                    field.id,
                    e.target.files && e.target.files.length > 0 ? e.target.files[0] : null,
                  )}
                }
                accept={field.fileTypes?.map((type) => {return `.${type}`}).join(',')}
              />
            </div>
            {fileUrl && (
              <div className='mt-2'>
                <Image
                  src={fileUrl}
                  alt='File preview'
                  width={128}
                  height={128}
                  className='max-h-32 max-w-full rounded-md border'
                />
                <span className='text-sm text-gray-500 block mt-1'>{currentValue as string}</span>
              </div>
            )}
          </div>
        );

      case 'inventory_item':
        const filteredItems = field.inventoryCategory
          ? inventoryItems.filter((item) => {return item.category === field.inventoryCategory})
          : inventoryItems;

        const selectedItemId = currentValue as string;
        const selectedItem = selectedItemId ? findInventoryItem(selectedItemId) : undefined;
        const hasVariants =
          selectedItem && selectedItem.variants && selectedItem.variants.length > 0;
        const selectedVariantId = selectedVariants[field.id];

        // Find the current quantity if any
        const currentFieldValue = fieldValues.find((fv) => {return fv.fieldId === field.id});
        const currentQuantity = currentFieldValue?.quantity || 1;

        return (
          <div className='space-y-3'>
            <Select
              value={currentValue?.toString() || ''}
              onValueChange={(value) => {
                handleFieldChange(field.id, value, undefined, value, currentQuantity);

                // Clear variant selection when changing the main item
                if (selectedVariants[field.id]) {
                  setSelectedVariants({
                    ...selectedVariants,
                    [field.id]: '',
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.name}...`} />
              </SelectTrigger>
              <SelectContent>
                {filteredItems.map((item) => {return (
                  <SelectItem key={item.id} value={item.id}>
                    <div className='flex items-center gap-2'>
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={24}
                          height={24}
                          className='h-6 w-6 rounded-md object-cover'
                        />
                      )}
                      <div className='flex flex-col'>
                        <span>{item.name}</span>
                        <span className='text-xs text-gray-500'>SKU: {item.sku}</span>
                      </div>
                    </div>
                  </SelectItem>
                )})}
              </SelectContent>
            </Select>

            {hasVariants && (
              <div className='pl-2 border-l-2 border-gray-200'>
                <Label htmlFor={`variant-${field.id}`} className='text-sm font-medium mb-1 block'>
                  Select Size/Variant
                </Label>
                <Select
                  value={selectedVariantId || ''}
                  onValueChange={(value) => {return handleVariantChange(field.id, value)}}
                >
                  <SelectTrigger id={`variant-${field.id}`}>
                    <SelectValue placeholder='Select size/variant...' />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedItem.variants.map((variant) => {return (
                      <SelectItem key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                        <div className='flex justify-between w-full'>
                          <span>{variant.name}</span>
                          <span
                            className={`text-xs ${
                              variant.stock <= 0
                                ? 'text-red-500'
                                : variant.stock < 10
                                ? 'text-amber-500'
                                : 'text-green-500'
                            }`}
                          >
                            {variant.stock <= 0 ? 'Out of stock' : `Stock: ${variant.stock}`}
                          </span>
                        </div>
                      </SelectItem>
                    )})}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Add quantity input */}
            {selectedItem && (
              <div className='space-y-2'>
                <Label htmlFor={`quantity-${field.id}`} className='text-sm font-medium mb-1 block'>
                  Quantity
                </Label>
                <Input
                  id={`quantity-${field.id}`}
                  type='number'
                  min='1'
                  value={currentQuantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 1;
                    handleFieldChange(field.id, currentValue, undefined, selectedItemId, qty);
                  }}
                  className='w-24'
                />
              </div>
            )}

            {selectedItem && (
              <div className='mt-1 p-2 bg-gray-50 rounded-md text-sm'>
                <div className='flex items-center gap-2'>
                  {selectedItem.imageUrl && (
                    <Image
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      width={40}
                      height={40}
                      className='h-10 w-10 rounded-md object-cover'
                    />
                  )}
                  <div>
                    <div className='font-medium'>{selectedItem.name}</div>
                    <div className='text-xs text-gray-500'>
                      SKU: {selectedItem.sku} | Price: ${selectedItem.price.toFixed(2)}
                    </div>
                    {hasVariants && selectedVariantId && (
                      <div className='text-xs font-medium mt-1 text-blue-600'>
                        Selected:{' '}
                        {selectedItem.variants.find((v) => {return v.id === selectedVariantId})?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <Input
            {...getFieldProps()}
            value={currentValue !== null ? currentValue : ''}
            onChange={(e) => {
              const val =
                field.type === 'number' || field.type === 'price'
                  ? parseFloat(e.target.value)
                  : e.target.value;
              handleFieldChange(field.id, val);
            }}
          />
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle>
            {existingItem ? 'Edit' : 'Create'} {template.name} Item
          </DialogTitle>
          <DialogDescription>
            Fill in the fields below to {existingItem ? 'update' : 'create'} a {template.name} item.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='item-name'>Item Name</Label>
            <Input
              id='item-name'
              value={name}
              onChange={(e) => {return setName(e.target.value)}}
              placeholder='Enter a name for this item...'
            />
          </div>

          <div className='space-y-4'>
            {template.fields.map((field) => {return (
              <div key={field.id} className='space-y-2'>
                <Label htmlFor={`field-${field.id}`} className='flex items-center'>
                  {field.name}
                  {field.required && <span className='text-red-500 ml-1'>*</span>}
                </Label>
                {field.description && <p className='text-sm text-gray-500'>{field.description}</p>}
                {renderFieldInput(field)}
              </div>
            )})}
          </div>

          {formErrors.length > 0 && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md'>
              <p className='font-medium'>Please correct the following errors:</p>
              <ul className='list-disc list-inside text-sm mt-1'>
                {formErrors.map((error, index) => {return (
                  <li key={index}>{error}</li>
                )})}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{existingItem ? 'Update' : 'Create'} Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateItemModal;
