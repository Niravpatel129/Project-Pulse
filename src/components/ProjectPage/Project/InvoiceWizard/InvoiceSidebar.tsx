import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

interface InvoiceSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (value: string) => void;
  dueDate: Date;
  setDueDate: (date: Date) => void;
  aiSuggestions: boolean;
  setAiSuggestions: (value: boolean) => void;
  calculateSubtotal: () => number;
  calculateTotal: () => number;
  error: string | null;
  isGenerating: boolean;
  handleCreateInvoice: () => void;
  shippingRequired: boolean;
  hasPhysicalProducts: boolean;
}

const InvoiceSidebar = ({
  activeTab,
  setActiveTab,
  invoiceNumber,
  setInvoiceNumber,
  dueDate,
  setDueDate,
  aiSuggestions,
  setAiSuggestions,
  calculateSubtotal,
  calculateTotal,
  error,
  isGenerating,
  handleCreateInvoice,
  shippingRequired,
  hasPhysicalProducts,
}: InvoiceSidebarProps) => {
  return (
    <div className='w-full md:w-[280px] border-r'>
      <div className='flex justify-between items-center p-4'>
        <h2 className='font-semibold'>Invoice Wizard</h2>
      </div>

      <div className='p-1'>
        <button
          className={`flex items-center gap-3 w-full p-4 rounded-md ${
            activeTab === 'items' ? 'bg-gray-100' : ''
          }`}
          onClick={() => {
            return setActiveTab('items');
          }}
        >
          <div className={`p-1 rounded ${activeTab === 'items' ? 'bg-gray-200' : ''}`}>
            <svg
              viewBox='0 0 24 24'
              width='18'
              height='18'
              strokeWidth='2'
              stroke='currentColor'
              fill='none'
            >
              <path d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </div>
          <span className={activeTab === 'items' ? 'font-medium' : ''}>Items</span>
        </button>

        <button
          className={`flex items-center gap-3 w-full p-4 rounded-md ${
            activeTab === 'client' ? 'bg-gray-100' : ''
          }`}
          onClick={() => {
            return setActiveTab('client');
          }}
        >
          <div className={`p-1 rounded ${activeTab === 'client' ? 'bg-gray-200' : ''}`}>
            <svg
              viewBox='0 0 24 24'
              width='18'
              height='18'
              strokeWidth='2'
              stroke='currentColor'
              fill='none'
            >
              <circle cx='12' cy='8' r='4' />
              <path d='M20 21a8 8 0 10-16 0' />
            </svg>
          </div>
          <span className={activeTab === 'client' ? 'font-medium' : ''}>Client</span>
        </button>

        <button
          className={`flex items-center gap-3 w-full p-4 rounded-md ${
            activeTab === 'details' ? 'bg-gray-100' : ''
          }`}
          onClick={() => {
            return setActiveTab('details');
          }}
        >
          <div className={`p-1 rounded ${activeTab === 'details' ? 'bg-gray-200' : ''}`}>
            <svg
              viewBox='0 0 24 24'
              width='18'
              height='18'
              strokeWidth='2'
              stroke='currentColor'
              fill='none'
            >
              <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' />
              <path d='M14 2v6h6M16 13H8M16 17H8M10 9H8' />
            </svg>
          </div>
          <span className={activeTab === 'details' ? 'font-medium' : ''}>Details</span>
        </button>

        {(shippingRequired || hasPhysicalProducts) && (
          <button
            className={`flex items-center gap-3 w-full p-4 rounded-md ${
              activeTab === 'shipping' ? 'bg-gray-100' : ''
            }`}
            onClick={() => {
              return setActiveTab('shipping');
            }}
          >
            <div className={`p-1 rounded ${activeTab === 'shipping' ? 'bg-gray-200' : ''}`}>
              <svg
                viewBox='0 0 24 24'
                width='18'
                height='18'
                strokeWidth='2'
                stroke='currentColor'
                fill='none'
              >
                <path d='M5 8h14M5 8a2 2 0 100-4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2v-8' />
                <path d='M15 19l-2-2m0 0l-2 2m2-2v-4' />
              </svg>
            </div>
            <span className={activeTab === 'shipping' ? 'font-medium' : ''}>Shipping</span>
          </button>
        )}
      </div>

      <div className='p-4 border-t mt-auto'>
        <div className='mb-4'>
          <label className='text-sm text-gray-500'>Invoice Number</label>
          <Input
            value={invoiceNumber}
            onChange={(e) => {
              return setInvoiceNumber(e.target.value);
            }}
            className='mt-1'
          />
        </div>

        <div>
          <label className='text-sm text-gray-500'>Due Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='w-full justify-between mt-1'>
                {format(dueDate, 'MMMM do, yyyy')}
                <svg
                  viewBox='0 0 24 24'
                  width='16'
                  height='16'
                  strokeWidth='2'
                  stroke='currentColor'
                  fill='none'
                >
                  <path d='M6 9l6 6 6-6' />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0 min-w-[300px]'>
              <Calendar
                mode='single'
                selected={dueDate}
                onSelect={(date) => {
                  if (date) setDueDate(date);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className='flex items-center justify-between mt-4'>
          <span className='text-sm'>AI Suggestions</span>
          <Switch checked={aiSuggestions} onCheckedChange={setAiSuggestions} />
        </div>

        <div className='mt-6 space-y-2'>
          <div className='flex justify-between'>
            <span className='text-sm'>Subtotal</span>
            <span className='font-medium'>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-sm'>Total</span>
            <span className='font-medium'>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {error && <div className='text-red-500 text-sm mt-2'>{error}</div>}

        <Button
          className='w-full mt-4 bg-black text-white hover:bg-gray-800'
          onClick={handleCreateInvoice}
          disabled={isGenerating}
        >
          {isGenerating ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceSidebar;
