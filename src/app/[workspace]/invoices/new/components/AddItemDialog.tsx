import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newItem: {
    description: string;
    quantity: number;
    unitPrice: number;
    projectIds?: string[];
    moduleIds?: string[];
  };
  project?: any;
  setNewItem: (item: any) => void;
  handleAddItem: () => void;
  projectOptions: { value: string; label: string }[];
  moduleOptions: { value: string; label: string }[];
}

export default function AddItemDialog({
  open,
  onOpenChange,
  newItem,
  setNewItem,
  handleAddItem,
  projectOptions,
  moduleOptions,
  project,
}: AddItemDialogProps) {
  // Pre-select the current project when dialog opens
  useEffect(() => {
    if (
      open &&
      project?._id &&
      (!newItem.projectIds || !newItem.projectIds.includes(project._id))
    ) {
      setNewItem({
        ...newItem,
        projectIds: [...(newItem.projectIds || []), project._id],
      });
    }
  }, [open, project, newItem, setNewItem]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <div className=''>
          <DialogHeader>
            <DialogTitle className='text-base font-medium px-1'>Add New Item</DialogTitle>
          </DialogHeader>
          <div>
            <div className='space-y-4 py-2'>
              <div className='space-x-3 px-1'>
                <div className='space-y-1.5'>
                  <Label htmlFor='item-description' className='text-xs font-medium'>
                    Item Name
                  </Label>
                  <Input
                    id='item-description'
                    value={newItem.description}
                    onChange={(e) => {
                      return setNewItem({ ...newItem, description: e.target.value });
                    }}
                    placeholder='Enter item name'
                    className='h-8 text-sm'
                  />
                </div>

                <div className='grid grid-cols-2 gap-3 !m-0 pt-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='item-quantity' className='text-xs font-medium'>
                      Quantity
                    </Label>
                    <Input
                      id='item-quantity'
                      type='number'
                      min='1'
                      value={newItem.quantity}
                      onChange={(e) => {
                        return setNewItem({ ...newItem, quantity: parseInt(e.target.value) });
                      }}
                      placeholder='1'
                      className='h-8 text-sm'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='item-unit-price' className='text-xs font-medium'>
                      Price
                    </Label>
                    <Input
                      id='item-unit-price'
                      type='number'
                      min='0'
                      step='0.01'
                      value={newItem.unitPrice}
                      onChange={(e) => {
                        return setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) });
                      }}
                      placeholder='0.00'
                      className='h-8 text-sm'
                      inputMode='decimal'
                    />
                  </div>
                </div>
              </div>

              <Accordion type='single' collapsible className='w-full'>
                <AccordionItem value='options' className='border-none'>
                  <AccordionTrigger className='text-xs font-medium py-1.5 hover:no-underline px-1'>
                    Additional Options
                  </AccordionTrigger>
                  <AccordionContent className='pt-2 overflow-visible'>
                    <div className='px-1 space-y-4'>
                      {!project && (
                        <div className='space-y-2'>
                          <Label className='text-xs font-medium'>Projects</Label>
                          <Select
                            value={newItem.projectIds?.[0] || ''}
                            onValueChange={(value) => {
                              if (value) {
                                setNewItem({
                                  ...newItem,
                                  projectIds: [...(newItem.projectIds || []), value],
                                });
                              }
                            }}
                          >
                            <SelectTrigger className='h-8 text-sm'>
                              <SelectValue placeholder='Select a project' />
                            </SelectTrigger>
                            <SelectContent>
                              {projectOptions.map((project) => {
                                return (
                                  <SelectItem
                                    key={project.value}
                                    value={project.value}
                                    className='text-sm'
                                  >
                                    {project.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                            {projectOptions.length === 0 && (
                              <SelectContent className='text-sm text-muted-foreground px-2'>
                                <div className=''>No projects found</div>
                              </SelectContent>
                            )}
                          </Select>
                          {newItem.projectIds && newItem.projectIds.length > 0 && (
                            <div className='mt-1.5 space-y-1'>
                              {newItem.projectIds.map((projectId) => {
                                const project = projectOptions.find((p) => {
                                  return p.value === projectId;
                                });
                                return (
                                  <div
                                    key={projectId}
                                    className='flex items-center justify-between px-2 py-1 text-xs border rounded-sm bg-muted/50'
                                  >
                                    <span className='text-muted-foreground'>{project?.label}</span>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='h-5 w-5 p-0 hover:bg-muted'
                                      onClick={() => {
                                        setNewItem({
                                          ...newItem,
                                          projectIds: newItem.projectIds?.filter((id) => {
                                            return id !== projectId;
                                          }),
                                        });
                                      }}
                                    >
                                      <X className='h-3 w-3' />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      <div className='space-y-2'>
                        <Label className='text-xs font-medium'>Modules</Label>
                        <Select
                          value={newItem.moduleIds?.[0] || ''}
                          onValueChange={(value) => {
                            if (value) {
                              setNewItem({
                                ...newItem,
                                moduleIds: [...(newItem.moduleIds || []), value],
                              });
                            }
                          }}
                        >
                          <SelectTrigger className='h-8 text-sm'>
                            <SelectValue placeholder='Select a module' />
                          </SelectTrigger>
                          <SelectContent>
                            {moduleOptions.map((module) => {
                              return (
                                <SelectItem
                                  key={module.value}
                                  value={module.value}
                                  className='text-sm'
                                >
                                  {module.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                          {moduleOptions.length === 0 && (
                            <SelectContent className='text-sm text-muted-foreground px-2 py-1'>
                              No modules found
                            </SelectContent>
                          )}
                        </Select>
                        {newItem.moduleIds && newItem.moduleIds.length > 0 && (
                          <div className='mt-1.5 space-y-1'>
                            {newItem.moduleIds.map((moduleId) => {
                              const moduleItem = moduleOptions.find((m) => {
                                return m.value === moduleId;
                              });
                              return (
                                <div
                                  key={moduleId}
                                  className='flex items-center justify-between px-2 py-1 text-xs border rounded-sm bg-muted/50'
                                >
                                  <span className='text-muted-foreground'>{moduleItem?.label}</span>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-5 w-5 p-0 hover:bg-muted'
                                    onClick={() => {
                                      setNewItem({
                                        ...newItem,
                                        moduleIds: newItem.moduleIds?.filter((id) => {
                                          return id !== moduleId;
                                        }),
                                      });
                                    }}
                                  >
                                    <X className='h-3 w-3' />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className='flex justify-end pt-2 px-1'>
              <div className='flex gap-2'>
                <Button
                  onClick={() => {
                    onOpenChange(false);
                  }}
                  size='sm'
                  variant='outline'
                >
                  Cancel
                </Button>
                <Button type='submit' onClick={handleAddItem} size='sm'>
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
