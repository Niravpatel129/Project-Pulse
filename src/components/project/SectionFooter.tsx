'use client';

import { Button } from '@/components/ui/button';

type SectionFooterProps = {
  onContinue: () => void;
  currentSection: number;
  totalSections: number;
  customContinueLabel?: string;
  onCancel?: () => void;
};

export default function SectionFooter({
  onContinue,
  currentSection,
  totalSections,
  customContinueLabel,
  onCancel,
}: SectionFooterProps) {
  return (
    <div className='absolute bottom-0 left-0 right-0 flex items-center justify-between py-4 border-t border-[#E5E7EB] px-8 bg-[#FAFAFA] z-10'>
      <div className='flex gap-3'>
        {onCancel && (
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={onContinue}>{customContinueLabel || 'Continue'}</Button>
      </div>
      <div className='flex items-center text-[#6B7280] text-xs'>
        <span>press</span>
        <span className='mx-1 px-1 border border-[#D1D5DB] rounded text-[11px]'>Enter</span>
        <span className='ml-0.5'>↵</span>
      </div>
      <div className='flex items-center'>
        <div className='w-4 h-4 rounded-full border-2 border-[#D1D5DB] border-t-[#6B7280] animate-spin mr-2'></div>
        <span className='text-[#6B7280] text-xs'>
          {currentSection}/{totalSections} steps
        </span>
      </div>
    </div>
  );
}
