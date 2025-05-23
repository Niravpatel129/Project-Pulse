import { SeamlessInput } from '@/components/ui/seamless-input';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const InvoiceItemsRow = () => {
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(12);
  const [price, setPrice] = useState('33');
  const [isFocused, setIsFocused] = useState(false);
  const [isPriceFocused, setIsPriceFocused] = useState(false);
  const [isQuantityFocused, setIsQuantityFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quantityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quantityRef.current && !quantityRef.current.contains(event.target as Node)) {
        setIsQuantityFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuantityChange = (delta: number) => {
    setQuantity((q) => {
      return Math.max(1, q + delta);
    });
  };

  const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement>) => {
    const textarea = ref.current;
    if (textarea) {
      if (!isFocused && !description) {
        textarea.style.height = '24px';
        textarea.style.minHeight = '24px';
      } else {
        textarea.style.minHeight = '24px';
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(24, textarea.scrollHeight)}px`;
      }
    }
  };

  useEffect(() => {
    adjustHeight(textareaRef);
  }, [description, isFocused]);

  const total = Number(price) * quantity || 0;

  return (
    <div className='flex flex-col gap-2 mt-8'>
      {/* Labels */}
      <div className='flex items-center gap-4 h-6'>
        <div className='flex-[4] text-[11px] text-muted-foreground'>Description</div>
        <div className='w-[60px] text-center text-[11px] text-muted-foreground'>Quantity</div>
        <div className='w-[80px] text-[11px] text-muted-foreground'>Price</div>
        <div className='w-[80px] text-right text-[11px] text-muted-foreground'>Total</div>
      </div>
      {/* Content */}
      <div className='flex gap-4 h-6'>
        {/* Description */}
        <div className='flex-[4] flex items-center'>
          <Textarea
            ref={textareaRef}
            className={`p-0 !text-[11px] font-mono w-full resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[24px] ${
              !isFocused && !description
                ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] h-[24px]'
                : ''
            }`}
            placeholder=''
            value={description}
            onFocus={() => {
              return setIsFocused(true);
            }}
            onBlur={() => {
              return setIsFocused(false);
            }}
            onChange={(e) => {
              setDescription(e.target.value);
              adjustHeight(textareaRef);
            }}
          />
        </div>
        {/* Quantity */}
        <div
          ref={quantityRef}
          className='w-[60px] flex items-center justify-center'
          onClick={() => {
            return setIsQuantityFocused(true);
          }}
        >
          {!isQuantityFocused && !quantity ? (
            <div className='w-full bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] h-[24px]'></div>
          ) : (
            <>
              {' '}
              <button
                type='button'
                className='px-1 text-xl text-muted-foreground hover:text-primary flex items-center'
                onClick={() => {
                  return handleQuantityChange(-1);
                }}
              >
                <Minus className='w-3 h-3' />
              </button>
              <SeamlessInput
                className={`p-0 !text-[11px] font-mono w-full relative rounded-none text-center ${!isQuantityFocused}`}
                value={quantity}
                onFocus={() => {
                  return setIsQuantityFocused(true);
                }}
                onBlur={() => {
                  return setIsQuantityFocused(false);
                }}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  setQuantity(value ? parseInt(value) : 0);
                }}
              />
              <button
                type='button'
                className='px-1 text-xl text-muted-foreground hover:text-primary flex items-center'
                onClick={() => {
                  return handleQuantityChange(1);
                }}
              >
                <Plus className='w-3 h-3' />
              </button>
            </>
          )}
        </div>
        {/* Price */}
        <div className='w-[80px] flex items-center'>
          <SeamlessInput
            className={`p-0 !text-[11px] font-mono w-full relative rounded-none border-b-2 border-transparent focus:border-[#dadad8] focus-visible:border-[#dadad8] active:border-[#dadad8] ${
              !isPriceFocused && !price
                ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] h-[24px]'
                : ''
            }`}
            placeholder=''
            value={price}
            onFocus={() => {
              return setIsPriceFocused(true);
            }}
            onBlur={() => {
              return setIsPriceFocused(false);
            }}
            onChange={(e) => {
              return setPrice(e.target.value.replace(/[^\d.]/g, ''));
            }}
          />
        </div>
        {/* Total */}
        <div className='w-[80px] text-right font-mono text-[11px] flex items-center justify-end'>
          ${total}
        </div>
      </div>
    </div>
  );
};

export default InvoiceItemsRow;
