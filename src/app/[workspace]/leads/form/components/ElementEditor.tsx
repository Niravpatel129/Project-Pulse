import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus, X } from 'lucide-react';
import React from 'react';
import { FormElement } from '../types';

interface ElementEditorProps {
  editingElement: FormElement | null;
  setEditingElement: (element: FormElement | null) => void;
  showValidationSettings: boolean;
  setShowValidationSettings: (show: boolean) => void;
  saveElementChanges: () => void;
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
              <div className='col-span-3 space-y-2 max-h-[200px] overflow-y-auto pr-1'>
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
                editingElement.type === 'Phone Number') && (
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
                                pattern: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$',
                              },
                            });
                          }}
                        >
                          Use Phone Number Pattern
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className={cn('flex gap-2', isMobile ? 'flex-col mt-6' : 'justify-end')}>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              return setEditingElement(null);
            }}
            className={isMobile ? 'w-full' : ''}
          >
            Cancel
          </Button>
          <Button type='button' onClick={saveElementChanges} className={isMobile ? 'w-full' : ''}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ElementEditor;
