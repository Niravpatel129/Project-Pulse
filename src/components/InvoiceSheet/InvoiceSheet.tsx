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
import { useQuery } from '@tanstack/react-query';
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
}

interface InvoiceSettings {
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { clients } = useClients();
  const { data: globalInvoiceSettings } = useInvoiceSettings();
  const { settings: lastInvoiceSettings, isLoading: isLoadingLastSettings } =
    useLastInvoiceSettings();
  const createInvoice = useCreateInvoice();
  const router = useRouter();

  const [fromAddress, setFromAddress] = useState<string>('');

  // Update from address when lastInvoiceSettings loads
  useEffect(() => {
    if (lastInvoiceSettings?.from) {
      setFromAddress(lastInvoiceSettings.from);
    }
  }, [lastInvoiceSettings]);

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    dateFormat: 'DD/MM/YYYY',
    salesTax: 'disable',
    vat: 'disable',
    currency: 'CAD',
    discount: 'disable',
    attachPdf: 'disable',
    decimals: 'yes',
    qrCode: 'enable',
    notes: '',
    logo: globalInvoiceSettings?.logo || '',
  });

  // Update invoice settings when lastInvoiceSettings loads
  useEffect(() => {
    if (lastInvoiceSettings) {
      setInvoiceSettings((prev) => {
        return {
          ...prev,
          dateFormat: lastInvoiceSettings.dateFormat || prev.dateFormat,
          salesTax: lastInvoiceSettings.salesTax?.enabled ? 'enable' : 'disable',
          vat: lastInvoiceSettings.vat?.enabled ? 'enable' : 'disable',
          currency: lastInvoiceSettings.currency || prev.currency,
          discount: lastInvoiceSettings.discount?.enabled ? 'enable' : 'disable',
          decimals: lastInvoiceSettings.decimals || prev.decimals,
          notes: lastInvoiceSettings.notes || prev.notes,
          logo: lastInvoiceSettings.logo || globalInvoiceSettings?.logo || prev.logo,
        };
      });
    }
  }, [lastInvoiceSettings, globalInvoiceSettings?.logo]);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      description: '',
      quantity: 1,
      price: '',
    },
  ]);
  const [invoiceTitle, setInvoiceTitle] = useState<string>('Invoice');
  const [taxRate, setTaxRate] = useState<number>(13);
  const [vatRate, setVatRate] = useState<number>(20);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-0001');
  const [issueDate, setIssueDate] = useState<Date>(() => {
    return new Date();
  });
  const [dueDate, setDueDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  });

  // Update rates and invoice number when lastInvoiceSettings loads
  useEffect(() => {
    if (lastInvoiceSettings) {
      setTaxRate(lastInvoiceSettings.salesTax?.rate || 13);
      setVatRate(lastInvoiceSettings.vat?.rate || 20);
      setDiscountAmount(lastInvoiceSettings.discount?.amount || 0);
      setInvoiceNumber(lastInvoiceSettings.newInvoiceNumber || 'INV-0001');
    }
  }, [lastInvoiceSettings]);

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

    const taxAmount = invoiceSettings.salesTax === 'enable' ? (subtotal * taxRate) / 100 : 0;
    const vatAmount = invoiceSettings.vat === 'enable' ? (subtotal * vatRate) / 100 : 0;
    const discount = invoiceSettings.discount === 'enable' ? discountAmount : 0;
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
    invoiceSettings.salesTax,
    invoiceSettings.vat,
    invoiceSettings.discount,
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
          enabled: invoiceSettings.salesTax === 'enable',
          rate: taxRate,
        },
        vat: {
          enabled: invoiceSettings.vat === 'enable',
          rate: vatRate,
        },
        discount: {
          enabled: invoiceSettings.discount === 'enable',
          amount: discountAmount,
        },
        decimals: invoiceSettings.decimals,
      },
      notes: invoiceSettings.notes,
      logo: invoiceSettings.logo,
    };

    createInvoice.mutate(invoiceData, {
      onSuccess: (data) => {
        toast.success('Invoice created successfully');
        setInvoiceCreated(true);
        setCreatedInvoiceData({ ...invoiceData, ...data });
        // Do NOT close the sheet here
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
  };

  const handleCreateAnother = () => {
    setInvoiceCreated(false);
    setCreatedInvoiceData(null);
    resetForm();
  };

  const handleViewInvoice = () => {
    const id = createdInvoiceData?._id || createdInvoiceData?.id;
    if (id) {
      router.push(`/dashboard/invoices?inv=${id}`);
    }
  };

  const resetForm = () => {
    // Reset form fields but preserve settings
    setFromAddress('');
    setInvoiceTitle('Invoice');
    setSelectedCustomer('');
    setToAddress('');
    setInvoiceNumber('INV-0001');
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

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
        }
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
          />
        ) : (
          <>
            <VisuallyHidden>
              <SheetTitle className='sr-only'>Invoice Editor</SheetTitle>
            </VisuallyHidden>
            <SheetHeader className='sticky top-3 right-3 z-10 bg-background pb-4'>
              <InvoiceSheetMenu
                settings={invoiceSettings}
                onSettingsChange={handleInvoiceSettingsChange}
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
                salesTax={invoiceSettings.salesTax}
                vat={invoiceSettings.vat}
                discount={invoiceSettings.discount}
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
              />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InvoiceSheet;
