'use client';

import { ArrowLeft, MoreHorizontal, Search, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function InvoiceEditor() {
  const [showPreview, setShowPreview] = useState(true);
  const [previewScale, setPreviewScale] = useState(0.8);
  const [isCustomerPicked, setIsCustomerPicked] = useState(true);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customers, setCustomers] = useState([
    {
      id: '1',
      name: 'Customer 1',
      email: 'customer1@example.com',
      address: '123 Main St, Anytown, USA',
    },
    {
      id: '2',
      name: 'Customer 2',
      email: 'customer2@example.com',
      address: '456 Maple Ave, Anycity, USA',
    },
    {
      id: '3',
      name: 'Customer 3',
      email: 'customer3@example.com',
      address: '789 Pine St, Anyvillage, USA',
    },
  ]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [currentCustomer, setCurrentCustomer] = useState(customers[0]);

  const handleCustomerSelect = (value: string) => {
    if (value === 'new') {
      setIsNewCustomerDialogOpen(true);
    } else {
      setSelectedCustomer(value);
      // Find the selected customer from the customers array
      const customer = customers.find((c) => {
        return c.id === value;
      });
      if (customer) {
        // Update the current customer with the selected customer's information
        setCurrentCustomer(customer);
        // Set isCustomerPicked to true to show the customer info panel
        setIsCustomerPicked(true);
      }
    }
  };

  const handleAddCustomer = () => {
    const newId = (customers.length + 2).toString();
    setCustomers([
      ...customers,
      { id: newId, name: newCustomer.name, email: newCustomer.email, address: newCustomer.address },
    ]);
    setSelectedCustomer(newId);
    setIsNewCustomerDialogOpen(false);
    // Update current customer with the new customer's information
    setCurrentCustomer({
      id: newId,
      name: newCustomer.name,
      email: newCustomer.email,
      address: newCustomer.address,
    });
    // Set isCustomerPicked to true to show the customer info panel
    setIsCustomerPicked(true);
    setNewCustomer({ name: '', email: '', address: '' });
  };

  const zoomIn = () => {
    setPreviewScale((prev) => {
      return Math.min(prev + 0.1, 1.2);
    });
  };

  const zoomOut = () => {
    setPreviewScale((prev) => {
      return Math.max(prev - 0.1, 0.5);
    });
  };

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
                  <p className='text-xs text-gray-400 mt-1'>{currentCustomer.address}</p>
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
                  <Separator className='my-1' />
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
          <Dialog open={isNewCustomerDialogOpen} onOpenChange={setIsNewCustomerDialogOpen}>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='name' className='text-right'>
                    Name
                  </Label>
                  <Input
                    id='name'
                    className='col-span-3'
                    value={newCustomer.name}
                    onChange={(e) => {
                      return setNewCustomer({ ...newCustomer, name: e.target.value });
                    }}
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='email' className='text-right'>
                    Email
                  </Label>
                  <Input
                    id='email'
                    className='col-span-3'
                    value={newCustomer.email}
                    onChange={(e) => {
                      return setNewCustomer({ ...newCustomer, email: e.target.value });
                    }}
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='address' className='text-right'>
                    Address
                  </Label>
                  <Input
                    id='address'
                    className='col-span-3'
                    value={newCustomer.address}
                    onChange={(e) => {
                      return setNewCustomer({ ...newCustomer, address: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className='flex justify-end'>
                <Button type='submit' onClick={handleAddCustomer}>
                  Save Customer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditCustomerDialogOpen} onOpenChange={setIsEditCustomerDialogOpen}>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Edit Customer Information</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='edit-name' className='text-right'>
                    Name
                  </Label>
                  <Input
                    id='edit-name'
                    className='col-span-3'
                    value={currentCustomer.name}
                    onChange={(e) => {
                      setCurrentCustomer({ ...currentCustomer, name: e.target.value });
                    }}
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='edit-email' className='text-right'>
                    Email
                  </Label>
                  <Input
                    id='edit-email'
                    className='col-span-3'
                    value={currentCustomer.email}
                    onChange={(e) => {
                      setCurrentCustomer({ ...currentCustomer, email: e.target.value });
                    }}
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='edit-address' className='text-right'>
                    Address
                  </Label>
                  <Input
                    id='edit-address'
                    className='col-span-3'
                    value={currentCustomer.address}
                    onChange={(e) => {
                      setCurrentCustomer({ ...currentCustomer, address: e.target.value });
                    }}
                  />
                </div>
              </div>
              <div className='flex justify-end'>
                <Button
                  type='submit'
                  onClick={() => {
                    return setIsEditCustomerDialogOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <Input className='pl-10 bg-white border-gray-200' placeholder='Find or add an item' />
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

            {/* Custom Fields */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <Label className='text-sm text-gray-700'>Custom Fields</Label>
                <Button variant='outline' size='sm' className='text-gray-600 hover:text-gray-900'>
                  Add Field
                </Button>
              </div>
              <p className='text-xs text-gray-500'>
                Add custom fields to your invoice for additional information.
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
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <Label className='text-sm text-gray-700 mb-2 block'>Icon</Label>
                <div className='border border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors'>
                  <p className='text-sm text-gray-500'>Upload icon</p>
                </div>
              </div>
              <div>
                <Label className='text-sm text-gray-700 mb-2 block'>Logo</Label>
                <div className='border border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors'>
                  <p className='text-sm text-gray-500'>Upload logo</p>
                </div>
              </div>
            </div>

            {/* Brand Color and Accent Color */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='brandColor' className='text-sm text-gray-700 mb-2 block'>
                  Brand Color
                </Label>
                <div className='flex'>
                  <div className='w-10 h-10 rounded-l-md bg-gray-900 border border-r-0 border-gray-200'></div>
                  <Input
                    id='brandColor'
                    defaultValue='#111827'
                    className='rounded-l-none bg-white border-gray-200'
                  />
                </div>
              </div>
              <div>
                <Label htmlFor='accentColor' className='text-sm text-gray-700 mb-2 block'>
                  Accent Color
                </Label>
                <div className='flex'>
                  <div className='w-10 h-10 rounded-l-md bg-gray-800 border border-r-0 border-gray-200'></div>
                  <Input
                    id='accentColor'
                    defaultValue='#1f2937'
                    className='rounded-l-none bg-white border-gray-200'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Invoice Preview */}
        {showPreview && (
          <div className='w-1/2 bg-gray-50 overflow-y-auto sticky top-14 h-[calc(100vh-3.5rem)] flex flex-col'>
            {/* Zoom controls */}
            <div className='flex justify-end mb-4 gap-2 p-4'>
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
                    <p className='text-xs text-gray-500'>Keshiv Sharma</p>
                    <p className='text-xs text-gray-500'>Ontario, Canada</p>
                    <p className='text-xs text-gray-500'>keshiv.sharma@gmail.com</p>
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
                    <tr className='border-b border-gray-100'>
                      <td className='py-3 text-gray-400'>No items added yet</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
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
    </div>
  );
}
