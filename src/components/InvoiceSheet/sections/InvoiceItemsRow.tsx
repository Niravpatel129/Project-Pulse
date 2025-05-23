import { SeamlessInput } from '@/components/ui/seamless-input';
import { Textarea } from '@/components/ui/textarea';
import { GripVertical, Minus, Plus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: string;
}

// Safe maximum limits
const MAX_QUANTITY = 999999;
const MAX_PRICE = 999999.99;

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

interface InvoiceItemsRowProps {
  item: InvoiceItem;
  onUpdate: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  isFirstRow?: boolean;
  onDelete?: (id: string) => void;
  dragHandleProps?: any;
  currency: string;
  formatNumber: (value: number) => string;
}

const InvoiceItemsRow = ({
  item,
  onUpdate,
  isFirstRow,
  onDelete,
  dragHandleProps,
  currency,
  formatNumber,
}: InvoiceItemsRowProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPriceFocused, setIsPriceFocused] = useState(false);
  const [isQuantityFocused, setIsQuantityFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const quantityRef = useRef<HTMLDivElement>(null);
  const currencySymbol = getCurrencySymbol(currency);

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
    const newQuantity = Math.max(1, Math.min(MAX_QUANTITY, item.quantity + delta));
    onUpdate(item.id, 'quantity', newQuantity);
  };

  const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement>) => {
    const textarea = ref.current;
    if (textarea) {
      if (!isFocused && !item.description) {
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
  }, [item.description, isFocused]);

  const total = Number(item.price) * item.quantity || 0;

  return (
    <div className='flex gap-6 h-6 group relative'>
      {/* Drag Handle */}
      {!isFirstRow && dragHandleProps && (
        <div
          className='absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing'
          {...dragHandleProps}
        >
          <GripVertical className='w-4 h-4 text-muted-foreground' />
        </div>
      )}
      {/* Description */}
      <div className='flex-[4] flex items-center'>
        <Textarea
          ref={textareaRef}
          className={`p-0 pt-5 !text-[11px] font-mono w-full resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[24px] ${
            !isFocused && !item.description
              ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] h-[24px]'
              : ''
          }`}
          placeholder=''
          value={item.description}
          onFocus={() => {
            return setIsFocused(true);
          }}
          onBlur={() => {
            return setIsFocused(false);
          }}
          onChange={(e) => {
            onUpdate(item.id, 'description', e.target.value);
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
        {!isQuantityFocused && !item.quantity ? (
          <div className='w-full bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] h-[24px]'></div>
        ) : (
          <>
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
              value={item.quantity}
              onFocus={() => {
                return setIsQuantityFocused(true);
              }}
              onBlur={() => {
                return setIsQuantityFocused(false);
              }}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                const numValue = value ? parseInt(value) : 0;
                onUpdate(item.id, 'quantity', Math.min(MAX_QUANTITY, numValue));
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
            !isPriceFocused && !item.price
              ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] h-[24px]'
              : ''
          }`}
          placeholder=''
          value={item.price}
          onFocus={() => {
            return setIsPriceFocused(true);
          }}
          onBlur={() => {
            return setIsPriceFocused(false);
          }}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d.]/g, '');
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              onUpdate(item.id, 'price', Math.min(MAX_PRICE, numValue).toString());
            } else {
              onUpdate(item.id, 'price', value);
            }
          }}
        />
      </div>
      {/* Total */}
      <div className='w-[80px] flex items-center justify-end'>
        <span className='text-[11px]'>
          {currencySymbol}
          {formatNumber(total)}
        </span>
      </div>
      {/* Delete Button */}
      {!isFirstRow && onDelete && (
        <button
          type='button'
          className='absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={() => {
            return onDelete(item.id);
          }}
        >
          <X className='w-4 h-4 text-muted-foreground' />
        </button>
      )}
    </div>
  );
};

export default InvoiceItemsRow;
