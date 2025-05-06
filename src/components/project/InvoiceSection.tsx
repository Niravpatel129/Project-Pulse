'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SectionFooter from './SectionFooter';
import { Client, InvoiceSettings, Item } from './types';

// Self-contained input component that manages its own state
function StatefulInput({
  id,
  type = 'text',
  initialValue,
  onValueChange,
  className,
  label,
  placeholder,
  min,
  max,
  step,
}: {
  id: string;
  type?: string;
  initialValue: string | number;
  onValueChange: (value: string | number) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
}) {
  // Internal state that won't cause parent re-renders
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const firstRender = useRef(true);

  // Only update local state if the initialValue prop changes
  useEffect(() => {
    if (!firstRender.current) {
      setValue(initialValue);
    }
    firstRender.current = false;
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    // Only update local state during typing, don't trigger parent updates
    setValue(newValue);
  };

  // Only trigger parent updates when input loses focus
  const handleBlur = () => {
    onValueChange(value);
  };

  return (
    <div>
      {label && (
        <Label htmlFor={id} className='block mb-1'>
          {label}
        </Label>
      )}
      <Input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={className}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

// Self-contained textarea component that manages its own state
function StatefulTextarea({
  id,
  initialValue,
  onValueChange,
  className,
  label,
  placeholder,
  height,
}: {
  id: string;
  initialValue: string;
  onValueChange: (value: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  height?: string;
}) {
  // Internal state that won't cause parent re-renders
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firstRender = useRef(true);

  // Only update local state if the initialValue prop changes
  useEffect(() => {
    if (!firstRender.current) {
      setValue(initialValue);
    }
    firstRender.current = false;
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Only update local state during typing, don't trigger parent updates
    setValue(newValue);
  };

  // Only trigger parent updates when input loses focus
  const handleBlur = () => {
    onValueChange(value);
  };

  return (
    <div>
      {label && (
        <Label htmlFor={id} className='block mb-1'>
          {label}
        </Label>
      )}
      <Textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${className} ${height ? height : ''}`}
        placeholder={placeholder}
      />
    </div>
  );
}

type InvoiceSectionProps = {
  items: Item[];
  client: Client;
  projectCurrency: string;
  notes: string;
  invoiceSettings: InvoiceSettings;
  setInvoiceSettings: (settings: InvoiceSettings) => void;
  workspaceTaxSettings: {
    defaultTaxRate: number;
    taxId: string;
  };
  onWorkspaceTaxSettingsChange: (settings: { defaultTaxRate: number; taxId: string }) => void;
  dueDate: Date | null;
  setDueDate: (date: Date | null) => void;
  onClose: () => void;
};

export default function InvoiceSection({
  items,
  client,
  projectCurrency,
  notes,
  invoiceSettings,
  setInvoiceSettings,
  workspaceTaxSettings,
  onWorkspaceTaxSettingsChange,
  dueDate,
  setDueDate,
  onClose,
}: InvoiceSectionProps) {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + Number.parseFloat(item.price.replace(/,/g, '')) * Number.parseFloat(item.quantity);
  }, 0);

  // Calculate discount if enabled
  const discountAmount = invoiceSettings.allowDiscount
    ? (subtotal * (invoiceSettings.defaultDiscountRate || 0)) / 100
    : 0;

  // Calculate tax
  const taxAmount = ((subtotal - discountAmount) * workspaceTaxSettings.defaultTaxRate) / 100;

  // Calculate total
  const total = subtotal - discountAmount + taxAmount;

  // Calculate deposit amount if enabled
  const depositAmount = invoiceSettings.requireDeposit
    ? (total * invoiceSettings.depositPercentage) / 100
    : 0;

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Custom handlers to preserve scroll position
  const handleInvoiceSettingsChange = (newSettings: Partial<InvoiceSettings>) => {
    // Update settings
    setInvoiceSettings({
      ...invoiceSettings,
      ...newSettings,
    });
  };

  const handleWorkspaceTaxSettingsChange = (newSettings: Partial<typeof workspaceTaxSettings>) => {
    // Update settings
    onWorkspaceTaxSettingsChange({
      ...workspaceTaxSettings,
      ...newSettings,
    });
  };

  const handleGenerateInvoice = async () => {
    if (items.length === 0) {
      return;
    }

    setIsGeneratingInvoice(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => {
        return setTimeout(resolve, 1500);
      });

      // In a real app, this would make an API request to generate the invoice
      console.log('Invoice Details:', {
        items,
        client,
        projectCurrency,
        notes,
        invoiceSettings,
        workspaceTaxSettings,
        dueDate,
      });

      setIsGeneratingInvoice(false);
      onClose();
    } catch (error) {
      console.error('Error generating invoice:', error);
      setIsGeneratingInvoice(false);
    }
  };

  // Section components for better organization
  const ClientInformationCard = () => {
    return (
      <div className='border border-[#E5E7EB] rounded-md p-4'>
        <h3 className='text-sm font-medium text-[#111827] mb-3'>Client Information</h3>
        <div className='bg-[#F9FAFB] p-3 rounded-md'>
          <div className='font-medium'>{client.name}</div>
          <div className='text-sm text-[#6B7280]'>{client.email}</div>
          {client.phone && <div className='text-sm text-[#6B7280]'>{client.phone}</div>}
          {client.address && client.address.street && (
            <div className='text-sm text-[#6B7280] mt-2'>
              <div>{client.address.street}</div>
              <div>
                {client.address.city}
                {client.address.state && `, ${client.address.state}`} {client.address.postalCode}
              </div>
              {client.address.country && <div>{client.address.country}</div>}
            </div>
          )}
        </div>
      </div>
    );
  };

  const WorkspaceTaxSettingsCard = () => {
    // Local state for tax settings to prevent re-renders during typing
    const [localTaxSettings, setLocalTaxSettings] = useState({
      taxId: workspaceTaxSettings.taxId || '',
    });

    // Update local state only if props change (not during user input)
    useEffect(() => {
      setLocalTaxSettings({
        taxId: workspaceTaxSettings.taxId || '',
      });
    }, [workspaceTaxSettings.taxId]);

    const handleLocalTaxIdChange = (value: string) => {
      // Only update local state
      setLocalTaxSettings((prev) => {
        return {
          ...prev,
          taxId: value,
        };
      });
    };

    // Only update parent state on blur
    const handleTaxSettingsBlur = () => {
      if (localTaxSettings.taxId !== workspaceTaxSettings.taxId) {
        handleWorkspaceTaxSettingsChange({
          ...workspaceTaxSettings,
          taxId: localTaxSettings.taxId,
        });
      }
    };

    return (
      <div className='border border-[#E5E7EB] rounded-md p-4'>
        <h3 className='text-sm font-medium text-[#111827] mb-3'>Workspace Tax Settings</h3>

        <div className='bg-blue-50 border border-blue-100 rounded-md p-3 mb-4'>
          <p className='text-sm text-blue-800'>
            <span className='font-medium'>Note:</span> These tax settings apply to all projects in
            your workspace.
          </p>
        </div>

        <div>
          <Label htmlFor='tax-id' className='block mb-1'>
            Tax ID / VAT Number
          </Label>
          <Input
            id='tax-id'
            value={localTaxSettings.taxId}
            onChange={(e) => {
              return handleLocalTaxIdChange(e.target.value);
            }}
            onBlur={handleTaxSettingsBlur}
            className='w-full'
            placeholder='e.g. VAT123456789'
          />
        </div>
      </div>
    );
  };

  const ProjectSettingsCard = () => {
    return (
      <div className='border border-[#E5E7EB] rounded-md p-4'>
        <h3 className='text-sm font-medium text-[#111827] mb-3'>Project Invoice Settings</h3>

        <div className='space-y-4'>
          {/* Payment Terms */}
          <div>
            <StatefulInput
              id='payment-terms'
              initialValue={invoiceSettings.paymentTerms || ''}
              onValueChange={(value) => {
                handleInvoiceSettingsChange({
                  paymentTerms: value as string,
                });
              }}
              className='w-full'
              label='Payment Terms'
              placeholder='e.g. Net 30'
            />
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor='due-date' className='block mb-1'>
              Due Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={dueDate || undefined}
                  onSelect={(date) => {
                    setDueDate(date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Discount Option */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <Label htmlFor='allow-discount' className='block'>
                  Enable Discount
                </Label>
                <p className='text-xs text-[#6B7280]'>
                  Apply a discount to this project&apos;s invoices
                </p>
              </div>
              <Switch
                id='allow-discount'
                checked={invoiceSettings.allowDiscount}
                onCheckedChange={(checked) => {
                  handleInvoiceSettingsChange({
                    allowDiscount: checked,
                  });
                }}
              />
            </div>

            {invoiceSettings.allowDiscount && (
              <div className='pl-4 border-l-2 border-gray-200 mt-2'>
                <StatefulInput
                  id='discount-rate'
                  type='number'
                  initialValue={invoiceSettings.defaultDiscountRate || 0}
                  onValueChange={(value) => {
                    handleInvoiceSettingsChange({
                      defaultDiscountRate: value as number,
                    });
                  }}
                  className='w-full'
                  label='Discount Rate (%)'
                  min='0'
                  max='100'
                />
              </div>
            )}
          </div>

          {/* Deposit Options */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <Label htmlFor='require-deposit' className='block'>
                  Require Deposit
                </Label>
                <p className='text-xs text-[#6B7280]'>Allow client to pay a deposit upfront</p>
              </div>
              <Switch
                id='require-deposit'
                checked={invoiceSettings.requireDeposit}
                onCheckedChange={(checked) => {
                  handleInvoiceSettingsChange({
                    requireDeposit: checked,
                  });
                }}
              />
            </div>

            {invoiceSettings.requireDeposit && (
              <div className='pl-4 border-l-2 border-gray-200 mt-2'>
                <StatefulInput
                  id='deposit-percentage'
                  type='number'
                  initialValue={invoiceSettings.depositPercentage}
                  onValueChange={(value) => {
                    handleInvoiceSettingsChange({
                      depositPercentage: value as number,
                    });
                  }}
                  className='w-full'
                  label='Deposit Percentage (%)'
                  min='1'
                  max='100'
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const InvoiceItemsCard = () => {
    return (
      <div className='border border-[#E5E7EB] rounded-md p-4'>
        <h3 className='text-sm font-medium text-[#111827] mb-3'>Invoice Items</h3>
        <div className='max-h-[300px] overflow-y-auto'>
          {items.length > 0 ? (
            <table className='w-full text-sm'>
              <thead className='text-xs text-[#6B7280]'>
                <tr className='border-b border-[#E5E7EB]'>
                  <th className='text-left py-2 font-medium'>Item</th>
                  <th className='text-right py-2 font-medium'>Qty</th>
                  <th className='text-right py-2 font-medium'>Price</th>
                  <th className='text-right py-2 font-medium'>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const itemTotal =
                    Number.parseFloat(item.price.replace(/,/g, '')) *
                    Number.parseFloat(item.quantity);
                  return (
                    <tr key={item.id} className='border-b border-[#E5E7EB]'>
                      <td className='py-2'>
                        <div>{item.name}</div>
                        {item.description && (
                          <div className='text-xs text-[#6B7280]'>{item.description}</div>
                        )}
                      </td>
                      <td className='text-right py-2'>{item.quantity}</td>
                      <td className='text-right py-2'>
                        {getCurrencySymbol(projectCurrency)}
                        {item.price}
                      </td>
                      <td className='text-right py-2'>
                        {getCurrencySymbol(projectCurrency)}
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className='text-center py-6 text-[#6B7280]'>
              No items added to this invoice yet.
            </div>
          )}
        </div>
      </div>
    );
  };

  const InvoiceSummaryCard = () => {
    return (
      <div className='border border-[#E5E7EB] rounded-md p-4'>
        <h3 className='text-sm font-medium text-[#111827] mb-3'>Invoice Summary</h3>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='text-[#6B7280]'>Subtotal</span>
            <span>
              {getCurrencySymbol(projectCurrency)}
              {formatCurrency(subtotal)}
            </span>
          </div>

          {invoiceSettings.allowDiscount && (
            <div className='flex justify-between'>
              <span className='text-[#6B7280]'>
                Discount ({invoiceSettings.defaultDiscountRate || 0}%)
              </span>
              <span className='text-red-500'>
                -{getCurrencySymbol(projectCurrency)}
                {formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          <div className='flex justify-between'>
            <span className='text-[#6B7280]'>Tax ({workspaceTaxSettings.defaultTaxRate}%)</span>
            <span>
              {getCurrencySymbol(projectCurrency)}
              {formatCurrency(taxAmount)}
            </span>
          </div>

          <div className='flex justify-between pt-2 border-t border-[#E5E7EB] font-medium'>
            <span>Total</span>
            <span>
              {getCurrencySymbol(projectCurrency)}
              {formatCurrency(total)}
            </span>
          </div>

          {invoiceSettings.requireDeposit && (
            <div className='flex justify-between pt-4 border-t border-[#E5E7EB] mt-4'>
              <span className='text-[#6B7280]'>Deposit ({invoiceSettings.depositPercentage}%)</span>
              <span className='font-medium'>
                {getCurrencySymbol(projectCurrency)}
                {formatCurrency(depositAmount)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const InvoiceNotesCard = () => {
    return (
      <div className='border border-[#E5E7EB] rounded-md p-4'>
        <StatefulTextarea
          id='invoice-notes'
          initialValue={invoiceSettings.invoiceNotes || ''}
          onValueChange={(value) => {
            handleInvoiceSettingsChange({
              invoiceNotes: value,
            });
          }}
          className='w-full'
          height='h-20'
          label='Invoice Notes'
          placeholder='Add any additional notes to include on the invoice...'
        />
      </div>
    );
  };

  return (
    <div className='flex flex-col h-full relative'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Invoice Details</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Configure invoice details and payment options before generating.
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
            {/* Left Column */}
            <div className='space-y-6'>
              <WorkspaceTaxSettingsCard />
              <ProjectSettingsCard />
            </div>

            {/* Right Column */}
            <div className='space-y-6'>
              <InvoiceSummaryCard />
              <InvoiceNotesCard />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SectionFooter
        onContinue={handleGenerateInvoice}
        currentSection={4}
        totalSections={4}
        customContinueLabel={isGeneratingInvoice ? 'Generating...' : 'Generate Invoice'}
        onCancel={onClose}
        isLastSection={true}
      />
    </div>
  );
}
