import { useClients } from '@/hooks/useClients';
import { useCreateInvoice } from '@/hooks/useCreateInvoice';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useLastInvoiceSettings } from '@/hooks/useLastInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '../ui/sheet';
import { VisuallyHidden } from '../ui/visually-hidden';
import InvoiceCreatedConfirmation from './InvoiceCreatedConfirmation';
import InvoiceFromTo from './sections/InvoiceFromTo';
import InvoiceHeader from './sections/InvoiceHeader';
import InvoiceItemsRow from './sections/InvoiceItemsRow';
import InvoiceNotes from './sections/InvoiceNotes';
import InvoiceSheetFooter from './sections/InvoiceSheetFooter';
import InvoiceSheetMenu from './sections/InvoiceSheetMenu';
import InvoiceTotal from './sections/InvoiceTotal';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: string;
  total?: number;
}

interface InvoiceSettings {
  dateFormat: string;
  salesTax: {
    enabled: boolean;
    rate: number;
  };
  vat: {
    enabled: boolean;
    rate: number;
  };
  currency: string;
  discount: {
    enabled: boolean;
    amount: number;
  };
  attachPdf: string;
  decimals: 'yes' | 'no';
  qrCode: string;
  notes?: string;
  teamNotes?: string;
  logo?: string;
}

// Interface for the menu component's settings
interface MenuInvoiceSettings {
  dateFormat: string;
  salesTax: string;
  vat: string;
  currency: string;
  discount: string;
  attachPdf: string;
  decimals: 'yes' | 'no';
  qrCode: string;
  notes?: string;
  teamNotes?: string;
  logo?: string;
}

const SortableInvoiceItem = ({
  item,
  index,
  onUpdate,
  onDelete,
  currency,
  formatNumber,
}: {
  item: InvoiceItem;
  index: number;
  onUpdate: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onDelete: (id: string) => void;
  currency: string;
  formatNumber: (value: number) => string;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <InvoiceItemsRow
        item={item}
        onUpdate={onUpdate}
        isFirstRow={index === 0}
        onDelete={onDelete}
        dragHandleProps={index === 0 ? undefined : listeners}
        currency={currency}
        formatNumber={formatNumber}
      />
    </div>
  );
};

const InvoiceSheet = ({
  open,
  onOpenChange,
  existingInvoice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingInvoice?: any;
}) => {
  const { clients } = useClients();
  const { data: globalInvoiceSettings } = useInvoiceSettings();
  const { settings: lastInvoiceSettings, isLoading: isLoadingLastSettings } =
    useLastInvoiceSettings();
  const createInvoice = useCreateInvoice();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [fromAddress, setFromAddress] = useState<string>('');

  // Update from address when lastInvoiceSettings loads or when editing
  useEffect(() => {
    if (existingInvoice?.from) {
      setFromAddress(existingInvoice.from);
    } else if (lastInvoiceSettings?.from) {
      setFromAddress(lastInvoiceSettings.from);
    }
  }, [lastInvoiceSettings, existingInvoice]);

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(() => {
    if (existingInvoice?.settings) {
      return {
        dateFormat: existingInvoice.settings.dateFormat || 'DD/MM/YYYY',
        salesTax: {
          enabled: existingInvoice.settings.salesTax?.enabled || false,
          rate: existingInvoice.settings.salesTax?.rate || 13,
        },
        vat: {
          enabled: existingInvoice.settings.vat?.enabled || false,
          rate: existingInvoice.settings.vat?.rate || 20,
        },
        currency: existingInvoice.settings.currency || 'CAD',
        discount: {
          enabled: existingInvoice.settings.discount?.enabled || false,
          amount: existingInvoice.settings.discount?.amount || 0,
        },
        attachPdf: 'disable',
        decimals: existingInvoice.settings.decimals || 'yes',
        qrCode: 'enable',
        notes: existingInvoice.notes || '',
        logo: existingInvoice.logo || globalInvoiceSettings?.logo || '',
      };
    }
    return {
      dateFormat: 'DD/MM/YYYY',
      salesTax: {
        enabled: false,
        rate: 13,
      },
      vat: {
        enabled: false,
        rate: 20,
      },
      currency: 'CAD',
      discount: {
        enabled: false,
        amount: 0,
      },
      attachPdf: 'disable',
      decimals: 'yes',
      qrCode: 'enable',
      notes: '',
      logo: globalInvoiceSettings?.logo || '',
    };
  });

  // Update invoice settings when lastInvoiceSettings loads
  useEffect(() => {
    if (!existingInvoice && lastInvoiceSettings) {
      setInvoiceSettings((prev) => {
        return {
          ...prev,
          dateFormat: lastInvoiceSettings.dateFormat || prev.dateFormat,
          salesTax: {
            enabled: lastInvoiceSettings.salesTax?.enabled || false,
            rate: lastInvoiceSettings.salesTax?.rate || prev.salesTax.rate,
          },
          vat: {
            enabled: lastInvoiceSettings.vat?.enabled || false,
            rate: lastInvoiceSettings.vat?.rate || prev.vat.rate,
          },
          currency: lastInvoiceSettings.currency || prev.currency,
          discount: {
            enabled: lastInvoiceSettings.discount?.enabled || false,
            amount: lastInvoiceSettings.discount?.amount || prev.discount.amount,
          },
          decimals: lastInvoiceSettings.decimals || prev.decimals,
          notes: lastInvoiceSettings.notes || prev.notes,
          logo: lastInvoiceSettings.logo || globalInvoiceSettings?.logo || prev.logo,
        };
      });
    }
  }, [lastInvoiceSettings, globalInvoiceSettings?.logo, existingInvoice]);

  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (existingInvoice?.items) {
      return existingInvoice.items.map((item: any) => {
        return {
          id: item._id || uuidv4(),
          description: item.description || '',
          quantity: item.quantity || 1,
          price: item.price?.toString() || '',
          total: item.total,
        };
      });
    }
    return [
      {
        id: uuidv4(),
        description: '',
        quantity: 1,
        price: '',
      },
    ];
  });

  const [invoiceTitle, setInvoiceTitle] = useState<string>(
    existingInvoice?.invoiceTitle || 'Invoice',
  );
  const [taxRate, setTaxRate] = useState<number>(existingInvoice?.settings?.salesTax?.rate || 13);
  const [vatRate, setVatRate] = useState<number>(existingInvoice?.settings?.vat?.rate || 20);
  const [discountAmount, setDiscountAmount] = useState<number>(
    existingInvoice?.settings?.discount?.amount || 0,
  );
  const [selectedCustomer, setSelectedCustomer] = useState<string>(
    existingInvoice?.customer?.id || '',
  );
  const [toAddress, setToAddress] = useState<string>(existingInvoice?.to || '');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    existingInvoice?.invoiceNumber || 'INV-0001',
  );
  const [issueDate, setIssueDate] = useState<Date>(() => {
    return existingInvoice?.issueDate ? new Date(existingInvoice.issueDate) : new Date();
  });
  const [dueDate, setDueDate] = useState<Date>(() => {
    if (existingInvoice?.dueDate) {
      return new Date(existingInvoice.dueDate);
    }
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });

  // Update rates and invoice number when lastInvoiceSettings loads
  useEffect(() => {
    if (!existingInvoice && lastInvoiceSettings) {
      setTaxRate(lastInvoiceSettings.salesTax?.rate || 13);
      setVatRate(lastInvoiceSettings.vat?.rate || 20);
      setDiscountAmount(lastInvoiceSettings.discount?.amount || 0);
      setInvoiceNumber(lastInvoiceSettings.newInvoiceNumber || 'INV-0001');
    }
  }, [lastInvoiceSettings, existingInvoice]);

  const formatNumber = (value: number) => {
    if (invoiceSettings.decimals === 'yes') {
      return value.toFixed(2);
    }
    return Math.round(value).toString();
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prevItems) => {
      return prevItems.map((item) => {
        return item.id === id ? { ...item, [field]: value } : item;
      });
    });
  };

  const handleAddItem = () => {
    setItems((prevItems) => {
      return [
        ...prevItems,
        {
          id: uuidv4(),
          description: '',
          quantity: 1,
          price: '',
        },
      ];
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => {
          return item.id === active.id;
        });
        const newIndex = items.findIndex((item) => {
          return item.id === over.id;
        });

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = item.quantity;
      const price = parseFloat(item.price) || 0;
      return sum + quantity * price;
    }, 0);

    const taxAmount = invoiceSettings.salesTax.enabled ? (subtotal * taxRate) / 100 : 0;
    const vatAmount = invoiceSettings.vat.enabled ? (subtotal * vatRate) / 100 : 0;
    const discount = invoiceSettings.discount.enabled ? discountAmount : 0;
    const total = subtotal + taxAmount + vatAmount - discount;

    return {
      subtotal,
      taxAmount,
      vatAmount,
      discount,
      total,
    };
  }, [
    items,
    taxRate,
    vatRate,
    invoiceSettings.salesTax.enabled,
    invoiceSettings.vat.enabled,
    invoiceSettings.discount.enabled,
    discountAmount,
  ]);

  const handleTaxRateChange = (newTaxRate: number) => {
    setTaxRate(newTaxRate);
  };

  const handleVatRateChange = (newVatRate: number) => {
    setVatRate(newVatRate);
  };

  const handleDiscountAmountChange = (amount: number) => {
    setDiscountAmount(amount);
  };

  const handleInvoiceSettingsChange = (newSettings: Partial<InvoiceSettings>) => {
    setInvoiceSettings((prev) => {
      return {
        ...prev,
        ...newSettings,
      };
    });
  };

  const validateInvoice = () => {
    // Check if a customer is selected
    console.log('Selected customer:', selectedCustomer);
    if (!selectedCustomer) {
      toast.error('Please select a customer for the invoice');
      return false;
    }

    // Check if there are any items
    if (items.length === 0) {
      toast.error('Please add at least one item to the invoice');
      return false;
    }

    // Check if all items have required fields
    const invalidItems = items.filter((item) => {
      return !item.description || !item.price;
    });
    if (invalidItems.length > 0) {
      toast.error('Please fill in all required fields for each item');
      return false;
    }

    // Check if any items have invalid prices
    const invalidPrices = items.filter((item) => {
      const price = parseFloat(item.price);
      return isNaN(price) || price < 0;
    });
    if (invalidPrices.length > 0) {
      toast.error('Please enter valid prices for all items');
      return false;
    }

    return true;
  };

  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [createdInvoiceData, setCreatedInvoiceData] = useState<any>(null);

  // Reset form when sheet opens, unless editing existing invoice
  useEffect(() => {
    if (open && !existingInvoice) {
      resetForm();
      setInvoiceCreated(false);
      setCreatedInvoiceData(null);
    }
  }, [open, existingInvoice]);

  const updateInvoice = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await newRequest.put(`/invoices2/${existingInvoice._id}`, invoiceData);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success('Invoice updated successfully');
      setInvoiceCreated(true);
      setCreatedInvoiceData(response.data.invoice);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', existingInvoice._id] });
    },
    onError: (error: any) => {
      if (error?.response?.data?.message === 'Invoice number already exists') {
        toast.error('This invoice number is already in use. Please choose a different number.');
      } else {
        toast.error('Failed to update invoice');
        console.error('Error updating invoice:', error);
      }
    },
  });

  const handleCreateInvoice = () => {
    if (!validateInvoice()) {
      return;
    }

    // Get the selected customer data
    const selectedCustomerData = clients.find((client) => {
      return client._id === selectedCustomer;
    });

    // Prepare invoice data
    const invoiceData = {
      customer: {
        id: selectedCustomer,
        name: selectedCustomerData?.user.name || '',
        email: selectedCustomerData?.user.email || '',
      },
      invoiceTitle: invoiceTitle,
      invoiceNumber: invoiceNumber,
      from: fromAddress,
      to: toAddress,
      issueDate: issueDate,
      dueDate: dueDate,
      items: items.map((item) => {
        return {
          description: item.description,
          quantity: item.quantity,
          price: parseFloat(item.price),
          total: item.quantity * parseFloat(item.price),
        };
      }),
      totals: {
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        vatAmount: totals.vatAmount,
        discount: totals.discount,
        total: totals.total,
      },
      settings: {
        currency: invoiceSettings.currency,
        dateFormat: invoiceSettings.dateFormat,
        salesTax: {
          enabled: invoiceSettings.salesTax.enabled,
          rate: taxRate,
        },
        vat: {
          enabled: invoiceSettings.vat.enabled,
          rate: vatRate,
        },
        discount: {
          enabled: invoiceSettings.discount.enabled,
          amount: discountAmount,
        },
        decimals: invoiceSettings.decimals,
      },
      notes: invoiceSettings.notes,
      logo: invoiceSettings.logo,
    };

    if (existingInvoice) {
      updateInvoice.mutate(invoiceData);
    } else {
      createInvoice.mutate(invoiceData, {
        onSuccess: (response) => {
          toast.success('Invoice created successfully');
          setInvoiceCreated(true);
          const invoiceData = response.data.invoice;
          setCreatedInvoiceData(invoiceData);
        },
        onError: (error: any) => {
          if (error?.response?.data?.message === 'Invoice number already exists') {
            toast.error('This invoice number is already in use. Please choose a different number.');
          } else {
            toast.error('Failed to create invoice');
            console.error('Error creating invoice:', error);
          }
        },
      });
    }
  };

  const handleCreateAnother = () => {
    setInvoiceCreated(false);
    setCreatedInvoiceData(null);
    resetForm();
    // Clear the existingInvoice by calling onOpenChange with false and then true
    onOpenChange(false);
    setTimeout(() => {
      onOpenChange(true);
    }, 0);
  };

  const handleViewInvoice = () => {
    onOpenChange(false);

    const id = createdInvoiceData?._id || createdInvoiceData?.id;
    if (id) {
      router.push(`/dashboard/invoices?inv=${id}`);
      onOpenChange(false);
    }
  };

  const resetForm = () => {
    // Reset form fields but preserve settings, from address, and invoice number
    setInvoiceTitle('Invoice');
    setSelectedCustomer('');
    setToAddress('');
    setIssueDate(new Date());
    setDueDate(() => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    });
    setItems([
      {
        id: uuidv4(),
        description: '',
        quantity: 1,
        price: '',
      },
    ]);

    // Keep the current settings but reset tax, vat, and discount values
    setTaxRate(13);
    setVatRate(20);
    setDiscountAmount(0);
  };

  const { data: invoiceNumberValidation, refetch: validateInvoiceNumber } = useQuery({
    queryKey: ['validateInvoiceNumber', invoiceNumber],
    queryFn: async () => {
      const response = await newRequest.get(`/validate-number/${invoiceNumber}`);
      return response.data;
    },
    enabled: false, // Don't run automatically
  });

  const handleInvoiceNumberBlur = async () => {
    if (invoiceNumber) {
      try {
        await validateInvoiceNumber();
        if (invoiceNumberValidation?.exists) {
          toast.error('This invoice number is already in use. Please choose a different number.');
        }
      } catch (error) {
        console.error('Error validating invoice number:', error);
      }
    }
  };

  // Convert internal settings to menu settings format
  const menuSettings: MenuInvoiceSettings = {
    dateFormat: invoiceSettings.dateFormat,
    salesTax: invoiceSettings.salesTax.enabled ? 'enable' : 'disable',
    vat: invoiceSettings.vat.enabled ? 'enable' : 'disable',
    currency: invoiceSettings.currency,
    discount: invoiceSettings.discount.enabled ? 'enable' : 'disable',
    attachPdf: invoiceSettings.attachPdf,
    decimals: invoiceSettings.decimals,
    qrCode: invoiceSettings.qrCode,
    notes: invoiceSettings.notes,
    teamNotes: invoiceSettings.teamNotes,
    logo: invoiceSettings.logo,
  };

  // Handle settings change from menu
  const handleMenuSettingsChange = (newSettings: Partial<MenuInvoiceSettings>) => {
    setInvoiceSettings((prev) => {
      return {
        ...prev,
        dateFormat: newSettings.dateFormat || prev.dateFormat,
        salesTax: {
          enabled: newSettings.salesTax === 'enable',
          rate: prev.salesTax.rate,
        },
        vat: {
          enabled: newSettings.vat === 'enable',
          rate: prev.vat.rate,
        },
        currency: newSettings.currency || prev.currency,
        discount: {
          enabled: newSettings.discount === 'enable',
          amount: prev.discount.amount,
        },
        attachPdf: newSettings.attachPdf || prev.attachPdf,
        decimals: newSettings.decimals || prev.decimals,
        qrCode: newSettings.qrCode || prev.qrCode,
        notes: newSettings.notes || prev.notes,
        teamNotes: newSettings.teamNotes || prev.teamNotes,
        logo: newSettings.logo || prev.logo,
      };
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          if (!invoiceCreated) {
            resetForm();
          }
        }
        setInvoiceCreated(false);
        setCreatedInvoiceData(null);
        onOpenChange(isOpen);
      }}
    >
      <SheetContent
        side='right'
        className='w-[800px] !max-w-[600px] fixed right-4 top-4 bottom-4 px-12 bg-background max-h-[calc(100vh-2rem)] overflow-y-auto border rounded-lg shadow-lg [&>button]:hidden font-mono scrollbar-hide flex flex-col p-0'
      >
        {invoiceCreated && createdInvoiceData ? (
          <InvoiceCreatedConfirmation
            createdInvoiceData={createdInvoiceData}
            onViewInvoice={handleViewInvoice}
            onCreateAnother={handleCreateAnother}
            isEditing={!!existingInvoice}
          />
        ) : (
          <>
            <VisuallyHidden>
              <SheetTitle className='sr-only'>Invoice Editor</SheetTitle>
            </VisuallyHidden>
            <SheetHeader className='sticky top-3 right-3 z-10 bg-background pb-4'>
              <InvoiceSheetMenu
                settings={menuSettings}
                onSettingsChange={handleMenuSettingsChange}
              />
            </SheetHeader>
            <div className='mt-4 flex-1 px-12'>
              <InvoiceHeader
                dateFormat={invoiceSettings.dateFormat}
                invoiceNumber={invoiceNumber}
                onInvoiceNumberChange={setInvoiceNumber}
                onInvoiceNumberBlur={handleInvoiceNumberBlur}
                issueDate={issueDate}
                onIssueDateChange={setIssueDate}
                dueDate={dueDate}
                onDueDateChange={setDueDate}
                invoiceTitle={invoiceTitle}
                onInvoiceTitleChange={(title) => {
                  return setInvoiceTitle(title);
                }}
              />
              <InvoiceFromTo
                onCustomerSelect={(id) => {
                  setSelectedCustomer(id);
                  const customer = clients.find((c) => {
                    return c._id === id;
                  });
                  if (customer) {
                    setToAddress(`${customer.user.name}\n${customer.user.email}`);
                  }
                }}
                onFromAddressChange={setFromAddress}
                fromAddress={fromAddress}
                onToAddressChange={setToAddress}
                selectedCustomer={selectedCustomer}
                toAddress={toAddress}
              />
              <div className='flex flex-col gap-2 mt-8'>
                {/* Labels */}
                <div className='flex items-center gap-6 h-6'>
                  <div className='flex-[4] text-[11px] text-muted-foreground'>Description</div>
                  <div className='w-[60px] text-center text-[11px] text-muted-foreground'>
                    Quantity
                  </div>
                  <div className='w-[80px] text-[11px] text-muted-foreground'>Price</div>
                  <div className='w-[80px] text-right text-[11px] text-muted-foreground'>Total</div>
                </div>
                {/* Items */}
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={items.map((item) => {
                      return item.id;
                    })}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((item, index) => {
                      return (
                        <SortableInvoiceItem
                          key={item.id}
                          item={item}
                          index={index}
                          onUpdate={handleUpdateItem}
                          onDelete={(id) => {
                            setItems(
                              items.filter((item) => {
                                return item.id !== id;
                              }),
                            );
                          }}
                          currency={invoiceSettings.currency}
                          formatNumber={formatNumber}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
                {/* Add Item Button */}
                <div
                  className='mt-1 py-1 flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer hover:text-primary'
                  onClick={handleAddItem}
                >
                  <FiPlus /> Add Item
                </div>
              </div>
              <InvoiceTotal
                subtotal={totals.subtotal}
                total={totals.total}
                taxRate={taxRate}
                onTaxRateChange={handleTaxRateChange}
                vatRate={vatRate}
                onVatRateChange={handleVatRateChange}
                currency={invoiceSettings.currency}
                formatNumber={formatNumber}
                decimals={invoiceSettings.decimals}
                salesTax={invoiceSettings.salesTax.enabled ? 'enable' : 'disable'}
                vat={invoiceSettings.vat.enabled ? 'enable' : 'disable'}
                discount={invoiceSettings.discount.enabled ? 'enable' : 'disable'}
                discountAmount={discountAmount}
                onDiscountAmountChange={handleDiscountAmountChange}
              />
              <InvoiceNotes
                notes={invoiceSettings.notes}
                teamNotes={invoiceSettings.teamNotes}
                onNotesChange={(notes) => {
                  return handleInvoiceSettingsChange({ notes });
                }}
                onTeamNotesChange={(teamNotes) => {
                  return handleInvoiceSettingsChange({ teamNotes });
                }}
              />
            </div>
            <SheetFooter className='sticky bottom-0 bg-background pt-4 border-none'>
              <InvoiceSheetFooter
                items={items}
                onValidate={validateInvoice}
                onCreate={handleCreateInvoice}
                isEditing={!!existingInvoice}
                isLoading={createInvoice.isPending || updateInvoice.isPending}
              />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InvoiceSheet;
