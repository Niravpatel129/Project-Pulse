import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

interface SeamlessInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function SeamlessInput({ className, ...props }: SeamlessInputProps) {
  return (
    <Input
      className={cn(
        'flex overflow-hidden shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0',
        className,
      )}
      {...props}
    />
  );
}
