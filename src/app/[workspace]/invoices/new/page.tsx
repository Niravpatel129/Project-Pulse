'use client';

import { ArrowLeft, MoreHorizontal, X, ZoomIn, ZoomOut } from 'lucide-react';

import CreateClientDialog from '@/components/ProjectPage/NewProjectDialog/CreateClientDialog';
import EditClientDialog from '@/components/ProjectPage/NewProjectDialog/EditClientDialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '@/components/ui/color-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useInvoiceEditor } from './hooks/useInvoiceEditor';

export default function InvoiceEditor() {
  const {
    showPreview,
    setShowPreview,
    previewScale,
    isCustomerPicked,
    setIsCustomerPicked,
    isNewCustomerDialogOpen,
    setIsNewCustomerDialogOpen,
    isEditCustomerDialogOpen,
    setIsEditCustomerDialogOpen,
    selectedCustomer,
    isNewItemDialogOpen,
    setIsNewItemDialogOpen,
    selectedItem,
    availableItems,
    selectedItems,
    newItem,
    setNewItem,
    customers,
    setCustomers,
    newCustomer,
    setNewCustomer,
    currentCustomer,
    setCurrentCustomer,
    handleCustomerSelect,
    handleAddCustomer,
    handleItemSelect,
    handleAddItem,
    handleRemoveItem,
    zoomIn,
    zoomOut,
    icon,
    setIcon,
    logo,
    setLogo,
    handleClientCreated,
    projectOptions,
    moduleOptions,
  } = useInvoiceEditor();

  return (
    <div className='flex min-h-screen flex-col font-sans bg-gray-50'>
      {/* Header */}
      <header className='sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm px-6'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' className='rounded-full hover:bg-gray-100'>
            <ArrowLeft className='h-4 w-4 text-gray-600' />
          </Button>
          <h1 className='text-base font-medium text-gray-900'>Edit invoice</h1>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            className='text-gray-600 hover:text-gray-900'
            onClick={() => {
              return setShowPreview(!showPreview);
            }}
          >
            {showPreview ? 'Hide preview' : 'Show preview'}
          </Button>
          <Button size='sm' className='bg-gray-900 hover:bg-gray-800 text-white'>
            Send invoice
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className='flex flex-1'>
        {/* Left panel - Invoice Form Editor */}
        <div
          className={`${
            showPreview ? 'w-1/2' : 'w-full'
          } border-r border-gray-100 bg-white p-8 overflow-y-auto`}
        >
          {/* Customer section */}
          <h2 className='text-sm font-medium text-gray-900 mb-3'>Customer</h2>
          {isCustomerPicked ? (
            <div className='mb-8'>
              <div className='flex items-start justify-between p-4 bg-gray-50 rounded-lg'>
                <div>
                  <p className='text-sm font-medium text-gray-900'>{currentCustomer.name}</p>
                  <p className='text-sm text-gray-500'>{currentCustomer.email}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100'>
                      <MoreHorizontal className='h-4 w-4 text-gray-500' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='w-56' align='end'>
                    <DropdownMenuItem
                      onClick={() => {
                        return setIsEditCustomerDialogOpen(true);
                      }}
                    >
                      Edit customer information
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        return setIsCustomerPicked(false);
                      }}
                    >
                      Switch customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className='mb-8'>
              <Select value={selectedCustomer} onValueChange={handleCustomerSelect}>
                <SelectTrigger className='w-full bg-white border-gray-200'>
                  <SelectValue placeholder='Select customer' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='new' className='text-gray-600'>
                    + Add new customer
                  </SelectItem>
                  {customers.length === 0 && <Separator className='my-1' />}
                  {customers.map((customer) => {
                    return (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <CreateClientDialog
            open={isNewCustomerDialogOpen}
            onOpenChange={setIsNewCustomerDialogOpen}
            onClientCreated={handleClientCreated}
          />
          <EditClientDialog
            open={isEditCustomerDialogOpen}
            onOpenChange={setIsEditCustomerDialogOpen}
            client={currentCustomer}
            onClientUpdated={(updatedClient) => {
              setCurrentCustomer(updatedClient);
              setCustomers(
                customers.map((c) => {
                  return c.id === updatedClient.id ? updatedClient : c;
                }),
              );
            }}
          />
          {/* Currency section */}
          <div className='mb-8'>
            <h2 className='text-sm font-medium text-gray-900 mb-3'>Currency</h2>
            <Select defaultValue='cad'>
              <SelectTrigger className='w-full bg-white border-gray-200'>
                <SelectValue placeholder='Select currency' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cad'>CAD - Canadian Dollar</SelectItem>
                <SelectItem value='usd'>USD - US Dollar</SelectItem>
                <SelectItem value='eur'>EUR - Euro</SelectItem>
                <SelectItem value='gbp'>GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-xs text-gray-500 mt-2'>
              Selecting a new currency will clear all items from the invoice.
            </p>
          </div>

          {/* Items section */}
          <div className='mb-8'>
            <h2 className='text-sm font-medium text-gray-900 mb-3'>Items</h2>
            <p className='text-sm text-gray-600 mb-4'>
              Add single, one-time items or products from your{' '}
              <span className='text-gray-900 font-medium cursor-pointer hover:text-gray-700'>
                product catalogue
              </span>{' '}
              to this invoice.
            </p>
            <div className='space-y-4'>
              <Select value={selectedItem} onValueChange={handleItemSelect}>
                <SelectTrigger className='w-full bg-white border-gray-200'>
                  <SelectValue placeholder='Add item' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='new' className='text-gray-600'>
                    + Add new item
                  </SelectItem>
                  <Separator className='my-1' />
                  {availableItems.map((item) => {
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {item.description}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {selectedItems.length > 0 && (
                <div className='space-y-2'>
                  {selectedItems.map((item) => {
                    return (
                      <div
                        key={`selected-${item.id}`}
                        className='flex items-start justify-between p-4 bg-gray-50 rounded-lg'
                      >
                        <div>
                          <p className='text-sm font-medium text-gray-900'>{item.description}</p>
                          <p className='text-sm text-gray-500'>Quantity: {item.quantity}</p>
                          <p className='text-sm text-gray-500'>Unit Price: ${item.unitPrice}</p>
                          <p className='text-sm text-gray-500'>Total: ${item.total}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8 hover:bg-gray-100'
                            >
                              <MoreHorizontal className='h-4 w-4 text-gray-500' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className='w-56' align='end'>
                            <DropdownMenuItem
                              onClick={() => {
                                return handleRemoveItem(item.id);
                              }}
                              className='text-red-600'
                            >
                              Remove item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Delivery section */}
          <div className='mb-8'>
            <h2 className='text-sm font-medium text-gray-900 mb-3'>Delivery</h2>
            <Select defaultValue='email'>
              <SelectTrigger className='w-full bg-white border-gray-200'>
                <SelectValue placeholder='Select delivery method' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='email'>Email</SelectItem>
                <SelectItem value='sms'>SMS</SelectItem>
                <SelectItem value='both'>Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options section */}
          <div className='mb-8'>
            <h2 className='text-sm font-medium text-gray-900 mb-3'>Options</h2>

            {/* Memo */}
            <div className='mb-4'>
              <Label htmlFor='memo' className='text-sm text-gray-700 mb-2 block'>
                Memo
              </Label>
              <Input
                id='memo'
                placeholder='Add a memo to your invoice'
                className='bg-white border-gray-200'
              />
              <p className='text-xs text-gray-500 mt-1'>
                This will appear on the invoice below the line items.
              </p>
            </div>

            {/* Footer */}
            <div className='mb-4'>
              <Label htmlFor='footer' className='text-sm text-gray-700 mb-2 block'>
                Footer
              </Label>
              <Input
                id='footer'
                placeholder='Add a footer to your invoice'
                className='bg-white border-gray-200'
              />
              <p className='text-xs text-gray-500 mt-1'>
                This will appear at the bottom of the invoice.
              </p>
            </div>
          </div>

          {/* Tax ID section */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-2'>
              <h2 className='text-sm font-medium text-gray-900'>Tax ID</h2>
              <div className='flex items-center'>
                <Label htmlFor='showTaxId' className='text-xs text-gray-600 mr-2'>
                  Show on invoice
                </Label>
                <Switch id='showTaxId' className='data-[state=checked]:bg-gray-900' />
              </div>
            </div>
            <Input
              id='taxId'
              placeholder='Enter your tax ID'
              className='bg-white border-gray-200'
            />
            <p className='text-xs text-gray-500 mt-1'>
              This will appear on the invoice if enabled.
            </p>
          </div>

          {/* Branding section */}
          <div className='mb-8'>
            <h2 className='text-sm font-medium text-gray-900 mb-3'>Branding</h2>

            {/* Icon and Logo */}
            <div className='flex gap-4 mb-4'>
              <div className='w-full max-w-[200px]'>
                <ImageUpload label='Icon' value={icon} onChange={setIcon} />
              </div>
              <div className='w-full max-w-[200px]'>
                <ImageUpload label='Logo' value={logo} onChange={setLogo} />
              </div>
            </div>

            {/* Brand Color and Accent Color */}
            <div className='grid grid-cols-2 gap-4'>
              <ColorPicker
                label='Brand Color'
                value='#006aff'
                onChange={(value) => {
                  // Handle brand color change
                  console.log('Brand color changed:', value);
                }}
              />
              <ColorPicker
                label='Accent Color'
                value='#1f2937'
                onChange={(value) => {
                  // Handle accent color change
                  console.log('Accent color changed:', value);
                }}
              />
            </div>
          </div>
        </div>

        {/* Right panel - Invoice Preview */}
        {showPreview && (
          <div className='w-1/2 bg-gray-50 overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col'>
            {/* Zoom controls */}
            <div className='flex justify-end mb-4 gap-2 p-4 absolute top-0 right-0'>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8 text-gray-600 hover:text-gray-900'
                onClick={zoomOut}
              >
                <ZoomOut className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8 text-gray-600 hover:text-gray-900'
                onClick={zoomIn}
              >
                <ZoomIn className='h-4 w-4' />
              </Button>
            </div>

            {/* Invoice Preview */}
            <div className='flex justify-center items-center flex-1 overflow-hidden py-8'>
              <div
                className='bg-white rounded-lg shadow-sm p-8 max-w-full mx-auto aspect-[1/1.334] my-auto'
                style={{ transform: `scale(${previewScale})`, transformOrigin: 'center center' }}
              >
                <div className='flex justify-between mb-6'>
                  <div>
                    <h2 className='text-base font-medium text-gray-900 mb-1'>Invoice</h2>
                    <p className='text-xs text-gray-500'>0BD1057-DRAFT</p>
                    <p className='text-xs text-gray-500'>Date due: May 10, 2025</p>
                  </div>
                  <div className='text-base font-medium text-gray-900'>BOLO</div>
                </div>

                <div className='grid grid-cols-2 gap-6 mb-6'>
                  <div>
                    <p className='text-xs font-medium text-gray-900 mb-1'>Bolo Print Inc.</p>
                    <p className='text-xs text-gray-500'>3883 Nashua Dr</p>
                    <p className='text-xs text-gray-500'>Brampton Ontario L4V1R3</p>
                    <p className='text-xs text-gray-500 mb-1'>Canada</p>
                    <p className='text-xs text-gray-500'>+1 844-321-2656</p>
                    <p className='text-xs text-gray-500'>info@boloprint.com</p>
                  </div>
                  <div>
                    <p className='text-xs font-medium text-gray-900 mb-1'>Bill to</p>
                    <p className='text-xs text-gray-500'>{currentCustomer.name}</p>
                    <p className='text-xs text-gray-500'>{currentCustomer.email}</p>
                  </div>
                </div>

                <div className='text-center text-xs font-medium text-gray-900 mb-6'>
                  C$0.00 due May 10, 2025
                </div>

                <table className='w-full mb-6 text-xs'>
                  <thead>
                    <tr className='border-b border-gray-100'>
                      <th className='text-left py-2 text-gray-500 font-medium'>Description</th>
                      <th className='text-right py-2 text-gray-500 font-medium'>Qty</th>
                      <th className='text-right py-2 text-gray-500 font-medium'>Unit price</th>
                      <th className='text-right py-2 text-gray-500 font-medium'>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.length > 0 ? (
                      selectedItems.map((item) => {
                        return (
                          <tr key={item.id} className='border-b border-gray-100'>
                            <td className='py-3'>{item.description}</td>
                            <td className='py-3 text-right'>{item.quantity}</td>
                            <td className='py-3 text-right'>${item.unitPrice}</td>
                            <td className='py-3 text-right'>${item.total}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr className='border-b border-gray-100'>
                        <td className='py-3 text-gray-400'>No items added yet</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className='flex justify-end'>
                  <div className='w-1/3 text-xs'>
                    <div className='flex justify-between mb-1 text-gray-500'>
                      <span>Subtotal</span>
                      <span>C$0.00</span>
                    </div>
                    <div className='flex justify-between mb-1 font-medium text-gray-900'>
                      <span>Total</span>
                      <span>C$0.00</span>
                    </div>
                    <div className='flex justify-between font-medium text-gray-900'>
                      <span>Amount due</span>
                      <span>C$0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Item Dialog */}
      <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className='grid gap-6 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='item-description' className='text-right'>
                Item Name
              </Label>
              <Input
                id='item-description'
                className='col-span-3'
                value={newItem.description}
                onChange={(e) => {
                  return setNewItem({ ...newItem, description: e.target.value });
                }}
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='item-unit-price' className='text-right'>
                Price
              </Label>
              <Input
                id='item-unit-price'
                type='number'
                min='0'
                step='0.01'
                className='col-span-3'
                value={newItem.unitPrice}
                onChange={(e) => {
                  return setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) });
                }}
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label className='text-right'>Projects</Label>
              <div className='col-span-3'>
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
                  <SelectTrigger>
                    <SelectValue placeholder='Select a project' />
                  </SelectTrigger>
                  <SelectContent>
                    {projectOptions.map((project) => {
                      return (
                        <SelectItem key={project.value} value={project.value}>
                          {project.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {newItem.projectIds && newItem.projectIds.length > 0 && (
                  <div className='mt-2 space-y-2'>
                    {newItem.projectIds.map((projectId) => {
                      const project = projectOptions.find((p) => {
                        return p.value === projectId;
                      });
                      return (
                        <div
                          key={projectId}
                          className='flex items-center justify-between p-2 border rounded-lg bg-muted'
                        >
                          <span>{project?.label}</span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setNewItem({
                                ...newItem,
                                projectIds: newItem.projectIds?.filter((id) => {
                                  return id !== projectId;
                                }),
                              });
                            }}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label className='text-right'>Modules</Label>
              <div className='col-span-3'>
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
                  <SelectTrigger>
                    <SelectValue placeholder='Select a module' />
                  </SelectTrigger>
                  <SelectContent>
                    {moduleOptions.map((module) => {
                      return (
                        <SelectItem key={module.value} value={module.value}>
                          {module.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {newItem.moduleIds && newItem.moduleIds.length > 0 && (
                  <div className='mt-2 space-y-2'>
                    {newItem.moduleIds.map((moduleId) => {
                      const moduleItem = moduleOptions.find((m) => {
                        return m.value === moduleId;
                      });
                      return (
                        <div
                          key={moduleId}
                          className='flex items-center justify-between p-2 border rounded-lg bg-muted'
                        >
                          <span>{moduleItem?.label}</span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setNewItem({
                                ...newItem,
                                moduleIds: newItem.moduleIds?.filter((id) => {
                                  return id !== moduleId;
                                }),
                              });
                            }}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <Accordion type='single' collapsible className='w-full'>
              <AccordionItem value='options'>
                <AccordionTrigger>Item Options</AccordionTrigger>
                <AccordionContent>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id='option-1'
                          checked={newItem.options?.['option1'] as boolean}
                          onCheckedChange={(checked) => {
                            return setNewItem({
                              ...newItem,
                              options: { ...newItem.options, option1: checked },
                            });
                          }}
                        />
                        <Label htmlFor='option-1'>Option 1</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id='option-2'
                          checked={newItem.options?.['option2'] as boolean}
                          onCheckedChange={(checked) => {
                            return setNewItem({
                              ...newItem,
                              options: { ...newItem.options, option2: checked },
                            });
                          }}
                        />
                        <Label htmlFor='option-2'>Option 2</Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id='option-3'
                          checked={newItem.options?.['option3'] as boolean}
                          onCheckedChange={(checked) => {
                            return setNewItem({
                              ...newItem,
                              options: { ...newItem.options, option3: checked },
                            });
                          }}
                        />
                        <Label htmlFor='option-3'>Option 3</Label>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className='flex justify-end'>
            <Button type='submit' onClick={handleAddItem}>
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
