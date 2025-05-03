import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign, Repeat } from 'lucide-react';
import { useState } from 'react';

interface UpfrontPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType?: 'upfront' | 'recurring';
}

export default function UpfrontPaymentDialog({
  open,
  onOpenChange,
  paymentType = 'upfront',
}: UpfrontPaymentDialogProps) {
  const { project } = useProject();

  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [sendInvoice, setSendInvoice] = useState(true);
  const [frequency, setFrequency] = useState('monthly');
  const [installments, setInstallments] = useState('3');
  const [includePaymentLink, setIncludePaymentLink] = useState(true);
  const [scheduleReminders, setScheduleReminders] = useState(true);
  const [currency, setCurrency] = useState('usd');
  const [taxId, setTaxId] = useState('');
  const [showTaxId, setShowTaxId] = useState(false);

  const handleSubmit = () => {
    // Here we would implement the actual payment processing
    const paymentData = {
      amount,
      dueDate,
      notes,
      paymentMethod,
      sendInvoice,
      includePaymentLink,
      scheduleReminders,
      currency,
      taxId: showTaxId ? taxId : '',
      showTaxId,
      projectName: project.name,
      paymentType,
    };

    // Add recurring payment specific data
    if (paymentType === 'recurring') {
      Object.assign(paymentData, {
        frequency,
        installments: parseInt(installments, 10),
      });
    }

    console.log('Processing payment:', paymentData);

    // Close the dialog
    onOpenChange(false);
  };

  // Calculated payment amount per installment for recurring payments
  const paymentPerInstallment =
    amount && installments && parseInt(installments, 10) > 0
      ? (parseFloat(amount) / parseInt(installments, 10)).toFixed(2)
      : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[750px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>
            {paymentType === 'upfront' ? 'Request Deposit Payment' : 'Setup Payment Schedule'}
          </DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 py-4'>
          {/* Left column - Essential payment details */}
          <div className='space-y-4'>
            <div className='space-y-1'>
              <h3 className='text-sm font-medium text-gray-900'>Payment Details</h3>
              <div className='h-px bg-gray-200 my-1'></div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='amount' className='font-medium'>
                  {paymentType === 'upfront' ? 'Deposit Amount' : 'Total Amount'}
                </Label>
                <div className='relative'>
                  <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
                  <Input
                    id='amount'
                    placeholder='0.00'
                    value={amount}
                    onChange={(e) => {
                      return setAmount(e.target.value);
                    }}
                    className='pl-9'
                    type='number'
                    min='0'
                    step='0.01'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='currency' className='font-medium'>
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id='currency'>
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
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='payment-method' className='font-medium'>
                  Payment Method
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id='payment-method'>
                    <SelectValue placeholder='Select method' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='credit-card'>Credit Card</SelectItem>
                    <SelectItem value='bank-transfer'>Bank Transfer</SelectItem>
                    <SelectItem value='paypal'>PayPal</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='due-date' className='font-medium'>
                  Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dueDate ? format(dueDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar mode='single' selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {paymentType === 'recurring' && (
              <>
                <div className='space-y-1 pt-2'>
                  <h3 className='text-sm font-medium text-gray-900'>Payment Schedule</h3>
                  <div className='h-px bg-gray-200 my-1'></div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='frequency' className='font-medium'>
                      Payment Frequency
                    </Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger id='frequency'>
                        <SelectValue placeholder='Select frequency' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='weekly'>Weekly</SelectItem>
                        <SelectItem value='biweekly'>Bi-Weekly</SelectItem>
                        <SelectItem value='monthly'>Monthly</SelectItem>
                        <SelectItem value='quarterly'>Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='installments' className='font-medium'>
                      Number of Installments
                    </Label>
                    <div className='relative'>
                      <Repeat className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500' />
                      <Input
                        id='installments'
                        placeholder='3'
                        value={installments}
                        onChange={(e) => {
                          return setInstallments(e.target.value);
                        }}
                        className='pl-9'
                        type='number'
                        min='2'
                        max='36'
                        step='1'
                      />
                    </div>
                  </div>
                </div>

                {amount && installments && (
                  <div className='bg-gray-50 border border-gray-200 p-3 rounded-md'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-700'>Per installment:</span>
                      <span className='font-medium'>${paymentPerInstallment}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-700'>Total amount:</span>
                      <span className='font-medium'>${parseFloat(amount).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className='space-y-1 pt-2'>
              <h3 className='text-sm font-medium text-gray-900'>Tax Information</h3>
              <div className='h-px bg-gray-200 my-1'></div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='tax-id' className='font-medium'>
                  Tax ID
                </Label>
                <div className='flex items-center'>
                  <label htmlFor='show-tax-id' className='text-xs text-gray-600 mr-2'>
                    Show on invoice
                  </label>
                  <Switch
                    id='show-tax-id'
                    className='data-[state=checked]:bg-gray-900'
                    checked={showTaxId}
                    onCheckedChange={setShowTaxId}
                  />
                </div>
              </div>
              <Input
                id='tax-id'
                value={taxId}
                onChange={(e) => {
                  return setTaxId(e.target.value);
                }}
                placeholder='Enter your tax ID'
              />
              <p className='text-xs text-gray-500'>This will appear on the invoice if enabled.</p>
            </div>
          </div>

          {/* Right column - Notes and delivery options */}
          <div className='space-y-4'>
            <div className='space-y-1'>
              <h3 className='text-sm font-medium text-gray-900'>Notes</h3>
              <div className='h-px bg-gray-200 my-1'></div>
            </div>

            <div className='space-y-2'>
              <Textarea
                id='notes'
                placeholder='Add any notes or payment instructions...'
                className='h-28'
                value={notes}
                onChange={(e) => {
                  return setNotes(e.target.value);
                }}
              />
              <p className='text-xs text-gray-500'>These notes will be visible on the invoice.</p>
            </div>

            <div className='space-y-1 pt-2'>
              <h3 className='text-sm font-medium text-gray-900'>Delivery Options</h3>
              <div className='h-px bg-gray-200 my-1'></div>
            </div>

            <div className=' gap-3'>
              <div className=' gap-4'>
                <div>
                  <Label className='flex items-center gap-2 mb-1'>
                    <Switch checked={sendInvoice} onCheckedChange={setSendInvoice} />
                    <span className='font-medium'>Send invoice</span>
                  </Label>
                  <p className='text-xs text-gray-500 ml-9'>
                    {sendInvoice ? 'Email client immediately' : 'Send manually later'}
                  </p>
                </div>

                <div>
                  <Label className='flex items-center gap-2 mb-1'>
                    <Switch checked={includePaymentLink} onCheckedChange={setIncludePaymentLink} />
                    <span className='font-medium'>Online payment</span>
                  </Label>
                  <p className='text-xs text-gray-500 ml-9'>
                    {includePaymentLink ? 'Client can pay online' : 'Manual payment only'}
                  </p>
                </div>
              </div>

              <div>
                <Label className='flex items-center gap-2 mb-1'>
                  <Switch checked={scheduleReminders} onCheckedChange={setScheduleReminders} />
                  <span className='font-medium'>Schedule reminders</span>
                </Label>
                <p className='text-xs text-gray-500 ml-9'>
                  {scheduleReminders
                    ? 'Automatic reminders at 3, 7, and 14 days after due date'
                    : 'No automatic reminders will be sent'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='mt-4 pt-3 border-t'>
          <Button
            variant='outline'
            onClick={() => {
              return onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} className='font-medium'>
            {paymentType === 'upfront' ? 'Request Payment' : 'Setup Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
