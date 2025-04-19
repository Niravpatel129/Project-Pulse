import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Building2, ChevronDown, Mail, MapPin, Phone, Plus, User2, X } from 'lucide-react';
import React from 'react';
import { FormElement } from '../types';

interface ElementEditorProps {
  editingElement: FormElement | null;
  setEditingElement: (element: FormElement | null) => void;
  showValidationSettings: boolean;
  setShowValidationSettings: (show: boolean) => void;
  saveElementChanges: (updatedElement: FormElement) => void;
  isMobile: boolean;
}

const ElementEditor: React.FC<ElementEditorProps> = ({
  editingElement,
  setEditingElement,
  showValidationSettings,
  setShowValidationSettings,
  saveElementChanges,
  isMobile,
}) => {
  if (!editingElement) return null;

  const handleSave = () => {
    if (editingElement) {
      saveElementChanges(editingElement);
    }
  };

  return (
    <Dialog
      open={!!editingElement}
      onOpenChange={(open) => {
        return !open && setEditingElement(null);
      }}
    >
      <DialogContent
        className={cn(
          'w-[95vw] max-w-[600px] rounded-xl max-h-[90vh] overflow-y-auto',
          isMobile ? 'p-4' : '',
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn('text-xl font-medium tracking-tight', isMobile ? 'text-lg' : '')}
          >
            Edit {editingElement.type}
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-2 md:py-4'>
          <div className={cn('grid items-center gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-4')}>
            <Label htmlFor='title' className={isMobile ? '' : 'text-right'}>
              Title
            </Label>
            <Input
              id='title'
              value={editingElement.title}
              onChange={(e) => {
                return setEditingElement({ ...editingElement, title: e.target.value });
              }}
              className={isMobile ? 'col-span-1' : 'col-span-3'}
            />
          </div>

          {/* Element specific settings */}
          {(editingElement.type === 'Single Response' ||
            editingElement.type === 'Long Answer' ||
            editingElement.type === 'Number' ||
            editingElement.type === 'Phone Number') && (
            <div
              className={cn('grid items-center gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-4')}
            >
              <Label htmlFor='placeholder' className={isMobile ? '' : 'text-right'}>
                Placeholder
              </Label>
              <Input
                id='placeholder'
                value={editingElement.placeholder || ''}
                onChange={(e) => {
                  return setEditingElement({ ...editingElement, placeholder: e.target.value });
                }}
                className={isMobile ? 'col-span-1' : 'col-span-3'}
                placeholder='Add a placeholder text...'
              />
            </div>
          )}

          {editingElement.type !== 'Client Details' && (
            <div
              className={cn('grid items-center gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-4')}
            >
              <Label htmlFor='description' className={isMobile ? '' : 'text-right'}>
                Description
              </Label>
              <Textarea
                id='description'
                value={editingElement.description || ''}
                onChange={(e) => {
                  return setEditingElement({ ...editingElement, description: e.target.value });
                }}
                className={isMobile ? 'col-span-1' : 'col-span-3'}
                placeholder='Add a descriptive text...'
              />
            </div>
          )}

          {/* Client Details specific fields */}
          {editingElement.type === 'Client Details' && (
            <div className='grid gap-5'>
              <div className='flex flex-col gap-3'>
                <Label>Fields to include</Label>
                <div className='space-y-2 ml-1'>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='nameField'
                      checked={editingElement.clientFields?.name || false}
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...(editingElement.clientFields || {
                              email: true,
                              name: false,
                              phone: false,
                              address: false,
                              company: false,
                              custom: [],
                            }),
                            name: checked,
                          },
                        });
                      }}
                    />
                    <Label htmlFor='nameField' className='flex items-center gap-2 cursor-pointer'>
                      <User2 className='h-4 w-4 text-gray-500' />
                      <span>Name</span>
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='emailField'
                      checked={editingElement.clientFields?.email || false}
                      disabled={true} // Email is required
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...(editingElement.clientFields || {
                              email: true,
                              name: false,
                              phone: false,
                              address: false,
                              company: false,
                              custom: [],
                            }),
                            email: checked,
                          },
                        });
                      }}
                    />
                    <Label htmlFor='emailField' className='flex items-center gap-2 cursor-pointer'>
                      <Mail className='h-4 w-4 text-gray-500' />
                      <span>Email</span>
                      <Badge className='text-xs bg-blue-100 text-blue-700 border-blue-200'>
                        Required
                      </Badge>
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='phoneField'
                      checked={editingElement.clientFields?.phone || false}
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...(editingElement.clientFields || {
                              email: true,
                              name: false,
                              phone: false,
                              address: false,
                              company: false,
                              custom: [],
                            }),
                            phone: checked,
                          },
                        });
                      }}
                    />
                    <Label htmlFor='phoneField' className='flex items-center gap-2 cursor-pointer'>
                      <Phone className='h-4 w-4 text-gray-500' />
                      <span>Phone</span>
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='addressField'
                      checked={editingElement.clientFields?.address || false}
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...(editingElement.clientFields || {
                              email: true,
                              name: false,
                              phone: false,
                              address: false,
                              company: false,
                              custom: [],
                            }),
                            address: checked,
                          },
                        });
                      }}
                    />
                    <Label
                      htmlFor='addressField'
                      className='flex items-center gap-2 cursor-pointer'
                    >
                      <MapPin className='h-4 w-4 text-gray-500' />
                      <span>Address</span>
                    </Label>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='companyField'
                      checked={editingElement.clientFields?.company || false}
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...(editingElement.clientFields || {
                              email: true,
                              name: false,
                              phone: false,
                              address: false,
                              company: false,
                              custom: [],
                            }),
                            company: checked,
                          },
                        });
                      }}
                    />
                    <Label
                      htmlFor='companyField'
                      className='flex items-center gap-2 cursor-pointer'
                    >
                      <Building2 className='h-4 w-4 text-gray-500' />
                      <span>Company</span>
                    </Label>
                  </div>

                  {/* Custom client fields 
                  <div className='flex flex-col gap-2 mt-4'>
                    <Label>Custom Fields</Label>
                    <div className='flex flex-col gap-2'>
                      {editingElement.clientFields?.custom?.map((field, index) => (
                        <div key={index} className='flex items-center gap-2'>
                          <Input
                            value={field}
                            onChange={(e) => {
                              const newCustomFields = [...(editingElement.clientFields?.custom || [])];
                              newCustomFields[index] = e.target.value;
                              setEditingElement({
                                ...editingElement,
                                clientFields: {
                                  ...(editingElement.clientFields || {
                                    email: true,
                                    name: false,
                                    phone: false,
                                    address: false,
                                    company: false,
                                    custom: [],
                                  }),
                                  custom: newCustomFields,
                                },
                              });
                            }}
                            placeholder='Custom field name'
                          />
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              const newCustomFields = [...(editingElement.clientFields?.custom || [])];
                              newCustomFields.splice(index, 1);
                              setEditingElement({
                                ...editingElement,
                                clientFields: {
                                  ...(editingElement.clientFields || {
                                    email: true,
                                    name: false,
                                    phone: false,
                                    address: false,
                                    company: false,
                                    custom: [],
                                  }),
                                  custom: newCustomFields,
                                },
                              });
                            }}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-2'
                        onClick={() => {
                          setEditingElement({
                            ...editingElement,
                            clientFields: {
                              ...(editingElement.clientFields || {
                                email: true,
                                name: false,
                                phone: false,
                                address: false,
                                company: false,
                                custom: [],
                              }),
                              custom: [...(editingElement.clientFields?.custom || []), ''],
                            },
                          });
                        }}
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Add Custom Field
                      </Button>
                    </div>
                  </div>
                  */}
                </div>
              </div>
            </div>
          )}

          {/* Options for multiple choice questions */}
          {(editingElement.type === 'Radio Buttons' ||
            editingElement.type === 'Checkboxes' ||
            editingElement.type === 'Dropdown') && (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label>Options</Label>
              </div>
              <div className='space-y-2'>
                {editingElement.options?.map((option, index) => {
                  return (
                    <div key={index} className='flex items-center gap-2'>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editingElement.options || [])];
                          newOptions[index] = e.target.value;
                          setEditingElement({
                            ...editingElement,
                            options: newOptions,
                          });
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          const newOptions = [...(editingElement.options || [])];
                          newOptions.splice(index, 1);
                          setEditingElement({
                            ...editingElement,
                            options: newOptions,
                          });
                        }}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  );
                })}
                <Button
                  variant='outline'
                  size='sm'
                  className='mt-2'
                  onClick={() => {
                    setEditingElement({
                      ...editingElement,
                      options: [
                        ...(editingElement.options || []),
                        `Option ${(editingElement.options?.length || 0) + 1}`,
                      ],
                    });
                  }}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Validation rules */}
          {showValidationSettings &&
            ['Single Response', 'Long Answer', 'Number', 'Phone Number'].includes(
              editingElement.type,
            ) && (
              <div className='grid grid-cols-4 gap-3'>
                {(editingElement.type === 'Single Response' ||
                  editingElement.type === 'Long Answer') && (
                  <>
                    <Label htmlFor='minLength' className='text-right col-span-1'>
                      Min Length
                    </Label>
                    <Input
                      id='minLength'
                      type='number'
                      min='0'
                      value={editingElement.validation?.minLength || ''}
                      onChange={(e) => {
                        return setEditingElement({
                          ...editingElement,
                          validation: {
                            ...editingElement.validation,
                            minLength: e.target.value ? Number.parseInt(e.target.value) : undefined,
                          },
                        });
                      }}
                      className='col-span-3'
                      placeholder='Minimum characters'
                    />

                    <Label htmlFor='maxLength' className='text-right col-span-1'>
                      Max Length
                    </Label>
                    <Input
                      id='maxLength'
                      type='number'
                      min='0'
                      value={editingElement.validation?.maxLength || ''}
                      onChange={(e) => {
                        return setEditingElement({
                          ...editingElement,
                          validation: {
                            ...editingElement.validation,
                            maxLength: e.target.value ? Number.parseInt(e.target.value) : undefined,
                          },
                        });
                      }}
                      className='col-span-3'
                      placeholder='Maximum characters'
                    />
                  </>
                )}

                {editingElement.type === 'Number' && (
                  <>
                    <Label htmlFor='min' className='text-right col-span-1'>
                      Min Value
                    </Label>
                    <Input
                      id='min'
                      type='number'
                      value={editingElement.validation?.min || ''}
                      onChange={(e) => {
                        return setEditingElement({
                          ...editingElement,
                          validation: {
                            ...editingElement.validation,
                            min: e.target.value ? Number.parseInt(e.target.value) : undefined,
                          },
                        });
                      }}
                      className='col-span-3'
                      placeholder='Minimum value'
                    />

                    <Label htmlFor='max' className='text-right col-span-1'>
                      Max Value
                    </Label>
                    <Input
                      id='max'
                      type='number'
                      value={editingElement.validation?.max || ''}
                      onChange={(e) => {
                        return setEditingElement({
                          ...editingElement,
                          validation: {
                            ...editingElement.validation,
                            max: e.target.value ? Number.parseInt(e.target.value) : undefined,
                          },
                        });
                      }}
                      className='col-span-3'
                      placeholder='Maximum value'
                    />
                  </>
                )}

                {editingElement.type === 'Phone Number' && (
                  <>
                    <Label htmlFor='pattern' className='text-right col-span-1'>
                      Pattern
                    </Label>
                    <Input
                      id='pattern'
                      value={editingElement.validation?.pattern || ''}
                      onChange={(e) => {
                        return setEditingElement({
                          ...editingElement,
                          validation: {
                            ...editingElement.validation,
                            pattern: e.target.value,
                          },
                        });
                      }}
                      className='col-span-3'
                      placeholder='Regex pattern (e.g. [0-9]{10})'
                    />
                  </>
                )}
              </div>
            )}

          {/* Required toggle */}
          {editingElement.type !== 'Client Details' && (
            <div className='flex items-center justify-between'>
              <Label htmlFor='required'>Required Field</Label>
              <Switch
                id='required'
                checked={editingElement.required}
                onCheckedChange={(checked) => {
                  return setEditingElement({ ...editingElement, required: checked });
                }}
              />
            </div>
          )}

          {/* Add validation rules button */}
          {!showValidationSettings &&
            ['Single Response', 'Long Answer', 'Number', 'Phone Number'].includes(
              editingElement.type,
            ) && (
              <Button
                variant='outline'
                size='sm'
                className='mt-2 w-full'
                onClick={() => {
                  return setShowValidationSettings(true);
                }}
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Validation Rules
              </Button>
            )}

          {/* Hide validation button */}
          {showValidationSettings &&
            ['Single Response', 'Long Answer', 'Number', 'Phone Number'].includes(
              editingElement.type,
            ) && (
              <Button
                variant='outline'
                size='sm'
                className='mt-2 w-full'
                onClick={() => {
                  return setShowValidationSettings(false);
                }}
              >
                <ChevronDown className='h-4 w-4 mr-2' />
                Hide Validation Rules
              </Button>
            )}
        </div>

        <div className='mt-4 flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              return setEditingElement(null);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ElementEditor;
