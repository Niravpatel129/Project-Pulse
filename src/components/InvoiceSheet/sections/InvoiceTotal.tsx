import { AnimatedNumber } from '@/components/ui/animated-number';
import { Input } from '@/components/ui/input';
import { useLayoutEffect, useRef } from 'react';

// Safe maximum limits
const MAX_TAX_RATE = 100;

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'CAD':
      return 'CA$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    case 'AUD':
      return 'A$';
    case 'INR':
      return '₹';
    case 'CNY':
      return '¥';
    case 'CHF':
      return 'Fr';
    case 'SGD':
      return 'S$';
    default:
      return currency;
  }
};

interface InvoiceTotalProps {
  subtotal: number;
  total: number;
  taxRate: number;
  onTaxRateChange: (taxRate: number) => void;
  currency: string;
  formatNumber: (value: number) => string;
  decimals: 'yes' | 'no';
}

const InvoiceTotal = ({
  subtotal,
  total,
  taxRate,
  onTaxRateChange,
  currency,
  formatNumber,
  decimals,
}: InvoiceTotalProps) => {
  const taxAmount = (subtotal * taxRate) / 100;
  const currencySymbol = getCurrencySymbol(currency);

  // Dynamic width logic
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (spanRef.current && inputRef.current) {
      inputRef.current.style.width = spanRef.current.offsetWidth + 4 + 'px';
    }
  }, [taxRate]);

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      onTaxRateChange(0);
    } else {
      // Remove leading zeros first
      const cleanValue = value.replace(/^0+/, '') || '0';

      const numValue = Number(cleanValue);

      if (!isNaN(numValue) && numValue <= MAX_TAX_RATE) {
        // Force the input to show the cleaned value
        e.target.value = cleanValue;
        onTaxRateChange(numValue);
      }
    }
  };

  return (
    <div className='w-full justify-end flex mt-8'>
      <div className='w-[300px] font-mono text-[#878787]'>
        <div className='flex justify-between mb-3'>
          <span className='text-[11px]'>Subtotal</span>
          <span className='text-[11px]'>
            {currencySymbol}
            {formatNumber(subtotal)}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <span className='text-[11px]'>Tax (</span>
            <span
              ref={spanRef}
              className='invisible absolute font-mono text-[10px] px-0'
              style={{ whiteSpace: 'pre' }}
            >
              {taxRate}
            </span>
            <Input
              ref={inputRef}
              type='number'
              value={taxRate}
              onChange={handleTaxChange}
              className='min-w-0 w-auto !text-[11px] border-0 p-0 m-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none font-mono text-[#878787] text-center appearance-none'
              min='0'
              max={MAX_TAX_RATE}
              style={{ width: 'auto' }}
            />
            <span className='text-[11px]'>%)</span>
          </div>
          <span className='text-[11px]'>
            {currencySymbol}
            {formatNumber(taxAmount)}
          </span>
        </div>
        <div className='h-[1px] bg-[#e0e0e0] my-3'></div>
        <div className='flex justify-between items-center'>
          <span className='text-[11px]'>Total</span>
          <span className='text-[21px] text-[#111] dark:text-[#fff] font-medium'>
            <AnimatedNumber value={total} currency={currency} decimals={decimals} />
          </span>
        </div>
      </div>
      <style jsx global>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default InvoiceTotal;
