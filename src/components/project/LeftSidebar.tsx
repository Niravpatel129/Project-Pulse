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
  console.log('🚀 items:', items);

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
    <div className='w-[300px] bg-white p-6 border-r border-[#F3F4F6] flex flex-col'>
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

      <div className='mb-6'>
        <h1 className='text-xl font-semibold mb-2 text-[#111827]'>New Project</h1>
        <p className='text-[#4B5563] text-sm leading-5'>
          Create new project to help manage items, clients and notes in one place.
        </p>
      </div>

      <div className='space-y-3 flex-grow'>
        <button
          className={`flex items-center w-full text-left p-2 rounded-md ${
            activeSection === 'items' ? 'bg-[#F9FAFB]' : ''
          } hover:bg-[#F9FAFB] transition-colors`}
          onClick={() => {
            return handleSectionChange('items');
          }}
        >
          <div
            className={`w-6 h-6 rounded-full ${
              activeSection === 'items'
                ? 'bg-[#111827]'
                : items.length > 0
                ? 'bg-green-100 border border-green-200'
                : 'border border-[#D1D5DB]'
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
                  stroke='white'
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
                  stroke='#059669'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='text-[#6B7280] text-xs'>1</span>
            )}
          </div>
          <div className='flex flex-col'>
            <span
              className={`text-sm ${
                activeSection === 'items'
                  ? 'text-[#111827] font-medium'
                  : items.length > 0
                  ? 'text-[#059669]'
                  : 'text-[#6B7280]'
              }`}
            >
              Items
            </span>
            {items.length > 0 && (
              <span className='text-xs text-[#6B7280]'>
                {items.length} {items.length === 1 ? 'item' : 'items'} added
              </span>
            )}
          </div>
        </button>

        <div className='relative'>
          <button
            className={`flex items-center w-full text-left p-2 rounded-md ${
              activeSection === 'client' ? 'bg-[#F9FAFB]' : ''
            } hover:bg-[#F9FAFB] transition-colors`}
            onClick={() => {
              return handleSectionChange('client');
            }}
          >
            <div
              className={`w-6 h-6 rounded-full ${
                activeSection === 'client'
                  ? 'bg-[#111827]'
                  : clientSelected && visitedSections.has('client')
                  ? 'bg-green-100 border border-green-200'
                  : 'border border-[#D1D5DB]'
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
                    stroke='white'
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
                    stroke='#059669'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              ) : (
                <span className='text-[#6B7280] text-xs'>2</span>
              )}
            </div>
            <div className='flex flex-col'>
              <span
                className={`text-sm ${
                  activeSection === 'client'
                    ? 'text-[#111827] font-medium'
                    : clientSelected && visitedSections.has('client')
                    ? 'text-[#059669]'
                    : 'text-[#6B7280]'
                }`}
              >
                Client
              </span>
              {clientSelected && <span className='text-xs text-[#6B7280]'>Client selected</span>}
            </div>

            {!clientSelected && hasAttemptedToLeave && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
                      <AlertCircle className='h-4 w-4 text-amber-500 animate-pulse' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side='right'
                    className='bg-white text-gray-900 border border-amber-200 shadow-md rounded-md p-3 max-w-[250px]'
                  >
                    <div className='space-y-2'>
                      <div className='flex items-start gap-2'>
                        <AlertCircle className='h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0' />
                        <div>
                          <p className='text-sm font-medium text-gray-900 mb-1'>Client Required</p>
                          <p className='text-xs text-gray-600'>
                            You need to select or create a client before proceeding to the next
                            section. This information is required for generating invoices.
                          </p>
                        </div>
                      </div>
                      <div className='pt-2 border-t border-amber-100'>
                        <p className='text-xs text-amber-600'>
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
            activeSection === 'invoice' ? 'bg-[#F9FAFB]' : ''
          } hover:bg-[#F9FAFB] transition-colors`}
          onClick={() => {
            return handleSectionChange('invoice');
          }}
        >
          <div
            className={`w-6 h-6 rounded-full ${
              activeSection === 'invoice'
                ? 'bg-[#111827]'
                : hasInvoice && visitedSections.has('invoice')
                ? 'bg-green-100 border border-green-200'
                : 'border border-[#D1D5DB]'
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
                  stroke='white'
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
                  stroke='#059669'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='text-[#6B7280] text-xs'>3</span>
            )}
          </div>
          <span
            className={`text-sm ${
              activeSection === 'invoice'
                ? 'text-[#111827] font-medium'
                : hasInvoice && visitedSections.has('invoice')
                ? 'text-[#059669]'
                : 'text-[#6B7280]'
            }`}
          >
            Invoice
          </span>
        </button>
      </div>

      {/* Total at bottom of sidebar */}
      <div className='mt-auto pt-6 border-t border-[#E5E7EB]'>
        <div className='flex justify-between items-center mb-3'>
          <span className='text-[#6B7280] text-sm'>Total</span>
          <div className='flex items-center gap-1'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='text-[#111827] text-base font-medium border-b border-dashed border-gray-400 cursor-help'>
                    {getCurrencySymbol(currency)}
                    {total}
                  </span>
                </TooltipTrigger>
                <TooltipContent className='bg-white text-gray-900 border border-gray-200 shadow-md rounded-md p-3'>
                  <div className='space-y-2 w-[180px]'>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#6B7280] text-xs'>Subtotal</span>
                      <span className='text-[#111827] text-xs font-medium'>
                        {getCurrencySymbol(currency)}
                        {total}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#6B7280] text-xs'>Tax</span>
                      <span className='text-[#111827] text-xs font-medium'>
                        {getCurrencySymbol(currency)}
                        {totalTax}
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-[#6B7280] text-xs'>Discount</span>
                      <span className='text-green-600 text-xs font-medium'>
                        -{getCurrencySymbol(currency)}
                        {totalDiscount}
                      </span>
                    </div>
                    <div className='pt-1 border-t border-gray-200 flex justify-between items-center'>
                      <span className='text-[#111827] text-xs font-medium'>Total</span>
                      <span className='text-[#111827] text-xs font-bold'>
                        {getCurrencySymbol(currency)}
                        {total}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className='compact-select'>
              <Select value={currency} onValueChange={onCurrencyChange}>
                <SelectTrigger className='w-[50px] h-7 text-xs border-none shadow-none px-1 focus:ring-0'>
                  <SelectValue placeholder='USD' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='USD'>USD</SelectItem>
                  <SelectItem value='CAD'>CAD</SelectItem>
                  <SelectItem value='EUR'>EUR</SelectItem>
                  <SelectItem value='GBP'>GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
