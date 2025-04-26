'use client';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColorPicker } from '@/components/ui/color-picker';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRightIcon,
  CreditCardIcon,
  Loader2,
  MinusIcon,
  MoreHorizontal,
  PenIcon,
  PlusIcon,
  Settings2Icon,
  TruckIcon,
} from 'lucide-react';
import { useState } from 'react';
import ModuleDialog from '../../ProjectPage/ProjectModules/ModuleDialog';
import { useQuickInvoice } from './hooks/useQuickInvoice';

// Animation variants for various components
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const slideIn = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } },
  exit: { x: -20, opacity: 0, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const listVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const sidebarVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { x: 20, opacity: 0, transition: { duration: 0.2 } },
};

interface QuickInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuickInvoiceDialog({ open, onOpenChange }: QuickInvoiceDialogProps) {
  // State for wizard UI
  const [currentView, setCurrentView] = useState<'items' | 'settings'>('items');
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [activeSettingTab, setActiveSettingTab] = useState('general');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  const {
    // State
    lineItems,
    isLoading,
    autoApplyDiscount,
    discountType,
    discountValue,
    memo,
    setMemo,
    footer,
    setFooter,
    localCurrency,
    setLocalCurrency,
    icon,
    setIcon,
    logo,
    setLogo,
    showTaxId,
    setShowTaxId,
    taxId,
    setTaxId,
    isCustomerPicked,
    setIsCustomerPicked,
    dueDate,
    setDueDate,
    isSubmitting,

    // Functions
    handleLineItemChange,
    addCustomLineItem,
    removeLineItem,
    toggleDiscount,
    handleDiscountTypeChange,
    handleDiscountValueChange,
    handleSettingsUpdate,
    handleSendInvoice,

    // Calculations
    subtotal,
    discountTotal,
    selectedTaxRate,
    taxAmount,
    total,

    // From other hooks
    project,
    handleCustomerSelect,
    selectedCustomer,
    currentCustomer,
    setCurrency,
    deliveryMethod,
    setDeliveryMethod,
    selectedTax,
    setSelectedTax,
    invoiceSettings,
    sendInvoiceMutation,
  } = useQuickInvoice(open, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='p-0 max-w-5xl max-h-[90vh] overflow-hidden'>
        <DialogTitle className='sr-only'>Quick Invoice Creator</DialogTitle>
        <motion.div
          className='flex flex-col h-full'
          initial='hidden'
          animate='visible'
          variants={fadeIn}
        >
          {/* Header - Simplified with more whitespace and cleaner layout */}
          <div className='border-b border-gray-100 px-6 py-4 flex justify-between items-center'>
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full h-8 w-8'
                onClick={() => {
                  return onOpenChange(false);
                }}
              >
                <ArrowLeft className='h-4 w-4 text-gray-500' />
              </Button>
              <h2 className='text-base font-medium text-gray-900'>Quick Invoice</h2>
            </div>
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='sm'
                className={`${showSettingsSidebar ? 'bg-gray-50' : ''} h-8 px-3`}
                onClick={() => {
                  return setShowSettingsSidebar(!showSettingsSidebar);
                }}
              >
                <Settings2Icon className='h-4 w-4 mr-2 text-gray-500' />
                <span className='text-gray-700'>Settings</span>
              </Button>
              <motion.div initial={{ scale: 1 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size='sm'
                  className='h-8 px-4'
                  onClick={handleSendInvoice}
                  disabled={
                    isSubmitting ||
                    sendInvoiceMutation.isPending ||
                    !currentCustomer ||
                    lineItems.length === 0 ||
                    !lineItems.some((item) => {
                      return item.name && item.price;
                    }) ||
                    total < 0.5
                  }
                >
                  {isSubmitting || sendInvoiceMutation.isPending ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='flex items-center'
                    >
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending...
                    </motion.div>
                  ) : total < 0.5 ? (
                    'Invoice total must be at least $0.50'
                  ) : (
                    'Send Invoice'
                  )}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Main content - More consistent spacing and cleaner layout */}
          <motion.div
            className='flex flex-1 overflow-hidden'
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Main panel */}
            <motion.div
              className={`${showSettingsSidebar ? 'w-3/5' : 'w-full'}`}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ScrollArea className='h-[calc(90vh-68px)]'>
                <div className='p-6 space-y-6'>
                  {/* Client selection - More whitespace and cleaner layout */}
                  <AnimatePresence mode='wait'>
                    <motion.div
                      key={isCustomerPicked ? 'picked' : 'unpicked'}
                      initial='hidden'
                      animate='visible'
                      exit='exit'
                      variants={fadeIn}
                    >
                      <h2 className='text-sm font-medium text-gray-800 mb-3'>Customer</h2>
                      {isCustomerPicked ? (
                        <motion.div variants={slideIn}>
                          <div className='flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100'>
                            <div>
                              <p className='text-sm font-medium text-gray-800'>
                                {currentCustomer.name}
                              </p>
                              <p className='text-sm text-gray-500'>{currentCustomer.email}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 hover:bg-gray-100'
                                >
                                  <MoreHorizontal className='h-4 w-4 text-gray-400' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className='w-56' align='end'>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setIsCustomerPicked(false);
                                    handleCustomerSelect('');
                                  }}
                                >
                                  Switch customer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div variants={slideIn}>
                          <Select
                            value={selectedCustomer}
                            onValueChange={(value) => {
                              handleCustomerSelect(value);
                              if (value && value !== 'new') {
                                setIsCustomerPicked(true);
                              }
                            }}
                          >
                            <SelectTrigger className='w-full bg-white border-gray-200'>
                              <SelectValue placeholder='Select customer' />
                            </SelectTrigger>
                            <SelectContent>
                              {project?.participants?.length > 0 &&
                                project.participants.map((participant) => {
                                  return (
                                    <SelectItem key={participant._id} value={participant._id}>
                                      <div className='flex items-center gap-2'>
                                        <div className='text-sm font-medium text-gray-800'>
                                          {participant.name}
                                        </div>
                                        <div className='text-xs text-gray-500'>
                                          {participant.email}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Line Items - More consistent spacing */}
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <h3 className='text-sm font-medium text-gray-800'>Line Items</h3>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={addCustomLineItem}
                          className='flex items-center gap-1 h-8 px-3'
                        >
                          <PlusIcon className='h-3.5 w-3.5' />
                          <span className='text-xs'>Add Item</span>
                        </Button>
                      </motion.div>
                    </div>

                    {isLoading ? (
                      <motion.div
                        className='flex justify-center items-center py-12 border border-gray-100 rounded-md bg-gray-50'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Loader2 className='h-5 w-5 animate-spin text-gray-400' />
                        <span className='ml-2 text-sm text-gray-500'>
                          Loading suggested items...
                        </span>
                      </motion.div>
                    ) : (
                      <>
                        {lineItems.length > 0 ? (
                          <motion.div
                            className='space-y-3'
                            variants={listVariants}
                            initial='hidden'
                            animate='visible'
                          >
                            <AnimatePresence>
                              {lineItems.map((item) => {
                                return (
                                  <motion.div
                                    key={item.id}
                                    className='flex gap-3 items-start border border-gray-100 p-4 rounded-md bg-gray-50'
                                    layout
                                    variants={itemVariants}
                                    initial='hidden'
                                    animate='visible'
                                    exit='exit'
                                  >
                                    <div className='flex-1 space-y-3'>
                                      <div>
                                        <Label
                                          htmlFor={`name-${item.id}`}
                                          className='text-xs text-gray-500 mb-1 block'
                                        >
                                          Item Name
                                        </Label>
                                        <Input
                                          id={`name-${item.id}`}
                                          placeholder='Name'
                                          value={item.name}
                                          onChange={(e) => {
                                            return handleLineItemChange(
                                              item.id,
                                              'name',
                                              e.target.value,
                                            );
                                          }}
                                          className='border-gray-200'
                                        />
                                      </div>
                                      <div className='grid grid-cols-3 gap-3'>
                                        <div>
                                          <Label
                                            htmlFor={`qty-${item.id}`}
                                            className='text-xs text-gray-500 mb-1 block'
                                          >
                                            Quantity
                                          </Label>
                                          <Input
                                            id={`qty-${item.id}`}
                                            placeholder='Qty'
                                            value={item.quantity}
                                            onChange={(e) => {
                                              return handleLineItemChange(
                                                item.id,
                                                'quantity',
                                                parseInt(e.target.value) || 1,
                                              );
                                            }}
                                            type='number'
                                            min='1'
                                            className='border-gray-200'
                                          />
                                        </div>
                                        <div>
                                          <Label
                                            htmlFor={`price-${item.id}`}
                                            className='text-xs text-gray-500 mb-1 block'
                                          >
                                            Price ($)
                                          </Label>
                                          <Input
                                            id={`price-${item.id}`}
                                            placeholder='Price'
                                            value={item.price}
                                            onChange={(e) => {
                                              return handleLineItemChange(
                                                item.id,
                                                'price',
                                                e.target.value,
                                              );
                                            }}
                                            type='number'
                                            className='border-gray-200'
                                          />
                                        </div>
                                        <div>
                                          <Label
                                            htmlFor={`discount-${item.id}`}
                                            className='text-xs text-gray-500 mb-1 block'
                                          >
                                            Discount (%)
                                          </Label>
                                          <Input
                                            id={`discount-${item.id}`}
                                            placeholder='Discount %'
                                            value={
                                              item.discount === undefined || isNaN(item.discount)
                                                ? ''
                                                : item.discount
                                            }
                                            onChange={(e) => {
                                              const value =
                                                e.target.value === ''
                                                  ? undefined
                                                  : parseInt(e.target.value);
                                              // Ensure discount doesn't exceed 100%
                                              const safeValue =
                                                value !== undefined
                                                  ? Math.min(value, 99)
                                                  : undefined;
                                              return handleLineItemChange(
                                                item.id,
                                                'discount',
                                                safeValue,
                                              );
                                            }}
                                            type='number'
                                            max='100'
                                            className='border-gray-200'
                                          />
                                        </div>
                                      </div>
                                      {item.moduleName && item.moduleType !== 'custom' && (
                                        <div className='flex items-center justify-between'>
                                          <div className='text-xs text-gray-400'>
                                            From {item.moduleType}: {item.moduleName}
                                          </div>
                                          {item.moduleId && (
                                            <Button
                                              variant='ghost'
                                              size='sm'
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveModuleId(item.moduleId);
                                              }}
                                              className='text-xs flex items-center gap-1 text-gray-600 hover:text-gray-700'
                                            >
                                              View Module
                                            </Button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    <motion.button
                                      whileHover={{
                                        scale: 1.1,
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                      }}
                                      whileTap={{ scale: 0.95 }}
                                      className='w-8 h-8 mt-6 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500'
                                      onClick={() => {
                                        return removeLineItem(item.id);
                                      }}
                                    >
                                      <MinusIcon className='h-4 w-4' />
                                    </motion.button>
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                          </motion.div>
                        ) : (
                          <motion.div
                            className='text-sm text-gray-500 py-12 text-center border border-gray-100 rounded-md bg-gray-50'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            No items added. Add a custom item or select a client with associated
                            modules.
                          </motion.div>
                        )}
                      </>
                    )}

                    {/* Quick Settings - More consistent spacing and cleaner separator */}
                    <motion.div
                      className='space-y-4 pt-4 border-t border-gray-100 mt-6'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {/* Discount Toggle */}
                      <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Switch
                              id='auto-discount'
                              checked={autoApplyDiscount}
                              onCheckedChange={toggleDiscount}
                            />
                            <Label htmlFor='auto-discount' className='text-sm text-gray-700'>
                              Apply discount to all items
                            </Label>
                          </div>
                        </div>

                        <AnimatePresence>
                          {autoApplyDiscount && (
                            <motion.div
                              className='flex gap-3 items-end pl-8'
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <div className='w-24'>
                                <Label
                                  htmlFor='discount-value'
                                  className='text-xs text-gray-500 mb-1 block'
                                >
                                  Value
                                </Label>
                                <Input
                                  id='discount-value'
                                  type='number'
                                  max={discountType === 'percentage' ? '99' : undefined}
                                  value={discountValue}
                                  onChange={(e) => {
                                    let value = parseFloat(e.target.value);
                                    // Ensure percentage discount doesn't exceed 99%
                                    if (discountType === 'percentage' && value > 99) {
                                      value = 99;
                                    }
                                    return handleDiscountValueChange(value);
                                  }}
                                  className='border-gray-200'
                                />
                              </div>
                              <div className='w-28'>
                                <Label
                                  htmlFor='discount-type'
                                  className='text-xs text-gray-500 mb-1 block'
                                >
                                  Type
                                </Label>
                                <Select
                                  value={discountType}
                                  onValueChange={(v) => {
                                    return handleDiscountTypeChange(v as 'percentage' | 'fixed');
                                  }}
                                >
                                  <SelectTrigger id='discount-type' className='border-gray-200'>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='percentage'>Percentage</SelectItem>
                                    <SelectItem value='fixed'>Fixed Amount</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Collapsible sections with smooth animations */}
                      <div className='space-y-2'>
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <motion.div whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                              <Button
                                variant='ghost'
                                className='flex w-full justify-between p-2 h-9 text-gray-700 hover:bg-gray-50 rounded-md'
                              >
                                <span className='flex items-center text-sm'>
                                  <PenIcon className='h-4 w-4 mr-2 text-gray-500' />
                                  Tax Settings
                                </span>
                                <ChevronRightIcon className='h-4 w-4 text-gray-400' />
                              </Button>
                            </motion.div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className='overflow-hidden'>
                            <motion.div
                              className='py-2 pl-8 pr-2'
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
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
                              <p className='text-xs text-gray-400 mt-1'>
                                This will be applied to all items on the invoice
                              </p>
                            </motion.div>
                          </CollapsibleContent>
                        </Collapsible>

                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <motion.div whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                              <Button
                                variant='ghost'
                                className='flex w-full justify-between p-2 h-9 text-gray-700 hover:bg-gray-50 rounded-md'
                              >
                                <span className='flex items-center text-sm'>
                                  <TruckIcon className='h-4 w-4 mr-2 text-gray-500' />
                                  Delivery Method
                                </span>
                                <ChevronRightIcon className='h-4 w-4 text-gray-400' />
                              </Button>
                            </motion.div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className='overflow-hidden'>
                            <motion.div
                              className='py-2 pl-8 pr-2'
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Select
                                value={deliveryMethod}
                                onValueChange={(value) => {
                                  return setDeliveryMethod(value);
                                }}
                              >
                                <SelectTrigger className='w-full bg-white border-gray-200'>
                                  <SelectValue placeholder='Select delivery method' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='email'>Email</SelectItem>
                                  <SelectItem value='sms'>SMS</SelectItem>
                                  <SelectItem value='both'>Both</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className='text-xs text-gray-400 mt-1'>
                                This will be used to deliver the invoice to the client
                              </p>
                            </motion.div>
                          </CollapsibleContent>
                        </Collapsible>

                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <motion.div whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                              <Button
                                variant='ghost'
                                className='flex w-full justify-between p-2 h-9 text-gray-700 hover:bg-gray-50 rounded-md'
                              >
                                <span className='flex items-center text-sm'>
                                  <PenIcon className='h-4 w-4 mr-2 text-gray-500' />
                                  Add Memo
                                </span>
                                <ChevronRightIcon className='h-4 w-4 text-gray-400' />
                              </Button>
                            </motion.div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className='overflow-hidden'>
                            <motion.div
                              className='pt-2 pl-8 pr-2'
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id='memo'
                                placeholder='Add a memo to your invoice'
                                value={memo}
                                onChange={(e) => {
                                  return setMemo(e.target.value);
                                }}
                                className='border-gray-200'
                              />
                              <p className='text-xs text-gray-400 mt-1'>
                                This note will appear on the invoice
                              </p>
                            </motion.div>
                          </CollapsibleContent>
                        </Collapsible>

                        <Collapsible>
                          <CollapsibleTrigger asChild>
                            <motion.div whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                              <Button
                                variant='ghost'
                                className='flex w-full justify-between p-2 h-9 text-gray-700 hover:bg-gray-50 rounded-md'
                              >
                                <span className='flex items-center text-sm'>
                                  <CreditCardIcon className='h-4 w-4 mr-2 text-gray-500' />
                                  Due Date
                                </span>
                                <ChevronRightIcon className='h-4 w-4 text-gray-400' />
                              </Button>
                            </motion.div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className='overflow-hidden'>
                            <motion.div
                              className='pt-2 pl-8 pr-2'
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id='dueDate'
                                type='date'
                                value={dueDate}
                                onChange={(e) => {
                                  return setDueDate(e.target.value);
                                }}
                                className='border-gray-200'
                              />
                              <p className='text-xs text-gray-400 mt-1'>When payment is due</p>
                            </motion.div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>

                      {/* Invoice Summary - Animated with subtle entrance */}
                      <motion.div
                        className='border border-gray-100 rounded-md p-4 bg-gray-50 mt-6'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                      >
                        <h4 className='text-sm font-medium text-gray-800 mb-3'>Invoice Summary</h4>
                        <div className='space-y-2 text-sm'>
                          <motion.div
                            className='flex justify-between'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            <span className='text-gray-600'>Subtotal:</span>
                            <span className='text-gray-800'>${subtotal.toFixed(2)}</span>
                          </motion.div>

                          <AnimatePresence>
                            {discountTotal > 0 && (
                              <motion.div
                                className='flex justify-between text-green-600'
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <span>Discount:</span>
                                <span>-${discountTotal.toFixed(2)}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <AnimatePresence>
                            {taxAmount > 0 && (
                              <motion.div
                                className='flex justify-between'
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <span className='text-gray-600'>Tax ({selectedTaxRate}%):</span>
                                <span className='text-gray-800'>${taxAmount.toFixed(2)}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.div
                            className='flex justify-between font-medium border-t border-gray-200 pt-2 mt-2'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <span className='text-gray-800'>Total:</span>
                            <motion.span
                              className='text-gray-900'
                              key={total}
                              initial={{ scale: 1.1, color: '#047857' }}
                              animate={{ scale: 1, color: '#111827' }}
                              transition={{ duration: 0.3 }}
                            >
                              ${total.toFixed(2)}
                            </motion.span>
                          </motion.div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>

            {/* Settings Sidebar with animation */}
            <AnimatePresence>
              {showSettingsSidebar && (
                <motion.div
                  className='w-2/5 border-l border-gray-100'
                  variants={sidebarVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                >
                  <ScrollArea className='h-[calc(90vh-68px)]'>
                    <Tabs
                      value={activeSettingTab}
                      onValueChange={setActiveSettingTab}
                      className='w-full'
                    >
                      <div className='border-b border-gray-100'>
                        <TabsList className='h-12 w-full justify-start bg-transparent px-4 rounded-none'>
                          <TabsTrigger
                            value='general'
                            className='data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:shadow-none rounded-none text-sm text-gray-600 data-[state=active]:text-gray-900'
                          >
                            General
                          </TabsTrigger>
                          <TabsTrigger
                            value='branding'
                            className='data-[state=active]:border-b-2 data-[state=active]:border-gray-800 data-[state=active]:shadow-none rounded-none text-sm text-gray-600 data-[state=active]:text-gray-900'
                          >
                            Branding
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <AnimatePresence mode='wait'>
                        <motion.div
                          className='p-6'
                          key={activeSettingTab}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TabsContent value='general' className='mt-0 pt-0 border-0 space-y-6'>
                            {/* Currency */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Label
                                htmlFor='currency'
                                className='text-sm font-medium text-gray-800 mb-2 block'
                              >
                                Currency
                              </Label>
                              <Select
                                value={localCurrency}
                                onValueChange={(value) => {
                                  setLocalCurrency(value);
                                  setCurrency(value);
                                  handleSettingsUpdate({ currency: value });
                                }}
                              >
                                <SelectTrigger id='currency' className='w-full border-gray-200'>
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
                            </motion.div>

                            {/* Footer */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Label
                                htmlFor='footer'
                                className='text-sm font-medium text-gray-800 mb-2 block'
                              >
                                Footer
                              </Label>
                              <Input
                                id='footer'
                                placeholder='Add a footer to your invoice'
                                value={footer}
                                onChange={(e) => {
                                  return setFooter(e.target.value);
                                }}
                                className='border-gray-200'
                              />
                              <p className='text-xs text-gray-400 mt-1'>
                                This will appear at the bottom of the invoice
                              </p>
                            </motion.div>

                            {/* Tax ID */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <div className='flex items-center justify-between mb-2'>
                                <Label
                                  htmlFor='taxId'
                                  className='text-sm font-medium text-gray-800'
                                >
                                  Tax ID
                                </Label>
                                <div className='flex items-center'>
                                  <Label htmlFor='showTaxId' className='text-xs text-gray-500 mr-2'>
                                    Show on invoice
                                  </Label>
                                  <Switch
                                    id='showTaxId'
                                    checked={showTaxId}
                                    onCheckedChange={(checked) => {
                                      setShowTaxId(checked);
                                      handleSettingsUpdate({ showTaxId: checked });
                                    }}
                                  />
                                </div>
                              </div>
                              <Input
                                id='taxId'
                                placeholder='Enter your tax ID'
                                value={taxId}
                                onChange={(e) => {
                                  return setTaxId(e.target.value);
                                }}
                                onBlur={(e) => {
                                  return handleSettingsUpdate({ taxId: e.target.value });
                                }}
                                className='border-gray-200'
                              />
                            </motion.div>
                          </TabsContent>

                          <TabsContent value='branding' className='mt-0 pt-0 border-0 space-y-6'>
                            {/* Branding */}
                            <motion.div className='space-y-6'>
                              {/* Icons */}
                              <motion.div
                                className='grid grid-cols-2 gap-4'
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <div>
                                  <Label className='text-sm font-medium text-gray-800 mb-2 block'>
                                    Icon
                                  </Label>
                                  <ImageUpload
                                    label='Company Icon'
                                    value={icon}
                                    onChange={(newIcon) => {
                                      setIcon(newIcon);
                                      handleSettingsUpdate({ icon: newIcon });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className='text-sm font-medium text-gray-800 mb-2 block'>
                                    Logo
                                  </Label>
                                  <ImageUpload
                                    label='Company Logo'
                                    value={logo}
                                    onChange={(newLogo) => {
                                      setLogo(newLogo);
                                      handleSettingsUpdate({ logo: newLogo });
                                    }}
                                  />
                                </div>
                              </motion.div>

                              {/* Colors */}
                              <motion.div
                                className='grid grid-cols-2 gap-4'
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div>
                                  <Label className='text-sm font-medium text-gray-800 mb-2 block'>
                                    Brand Color
                                  </Label>
                                  <ColorPicker
                                    label='Brand Color'
                                    value={invoiceSettings?.brandColor || ''}
                                    onChange={(value) => {
                                      return handleSettingsUpdate({ brandColor: value });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className='text-sm font-medium text-gray-800 mb-2 block'>
                                    Accent Color
                                  </Label>
                                  <ColorPicker
                                    label='Accent Color'
                                    value={invoiceSettings?.accentColor || ''}
                                    onChange={(value) => {
                                      return handleSettingsUpdate({ accentColor: value });
                                    }}
                                  />
                                </div>
                              </motion.div>
                            </motion.div>
                          </TabsContent>
                        </motion.div>
                      </AnimatePresence>
                    </Tabs>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </DialogContent>

      {/* Module Dialog */}
      {activeModuleId && (
        <ModuleDialog
          moduleId={activeModuleId}
          onOpenChange={(open) => {
            if (!open) setActiveModuleId(null);
          }}
        />
      )}
    </Dialog>
  );
}
