import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Percent, TruckIcon } from 'lucide-react';
import { useInvoiceWizardContext } from './InvoiceWizardContext';

interface InvoiceSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  shippingRequired: boolean;
  hasPhysicalProducts: boolean;
}

const InvoiceSidebar = ({
  activeTab,
  setActiveTab,
  shippingRequired,
  hasPhysicalProducts,
}: InvoiceSidebarProps) => {
  const {
    dueDate,
    setDueDate,
    calculateInvoiceSubtotal,
    calculateInvoiceTotal,
    error,
    isGenerating,
    handleCreateInvoice,
    shippingItem,
    taxId,
    setTaxId,
    showTaxId,
    setShowTaxId,
    discount,
  } = useInvoiceWizardContext();

  // Show shipping tab only when shipping is required
  const showShippingTab = shippingRequired;

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!discount) return 0;
    const subtotal = calculateInvoiceSubtotal();
    return (subtotal * discount) / 100;
  };

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

        {showShippingTab && (
          <button
            className={`flex items-center gap-3 w-full p-4 rounded-md ${
              activeTab === 'shipping' ? 'bg-gray-100' : ''
            }`}
            onClick={() => {
              return setActiveTab('shipping');
            }}
          >
            <div className={`p-1 rounded ${activeTab === 'shipping' ? 'bg-gray-200' : ''}`}>
              <TruckIcon size={18} />
            </div>
            <span className={activeTab === 'shipping' ? 'font-medium' : ''}>
              Shipping
              {shippingItem && (
                <span className='ml-2 text-xs inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700'>
                  Added
                </span>
              )}
            </span>
          </button>
        )}
      </div>

      <div className='p-4 border-t mt-auto'>
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm text-gray-500'>Tax ID</label>
            <div className='flex items-center'>
              <label htmlFor='showTaxId' className='text-xs text-gray-600 mr-2'>
                Show on invoice
              </label>
              <Switch
                id='showTaxId'
                className='data-[state=checked]:bg-gray-900'
                checked={showTaxId}
                onCheckedChange={(checked) => {
                  return setShowTaxId(checked);
                }}
              />
            </div>
          </div>
          <Input
            value={taxId}
            onChange={(e) => {
              return setTaxId(e.target.value);
            }}
            className='mt-1'
            placeholder='Enter your tax ID'
          />
          <p className='text-xs text-gray-500 mt-1'>This will appear on the invoice if enabled.</p>
        </div>

        <div>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm text-gray-500'>Due Date</label>
            {dueDate && (
              <Button
                variant='ghost'
                size='sm'
                className='h-6 p-1 text-gray-500 hover:text-red-500'
                onClick={() => {
                  return setDueDate(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='w-full justify-between mt-1'>
                {dueDate ? format(dueDate, 'MMMM do, yyyy') : 'No due date'}
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
                  setDueDate(date);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className='mt-6 space-y-2'>
          <div className='flex justify-between'>
            <span className='text-sm'>Subtotal</span>
            <span className='font-medium'>${calculateInvoiceSubtotal().toFixed(2)}</span>
          </div>

          {/* Display discount if it exists */}
          {discount > 0 && (
            <div className='flex justify-between'>
              <span className='text-sm flex items-center gap-1'>
                <Percent size={12} /> Discount ({discount}%)
              </span>
              <span className='font-medium text-emerald-600'>
                -${calculateDiscountAmount().toFixed(2)}
              </span>
            </div>
          )}

          {/* Show shipping costs if there's a shipping item */}
          {shippingItem && (
            <div className='flex justify-between'>
              <span className='text-sm'>Shipping</span>
              <span className='font-medium'>
                $
                {(
                  calculateInvoiceTotal() -
                  calculateInvoiceSubtotal() +
                  calculateDiscountAmount()
                ).toFixed(2)}
              </span>
            </div>
          )}

          <div className='flex justify-between border-t pt-2'>
            <span className='text-sm font-medium'>Total</span>
            <span className='font-medium'>${calculateInvoiceTotal().toFixed(2)}</span>
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
