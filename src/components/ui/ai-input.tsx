import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Mic, Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';

export interface Attachment {
  id: string;
  type: 'file' | 'voice';
  name: string;
  size?: number;
  timestamp: string;
  url?: string;
  duration?: number;
  mimeType?: string;
}

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  error?: string | null;
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
  isGenerating = false,
  error = null,
  placeholder = 'Type your message...',
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (onAttachmentAdd) {
        const newAttachment: Attachment = {
          id: `voice-${Date.now()}`,
          type: 'voice',
          name: `Voice note (${recordingDuration}s)`,
          timestamp: new Date().toISOString(),
          duration: recordingDuration,
        };
        onAttachmentAdd([...attachments, newAttachment]);
      }
      setRecordingDuration(0);
    } else {
      // Start recording
      setIsRecording(true);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onAttachmentAdd) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => {
      return {
        id: `file-${Date.now()}-${file.name}`,
        type: 'file',
        name: file.name,
        size: file.size,
        timestamp: new Date().toISOString(),
        mimeType: file.type,
      };
    });

    onAttachmentAdd([...attachments, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    if (!onAttachmentRemove) return;
    onAttachmentRemove(id);
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
      <div className='relative'>
        <Textarea
          ref={aiPromptInputRef}
          value={value}
          onChange={(e) => {
            return onChange(e.target.value);
          }}
          placeholder={placeholder}
          className={cn(
            'min-h-[100px] resize-none pr-24',
            error && 'border-red-500 focus-visible:ring-red-500',
          )}
        />
        <div className='absolute bottom-2 right-2 flex items-center gap-2'>
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileSelect}
            className='hidden'
            multiple
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => {
              return fileInputRef.current?.click();
            }}
            className='h-8 w-8'
          >
            <Paperclip className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={toggleRecording}
            className={cn('h-8 w-8', isRecording && 'text-red-500')}
          >
            <Mic className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            onClick={onGenerate}
            disabled={!value.trim() || isGenerating}
            className='h-8'
          >
            {isGenerating ? <Loader2 className='h-4 w-4 animate-spin' /> : 'Generate'}
          </Button>
        </div>
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
                    onChange={handleFileSelect}
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
                      return removeAttachment(attachment.id);
                    }}
                    className='text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors'
                    aria-label={`Remove attachment ${attachment.name}`}
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
