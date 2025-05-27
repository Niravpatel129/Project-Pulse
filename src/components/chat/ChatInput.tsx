import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { File, Paperclip, Search, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PromptList } from './PromptList';

interface ChatInputProps {
  onSend: (message: string, attachments?: File[], images?: { url: string; alt?: string }[]) => void;
  isTyping: boolean;
  onAttach?: () => void;
  onVoiceMessage?: () => void;
  samplePrompts: {
    category: string;
    prompts: string[];
  }[];
}

export function ChatInput({
  onSend,
  isTyping,
  onAttach,
  onVoiceMessage,
  samplePrompts,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [promptsOpen, setPromptsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<{ url: string; alt?: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        return URL.revokeObjectURL(url);
      });
    };
  }, []);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
      setIsExpanded(newHeight > 56);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 3000) {
      setInput(value);
      setCharCount(value.length);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with shift + enter
        return;
      }
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0 && selectedImages.length === 0) return;
    onSend(input.trim(), attachments, selectedImages);
    setInput('');
    setCharCount(0);
    setAttachments([]);
    setSelectedImages([]);
    setIsExpanded(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    setCharCount(prompt.length);
    setPromptsOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setAttachments((prev) => {
      return [...prev, ...newFiles];
    });

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      return prev.filter((_, i) => {
        return i !== index;
      });
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageSelect = (image: { url: string; alt?: string }) => {
    setSelectedImages((prev) => {
      return [...prev, image];
    });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems = Array.from(items).filter((item) => {
      return item.type.startsWith('image/');
    });

    if (imageItems.length > 0) {
      e.preventDefault();

      for (const item of imageItems) {
        const file = item.getAsFile();
        if (!file) continue;

        // Create a URL for the pasted image
        const imageUrl = URL.createObjectURL(file);
        objectUrlsRef.current.add(imageUrl);
        setSelectedImages((prev) => {
          return [...prev, { url: imageUrl, alt: 'Pasted image' }];
        });
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = [...prev];
      const removedImage = newImages[index];
      if (removedImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(removedImage.url);
        objectUrlsRef.current.delete(removedImage.url);
      }
      return newImages.filter((_, i) => {
        return i !== index;
      });
    });
  };

  return (
    <div className='dark:border-[#232428] bg-background px-6 py-4 shrink-0'>
      <div className='mx-auto max-w-3xl relative'>
        <div className='border border-gray-200 dark:border-[#313131] rounded-lg overflow-hidden'>
          <div className='relative'>
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onPaste={handlePaste}
              className='border-0 shadow-none text-sm py-5 px-4 bg-white dark:bg-[#141414] resize-none min-h-[56px] max-h-[200px] overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white'
              placeholder='Summarize the latest'
              rows={1}
            />
            <Button
              size='icon'
              onClick={handleSend}
              disabled={
                (!input.trim() && attachments.length === 0 && selectedImages.length === 0) ||
                isTyping
              }
              className={`absolute right-3 rounded-full h-7 w-7 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-[#232323] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isExpanded ? 'bottom-3' : 'top-1/2 -translate-y-1/2'
              }`}
            >
              <Send className='h-3.5 w-3.5 text-white dark:text-black' />
            </Button>
          </div>

          {attachments.length > 0 && (
            <div className='px-4 py-2 border-t border-gray-100 dark:border-[#232428] bg-gray-50 dark:bg-[#232323]'>
              <div className='space-y-2'>
                {attachments.map((file, index) => {
                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className='flex items-center justify-between bg-white dark:bg-[#141414] p-2 rounded'
                    >
                      <div className='flex items-center gap-2'>
                        <File className='h-4 w-4 text-gray-500' />
                        <span className='text-sm truncate max-w-[200px]'>{file.name}</span>
                        <span className='text-xs text-gray-500'>({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          return removeAttachment(index);
                        }}
                        className='h-6 w-6 p-0'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedImages.length > 0 && (
            <div className='px-4 py-2 border-t border-gray-100 dark:border-[#232428] bg-gray-50 dark:bg-[#232323]'>
              <div className='grid grid-cols-2 gap-2'>
                {selectedImages.map((image, index) => {
                  return (
                    <div
                      key={`${image.url}-${index}`}
                      className='relative group aspect-video bg-white dark:bg-[#141414] rounded overflow-hidden'
                    >
                      <img
                        src={image.url}
                        alt={image.alt || 'Selected image'}
                        className='w-full h-full object-cover'
                      />
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          return removeImage(index);
                        }}
                        className='absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className='flex items-center justify-between border-t border-gray-100 dark:border-[#232428] px-4 py-2 bg-gray-50 dark:bg-[#232323]'>
            <div className='flex items-center gap-3'>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileSelect}
                className='hidden'
                multiple
              />
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return fileInputRef.current?.click();
                }}
                className='text-xs text-gray-500 dark:text-[#8b8b8b] h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#313131]'
              >
                <Paperclip className='h-3.5 w-3.5 mr-1.5' />
                Attach
              </Button>
              <Popover open={promptsOpen} onOpenChange={setPromptsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-xs text-gray-500 dark:text-[#8b8b8b] h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#313131]'
                  >
                    <Search className='h-3.5 w-3.5 mr-1.5' />
                    Browse Prompts
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align='start'
                  sideOffset={8}
                  className='w-80 p-0 border border-gray-200 dark:border-[#313131] shadow-lg rounded-lg overflow-hidden'
                >
                  <PromptList categories={samplePrompts} onSelectPrompt={handleSelectPrompt} />
                </PopoverContent>
              </Popover>
            </div>
            <div className='text-xs text-gray-400 dark:text-[#8b8b8b]'>{charCount} / 3,000</div>
          </div>
        </div>
      </div>
    </div>
  );
}
