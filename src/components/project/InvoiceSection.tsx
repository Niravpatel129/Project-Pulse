'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['client-info']);

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

  return (
    <div className='flex flex-col h-full relative bg-[#FAFAFA]'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Invoice Details</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Configure invoice details and payment options before generating.
          </p>

          <Accordion
            type='multiple'
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
            className='w-full space-y-4'
          >
            {/* Invoice Settings Section */}
            <AccordionItem
              value='invoice-settings'
              className='border border-[#E5E7EB] rounded-xl px-4 bg-white shadow-sm hover:shadow-md transition-all duration-200'
            >
              <AccordionTrigger className='text-sm font-medium text-[#111827] py-4'>
                Invoice Settings
              </AccordionTrigger>
              <AccordionContent>
                <div className='space-y-6'>
                  {/* Workspace Tax Settings */}
                  <div>
                    <div>
                      <Label htmlFor='tax-id' className='text-xs text-gray-500 mb-1 block'>
                        Tax ID / VAT Number
                      </Label>
                      <Input
                        id='tax-id'
                        value={workspaceTaxSettings.taxId || ''}
                        onChange={(e) => {
                          handleWorkspaceTaxSettingsChange({
                            taxId: e.target.value,
                          });
                        }}
                        className='w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-base font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors'
                        placeholder='e.g. VAT123456789'
                      />
                    </div>
                  </div>

                  {/* Project Settings */}
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
                        className='w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-base font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors'
                        label='Payment Terms'
                        placeholder='e.g. Net 30'
                      />
                    </div>

                    {/* Due Date */}
                    <div>
                      <Label htmlFor='due-date' className='text-xs text-gray-500 mb-1 block'>
                        Due Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal border border-[#E5E7EB] rounded-lg px-3 py-2 text-base font-medium text-[#111827] outline-none hover:border-blue-400 hover:ring-2 hover:ring-blue-100 transition-colors',
                              !dueDate && 'text-[#9CA3AF]',
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
                          <Label
                            htmlFor='allow-discount'
                            className='block text-sm font-medium text-[#111827]'
                          >
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
                            className='w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-base font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors'
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
                          <Label
                            htmlFor='require-deposit'
                            className='block text-sm font-medium text-[#111827]'
                          >
                            Require Deposit
                          </Label>
                          <p className='text-xs text-[#6B7280]'>
                            Allow client to pay a deposit upfront
                          </p>
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
                            className='w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-base font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors'
                            label='Deposit Percentage (%)'
                            min='1'
                            max='100'
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Notes Section */}
            <AccordionItem
              value='notes'
              className='border border-[#E5E7EB] rounded-xl px-4 bg-white shadow-sm hover:shadow-md transition-all duration-200'
            >
              <AccordionTrigger className='text-sm font-medium text-[#111827] py-4'>
                Notes & Additional Information
              </AccordionTrigger>
              <AccordionContent>
                <StatefulTextarea
                  id='invoice-notes'
                  initialValue={invoiceSettings.invoiceNotes || ''}
                  onValueChange={(value) => {
                    handleInvoiceSettingsChange({
                      invoiceNotes: value,
                    });
                  }}
                  className='w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-base font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF] focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors'
                  height='h-20'
                  label='Invoice Notes'
                  placeholder='Add any additional notes to include on the invoice...'
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
