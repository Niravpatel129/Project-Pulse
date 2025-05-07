import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface AICardProps {
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
  title?: string;
  description?: string;
}

export default function AICard({ children, className, onClose, title, description }: AICardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-6 relative', className)}>
      {onClose && (
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors'
          aria-label='Close'
        >
          <X size={18} />
        </button>
      )}
      {title && (
        <div className='mb-4'>
          <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
          {description && <p className='text-sm text-gray-500 mt-1'>{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
