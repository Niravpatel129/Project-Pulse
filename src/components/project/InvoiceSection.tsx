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
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, File, Paperclip, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import FileUploadManagerModal from '../ProjectPage/FileComponents/FileUploadManagerModal';
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
  attachments,
  onAttachmentsChange,
  hideAttachments,
}: {
  id: string;
  initialValue: string;
  onValueChange: (value: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  height?: string;
  hideAttachments?: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size?: string;
    type?: string;
  }>;
  onAttachmentsChange?: (
    attachments: Array<{
      id: string;
      name: string;
      url: string;
      size?: string;
      type?: string;
    }>,
  ) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (!firstRender.current) {
      setValue(initialValue);
    }
    firstRender.current = false;
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
  };

  const handleBlur = () => {
    onValueChange(value);
  };

  const handleAddFileToProject = (file: any) => {
    if (onAttachmentsChange) {
      const newAttachment = {
        id: file._id,
        name: file.originalName,
        url: file.downloadURL,
        type: file.contentType,
        size: formatFileSize(file.size),
      };
      onAttachmentsChange([...(attachments || []), newAttachment]);
    }
    setIsFileUploadOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeAttachment = (id: string) => {
    if (onAttachmentsChange) {
      onAttachmentsChange(
        (attachments || []).filter((attachment) => {
          return attachment.id !== id;
        }),
      );
    }
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

      {!hideAttachments && (
        <>
          <div className='mt-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                return setIsFileUploadOpen(true);
              }}
              className='mt-2'
            >
              <Paperclip className='h-4 w-4 mr-2' />
              Attach Files
            </Button>

            {attachments && attachments.length > 0 && (
              <div className='mt-2 space-y-2'>
                {attachments.map((attachment) => {
                  return (
                    <div
                      key={attachment.id}
                      className='flex items-center justify-between bg-muted p-2 rounded'
                    >
                      <div className='flex items-center'>
                        <File className='h-4 w-4 mr-2 text-muted-foreground' />
                        <span className='text-sm text-foreground'>{attachment.name}</span>
                        {attachment.size && (
                          <span className='text-xs text-muted-foreground ml-2'>
                            ({attachment.size})
                          </span>
                        )}
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          return removeAttachment(attachment.id);
                        }}
                        className='h-6 w-6 p-0'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <FileUploadManagerModal
            isOpen={isFileUploadOpen}
            onClose={() => {
              return setIsFileUploadOpen(false);
            }}
            handleAddFileToProject={handleAddFileToProject}
            initialFiles={attachments}
            onDeleteFile={removeAttachment}
          />
        </>
      )}
    </div>
  );
}

type InvoiceSectionProps = {
  items: Item[];
  client: Client;
  projectCurrency: string;
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
  existingInvoice?: {
    _id: string;
    client: {
      _id: string;
      user: {
        name: string;
        email: string;
      };
    };
    items: Array<{
      name: string;
      description: string;
      quantity: number;
      price: number;
      discount: number;
      tax: number;
    }>;
    total: number;
    status: string;
    dueDate: string;
    notes?: string;
    currency: string;
    taxRate: number;
    taxId?: string;
    showTaxId: boolean;
    requireDeposit: boolean;
    depositPercentage: number;
    discount: number;
    discountAmount: number;
    subtotal: number;
    taxAmount: number;
  };
  onChatClick?: () => void;
  onSectionChange?: (section: number) => void;
};

export default function InvoiceSection({
  items,
  client,
  projectCurrency,
  invoiceSettings,
  setInvoiceSettings,
  workspaceTaxSettings,
  onWorkspaceTaxSettingsChange,
  dueDate,
  setDueDate,
  onClose,
  existingInvoice,
  onChatClick,
  onSectionChange,
}: InvoiceSectionProps) {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['notes']);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const queryClient = useQueryClient();

  // Initialize dueDate from existingInvoice if available
  useEffect(() => {
    if (existingInvoice?.dueDate) {
      setDueDate(new Date(existingInvoice.dueDate));
    } else {
      setDueDate(null);
    }
  }, [existingInvoice, setDueDate]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number.parseFloat(item.quantity);
    const price = Number.parseFloat(item.price.replace(/,/g, ''));
    return sum + quantity * price;
  }, 0);

  const discountAmount = invoiceSettings.allowDiscount
    ? (subtotal * (invoiceSettings.defaultDiscountRate || 0)) / 100
    : 0;

  const taxAmount = items.reduce((sum, item) => {
    if (!item.taxRate) return sum;
    const quantity = Number.parseFloat(item.quantity);
    const price = Number.parseFloat(item.price.replace(/,/g, ''));
    const itemSubtotal = quantity * price;
    const itemDiscount = invoiceSettings.allowDiscount
      ? (itemSubtotal * (invoiceSettings.defaultDiscountRate || 0)) / 100
      : 0;
    const taxableAmount = itemSubtotal - itemDiscount;
    return sum + (taxableAmount * item.taxRate) / 100;
  }, 0);

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

  const handleSaveAsDraft = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one item to the invoice');
      return;
    }

    setIsGeneratingInvoice(true);

    try {
      // Prepare invoice data
      const invoiceData = {
        clientId: client._id,
        items: items.map((item) => {
          return {
            name: item.name,
            description: item.description,
            quantity: Number.parseFloat(item.quantity),
            price: Number.parseFloat(item.price.replace(/,/g, '')),
            discount: invoiceSettings.allowDiscount ? invoiceSettings.defaultDiscountRate : 0,
            tax: item.taxRate || 0,
            taxName: item.taxName || 'VAT',
          };
        }),
        dueDate: dueDate ? dueDate.toISOString() : null,
        taxRate: workspaceTaxSettings.defaultTaxRate,
        taxId: workspaceTaxSettings.taxId || '',
        showTaxId: !!workspaceTaxSettings.taxId,
        notes: invoiceSettings.invoiceNotes || '',
        teamNotes: invoiceSettings.teamNotes || '',
        teamNotesAttachments: invoiceSettings.teamNotesAttachments || [],
        currency: projectCurrency.toUpperCase(),
        deliveryOptions: 'email',
        requireDeposit: invoiceSettings.requireDeposit,
        depositPercentage: invoiceSettings.depositPercentage,
        discount: invoiceSettings.allowDiscount ? invoiceSettings.defaultDiscountRate : 0,
        discountAmount: discountAmount,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
        status: 'draft',
      };

      // Make API call to create or update invoice
      const response = existingInvoice
        ? await newRequest.put(`/invoices/${existingInvoice._id}`, invoiceData)
        : await newRequest.post('/invoices', invoiceData);

      if (response.data.status === 'success') {
        toast.success(existingInvoice ? 'Invoice updated successfully' : 'Invoice saved as draft');
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to save invoice');
      }
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast.error(error.message || 'Failed to save invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!client?._id) {
      toast.error('Please select a client');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item to the invoice');
      return;
    }

    setIsGeneratingInvoice(true);

    try {
      // Prepare invoice data
      const invoiceData = {
        clientId: client._id,
        items: items.map((item) => {
          return {
            name: item.name,
            description: item.description,
            quantity: Number.parseFloat(item.quantity),
            price: Number.parseFloat(item.price.replace(/,/g, '')),
            discount: invoiceSettings.allowDiscount ? invoiceSettings.defaultDiscountRate : 0,
            tax: item.taxRate || 0,
            taxName: item.taxName || 'VAT',
          };
        }),
        dueDate: dueDate ? dueDate.toISOString() : null,
        taxRate: workspaceTaxSettings.defaultTaxRate,
        taxId: workspaceTaxSettings.taxId || '',
        showTaxId: !!workspaceTaxSettings.taxId,
        notes: invoiceSettings.invoiceNotes || '',
        teamNotes: invoiceSettings.teamNotes || '',
        teamNotesAttachments: invoiceSettings.teamNotesAttachments || [],
        currency: projectCurrency.toUpperCase(),
        deliveryOptions: 'email',
        requireDeposit: invoiceSettings.requireDeposit,
        depositPercentage: invoiceSettings.depositPercentage,
        discount: invoiceSettings.allowDiscount ? invoiceSettings.defaultDiscountRate : 0,
        discountAmount: discountAmount,
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total,
        status: existingInvoice?.status || 'open',
      };

      // Make API call to create or update invoice
      const response = existingInvoice
        ? await newRequest.put(`/invoices/${existingInvoice._id}`, invoiceData)
        : await newRequest.post('/invoices', invoiceData);

      if (response.data.status === 'success') {
        toast.success(
          existingInvoice ? 'Invoice updated successfully' : 'Invoice created successfully',
        );
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to create invoice');
      }
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    } finally {
      // invalidate the invoices query
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', existingInvoice?._id] });
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <div className='flex flex-col h-full relative bg-background'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-foreground'>Invoice Details</h2>
          </div>
          <p className='text-muted-foreground text-sm leading-5 mb-6'>
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
              className='border border-border rounded-xl px-4 bg-background shadow-sm hover:shadow-md transition-all duration-200'
            >
              <AccordionTrigger className='text-sm font-medium text-foreground py-4'>
                Invoice Settings
              </AccordionTrigger>
              <AccordionContent>
                <div className='p-1'>
                  <div className='space-y-6'>
                    {/* Project Settings */}
                    <div className='space-y-4'>
                      {/* Due Date */}
                      <div>
                        <Label
                          htmlFor='due-date'
                          className='text-xs text-muted-foreground mb-1 block'
                        >
                          Payment Due
                        </Label>
                        <div className='flex gap-2'>
                          <Popover modal>
                            <PopoverTrigger asChild>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal bg-background border-input rounded-lg px-3 py-2 text-base font-medium text-foreground outline-none hover:border-primary hover:ring-2 hover:ring-primary/20 transition-colors',
                                  !dueDate && 'text-muted-foreground',
                                )}
                              >
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-auto p-0 min-w-[350px] bg-background border-border'
                              align='start'
                            >
                              <Calendar
                                mode='single'
                                selected={dueDate || undefined}
                                onSelect={(date) => {
                                  setDueDate(date);
                                }}
                                initialFocus
                                className='bg-background text-foreground'
                              />
                            </PopoverContent>
                          </Popover>
                          {dueDate && (
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={() => {
                                return setDueDate(null);
                              }}
                              className='bg-background border-input hover:border-primary hover:ring-2 hover:ring-primary/20'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Deposit Options */}
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <Label
                              htmlFor='require-deposit'
                              className='block text-sm font-medium text-foreground'
                            >
                              Require Deposit
                            </Label>
                            <p className='text-xs text-muted-foreground'>
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
                          <div className='space-y-3'>
                            <StatefulInput
                              id='deposit-percentage'
                              type='text'
                              initialValue={invoiceSettings.depositPercentage || ''}
                              onValueChange={(value) => {
                                const numValue = value === '' ? 0 : Number(value);
                                if (!isNaN(numValue)) {
                                  handleInvoiceSettingsChange({
                                    depositPercentage: numValue,
                                  });
                                }
                              }}
                              className='w-full bg-background border-input rounded-lg px-3 py-2 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors'
                              label='Deposit Percentage'
                              placeholder='0'
                            />
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-muted-foreground'>Total deposit:</span>
                              <span className='font-medium text-foreground'>
                                {((total * (invoiceSettings.depositPercentage || 0)) / 100).toFixed(
                                  2,
                                )}{' '}
                                {projectCurrency}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Notes Section */}
            <AccordionItem
              value='notes'
              className='border border-border rounded-xl px-4 bg-background shadow-sm hover:shadow-md transition-all duration-200'
            >
              <AccordionTrigger className='text-sm font-medium text-foreground py-4'>
                Notes & Additional Information
              </AccordionTrigger>
              <AccordionContent>
                <div className='p-1 space-y-6'>
                  <div>
                    <StatefulTextarea
                      id='invoice-notes'
                      initialValue={invoiceSettings.invoiceNotes || ''}
                      onValueChange={(value) => {
                        handleInvoiceSettingsChange({
                          invoiceNotes: value,
                        });
                      }}
                      className='w-full bg-background border-input rounded-lg px-3 py-2 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors'
                      height='h-20'
                      label='Invoice Notes & Terms'
                      placeholder='Add any additional notes to include on the invoice...'
                      hideAttachments={true}
                    />
                  </div>

                  <div>
                    <StatefulTextarea
                      id='team-notes'
                      initialValue={invoiceSettings.teamNotes || ''}
                      onValueChange={(value) => {
                        handleInvoiceSettingsChange({
                          teamNotes: value,
                        });
                      }}
                      className='w-full bg-background border-input rounded-lg px-3 py-2 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors'
                      height='h-20'
                      label='Team Notes (Private)'
                      placeholder='Add private notes for the team...'
                      attachments={invoiceSettings.teamNotesAttachments}
                      onAttachmentsChange={(attachments) => {
                        handleInvoiceSettingsChange({
                          teamNotesAttachments: attachments,
                        });
                      }}
                    />
                    <p className='text-xs text-muted-foreground mt-1'>
                      These notes and attachments are only visible to your team and will not be
                      included in the invoice.
                    </p>
                  </div>
                </div>
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
        secondaryAction={{
          label: isGeneratingInvoice ? 'Saving...' : 'Save as Draft',
          onClick: handleSaveAsDraft,
          disabled: isGeneratingInvoice,
        }}
        onChatClick={onChatClick}
      />
    </div>
  );
}
