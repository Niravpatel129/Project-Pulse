'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Item, Section } from './types';

type LeftSidebarProps = {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  total: string;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  totalTax?: string;
  totalDiscount?: string;
  clientSelected?: boolean;
  items?: Item[];
  hasInvoice?: boolean;
};

export default function LeftSidebar({
  activeSection,
  setActiveSection,
  total,
  currency = 'USD',
  onCurrencyChange,
  totalTax = '0.00',
  totalDiscount = '0.00',
  clientSelected = false,
  items = [],
  hasInvoice = false,
}: LeftSidebarProps) {
  const [hasAttemptedToLeave, setHasAttemptedToLeave] = useState(false);
  const [visitedSections, setVisitedSections] = useState<Set<Section>>(new Set(['items']));

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalTaxAmount = 0;
    let totalDiscountAmount = 0;

    items.forEach((item) => {
      // Parse price and quantity, handling comma-separated numbers
      const price = parseFloat(item.price.replace(/,/g, ''));
      const quantity = parseFloat(item.quantity || '1');

      // Calculate item subtotal
      const itemSubtotal = price * quantity;

      // Calculate discount first (if any)
      let discountedAmount = itemSubtotal;
      if (item.discount && item.discount > 0) {
        const discountAmount = itemSubtotal * (item.discount / 100);
        totalDiscountAmount += discountAmount;
        discountedAmount = itemSubtotal - discountAmount;
      }

      // Calculate tax on the discounted amount (if taxable)
      if (item.taxRate && item.taxRate > 0) {
        const taxAmount = discountedAmount * (item.taxRate / 100);
        totalTaxAmount += taxAmount;
      }

      subtotal += itemSubtotal;
    });

    // Calculate final total
    const finalTotal = subtotal + totalTaxAmount - totalDiscountAmount;

    // Format all numbers to 2 decimal places
    return {
      subtotal: subtotal.toFixed(2),
      tax: totalTaxAmount.toFixed(2),
      discount: totalDiscountAmount.toFixed(2),
      total: finalTotal.toFixed(2),
    };
  };

  const totals = calculateTotals();

  // Update visited sections when activeSection changes
  useEffect(() => {
    setVisitedSections((prev) => {
      return new Set([...prev, activeSection]);
    });
  }, [activeSection]);

  const handleSectionChange = (section: Section) => {
    if (activeSection === 'client' && !clientSelected) {
      setHasAttemptedToLeave(true);
    }
    setActiveSection(section);
  };

  // Function to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'CAD':
        return 'C$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return currency;
    }
  };

  return (
    <div className='w-[300px] bg-white dark:bg-[#141414] border-r border-[#E4E4E7] dark:border-[#232428] flex flex-col rounded-none'>
      {/* Custom style to fix select spacing */}
      <style jsx global>{`
        .compact-select [data-radix-select-trigger] {
          gap: 0 !important;
        }
        .compact-select [data-radix-select-trigger] > span {
          margin-right: 0 !important;
          padding-right: 0 !important;
        }
        .compact-select [data-radix-select-trigger] > svg {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 10px !important;
          height: 10px !important;
        }
      `}</style>

      <div className='mb-6 px-3 pt-4'>
        <h1 className='text-xl font-semibold mb-2 text-[#3F3F46] dark:text-[#fafafa]'>
          New Project
        </h1>
        <p className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm leading-5'>
          Create new project to help manage items, clients and notes in one place.
        </p>
      </div>

      <div className='space-y-3 flex-grow px-3'>
        <button
          className={`flex items-center w-full text-left p-2 rounded-md ${
            activeSection === 'items' ? 'bg-[#F4F4F5] dark:bg-[#232428]' : ''
          } hover:bg-[#F4F4F5] dark:hover:bg-[#232428] transition-colors`}
          onClick={() => {
            return handleSectionChange('items');
          }}
        >
          <div
            className={`w-6 h-6 rounded-full ${
              activeSection === 'items'
                ? 'bg-[#ececec] dark:bg-[#fafafa]'
                : items.length > 0
                ? 'bg-[#F4F4F5] dark:bg-[#232428] border border-[#E4E4E7] dark:border-[#2A2A2F]'
                : 'border border-[#E4E4E7] dark:border-[#232428]'
            } flex items-center justify-center mr-3 transition-colors`}
          >
            {activeSection === 'items' ? (
              <svg
                width='12'
                height='12'
                viewBox='0 0 12 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 3L4.5 8.5L2 6'
                  stroke='currentColor'
                  className='text-[#3F3F46] dark:text-[#141414]'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : items.length > 0 ? (
              <svg
                width='12'
                height='12'
                viewBox='0 0 12 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 3L4.5 8.5L2 6'
                  stroke='currentColor'
                  className=' text-[#8b5df8]'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='text-[#8C8C8C] text-xs'>1</span>
            )}
          </div>
          <div className='flex flex-col'>
            <span
              className={`text-sm ${
                activeSection === 'items'
                  ? 'text-[#3F3F46] dark:text-[#fafafa] font-medium'
                  : items.length > 0
                  ? 'text-[#8b5df8]'
                  : 'text-[#3F3F46]/60 dark:text-[#8C8C8C]'
              }`}
            >
              Items
            </span>
            {items.length > 0 && (
              <span className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                {items.length} {items.length === 1 ? 'item' : 'items'} added
              </span>
            )}
          </div>
        </button>

        <div className='relative'>
          <button
            className={`flex items-center w-full text-left p-2 rounded-md ${
              activeSection === 'client' ? 'bg-[#F4F4F5] dark:bg-[#232428]' : ''
            } hover:bg-[#F4F4F5] dark:hover:bg-[#232428] transition-colors`}
            onClick={() => {
              return handleSectionChange('client');
            }}
          >
            <div
              className={`w-6 h-6 rounded-full ${
                activeSection === 'client'
                  ? 'bg-[#ececec] dark:bg-[#fafafa]'
                  : clientSelected && visitedSections.has('client')
                  ? 'bg-[#F4F4F5] dark:bg-[#232428] border border-[#E4E4E7] dark:border-[#2A2A2F]'
                  : 'border border-[#E4E4E7] dark:border-[#232428]'
              } flex items-center justify-center mr-3 transition-colors`}
            >
              {activeSection === 'client' ? (
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 12 12'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M10 3L4.5 8.5L2 6'
                    stroke='currentColor'
                    className='dark:text-black'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              ) : clientSelected && visitedSections.has('client') ? (
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 12 12'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M10 3L4.5 8.5L2 6'
                    stroke='currentColor'
                    className='text-[#8b5df8]'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              ) : (
                <span className='text-[#8C8C8C] text-xs'>2</span>
              )}
            </div>
            <div className='flex flex-col'>
              <span
                className={`text-sm ${
                  activeSection === 'client'
                    ? 'text-[#3F3F46] dark:text-[#fafafa] font-medium'
                    : clientSelected && visitedSections.has('client')
                    ? 'text-[#8b5df8]'
                    : 'text-[#3F3F46]/60 dark:text-[#8C8C8C]'
                }`}
              >
                Client
              </span>
              {clientSelected && (
                <span className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                  Client selected
                </span>
              )}
            </div>

            {!clientSelected && hasAttemptedToLeave && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
                      <AlertCircle className='h-4 w-4 text-[#eea01a] animate-pulse' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side='right'
                    className='bg-white dark:bg-[#141414] text-[#3F3F46] dark:text-[#fafafa] border border-[#E4E4E7] dark:border-[#232428] shadow-md rounded-md p-3 max-w-[250px]'
                  >
                    <div className='space-y-2'>
                      <div className='flex items-start gap-2'>
                        <AlertCircle className='h-4 w-4 text-[#eea01a] mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm font-medium text-[#3F3F46] dark:text-[#fafafa] mb-1'>
                            Client Required
                          </p>
                          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                            You need to select or create a client before proceeding to the next
                            section. This information is required for generating invoices.
                          </p>
                        </div>
                      </div>
                      <div className='pt-2 border-t border-[#E4E4E7] dark:border-[#232428]'>
                        <p className='text-xs text-[#eea01a]'>
                          Click the &quot;Add Client&quot; button or select an existing client to
                          continue.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </button>
        </div>

        <button
          className={`flex items-center w-full text-left p-2 rounded-md ${
            activeSection === 'invoice' ? 'bg-[#F4F4F5] dark:bg-[#232428]' : ''
          } hover:bg-[#F4F4F5] dark:hover:bg-[#232428] transition-colors`}
          onClick={() => {
            return handleSectionChange('invoice');
          }}
        >
          <div
            className={`w-6 h-6 rounded-full ${
              activeSection === 'invoice'
                ? 'bg-[#ececec] dark:bg-[#fafafa]'
                : hasInvoice && visitedSections.has('invoice')
                ? 'bg-[#F4F4F5] dark:bg-[#232428] border border-[#E4E4E7] dark:border-[#2A2A2F]'
                : 'border border-[#E4E4E7] dark:border-[#232428]'
            } flex items-center justify-center mr-3 transition-colors`}
          >
            {activeSection === 'invoice' ? (
              <svg
                width='12'
                height='12'
                viewBox='0 0 12 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 3L4.5 8.5L2 6'
                  stroke='currentColor'
                  className='text-[#3F3F46] dark:text-[#141414]'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : hasInvoice && visitedSections.has('invoice') ? (
              <svg
                width='12'
                height='12'
                viewBox='0 0 12 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 3L4.5 8.5L2 6'
                  stroke='currentColor'
                  className='text-[#8b5df8] dark:text-[#8b5df8] '
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='text-[#8C8C8C] text-xs'>3</span>
            )}
          </div>
          <span
            className={`text-sm ${
              activeSection === 'invoice'
                ? 'text-[#3F3F46] dark:text-[#fafafa] font-medium'
                : hasInvoice && visitedSections.has('invoice')
                ? 'text-[#8b5df8]'
                : 'text-[#3F3F46]/60 dark:text-[#8C8C8C]'
            }`}
          >
            Invoice
          </span>
        </button>
      </div>

      {/* Total at bottom of sidebar */}
      <div className='mt-auto py-5 border-t border-[#E4E4E7] dark:border-[#232428] px-3'>
        <div className='flex justify-between items-center'>
          <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm'>Total</span>
          <div className='flex items-center gap-1'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='text-[#3F3F46] dark:text-[#fafafa] text-base font-medium border-b border-dashed border-[#E4E4E7] dark:border-[#232428] cursor-help'>
                    {getCurrencySymbol(currency)}
                    {totals.total}
                  </span>
                </TooltipTrigger>
                <TooltipContent className='bg-white dark:bg-[#141414] text-[#3F3F46] dark:text-[#fafafa] border border-[#E4E4E7] dark:border-[#232428] shadow-md rounded-md p-3'>
                  <div className='space-y-2 w-[180px]'>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs'>
                        Subtotal
                      </span>
                      <span className='text-[#3F3F46] dark:text-[#fafafa] text-xs font-medium'>
                        {getCurrencySymbol(currency)}
                        {totals.subtotal}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs'>Tax</span>
                      <span className='text-[#3F3F46] dark:text-[#fafafa] text-xs font-medium'>
                        {getCurrencySymbol(currency)}
                        {totals.tax}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs'>
                        Discount
                      </span>
                      <span className='text-[#8b5df8] text-xs font-medium'>
                        -{getCurrencySymbol(currency)}
                        {totals.discount}
                      </span>
                    </div>
                    <div className='pt-1 border-t border-[#E4E4E7] dark:border-[#232428] flex justify-between items-center'>
                      <span className='text-[#3F3F46] dark:text-[#fafafa] text-xs font-medium'>
                        Total
                      </span>
                      <span className='text-[#3F3F46] dark:text-[#fafafa] text-xs font-bold'>
                        {getCurrencySymbol(currency)}
                        {totals.total}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className='compact-select'>
              <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger className='w-[50px] h-7 text-xs border-none shadow-none px-1 focus:ring-0 text-[#3F3F46] dark:text-[#fafafa]'>
                  <SelectValue placeholder='USD' />
                </SelectTrigger>
                <SelectContent className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428]'>
                  <SelectItem value='USD' className='text-[#3F3F46] dark:text-[#fafafa]'>
                    USD
                  </SelectItem>
                  <SelectItem value='CAD' className='text-[#3F3F46] dark:text-[#fafafa]'>
                    CAD
                  </SelectItem>
                  <SelectItem value='EUR' className='text-[#3F3F46] dark:text-[#fafafa]'>
                    EUR
                  </SelectItem>
                  <SelectItem value='GBP' className='text-[#3F3F46] dark:text-[#fafafa]'>
                    GBP
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
