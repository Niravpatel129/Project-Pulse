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
  vatRate: number;
  onVatRateChange: (vatRate: number) => void;
  taxLabel?: string;
  onTaxLabelChange?: (label: string) => void;
  vatLabel?: string;
  onVatLabelChange?: (label: string) => void;
  currency: string;
  formatNumber: (value: number) => string;
  decimals: 'yes' | 'no';
  salesTax: string;
  vat: string;
}

const InvoiceTotal = ({
  subtotal,
  total,
  taxRate,
  onTaxRateChange,
  vatRate,
  onVatRateChange,
  taxLabel = 'Tax',
  onTaxLabelChange = () => {},
  vatLabel = 'VAT',
  onVatLabelChange = () => {},
  currency,
  formatNumber,
  decimals,
  salesTax,
  vat,
}: InvoiceTotalProps) => {
  const taxAmount = (subtotal * taxRate) / 100;
  const vatAmount = (subtotal * vatRate) / 100;
  const currencySymbol = getCurrencySymbol(currency);

  // Dynamic width logic
  const taxSpanRef = useRef<HTMLSpanElement>(null);
  const taxInputRef = useRef<HTMLInputElement>(null);
  const taxLabelRef = useRef<HTMLSpanElement>(null);
  const taxLabelInputRef = useRef<HTMLInputElement>(null);
  const vatSpanRef = useRef<HTMLSpanElement>(null);
  const vatInputRef = useRef<HTMLInputElement>(null);
  const vatLabelRef = useRef<HTMLSpanElement>(null);
  const vatLabelInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (taxSpanRef.current && taxInputRef.current) {
      taxInputRef.current.style.width = taxSpanRef.current.offsetWidth + 4 + 'px';
    }
    if (taxLabelRef.current && taxLabelInputRef.current) {
      const width = Math.max(taxLabelRef.current.offsetWidth + 4, 30);
      taxLabelInputRef.current.style.width = `${width}px`;
    }
    if (vatSpanRef.current && vatInputRef.current) {
      vatInputRef.current.style.width = vatSpanRef.current.offsetWidth + 4 + 'px';
    }
    if (vatLabelRef.current && vatLabelInputRef.current) {
      const width = Math.max(vatLabelRef.current.offsetWidth + 4, 30);
      vatLabelInputRef.current.style.width = `${width}px`;
    }
  }, [taxRate, taxLabel, vatRate, vatLabel]);

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      onTaxRateChange(0);
    } else {
      const cleanValue = value.replace(/^0+/, '') || '0';
      const numValue = Number(cleanValue);

      if (!isNaN(numValue) && numValue <= MAX_TAX_RATE) {
        e.target.value = cleanValue;
        onTaxRateChange(numValue);
      }
    }
  };

  const handleVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      onVatRateChange(0);
    } else {
      const cleanValue = value.replace(/^0+/, '') || '0';
      const numValue = Number(cleanValue);

      if (!isNaN(numValue) && numValue <= MAX_TAX_RATE) {
        e.target.value = cleanValue;
        onVatRateChange(numValue);
      }
    }
  };

  const handleTaxLabelChange = (e: React.FormEvent<HTMLSpanElement>) => {
    onTaxLabelChange(e.currentTarget.textContent || '');
  };

  const handleVatLabelChange = (e: React.FormEvent<HTMLSpanElement>) => {
    onVatLabelChange(e.currentTarget.textContent || '');
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
        {vat === 'enable' && (
          <div className='flex justify-between items-center'>
            <div className='flex items-center'>
              <span
                contentEditable
                suppressContentEditableWarning
                onInput={handleVatLabelChange}
                className='min-w-[25px] !text-[11px] outline-none font-mono text-[#878787]'
              >
                {vatLabel}
              </span>
              <span className='text-[11px]'> (</span>
              <span
                ref={vatSpanRef}
                className='invisible absolute font-mono text-[10px] px-0'
                style={{ whiteSpace: 'pre' }}
              >
                {vatRate}
              </span>
              <Input
                ref={vatInputRef}
                type='number'
                value={vatRate}
                onChange={handleVatChange}
                className='min-w-0 w-auto !text-[11px] border-0 p-0 m-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none font-mono text-[#878787] text-center appearance-none'
                min='0'
                max={MAX_TAX_RATE}
                style={{ width: 'auto' }}
              />
              <span className='text-[11px]'>%)</span>
            </div>
            <span className='text-[11px]'>
              {currencySymbol}
              {formatNumber(vatAmount)}
            </span>
          </div>
        )}
        {salesTax === 'enable' && (
          <div className='flex justify-between items-center'>
            <div className='flex items-center'>
              <span
                contentEditable
                suppressContentEditableWarning
                onInput={handleTaxLabelChange}
                className='min-w-[25px] !text-[11px] outline-none font-mono text-[#878787]'
              >
                {taxLabel}
              </span>
              <span className='text-[11px]'> (</span>
              <span
                ref={taxSpanRef}
                className='invisible absolute font-mono text-[10px] px-0'
                style={{ whiteSpace: 'pre' }}
              >
                {taxRate}
              </span>
              <Input
                ref={taxInputRef}
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
        )}
        <div className='h-[1px] bg-[#e0e0e0] my-3'></div>
        <div className='flex justify-between items-center'>
          <span className='text-[11px]'>Total</span>
          <span className='text-[21px] text-[#111] dark:text-white'>
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
