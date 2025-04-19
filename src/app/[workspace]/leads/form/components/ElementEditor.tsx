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
import { useFormBuilder } from '../context/FormBuilderContext';

const ElementEditor: React.FC = () => {
  const {
    editingElement,
    setEditingElement,
    showValidationSettings,
    setShowValidationSettings,
    saveElementChanges,
    isMobile,
  } = useFormBuilder();

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
      <DialogContent className='w-[95vw] max-w-[600px] rounded-xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-medium tracking-tight'>
            Edit {editingElement.type}
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='title' className='text-right'>
              Title
            </Label>
            <Input
              id='title'
              value={editingElement.title}
              onChange={(e) => {
                return setEditingElement({ ...editingElement, title: e.target.value });
              }}
              className='col-span-3'
            />
          </div>

          <div className='grid grid-cols-4 items-start gap-4'>
            <Label htmlFor='description' className='text-right mt-2'>
              Description
            </Label>
            <Textarea
              id='description'
              value={editingElement.description || ''}
              onChange={(e) => {
                return setEditingElement({ ...editingElement, description: e.target.value });
              }}
              className='col-span-3'
              placeholder='Optional description or instructions'
            />
          </div>

          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='required' className='text-right'>
              Required
            </Label>
            <div className='col-span-3 flex items-center space-x-2'>
              <Switch
                id='required'
                checked={editingElement.required}
                onCheckedChange={(checked) => {
                  return setEditingElement({ ...editingElement, required: checked });
                }}
              />
              <Label htmlFor='required'>Make this field required</Label>
            </div>
          </div>

          {(editingElement.type === 'Single Response' ||
            editingElement.type === 'Short Answer' ||
            editingElement.type === 'Long Answer' ||
            editingElement.type === 'Phone Number' ||
            editingElement.type === 'Email' ||
            editingElement.type === 'URL' ||
            editingElement.type === 'Number') && (
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='placeholder' className='text-right'>
                Placeholder
              </Label>
              <Input
                id='placeholder'
                value={editingElement.placeholder || ''}
                onChange={(e) => {
                  return setEditingElement({ ...editingElement, placeholder: e.target.value });
                }}
                className='col-span-3'
                placeholder='Enter placeholder text'
              />
            </div>
          )}

          {(editingElement.type === 'Radio Buttons' ||
            editingElement.type === 'Checkboxes' ||
            editingElement.type === 'Dropdown') && (
            <div className='grid grid-cols-4 items-start gap-4'>
              <Label className='text-right mt-2'>Options</Label>
              <div className='col-span-3 space-y-2 max-h-[200px] overflow-y-auto p-1'>
                {editingElement.options?.map((option, index) => {
                  return (
                    <div key={index} className='flex items-center gap-2'>
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(editingElement.options || [])];
                          newOptions[index] = e.target.value;
                          setEditingElement({ ...editingElement, options: newOptions });
                        }}
                      />
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                          const newOptions = [...(editingElement.options || [])];
                          newOptions.splice(index, 1);
                          setEditingElement({ ...editingElement, options: newOptions });
                        }}
                        disabled={editingElement.options?.length === 1}
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
                    const newOptions = [
                      ...(editingElement.options || []),
                      `Option ${(editingElement.options?.length || 0) + 1}`,
                    ];
                    setEditingElement({ ...editingElement, options: newOptions });
                  }}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          {/* Validation Settings Button */}
          {(editingElement.type === 'Single Response' ||
            editingElement.type === 'Short Answer' ||
            editingElement.type === 'Long Answer' ||
            editingElement.type === 'Phone Number' ||
            editingElement.type === 'Email' ||
            editingElement.type === 'URL' ||
            editingElement.type === 'Number') && (
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label className='text-right'>Validation</Label>
              <div className='col-span-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    return setShowValidationSettings(!showValidationSettings);
                  }}
                  className='flex items-center gap-2'
                >
                  {showValidationSettings ? 'Hide Validation Settings' : 'Show Validation Settings'}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      showValidationSettings ? 'rotate-180' : '',
                    )}
                  />
                </Button>
              </div>
            </div>
          )}

          {/* Validation Settings Panel */}
          {showValidationSettings && editingElement && (
            <div className='grid grid-cols-4 items-start gap-4 pl-4 pt-2 pb-2 bg-gray-50 rounded-md border border-gray-200 max-h-[300px] overflow-y-auto'>
              <div className='col-span-4 mb-2'>
                <h4 className='font-medium text-sm'>Validation Rules</h4>
                <p className='text-xs text-gray-500 mt-1'>Set rules to validate user input</p>
              </div>

              {(editingElement.type === 'Single Response' ||
                editingElement.type === 'Short Answer' ||
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

              {(editingElement.type === 'Single Response' ||
                editingElement.type === 'Short Answer' ||
                editingElement.type === 'Phone Number' ||
                editingElement.type === 'Email' ||
                editingElement.type === 'URL') && (
                <>
                  <Label htmlFor='pattern' className='text-right col-span-1'>
                    Pattern
                  </Label>
                  <div className='col-span-3 space-y-2'>
                    <Input
                      id='pattern'
                      value={editingElement.validation?.pattern || ''}
                      onChange={(e) => {
                        return setEditingElement({
                          ...editingElement,
                          validation: {
                            ...editingElement.validation,
                            pattern: e.target.value || undefined,
                          },
                        });
                      }}
                      placeholder='Regular expression pattern'
                    />
                    <div className='text-xs text-gray-500'>
                      {editingElement.type === 'Phone Number' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-xs h-6 px-2'
                          onClick={() => {
                            return setEditingElement({
                              ...editingElement,
                              validation: {
                                ...editingElement.validation,
                                pattern:
                                  '^(\\+\\d{1,2}\\s?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$',
                              },
                            });
                          }}
                        >
                          Use phone number pattern
                        </Button>
                      )}
                      {editingElement.type === 'Email' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-xs h-6 px-2'
                          onClick={() => {
                            return setEditingElement({
                              ...editingElement,
                              validation: {
                                ...editingElement.validation,
                                pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
                              },
                            });
                          }}
                        >
                          Use email pattern
                        </Button>
                      )}
                      {editingElement.type === 'URL' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-xs h-6 px-2'
                          onClick={() => {
                            return setEditingElement({
                              ...editingElement,
                              validation: {
                                ...editingElement.validation,
                                pattern:
                                  '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$',
                              },
                            });
                          }}
                        >
                          Use URL pattern
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Client Fields for Client Details element */}
          {editingElement.type === 'Client Details' && (
            <div className='grid grid-cols-4 items-start gap-4'>
              <Label className='text-right mt-2'>Client Fields</Label>
              <div className='col-span-3 space-y-3'>
                <div className='flex items-center gap-3 p-2 border rounded-md bg-gray-50'>
                  <Mail className='h-4 w-4 text-blue-500' />
                  <span className='font-medium text-sm'>Email</span>
                  <Badge className='ml-auto' variant='outline'>
                    Required
                  </Badge>
                </div>

                <div className='flex items-center gap-3 p-2 border rounded-md'>
                  <User2 className='h-4 w-4 text-gray-500' />
                  <span className='text-sm'>Full Name</span>
                  <div className='ml-auto flex items-center gap-2'>
                    <Switch
                      id='name-field'
                      checked={editingElement.clientFields?.name || false}
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...editingElement.clientFields,
                            name: checked,
                          },
                        });
                      }}
                    />
                  </div>
                </div>

                <div className='flex items-center gap-3 p-2 border rounded-md'>
                  <Phone className='h-4 w-4 text-gray-500' />
                  <span className='text-sm'>Phone Number</span>
                  <div className='ml-auto flex items-center gap-2'>
                    <Switch
                      id='phone-field'
                      checked={editingElement.clientFields?.phone || false}
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...editingElement.clientFields,
                            phone: checked,
                          },
                        });
                      }}
                    />
                  </div>
                </div>

                <div className='flex items-center gap-3 p-2 border rounded-md'>
                  <MapPin className='h-4 w-4 text-gray-500' />
                  <span className='text-sm'>Address</span>
                  <div className='ml-auto flex items-center gap-2'>
                    <Switch
                      id='address-field'
                      checked={editingElement.clientFields?.address || false}
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...editingElement.clientFields,
                            address: checked,
                          },
                        });
                      }}
                    />
                  </div>
                </div>

                <div className='flex items-center gap-3 p-2 border rounded-md'>
                  <Building2 className='h-4 w-4 text-gray-500' />
                  <span className='text-sm'>Company</span>
                  <div className='ml-auto flex items-center gap-2'>
                    <Switch
                      id='company-field'
                      checked={editingElement.clientFields?.company || false}
                      onCheckedChange={(checked) => {
                        return setEditingElement({
                          ...editingElement,
                          clientFields: {
                            ...editingElement.clientFields,
                            company: checked,
                          },
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='flex justify-end gap-2 mt-4'>
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
