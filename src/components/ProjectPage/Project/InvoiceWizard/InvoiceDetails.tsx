import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

interface InvoiceDetailsProps {
  taxRate: number;
  setTaxRate: (value: number) => void;
  reducedTaxRate: number;
  setReducedTaxRate: (value: number) => void;
  notes: string;
  setNotes: (value: string) => void;
  shippingRequired: boolean;
  setShippingRequired: (value: boolean) => void;
  hasPhysicalProducts: boolean;
}

const InvoiceDetails = ({
  taxRate,
  setTaxRate,
  reducedTaxRate,
  setReducedTaxRate,
  notes,
  setNotes,
  shippingRequired,
  setShippingRequired,
  hasPhysicalProducts,
}: InvoiceDetailsProps) => {
  return (
    <motion.div
      key='details'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='space-y-6'
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='tax-rate'>Standard Tax Rate (%)</Label>
          <Input
            id='tax-rate'
            type='number'
            value={taxRate}
            onChange={(e) => {
              return setTaxRate(Number(e.target.value));
            }}
            className='mt-1'
          />
        </div>
        <div>
          <Label htmlFor='reduced-tax-rate'>Reduced Tax Rate (%)</Label>
          <Input
            id='reduced-tax-rate'
            type='number'
            value={reducedTaxRate}
            onChange={(e) => {
              return setReducedTaxRate(Number(e.target.value));
            }}
            className='mt-1'
          />
        </div>
      </div>

      <div>
        <Label htmlFor='currency'>Currency</Label>
        <select
          id='currency'
          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1'
          defaultValue='USD'
        >
          <option value='USD'>USD ($)</option>
          <option value='EUR'>EUR (€)</option>
          <option value='GBP'>GBP (£)</option>
          <option value='CAD'>CAD (C$)</option>
        </select>
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
