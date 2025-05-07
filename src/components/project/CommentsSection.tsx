'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Loader2, Plus, Save, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import SectionFooter from './SectionFooter';
import { Section } from './types';

type CommentsSectionProps = {
  notes: string;
  setNotes: (notes: string) => void;
  onClose: () => void;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
};

export default function CommentsSection({
  notes,
  setNotes,
  onClose,
  setActiveSection,
}: CommentsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    if (!localNotes.trim()) {
      toast.error('Notes cannot be empty');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
    setNotes(localNotes);
    setIsEditing(false);
    setIsSubmitting(false);
    toast.success('Notes saved successfully');
  };

  const handleCancel = () => {
    setLocalNotes(notes);
    setIsEditing(false);
  };

  return (
    <div className='flex flex-col h-full relative bg-[#FAFAFA]'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Project Notes</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Add any additional notes or comments about this project. These notes will be visible to
            your team.
          </p>

          <div className='space-y-6'>
            {/* Notes Card */}
            <Card className='p-6 transition-all duration-200 hover:shadow-sm'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <div className='p-2 bg-blue-50 rounded-full'>
                    <FileText className='h-4 w-4 text-blue-600' />
                  </div>
                  <h3 className='text-base font-medium text-gray-900'>Project Notes</h3>
                </div>
                {!isEditing && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setIsEditing(true);
                      setTimeout(() => {
                        return textareaRef.current?.focus();
                      }, 10);
                    }}
                    className='text-blue-600 hover:text-blue-700'
                  >
                    <Plus className='h-4 w-4 mr-1' />
                    Edit Notes
                  </Button>
                )}
              </div>

              <AnimatePresence mode='wait'>
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className='space-y-4'
                  >
                    <Textarea
                      ref={textareaRef}
                      value={localNotes}
                      onChange={(e) => {
                        return setLocalNotes(e.target.value);
                      }}
                      placeholder='Add your project notes here...'
                      className='min-h-[200px] resize-none'
                    />
                    <div className='flex justify-end gap-2'>
                      <Button variant='outline' onClick={handleCancel} disabled={isSubmitting}>
                        <X className='h-4 w-4 mr-1' />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSubmitting || !localNotes.trim()}
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                      >
                        {isSubmitting ? (
                          <Loader2 className='h-4 w-4 mr-1 animate-spin' />
                        ) : (
                          <Save className='h-4 w-4 mr-1' />
                        )}
                        Save Notes
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='prose prose-sm max-w-none'
                  >
                    {notes ? (
                      <p className='text-gray-700 whitespace-pre-wrap leading-relaxed'>{notes}</p>
                    ) : (
                      <p className='text-gray-500 italic'>No notes added yet.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          setActiveSection('invoice');
        }}
        currentSection={3}
        totalSections={4}
        onCancel={onClose}
      />
    </div>
  );
}
