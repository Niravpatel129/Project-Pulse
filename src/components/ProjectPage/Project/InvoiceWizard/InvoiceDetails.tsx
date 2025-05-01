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
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

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
}: InvoiceDetailsProps) => {
  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();
  const [isCreatingTax, setIsCreatingTax] = useState(false);
  const [newTax, setNewTax] = useState({ name: '', rate: 0 });
  const [localCurrency, setLocalCurrency] = useState(invoiceSettings?.currency || 'usd');

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

      <div>
        <Label className='flex items-center gap-2'>
          <Switch checked={true} onCheckedChange={() => {}} />
          <span>Send invoice to client automatically</span>
        </Label>
      </div>

      <div>
        <Label className='flex items-center gap-2'>
          <Switch checked={true} onCheckedChange={() => {}} />
          <span>Include payment link</span>
        </Label>
      </div>

      <div>
        <Label className='flex items-center gap-2'>
          <Switch checked={false} onCheckedChange={() => {}} />
          <span>Schedule automatic reminders</span>
        </Label>
      </div>
      <div>
        <Label className='flex items-center gap-2'>
          <Switch
            checked={shippingRequired || hasPhysicalProducts}
            onCheckedChange={(checked) => {
              return setShippingRequired(checked);
            }}
            disabled={hasPhysicalProducts} // Disable if we already have physical products
          />
          <span>
            {hasPhysicalProducts
              ? 'Shipping required for physical products'
              : 'Add shipping to this invoice'}
          </span>
        </Label>
      </div>
    </motion.div>
  );
};

export default InvoiceDetails;
