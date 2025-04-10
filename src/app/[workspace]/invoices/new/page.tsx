'use client';

import { ArrowLeft, MoreHorizontal, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function InvoiceEditor() {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className='flex min-h-screen flex-col font-sans'>
      {/* Header */}
      <header className='sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' className='rounded-full'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-xl font-semibold'>Edit invoice</h1>
        </div>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            onClick={() => {
              return setShowPreview(!showPreview);
            }}
          >
            {showPreview ? 'Hide preview' : 'Show preview'}
          </Button>
          <Button className='bg-[#635BFF] hover:bg-[#524cdb]'>Send invoice</Button>
        </div>
      </header>

      {/* Main content */}
      <div className='flex flex-1'>
        {/* Left panel - Invoice Form Editor */}
        <div className='w-1/2 border-r border-gray-200 bg-white p-6 overflow-y-auto'>
          {/* Customer section */}
          <div className='mb-8'>
            <h2 className='text-base font-semibold mb-4'>Customer</h2>
            <div className='flex items-start justify-between'>
              <div>
                <p className='font-medium'>Keshiv Sharma</p>
                <p className='text-gray-500 text-sm'>keshiv.sharma@gmail.com</p>
                <p className='text-gray-400 text-sm mt-1'>Language: English (United States)</p>
              </div>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreHorizontal className='h-5 w-5' />
              </Button>
            </div>
          </div>

          {/* Currency section */}
          <div className='mb-8'>
            <h2 className='text-base font-semibold mb-4'>Currency</h2>
            <Select defaultValue='cad'>
              <SelectTrigger className='w-full bg-white'>
                <SelectValue placeholder='Select currency' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cad'>CAD - Canadian Dollar</SelectItem>
                <SelectItem value='usd'>USD - US Dollar</SelectItem>
                <SelectItem value='eur'>EUR - Euro</SelectItem>
                <SelectItem value='gbp'>GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-gray-500 text-sm mt-2'>
              Selecting a new currency will clear all items from the invoice.
            </p>
          </div>

          {/* Items section */}
          <div className='mb-8'>
            <h2 className='text-base font-semibold mb-4'>Items</h2>
            <p className='text-gray-600 text-sm mb-4'>
              Add single, one-time items or products from your{' '}
              <span className='text-[#635BFF] cursor-pointer'>product catalogue</span> to this
              invoice.
            </p>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
              <Input className='pl-10 bg-white' placeholder='Find or add an item' />
            </div>
          </div>

          {/* Delivery section */}
          <div className='mb-8'>
            <h2 className='text-base font-semibold mb-4'>Delivery</h2>
            <RadioGroup className='flex flex-wrap gap-2' defaultValue='email'>
              <div className='border-input has-data-[state=checked]:border-[#635BFF]/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none'>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem
                    id='email'
                    value='email'
                    className='after:absolute after:inset-0'
                  />
                  <Label htmlFor='email'>Email</Label>
                </div>
              </div>
              <div className='border-input has-data-[state=checked]:border-[#635BFF]/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none'>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem id='sms' value='sms' className='after:absolute after:inset-0' />
                  <Label htmlFor='sms'>SMS</Label>
                </div>
              </div>
              <div className='border-input has-data-[state=checked]:border-[#635BFF]/50 relative flex flex-col items-start gap-4 rounded-md border p-3 shadow-xs outline-none'>
                <div className='flex items-center gap-2'>
                  <RadioGroupItem id='both' value='both' className='after:absolute after:inset-0' />
                  <Label htmlFor='both'>Both</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Options section */}
          <div className='mb-8'>
            <h2 className='text-base font-semibold mb-4'>Options</h2>

            {/* Memo */}
            <div className='mb-4'>
              <Label htmlFor='memo' className='block mb-2'>
                Memo
              </Label>
              <Input id='memo' placeholder='Add a memo to your invoice' className='bg-white' />
              <p className='text-gray-500 text-sm mt-1'>
                This will appear on the invoice below the line items.
              </p>
            </div>

            {/* Footer */}
            <div className='mb-4'>
              <Label htmlFor='footer' className='block mb-2'>
                Footer
              </Label>
              <Input id='footer' placeholder='Add a footer to your invoice' className='bg-white' />
              <p className='text-gray-500 text-sm mt-1'>
                This will appear at the bottom of the invoice.
              </p>
            </div>

            {/* Custom Fields */}
            <div>
              <div className='flex items-center justify-between mb-2'>
                <Label>Custom Fields</Label>
                <Button variant='outline' size='sm' className='text-[#635BFF]'>
                  Add Field
                </Button>
              </div>
              <p className='text-gray-500 text-sm'>
                Add custom fields to your invoice for additional information.
              </p>
            </div>
          </div>

          {/* Tax ID section */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-2'>
              <h2 className='text-base font-semibold'>Tax ID</h2>
              <div className='flex items-center'>
                <Label htmlFor='showTaxId' className='mr-2 text-sm'>
                  Show on invoice
                </Label>
                <Switch id='showTaxId' className='data-[state=checked]:bg-[#635BFF]' />
              </div>
            </div>
            <Input id='taxId' placeholder='Enter your tax ID' className='bg-white' />
            <p className='text-gray-500 text-sm mt-1'>
              This will appear on the invoice if enabled.
            </p>
          </div>

          {/* Branding section */}
          <div className='mb-8'>
            <h2 className='text-base font-semibold mb-4'>Branding</h2>

            {/* Icon and Logo */}
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <Label className='block mb-2'>Icon</Label>
                <div className='border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50'>
                  <p className='text-sm text-gray-500'>Upload icon</p>
                </div>
              </div>
              <div>
                <Label className='block mb-2'>Logo</Label>
                <div className='border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50'>
                  <p className='text-sm text-gray-500'>Upload logo</p>
                </div>
              </div>
            </div>

            {/* Brand Color and Accent Color */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='brandColor' className='block mb-2'>
                  Brand Color
                </Label>
                <div className='flex'>
                  <div className='w-10 h-10 rounded-l-md bg-[#635BFF] border border-r-0 border-gray-300'></div>
                  <Input
                    id='brandColor'
                    defaultValue='#635BFF'
                    className='rounded-l-none bg-white'
                  />
                </div>
              </div>
              <div>
                <Label htmlFor='accentColor' className='block mb-2'>
                  Accent Color
                </Label>
                <div className='flex'>
                  <div className='w-10 h-10 rounded-l-md bg-[#524cdb] border border-r-0 border-gray-300'></div>
                  <Input
                    id='accentColor'
                    defaultValue='#524cdb'
                    className='rounded-l-none bg-white'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Invoice Preview */}
        {showPreview && (
          <div className='w-1/2 bg-[#f0f1f6] p-6 overflow-y-auto'>
            {/* Invoice Preview */}
            <div className='bg-white rounded-md shadow-md p-8 max-w-3xl mx-auto'>
              <div className='flex justify-between mb-8'>
                <div>
                  <h2 className='text-2xl font-bold mb-2'>Invoice</h2>
                  <p className='text-sm'>0BD1057-DRAFT</p>
                  <p className='text-sm'>Date due: May 10, 2025</p>
                </div>
                <div className='text-xl font-bold'>BOLO</div>
              </div>

              <div className='grid grid-cols-2 gap-8 mb-8'>
                <div>
                  <p className='font-medium mb-1'>Bolo Print Inc.</p>
                  <p className='text-sm'>3883 Nashua Dr</p>
                  <p className='text-sm'>Brampton Ontario L4V1R3</p>
                  <p className='text-sm mb-2'>Canada</p>
                  <p className='text-sm'>+1 844-321-2656</p>
                  <p className='text-sm'>info@boloprint.com</p>
                </div>
                <div>
                  <p className='font-medium mb-1'>Bill to</p>
                  <p className='text-sm'>Keshiv Sharma</p>
                  <p className='text-sm'>Ontario, Canada</p>
                  <p className='text-sm'>keshiv.sharma@gmail.com</p>
                </div>
              </div>

              <div className='text-center font-bold mb-8'>C$0.00 due May 10, 2025</div>

              <table className='w-full mb-8 text-sm'>
                <thead>
                  <tr className='border-b border-gray-200'>
                    <th className='text-left py-2'>Description</th>
                    <th className='text-right py-2'>Qty</th>
                    <th className='text-right py-2'>Unit price</th>
                    <th className='text-right py-2'>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='border-b border-gray-200'>
                    <td className='py-4 text-gray-400'>No items added yet</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              <div className='flex justify-end'>
                <div className='w-1/3'>
                  <div className='flex justify-between mb-2'>
                    <span>Subtotal</span>
                    <span>C$0.00</span>
                  </div>
                  <div className='flex justify-between mb-2 font-medium'>
                    <span>Total</span>
                    <span>C$0.00</span>
                  </div>
                  <div className='flex justify-between font-medium'>
                    <span>Amount due</span>
                    <span>C$0.00</span>
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
