import { Input } from '@/components/ui/input';
import { useLayoutEffect, useRef, useState } from 'react';

const InvoiceTotal = () => {
  const [taxRate, setTaxRate] = useState<number | ''>(0);
  const subtotal = 66600;
  const taxAmount = (subtotal * (typeof taxRate === 'number' ? taxRate : 0)) / 100;
  const total = subtotal + taxAmount;

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
      setTaxRate('');
    } else {
      const numValue = Number(value);
      if (numValue <= 100) {
        setTaxRate(numValue);
      }
    }
  };

  return (
    <div className='w-full justify-end flex mt-8'>
      <div className='w-[300px] font-mono text-[#878787]'>
        <div className='flex justify-between mb-3'>
          <span className='text-[11px]'>Subtotal</span>
          <span className='text-[11px]'>${subtotal.toLocaleString()}</span>
        </div>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <span className='text-[11px]'>Tax (</span>
            <span
              ref={spanRef}
              className='invisible absolute font-mono text-[10px] px-0'
              style={{ whiteSpace: 'pre' }}
            >
              {taxRate === '' ? '0' : taxRate}
            </span>
            <Input
              ref={inputRef}
              type='number'
              value={taxRate}
              onChange={handleTaxChange}
              className='min-w-0 w-auto !text-[11px] border-0 p-0 m-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none font-mono text-[#878787] text-center appearance-none'
              min='0'
              max='100'
              style={{ width: 'auto' }}
            />
            <span className='text-[11px]'>%)</span>
          </div>
          <span className='text-[11px]'>${taxAmount.toLocaleString()}</span>
        </div>
        <div className='h-[1px] bg-[#e0e0e0] my-3'></div>
        <div className='flex justify-between items-center'>
          <span className='text-[11px]'>Total</span>
          <span className='text-[21px] text-[#111] font-medium'>${total.toLocaleString()}</span>
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
