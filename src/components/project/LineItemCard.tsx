import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Percent, Plus, Tag } from 'lucide-react';
import { useState } from 'react';

interface LineItem {
  name: string;
  description: string;
  price: string;
  type: string;
  qty: number;
  reasoning: string;
  discount?: string;
  taxName?: string;
  taxRate?: string;
}

interface LineItemCardProps {
  item: LineItem;
  onClick: (item: LineItem) => void;
  className?: string;
}

export function LineItemCard({ item, onClick, className }: LineItemCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const hasTax = item.taxRate && parseFloat(item.taxRate) > 0;
  const hasDiscount = item.discount && parseFloat(item.discount) > 0;

  const handleClick = () => {
    if (!isAdded) {
      setIsAdded(true);
      onClick(item);
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-purple-200 bg-white',
        isAdded && 'bg-purple-50 border-purple-200 shadow-sm',
        className,
      )}
      onClick={handleClick}
    >
      <CardContent className='p-3'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <h3 className='font-medium text-sm text-neutral-900 truncate'>{item.name}</h3>
              <span className='text-xs text-neutral-400'>× {item.qty}</span>
            </div>
            <div className='flex items-center gap-2 mt-1'>
              <span className='text-sm font-medium text-purple-600'>{item.price}</span>
            </div>
            {(hasTax || hasDiscount) && (
              <div className='flex items-center gap-1.5 mt-1.5 text-xs'>
                {hasTax && (
                  <span className='inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded'>
                    <Percent className='w-3 h-3' />
                    {item.taxRate}% {item.taxName || 'tax'}
                  </span>
                )}
                {hasDiscount && (
                  <span className='inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded'>
                    <Tag className='w-3 h-3' />
                    {item.discount} off
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex-shrink-0'>
            <div
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                isAdded
                  ? 'bg-green-50 text-green-600'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100',
              )}
            >
              {isAdded ? <Check className='w-3.5 h-3.5' /> : <Plus className='w-3.5 h-3.5' />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
