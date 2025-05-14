import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Edit, Plus, Trash } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

// Define a TaxRate type
export type TaxRate = {
  id: string;
  name: string;
  rate: number;
};

type TaxRateDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taxRates: TaxRate[];
  onTaxRatesChange: (taxRates: TaxRate[]) => void;
  selectedTaxRateId: string;
  onSelectTaxRate: (id: string) => void;
};

// Maximum allowed tax rates
const MAX_TAX_RATES = 8;

export default function TaxRateDialog({
  isOpen,
  onOpenChange,
  taxRates,
  onTaxRatesChange,
  selectedTaxRateId,
  onSelectTaxRate,
}: TaxRateDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaxRate, setCurrentTaxRate] = useState<TaxRate>({
    id: '',
    name: '',
    rate: 0,
  });
  const [search, setSearch] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog is opened/closed
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
      setSearch('');
    } else {
      // Focus on input after a small delay to ensure it's visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const resetForm = () => {
    setIsEditing(false);
    setCurrentTaxRate({ id: '', name: '', rate: 0 });
  };

  const handleAddTaxRate = () => {
    if (!currentTaxRate.name.trim()) {
      toast.error('Tax rate name is required');
      return;
    }

    // Check if we're at the maximum limit and not in editing mode
    if (taxRates.length >= MAX_TAX_RATES && !isEditing) {
      toast.error(`You can only have a maximum of ${MAX_TAX_RATES} tax rates`);
      return;
    }

    const taxRateId = isEditing ? currentTaxRate.id : `tax-${Date.now()}`;
    const newTaxRateObj: TaxRate = {
      id: taxRateId,
      name: currentTaxRate.name.trim(),
      rate: currentTaxRate.rate,
    };

    if (isEditing) {
      // Update existing tax rate
      const updatedTaxRates = taxRates.map((tax) => {
        return tax.id === taxRateId ? newTaxRateObj : tax;
      });
      onTaxRatesChange(updatedTaxRates);
      toast.success(`Tax rate "${currentTaxRate.name}" updated successfully`);
    } else {
      // Add new tax rate
      onTaxRatesChange([...taxRates, newTaxRateObj]);
      onSelectTaxRate(taxRateId);
      toast.success(`Tax rate "${currentTaxRate.name}" added successfully`);
    }

    resetForm();
  };

  const handleEditTaxRate = (taxRate: TaxRate) => {
    setIsEditing(true);
    setCurrentTaxRate({ ...taxRate });

    // Focus on input after a small delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleDeleteTaxRate = (id: string) => {
    const taxToDelete = taxRates.find((tax) => {
      return tax.id === id;
    });

    // Don't allow deleting the standard tax rates
    if (['standard', 'reduced', 'zero'].includes(id)) {
      toast.error('Cannot delete default tax rates');
      return;
    }

    const updatedTaxRates = taxRates.filter((tax) => {
      return tax.id !== id;
    });
    onTaxRatesChange(updatedTaxRates);

    // If the deleted tax was selected, select the standard rate
    if (selectedTaxRateId === id) {
      onSelectTaxRate('standard');
    }

    toast.success(`Tax rate "${taxToDelete?.name}" deleted successfully`);
  };

  const isDefaultTaxRate = (id: string) => {
    return ['standard', 'reduced', 'zero'].includes(id);
  };

  // Filter tax rates based on search
  const filteredTaxRates = taxRates.filter((tax) => {
    return tax.name.toLowerCase().includes(search.toLowerCase());
  });

  // Calculate how many more tax rates can be added
  const remainingTaxRates = MAX_TAX_RATES - taxRates.length;
  const isNearLimit = remainingTaxRates <= 2 && remainingTaxRates > 0;
  const isAtLimit = remainingTaxRates === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[780px] bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] p-0 overflow-hidden'>
        <DialogHeader className='px-6 pt-6 pb-2'>
          <DialogTitle className='flex items-center text-lg font-semibold text-[#3F3F46] dark:text-[#fafafa]'>
            <div className='mr-2 p-1.5 bg-[#F4F4F5] dark:bg-[#232428] rounded-full'>
              <Plus size={18} className='text-[#8b5df8]' />
            </div>
            Manage Tax Rates
          </DialogTitle>
          <DialogDescription className='text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
            Create, edit, or delete tax rates to apply to your items.
            {isNearLimit && (
              <span className='ml-1 text-amber-500 dark:text-amber-400'>
                You can add {remainingTaxRates} more tax rate{remainingTaxRates > 1 ? 's' : ''}.
              </span>
            )}
            {isAtLimit && (
              <span className='ml-1 text-red-500 dark:text-red-400'>
                You&apos;ve reached the maximum of {MAX_TAX_RATES} tax rates.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-2 gap-4 p-4 h-[460px]'>
          {/* Left column - Tax rates list */}
          <div className='flex flex-col h-full'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='font-medium text-[#3F3F46] dark:text-[#fafafa] flex items-center'>
                Available Tax Rates
                <span className='ml-2 text-xs font-normal bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46]/60 dark:text-[#8C8C8C] px-2 py-0.5 rounded-full'>
                  {taxRates.length}/{MAX_TAX_RATES}
                </span>
              </h3>
            </div>

            {/* Search input */}
            <div className='relative mb-3'>
              <Input
                value={search}
                onChange={(e) => {
                  return setSearch(e.target.value);
                }}
                placeholder='Search tax rates...'
                className='pl-9 bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428]'
              />
              <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
                  <path
                    d='M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>
            </div>

            {/* Tax rates list */}
            <div className='flex-1 overflow-y-auto rounded-lg border border-[#E4E4E7] dark:border-[#232428]'>
              <AnimatePresence mode='popLayout'>
                {filteredTaxRates.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='flex flex-col items-center justify-center h-full text-[#3F3F46]/60 dark:text-[#8C8C8C] p-4'
                  >
                    <p className='text-sm'>No tax rates found</p>
                  </motion.div>
                ) : (
                  filteredTaxRates.map((taxRate, index) => {
                    return (
                      <motion.div
                        key={taxRate.id}
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 25,
                          mass: 0.8,
                          delay: index * 0.03,
                        }}
                        className={cn(
                          'p-3 border-b border-[#E4E4E7] dark:border-[#232428] last:border-0',
                          'hover:bg-[#F4F4F5] dark:hover:bg-[#232428]',
                          'transition-colors duration-200',
                          selectedTaxRateId === taxRate.id && 'bg-[#F4F4F5] dark:bg-[#232428]',
                          'flex justify-between items-center group',
                        )}
                      >
                        <div
                          className='flex-1 cursor-pointer'
                          onClick={() => {
                            return onSelectTaxRate(taxRate.id);
                          }}
                        >
                          <div className='flex items-center'>
                            <span className='text-[#3F3F46] dark:text-[#fafafa] font-medium'>
                              {taxRate.name}
                            </span>
                            <span className='ml-2 text-xs font-medium bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46] dark:text-[#fafafa] rounded-full px-2 py-0.5 border border-[#E4E4E7] dark:border-[#313131]'>
                              {taxRate.rate}%
                            </span>
                          </div>
                        </div>
                        <div className='flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              return handleEditTaxRate(taxRate);
                            }}
                            className='h-8 w-8 p-0 rounded-full'
                            disabled={isDefaultTaxRate(taxRate.id)}
                          >
                            <Edit size={14} className='text-[#3F3F46]/60 dark:text-[#8C8C8C]' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              return handleDeleteTaxRate(taxRate.id);
                            }}
                            className='h-8 w-8 p-0 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            disabled={isDefaultTaxRate(taxRate.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right column - Add/Edit form */}
          <div className='border-l border-[#E4E4E7] dark:border-[#232428] pl-5'>
            <h3 className='font-medium text-[#3F3F46] dark:text-[#fafafa] mb-4'>
              {isEditing ? 'Edit Tax Rate' : 'Add New Tax Rate'}
            </h3>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className='space-y-5'
            >
              {isAtLimit && !isEditing && (
                <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3 mb-4 flex items-start gap-2'>
                  <AlertCircle size={18} className='text-red-500 dark:text-red-400 mt-0.5' />
                  <div>
                    <p className='text-red-600 dark:text-red-400 text-sm font-medium'>
                      Maximum limit reached
                    </p>
                    <p className='text-red-600/80 dark:text-red-400/80 text-xs mt-1'>
                      You&apos;ve reached the maximum of {MAX_TAX_RATES} tax rates. Delete an
                      existing rate before adding a new one.
                    </p>
                  </div>
                </div>
              )}

              <div className='space-y-2'>
                <Label
                  htmlFor='tax-name'
                  className='text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'
                >
                  Tax Name
                </Label>
                <Input
                  id='tax-name'
                  ref={inputRef}
                  value={currentTaxRate.name}
                  onChange={(e) => {
                    return setCurrentTaxRate({ ...currentTaxRate, name: e.target.value });
                  }}
                  disabled={isAtLimit && !isEditing}
                  className='w-full bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
                  placeholder='e.g. GST, VAT, Sales Tax'
                />
                <p className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                  Enter a descriptive name for this tax rate
                </p>
              </div>

              <div className='space-y-2'>
                <Label
                  htmlFor='tax-percentage'
                  className='text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'
                >
                  Rate (%)
                </Label>
                <Input
                  id='tax-percentage'
                  type='number'
                  min='0'
                  max='100'
                  step='0.1'
                  value={currentTaxRate.rate}
                  onChange={(e) => {
                    return setCurrentTaxRate({
                      ...currentTaxRate,
                      rate: parseFloat(e.target.value) || 0,
                    });
                  }}
                  disabled={isAtLimit && !isEditing}
                  className='w-full bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
                  placeholder='e.g. 7.5'
                />
                <p className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                  Enter the percentage rate without the % symbol
                </p>
              </div>

              <div className='pt-4 mt-4 border-t border-[#E4E4E7] dark:border-[#232428]'>
                <div className='flex justify-between items-center'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      if (isEditing) {
                        resetForm();
                      }
                    }}
                    className={cn(
                      'border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#F4F4F5] dark:hover:bg-[#232428]',
                      !isEditing && 'invisible',
                    )}
                  >
                    Cancel Edit
                  </Button>
                  <Button
                    type='button'
                    onClick={handleAddTaxRate}
                    disabled={(isAtLimit && !isEditing) || !currentTaxRate.name.trim()}
                    className='bg-[#8b5df8] hover:bg-[#7c3aed] text-white transition-colors duration-200'
                  >
                    {isEditing ? 'Update Tax Rate' : 'Add Tax Rate'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <DialogFooter className='px-6 py-4 border-t border-[#E4E4E7] dark:border-[#232428] bg-[#FAFAFA] dark:bg-[#1A1A1A]'>
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              return onOpenChange(false);
            }}
            className='border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#F4F4F5] dark:hover:bg-[#232428]'
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
