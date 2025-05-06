'use client';

import { Button } from '@/components/ui/button';
import SectionFooter from './SectionFooter';

type CommentsSectionProps = {
  notes: string;
  setNotes: (notes: string) => void;
  showNotification: (message: string, type?: string) => void;
  onClose: () => void;
};

export default function CommentsSection({
  notes,
  setNotes,
  showNotification,
  onClose,
}: CommentsSectionProps) {
  return (
    <div className='flex flex-col h-full relative'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Project Notes</h2>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                return showNotification('Draft saved', 'success');
              }}
            >
              Save as draft
            </Button>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Add any additional notes or comments about this project.
          </p>

          <div className='space-y-4'>
            <div className='border border-[#E5E7EB] rounded-md p-4'>
              <label className='block text-[#111827] font-medium text-sm mb-2'>Project Notes</label>
              <textarea
                className='w-full min-h-[120px] border border-[#E5E7EB] rounded-md p-3 text-sm outline-none focus:border-[#9CA3AF] transition-colors bg-transparent'
                value={notes}
                onChange={(e) => {
                  return setNotes(e.target.value);
                }}
                placeholder='Add any notes or comments about this project...'
              />
            </div>

            <div className='border border-[#E5E7EB] rounded-md p-4'>
              <label className='block text-[#111827] font-medium text-sm mb-2'>
                Project Settings
              </label>

              <div className='space-y-3'>
                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='setting1'
                    className='w-4 h-4 rounded-sm border-[#D1D5DB] mr-2'
                  />
                  <label htmlFor='setting1' className='text-[#111827] text-sm'>
                    Send client notifications
                  </label>
                </div>

                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='setting2'
                    className='w-4 h-4 rounded-sm border-[#D1D5DB] mr-2'
                    defaultChecked
                  />
                  <label htmlFor='setting2' className='text-[#111827] text-sm'>
                    Track time spent on project
                  </label>
                </div>

                <div className='flex items-center'>
                  <input
                    type='checkbox'
                    id='setting3'
                    className='w-4 h-4 rounded-sm border-[#D1D5DB] mr-2'
                  />
                  <label htmlFor='setting3' className='text-[#111827] text-sm'>
                    Make project private
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          showNotification('Project completed successfully!', 'success');
          setTimeout(() => {
            return onClose();
          }, 1500);
        }}
        currentSection={3}
        totalSections={3}
        customContinueLabel='Complete Project'
        onCancel={onClose}
      />
    </div>
  );
}
