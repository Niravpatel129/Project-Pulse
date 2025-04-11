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
import { useEffect, useMemo } from 'react';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newItem: {
    description: string;
    quantity: number;
    unitPrice: number;
    projectIds?: string[];
    moduleIds?: string[];
    options?: {
      [key: string]: string | number | boolean;
    };
  };
  project?: any;
  modules: any[];
  setNewItem: (item: any) => void;
  handleAddItem: () => void;
  projectOptions: { value: string; label: string }[];
  currency?: string;
}

export default function AddItemDialog({
  open,
  onOpenChange,
  newItem,
  setNewItem,
  handleAddItem,
  projectOptions,
  modules,
  project,
  currency = 'usd',
}: AddItemDialogProps) {
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

  const totalPrice = useMemo(() => {
    return (newItem.quantity * newItem.unitPrice).toFixed(2);
  }, [newItem.quantity, newItem.unitPrice]);

  // Currency symbol mapping
  const currencySymbols: { [key: string]: string } = {
    usd: '$',
    cad: 'C$',
    eur: '€',
    gbp: '£',
  };

  // Get the appropriate currency symbol
  const currencySymbol = currencySymbols[currency.toLowerCase()] || '$';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-sm font-medium'>Add New Item</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-2'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='item-description' className='text-xs'>
                Item Name
              </Label>
              <Input
                id='item-description'
                value={newItem.description}
                onChange={(e) => {
                  return setNewItem({ ...newItem, description: e.target.value });
                }}
                placeholder='Enter item name'
                className='h-8 text-xs'
              />
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs'>Price Calculator</Label>
                <div className='text-xs text-muted-foreground'>
                  {newItem.quantity} × {currencySymbol}
                  {newItem.unitPrice.toFixed(2)} = {currencySymbol}
                  {totalPrice}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='item-quantity' className='text-xs'>
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
                  className='h-8 text-xs'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='item-unit-price' className='text-xs'>
                  Price
                </Label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                    <span className='text-gray-500 text-xs'>{currencySymbol}</span>
                  </div>
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
                    className='h-8 text-xs pl-7'
                    inputMode='decimal'
                  />
                </div>
              </div>
            </div>
          </div>

          {modules && modules.length > 0 && (
            <div className='space-y-6'>
              {!project && (
                <div className='space-y-2'>
                  <Label className='text-xs'>Projects</Label>
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
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue placeholder='Select a project' />
                    </SelectTrigger>
                    <SelectContent>
                      {projectOptions.map((project) => {
                        return (
                          <SelectItem key={project.value} value={project.value} className='text-xs'>
                            {project.label}
                          </SelectItem>
                        );
                      })}
                      {projectOptions.length === 0 && (
                        <div className='text-xs text-muted-foreground p-2'>No projects found</div>
                      )}
                    </SelectContent>
                  </Select>

                  {newItem.projectIds && newItem.projectIds.length > 0 && (
                    <div className='mt-2 space-y-1'>
                      {newItem.projectIds.map((projectId) => {
                        const project = projectOptions.find((p) => {
                          return p.value === projectId;
                        });
                        return (
                          <div
                            key={projectId}
                            className='flex items-center justify-between px-2 py-1 text-xs border rounded bg-muted/40'
                          >
                            <span className='text-muted-foreground'>{project?.label}</span>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-5 w-5 p-0'
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
                <Label className='text-xs'>Modules</Label>
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
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue placeholder='Select a module' />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => {
                      return (
                        <SelectItem key={module._id} value={module._id} className='text-xs'>
                          {module.name}
                        </SelectItem>
                      );
                    })}
                    {modules.length === 0 && (
                      <div className='text-xs text-muted-foreground p-2'>No modules found</div>
                    )}
                  </SelectContent>
                </Select>

                {newItem.moduleIds && newItem.moduleIds.length > 0 && (
                  <div className='mt-2 space-y-1'>
                    {newItem.moduleIds.map((moduleId) => {
                      const moduleItem = modules.find((m) => {
                        return m._id === moduleId;
                      });
                      return (
                        <div
                          key={moduleId}
                          className='flex items-center justify-between px-2 py-1 text-xs border rounded bg-muted/40'
                        >
                          <span className='text-muted-foreground'>{moduleItem?.name}</span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-5 w-5 p-0'
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
          )}
        </div>

        <div className='flex justify-end gap-2 pt-4'>
          <Button
            onClick={() => {
              return onOpenChange(false);
            }}
            size='sm'
            variant='outline'
            className='text-xs h-8'
          >
            Cancel
          </Button>
          <Button type='submit' onClick={handleAddItem} size='sm' className='text-xs h-8'>
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
