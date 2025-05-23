import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Paperclip, Search, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PromptList } from './PromptList';

interface ChatInputProps {
  onSend: (message: string) => void;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
    setCharCount(0);
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
              className='border-0 shadow-none text-sm py-5 px-4 bg-white dark:bg-[#141414] resize-none min-h-[56px] max-h-[200px] overflow-y-auto focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white'
              placeholder='Summarize the latest'
              rows={1}
            />
            <Button
              size='icon'
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`absolute right-3 rounded-full h-7 w-7 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-[#232323] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isExpanded ? 'bottom-3' : 'top-1/2 -translate-y-1/2'
              }`}
            >
              <Send className='h-3.5 w-3.5 text-white dark:text-black' />
            </Button>
          </div>
          <div className='flex items-center justify-between border-t border-gray-100 dark:border-[#232428] px-4 py-2 bg-gray-50 dark:bg-[#232323]'>
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='sm'
                onClick={onAttach}
                className='text-xs text-gray-500 dark:text-[#8b8b8b] h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#313131]'
              >
                <Paperclip className='h-3.5 w-3.5 mr-1.5' />
                Attach
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={onVoiceMessage}
                className='text-xs text-gray-500 dark:text-[#8b8b8b] h-7 px-2 rounded hover:bg-gray-100 dark:hover:bg-[#313131]'
              >
                <Mic className='h-3.5 w-3.5 mr-1.5' />
                Voice Message
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
