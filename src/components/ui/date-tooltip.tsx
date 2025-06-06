'use client';

import { format, isValid } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface DateTooltipProps {
  date: Date | string;
  children: React.ReactNode;
  format?: string;
  tooltipFormat?: string;
}

export function DateTooltip({
  date,
  children,
  format: dateFormat = 'MMM d, yyyy',
  tooltipFormat = 'MMM d, yyyy h:mm a',
}: DateTooltipProps) {
  // Convert string to Date if needed and validate
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const isValidDate = isValid(dateObj);

  // If date is invalid, just render children without tooltip
  if (!isValidDate) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className='bg-background text-foreground border border-border shadow-md rounded-md p-2'>
          <p className='text-sm'>{format(dateObj, tooltipFormat)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
