import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface LineItem {
  name: string;
  description: string;
  price: string;
  type: string;
  qty: number;
  reasoning: string;
}

interface LineItemCardProps {
  item: LineItem;
  onClick: (item: LineItem) => void;
  className?: string;
}

export function LineItemCard({ item, onClick, className }: LineItemCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-purple-200',
        className,
      )}
      onClick={() => {
        return onClick(item);
      }}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 min-w-0'>
            <h3 className='font-medium text-sm text-neutral-900 truncate'>{item.name}</h3>
            <p className='text-xs text-neutral-500 mt-0.5 line-clamp-2'>{item.description}</p>
            <div className='flex items-center gap-2 mt-2'>
              <span className='text-sm font-medium text-purple-600'>{item.price}</span>
              <span className='text-xs text-neutral-400'>× {item.qty}</span>
            </div>
          </div>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600'>
              <Plus className='w-4 h-4' />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
