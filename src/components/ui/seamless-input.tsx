import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface SeamlessInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SeamlessInput = forwardRef<HTMLInputElement, SeamlessInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'flex overflow-hidden shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 p-0',
          className,
        )}
        {...props}
      />
    );
  },
);

SeamlessInput.displayName = 'SeamlessInput';
