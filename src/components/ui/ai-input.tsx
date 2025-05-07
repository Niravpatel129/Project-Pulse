import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Mic, Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';

export type Attachment = {
  id: string;
  type: 'file' | 'voice';
  name: string;
  size?: number;
  timestamp: string;
};

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  error?: string;
  placeholder?: string;
  exampleText?: string;
  className?: string;
  attachments?: Attachment[];
  onAttachmentAdd?: (attachments: Attachment[]) => void;
  onAttachmentRemove?: (id: string) => void;
  onClose?: () => void;
}

export default function AIInput({
  value,
  onChange,
  onGenerate,
  isGenerating,
  error,
  placeholder = 'Describe what you need...',
  exampleText,
  className,
  attachments = [],
  onAttachmentAdd,
  onAttachmentRemove,
  onClose,
}: AIInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const aiPromptInputRef = useRef<HTMLTextAreaElement>(null);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and attach the voice note
      setIsRecording(false);
      const newAttachment = {
        id: `voice-${Date.now()}`,
        type: 'voice',
        name: `Voice note (${recordingDuration}s)`,
        timestamp: new Date().toISOString(),
      };
      onAttachmentAdd?.([...attachments, newAttachment]);
      setRecordingDuration(0);
    } else {
      // Start recording
      setIsRecording(true);
      // Start duration counter
      const intervalId = setInterval(() => {
        setRecordingDuration((prev) => {
          return prev + 1;
        });
      }, 1000);

      // Store interval ID for cleanup
      return () => {
        return clearInterval(intervalId);
      };
    }
  };

  const handleFileAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList) as File[];

      const newAttachments = filesArray.map((file) => {
        return {
          id: `file-${Date.now()}-${file.name}`,
          type: 'file',
          name: file.name,
          size: file.size,
          timestamp: new Date().toISOString(),
        };
      });

      onAttachmentAdd?.([...attachments, ...newAttachments]);
    }
  };

  return (
    <div className={cn('space-y-4 relative', className)}>
      {onClose && (
        <button
          onClick={onClose}
          className='absolute top-0 right-0 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors z-10'
          aria-label='Close'
        >
          <X size={18} />
        </button>
      )}
      <div className='flex relative'>
        <Textarea
          ref={aiPromptInputRef}
          value={value}
          onChange={(e) => {
            return onChange(e.target.value);
          }}
          rows={4}
          placeholder={placeholder}
          className={cn(
            'flex-1 border rounded-lg px-3 py-2 text-sm outline-none bg-transparent transition-colors pr-[110px]',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
              : 'border-[#E5E7EB] focus:border-purple-400 focus:ring-purple-100',
          )}
        />
        <Button
          onClick={onGenerate}
          className={cn(
            'bg-purple-600 text-white px-4 py-2 text-sm transition-all duration-200 flex items-center justify-center min-w-[100px] absolute right-2 bottom-2 cursor-pointer z-10 rounded-lg',
            !value.trim() || isGenerating
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-purple-700 hover:shadow',
          )}
          disabled={!value.trim() || isGenerating}
        >
          {isGenerating ? <Loader2 size={16} className='animate-spin' /> : 'Generate'}
        </Button>
      </div>

      {/* Error message display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-2 text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-100'
        >
          <div className='flex items-start'>
            <X size={16} className='mr-1 mt-0.5 flex-shrink-0' />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Voice and attachment controls */}
      <div className='flex mt-3 items-center'>
        <div className='flex space-x-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleRecording}
                  className={cn(
                    'p-2 rounded-full flex items-center justify-center transition-all duration-200',
                    isRecording
                      ? 'bg-red-100 text-red-600 shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                  title={isRecording ? 'Stop recording' : 'Record voice note'}
                  aria-label={isRecording ? 'Stop recording' : 'Record voice note'}
                >
                  <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isRecording ? 'Stop recording' : 'Record voice note'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <label className='p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 cursor-pointer flex items-center justify-center'>
                  <Paperclip size={16} />
                  <Input
                    type='file'
                    multiple
                    className='hidden'
                    onChange={handleFileAttachment}
                    accept='image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    aria-label='Attach files'
                  />
                </label>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach files</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className='ml-2 flex items-center'
          >
            <div className='w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse'></div>
            <span className='text-xs text-gray-500'>Recording {recordingDuration}s</span>
          </motion.div>
        )}

        <div className='flex-1'></div>

        <div className='text-xs text-gray-500'>
          {attachments.length > 0 &&
            `${attachments.length} attachment${attachments.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Attachments display */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='mt-3 space-y-2 border-t border-gray-100 pt-2'
          >
            {attachments.map((attachment, index) => {
              return (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  key={attachment.id}
                  className='flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs hover:bg-gray-100 transition-colors'
                >
                  <div className='flex items-center'>
                    {attachment.type === 'voice' ? (
                      <Mic size={14} className='mr-2 text-purple-500' />
                    ) : (
                      <Paperclip size={14} className='mr-2 text-purple-500' />
                    )}
                    <span className='text-gray-700'>{attachment.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      return onAttachmentRemove?.(attachment.id);
                    }}
                    className='text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors'
                    aria-label={`Remove attachment ${attachment.name}`}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {exampleText && <p className='text-[#6B7280] text-xs mt-2 italic'>{exampleText}</p>}
    </div>
  );
}
