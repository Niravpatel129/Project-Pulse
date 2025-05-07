'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
}: SectionFooterProps) {
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

  return (
    <div className='absolute bottom-0 left-0 right-0 flex items-center justify-between py-4 border-t border-[#E5E7EB] px-8 bg-[#FAFAFA] z-10'>
      <div className='flex items-center'>
        <div className='w-4 h-4 rounded-full border-2 border-[#D1D5DB] border-t-[#6B7280] animate-spin mr-2'></div>
        <span className='text-[#6B7280] text-xs'>
          {currentSection}/{totalSections} steps
        </span>
      </div>
      <div className='flex items-center text-[#6B7280] text-xs'>
        <span>press</span>
        <span className='mx-1 px-1 border border-[#D1D5DB] rounded text-[11px]'>Enter</span>
        <span className='ml-0.5'>↵</span>
      </div>
      <div className='flex gap-3'>
        {onCancel && (
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  onClick={onContinue}
                  disabled={isDisabled}
                  className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {isLastSection ? 'Finish' : customContinueLabel || 'Continue'}
                </Button>
              </span>
            </TooltipTrigger>
            {isDisabled && (
              <TooltipContent side='top'>
                <p>{disabledTooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
