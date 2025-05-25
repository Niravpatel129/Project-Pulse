import { Badge } from '@/components/ui/badge';
import { XIcon } from 'lucide-react';
import React, { useState } from 'react';

interface InvoicePreview2Props {
  selectedInvoice?: any;
  setSelectedInvoice: (invoice: any) => void;
}

function formatCurrency(amount: number, currency: string = 'CAD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

const InvoicePreview2: React.FC<InvoicePreview2Props> = ({
  selectedInvoice,
  setSelectedInvoice,
}) => {
  const [activityOpen, setActivityOpen] = useState(true);
  const [noteOpen, setNoteOpen] = useState(false);

  if (!selectedInvoice) {
    return (
      <div className='h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm'>
        Select an invoice to preview
      </div>
    );
  }

  return (
    <div className='h-full p-4 min-w-[600px]'>
      <button
        onClick={() => {
          return setSelectedInvoice(null);
        }}
        className='absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors duration-150'
      >
        <XIcon />
      </button>
      <div className='bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-800 h-full flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 pb-3'>
          <div className='flex items-center gap-3'>
            <span className='text-[14px] font-medium text-gray-900 dark:text-gray-100'>
              {selectedInvoice.customer?.name}
              <Badge variant='outline' className='text-xs ml-2 text-slate-600'>
                {selectedInvoice.status}
              </Badge>
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className='px-6 pt-1 pb-5'>
          <div className='text-3xl font-mono font-light text-gray-900 dark:text-gray-100 tracking-tight'>
            {formatCurrency(
              selectedInvoice.totals?.total || 0,
              selectedInvoice.settings?.currency || 'CAD',
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-2 px-6 pb-6'>
          <button className='flex-1 py-2 rounded-md bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors duration-150'>
            <span className='inline-flex items-center justify-center gap-1.5'>
              <svg width='16' height='16' fill='none' viewBox='0 0 24 24' className='text-gray-500'>
                <path
                  d='M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <circle cx='12' cy='7' r='4' stroke='currentColor' strokeWidth='1.5' />
              </svg>
              Edit
            </span>
          </button>
          <button className='w-9 h-9 flex items-center justify-center rounded-md bg-gray-50 dark:bg-neutral-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors duration-150'>
            <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
              <circle cx='12' cy='5' r='1.5' fill='currentColor' />
              <circle cx='12' cy='12' r='1.5' fill='currentColor' />
              <circle cx='12' cy='19' r='1.5' fill='currentColor' />
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className='px-6 pb-4'>
          <div className='grid grid-cols-2 gap-y-2 text-xs text-gray-500 dark:text-gray-400'>
            <div>Due date</div>
            <div className='text-right text-gray-900 dark:text-gray-100 font-medium'>
              {formatDate(selectedInvoice.dueDate)}
            </div>
            <div>Issue date</div>
            <div className='text-right text-gray-900 dark:text-gray-100 font-medium'>
              {formatDate(selectedInvoice.issueDate)}
            </div>
            <div>Invoice no.</div>
            <div className='text-right text-gray-900 dark:text-gray-100 font-medium'>
              {selectedInvoice.invoiceNumber}
            </div>
          </div>
        </div>

        {/* Invoice link */}
        <div className='px-6 pb-4'>
          <div className='text-xs text-gray-500 dark:text-gray-400 mb-1.5'>Invoice link</div>
          <div className='flex items-center gap-1.5'>
            <input
              className='flex-1 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 truncate focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-700 transition-shadow'
              value={`https://${window.location.host}/i/${selectedInvoice._id}`}
              readOnly
            />
            <button
              className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 transition-colors duration-150'
              title='Copy'
            >
              <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                <rect
                  x='9'
                  y='9'
                  width='13'
                  height='13'
                  rx='2'
                  stroke='currentColor'
                  strokeWidth='1.5'
                />
                <rect
                  x='3'
                  y='3'
                  width='13'
                  height='13'
                  rx='2'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                />
              </svg>
            </button>
            <button
              className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 transition-colors duration-150'
              title='Open'
            >
              <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                <path
                  d='M14 3h7v7m0-7L10 14'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
            <button
              className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 transition-colors duration-150'
              title='Download'
            >
              <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                <path
                  d='M12 3v14m0 0l-4-4m4 4l4-4'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <rect x='4' y='19' width='16' height='2' rx='1' fill='currentColor' />
              </svg>
            </button>
          </div>
        </div>

        {/* Activity */}
        <div className='px-6 pt-2'>
          <button
            className='w-full flex items-center justify-between text-xs font-medium text-gray-900 dark:text-gray-100 py-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150'
            onClick={() => {
              return setActivityOpen(!activityOpen);
            }}
          >
            Activity
            <svg
              className={`w-3.5 h-3.5 ml-2 transition-transform duration-200 ${
                activityOpen ? '' : 'rotate-180'
              }`}
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                d='M19 9l-7 7-7-7'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          {activityOpen && (
            <div className='pl-2 pb-2 text-xs text-gray-500 dark:text-gray-400 space-y-1.5'>
              <div className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full bg-gray-400 inline-block'></span>
                Created{' '}
                <span className='ml-auto'>{formatDate(selectedInvoice.issueDate)}, 06:38</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-1.5 w-1.5 rounded-full border border-gray-400 inline-block'></span>
                Paid
              </div>
            </div>
          )}
        </div>

        {/* Internal note */}
        <div className='px-6 pb-6'>
          <button
            className='w-full flex items-center justify-between text-xs font-medium text-gray-900 dark:text-gray-100 py-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150'
            onClick={() => {
              return setNoteOpen(!noteOpen);
            }}
          >
            Internal note
            <svg
              className={`w-3.5 h-3.5 ml-2 transition-transform duration-200 ${
                noteOpen ? '' : 'rotate-180'
              }`}
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                d='M19 9l-7 7-7-7'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          {noteOpen && (
            <textarea
              className='w-full mt-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 min-h-[40px] focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-700 transition-shadow resize-none'
              placeholder='Add a note...'
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview2;
