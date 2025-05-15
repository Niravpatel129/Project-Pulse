'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';

type SectionFooterProps = {
  onContinue: () => void;
  currentSection: number;
  totalSections: number;
  customContinueLabel?: string;
  onCancel?: () => void;
  isLastSection?: boolean;
  isDisabled?: boolean;
  disabledTooltip?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  onChatClick?: () => void;
  onSectionChange?: (section: number) => void;
};

export default function SectionFooter({
  onContinue,
  currentSection,
  totalSections,
  customContinueLabel,
  onCancel,
  isLastSection = false,
  isDisabled = false,
  disabledTooltip = 'Complete required fields to continue',
  secondaryAction,
  onChatClick,
  onSectionChange,
}: SectionFooterProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      if (event.key === 'Enter' && !isDisabled) {
        onContinue();
      } else if (event.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      return window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onContinue, onCancel, isDisabled]);

  const getSectionName = (section: number) => {
    switch (section) {
      case 1:
        return 'Items';
      case 2:
        return 'Client';
      case 3:
        return 'Invoice';
      case 4:
        return 'Review';
      default:
        return `Step ${section}`;
    }
  };

  return (
    <div className='absolute bottom-0 left-0 right-0 flex items-center justify-between py-3 border-t border-[#E4E4E7] dark:border-[#232428] px-8 bg-white dark:bg-[#141414] z-10'>
      {isMobile ? (
        <Popover modal>
          <PopoverTrigger asChild>
            <button className='flex items-center text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs border-b border-dashed border-[#E4E4E7] dark:border-[#232428] pb-1'>
              <div className='w-4 h-4 rounded-full border-2 border-[#E4E4E7] dark:border-[#232428] border-t-[#3F3F46]/60 dark:border-t-[#8C8C8C] animate-spin mr-2'></div>
              <span>
                {currentSection}/{totalSections} steps
              </span>
              <ChevronDown className='w-4 h-4 ml-1' />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className='w-48 p-2 bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428]'
            align='start'
          >
            <div className='space-y-1'>
              {Array.from({ length: totalSections }, (_, i) => {
                return i + 1;
              }).map((section) => {
                return (
                  <button
                    key={section}
                    onClick={() => {
                      return onSectionChange?.(section);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      section === currentSection
                        ? 'bg-[#F4F4F5] dark:bg-[#232428] text-[#3F3F46] dark:text-[#fafafa]'
                        : 'hover:bg-[#F4F4F5] dark:hover:bg-[#232428] text-[#3F3F46]/60 dark:text-[#8C8C8C]'
                    }`}
                  >
                    {getSectionName(section)}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <div className='flex items-center'>
          <div className='w-4 h-4 rounded-full border-2 border-[#E4E4E7] dark:border-[#232428] border-t-[#3F3F46]/60 dark:border-t-[#8C8C8C] animate-spin mr-2'></div>
          <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs'>
            {currentSection}/{totalSections} steps
          </span>
        </div>
      )}
      {!isMobile && (
        <div className='flex items-center text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs'>
          <span>press</span>
          <span className='mx-1 px-1 border border-[#E4E4E7] dark:border-[#232428] rounded text-[11px]'>
            Enter
          </span>
          <span className='ml-0.5'>↵</span>
        </div>
      )}
      <div className='flex gap-3'>
        {onCancel && (
          <Button
            variant='outline'
            onClick={onCancel}
            className='hidden md:block border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#F4F4F5] dark:hover:bg-[#232428]'
          >
            Cancel
          </Button>
        )}
        {secondaryAction && (
          <Button
            variant='outline'
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            className='border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#F4F4F5] dark:hover:bg-[#232428]'
          >
            {secondaryAction.label}
          </Button>
        )}
        {isMobile && onChatClick && (
          <Button
            variant='outline'
            onClick={onChatClick}
            className='gap-2 border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#F4F4F5] dark:hover:bg-[#232428]'
          >
            <MessageSquare className='h-4 w-4' />
            Chat
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={onContinue}
                  disabled={isDisabled}
                  className={cn(
                    isDisabled ? 'opacity-50 cursor-not-allowed' : '',
                    'w-full mb-2 bg-blue-600 hover:bg-blue-700 text-white ',
                  )}
                >
                  {isLastSection ? 'Finish' : customContinueLabel || 'Continue'}
                </Button>
              </span>
            </TooltipTrigger>
            {isDisabled && (
              <TooltipContent
                side='top'
                className='bg-white dark:bg-[#141414] text-[#3F3F46] dark:text-[#fafafa] border-[#E4E4E7] dark:border-[#232428]'
              >
                <p>{disabledTooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
