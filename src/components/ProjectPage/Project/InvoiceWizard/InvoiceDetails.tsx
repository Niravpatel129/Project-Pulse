import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { motion } from 'framer-motion';
import { Info, Plus, TruckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInvoiceWizardContext } from './InvoiceWizardContext';

interface InvoiceDetailsProps {
  selectedTax: string;
  setSelectedTax: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  shippingRequired: boolean;
  setShippingRequired: (value: boolean) => void;
  hasPhysicalProducts: boolean;
  taxRate: number;
  setTaxRate: (value: number) => void;
  reducedTaxRate: number;
  setReducedTaxRate: (value: number) => void;
  setActiveTab: (tab: string) => void;
}

const InvoiceDetails = ({
  selectedTax,
  setSelectedTax,
  notes,
  setNotes,
  shippingRequired,
  setShippingRequired,
  hasPhysicalProducts,
  taxRate,
  setTaxRate,
  reducedTaxRate,
  setReducedTaxRate,
  setActiveTab,
}: InvoiceDetailsProps) => {
  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();
  const [isCreatingTax, setIsCreatingTax] = useState(false);
  const [newTax, setNewTax] = useState({ name: '', rate: 0 });
  const [localCurrency, setLocalCurrency] = useState(invoiceSettings?.currency || 'usd');
  const { shippingItem, discount, setDiscount } = useInvoiceWizardContext();

  // Toggle states
  const [sendAutomatically, setSendAutomatically] = useState(true);
  const [includePaymentLink, setIncludePaymentLink] = useState(true);
  const [scheduleReminders, setScheduleReminders] = useState(false);

  useEffect(() => {
    if (invoiceSettings?.currency) {
      setLocalCurrency(invoiceSettings.currency);
    }
  }, [invoiceSettings?.currency]);

  const handleSettingsUpdate = (updates: Partial<typeof invoiceSettings>) => {
    updateInvoiceSettings.mutate({
      settings: {
        ...invoiceSettings,
        ...updates,
      },
    });
  };

  const handleAddTax = () => {
    if (!newTax.name || newTax.rate <= 0) return;

    const newTaxId = `tax-${Date.now()}`;
    const updatedTaxes = [
      ...(invoiceSettings?.taxes || []),
      { id: newTaxId, name: newTax.name, rate: newTax.rate },
    ];

    handleSettingsUpdate({ taxes: updatedTaxes });
    setNewTax({ name: '', rate: 0 });
    setIsCreatingTax(false);
  };

  const handleShippingToggle = (checked: boolean) => {
    setShippingRequired(checked);

    // If shipping is enabled, navigate to the shipping tab
    if (checked) {
      setActiveTab('shipping');
    }
  };

  const handleDiscountChange = (value: string) => {
    setDiscount(Number(value));
  };

  return (
    <motion.div
      key='details'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='space-y-6'
    >
      {/* Tax section */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <h2 className='text-sm font-medium text-gray-900'>Taxes</h2>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              return setIsCreatingTax(true);
            }}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Tax
          </Button>
        </div>

        {isCreatingTax && (
          <div className='mb-4 p-4 bg-gray-50 rounded-lg'>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <Label htmlFor='tax-name'>Tax Name</Label>
                <Input
                  id='tax-name'
                  placeholder='e.g. GST, VAT'
                  value={newTax.name}
                  onChange={(e) => {
                    return setNewTax({ ...newTax, name: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor='tax-rate'>Rate (%)</Label>
                <Input
                  id='tax-rate'
                  type='number'
                  min='0'
                  step='0.1'
                  value={newTax.rate}
                  onChange={(e) => {
                    return setNewTax({ ...newTax, rate: Number(e.target.value) });
                  }}
                />
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setIsCreatingTax(false);
                  setNewTax({ name: '', rate: 0 });
                }}
              >
                Cancel
              </Button>
              <Button size='sm' onClick={handleAddTax}>
                Add Tax
              </Button>
            </div>
          </div>
        )}

        <Select value={selectedTax} onValueChange={setSelectedTax}>
          <SelectTrigger className='w-full bg-white border-gray-200'>
            <SelectValue placeholder='Select tax rate' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='no-tax'>No Tax</SelectItem>
            {invoiceSettings?.taxes?.map((tax) => {
              return (
                <SelectItem key={tax.id} value={tax.id}>
                  {tax.name} ({tax.rate}%)
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Discount section */}
      <div>
        <h2 className='text-sm font-medium text-gray-900 mb-3'>Discount</h2>
        <Select value={String(discount || '0')} onValueChange={handleDiscountChange}>
          <SelectTrigger className='w-full bg-white border-gray-200'>
            <SelectValue placeholder='Select discount' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>No Discount</SelectItem>
            <SelectItem value='5'>5% off</SelectItem>
            <SelectItem value='10'>10% off</SelectItem>
            <SelectItem value='15'>15% off</SelectItem>
            <SelectItem value='20'>20% off</SelectItem>
            <SelectItem value='25'>25% off</SelectItem>
            <SelectItem value='50'>50% off</SelectItem>
          </SelectContent>
        </Select>
        {Number(discount) > 0 && (
          <p className='text-xs text-emerald-600 font-medium mt-1'>
            {discount}% discount will be applied to the invoice
          </p>
        )}
      </div>

      {/* Currency section */}
      <div>
        <h2 className='text-sm font-medium text-gray-900 mb-3'>Currency</h2>
        <Select
          value={localCurrency}
          onValueChange={(value) => {
            setLocalCurrency(value);
            handleSettingsUpdate({ currency: value });
          }}
        >
          <SelectTrigger className='w-full bg-white border-gray-200'>
            <SelectValue placeholder='Select currency' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='usd'>USD - US Dollar</SelectItem>
            <SelectItem value='eur'>EUR - Euro</SelectItem>
            <SelectItem value='gbp'>GBP - British Pound</SelectItem>
            <SelectItem value='cad'>CAD - Canadian Dollar</SelectItem>
            <SelectItem value='aud'>AUD - Australian Dollar</SelectItem>
            <SelectItem value='jpy'>JPY - Japanese Yen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor='notes'>Notes</Label>
        <Textarea
          id='notes'
          placeholder='Add any notes or payment instructions...'
          className='mt-1 h-32'
          value={notes}
          onChange={(e) => {
            return setNotes(e.target.value);
          }}
        />
      </div>

      {/* Invoice delivery settings */}
      <div className='border p-4 rounded-lg'>
        <h2 className='text-sm font-medium text-gray-900 mb-3'>Invoice Delivery Options</h2>

        <div className='space-y-4'>
          <div>
            <Label className='flex items-center gap-2 mb-1'>
              <Switch checked={sendAutomatically} onCheckedChange={setSendAutomatically} />
              <span className='font-medium'>Send invoice to client automatically</span>
            </Label>
            <p className='text-xs text-gray-500 ml-9'>
              {sendAutomatically
                ? "Invoice will be emailed to client as soon as it's finalized"
                : "You'll need to manually send the invoice to your client"}
            </p>
          </div>

          <div>
            <Label className='flex items-center gap-2 mb-1'>
              <Switch checked={includePaymentLink} onCheckedChange={setIncludePaymentLink} />
              <span className='font-medium'>Include online payment</span>
            </Label>
            <p className='text-xs text-gray-500 ml-9'>
              {includePaymentLink
                ? 'Client can pay online directly through the invoice'
                : 'Client will need to arrange payment manually'}
            </p>
          </div>

          <div>
            <Label className='flex items-center gap-2 mb-1'>
              <Switch checked={scheduleReminders} onCheckedChange={setScheduleReminders} />
              <span className='font-medium'>Schedule automatic reminders</span>
            </Label>
            <p className='text-xs text-gray-500 ml-9'>
              {scheduleReminders
                ? 'Reminders will be sent if invoice is overdue'
                : 'No automatic reminders will be sent'}
            </p>
            {scheduleReminders && (
              <div className='mt-2 ml-9 p-2 bg-blue-50 rounded-md text-xs flex items-start gap-2'>
                <Info className='h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0' />
                <p className='text-blue-700'>
                  Reminders will be sent 3, 7, and 14 days after the due date if the invoice remains
                  unpaid.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipping section with prominent styling */}
      <div className='border p-4 rounded-lg bg-gray-50'>
        <h2 className='text-sm font-medium text-gray-900 mb-3 flex items-center gap-2'>
          <TruckIcon size={18} />
          Shipping Options
        </h2>

        {shippingItem ? (
          <div className='mb-3 p-3 rounded-md bg-green-50 border border-green-200'>
            <p className='text-sm text-green-700 font-medium'>Shipping added to invoice</p>
            <p className='text-xs text-green-600 mt-1'>
              {shippingItem.name} - ${shippingItem.price.toFixed(2)}
            </p>
            <Button
              variant='link'
              size='sm'
              className='text-green-700 p-0 mt-1'
              onClick={() => {
                return setActiveTab('shipping');
              }}
            >
              Edit shipping details
            </Button>
          </div>
        ) : (
          <>
            <Label className='flex items-center gap-2 mb-3'>
              <Switch
                checked={shippingRequired || hasPhysicalProducts}
                onCheckedChange={handleShippingToggle}
                disabled={hasPhysicalProducts} // Disable if we already have physical products
              />
              <span>
                {hasPhysicalProducts
                  ? 'Shipping required for physical products'
                  : 'Add shipping to this invoice'}
              </span>
            </Label>

            {(shippingRequired || hasPhysicalProducts) && !shippingItem && (
              <Button
                variant='outline'
                size='sm'
                className='w-full mt-2'
                onClick={() => {
                  return setActiveTab('shipping');
                }}
              >
                <TruckIcon size={14} className='mr-2' />
                Configure Shipping Details
              </Button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default InvoiceDetails;
