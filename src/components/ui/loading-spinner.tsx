import { cn } from '@/lib/utils';
import React from 'react';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'secondary';
  fullPage?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  fullPage = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const variantClass = {
    default: 'border-muted-foreground/20 border-t-muted-foreground/60',
    primary: 'border-primary/30 border-t-primary',
    secondary: 'border-secondary/30 border-t-secondary',
  };

  const spinner = (
    <div
      className={cn('animate-spin rounded-full', sizeClass[size], variantClass[variant], className)}
      {...props}
    />
  );

  if (fullPage) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'>
        {spinner}
      </div>
    );
  }

  return spinner;
}
