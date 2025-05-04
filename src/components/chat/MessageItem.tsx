import { Prose } from '@/components/ui/prose';
import { Message } from '@/hooks/useChatWidget';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageItem = React.memo(({ message }: { message: Message }) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => {
      return setCopied(false);
    }, 2000);
  };

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex w-full max-w-[80%] gap-2 p-3 rounded-lg transition-all relative group',
        message.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted',
      )}
    >
      <div className='flex flex-col w-full'>
        {/* Mentions */}
        {message.mentions?.length > 0 && (
          <div className='flex flex-wrap gap-1 mb-2'>
            {message.mentions.map((m) => {
              return (
                <div
                  key={m.id}
                  className='px-2 py-0.5 text-xs rounded-full bg-primary-foreground/20 flex items-center'
                >
                  <span>@{m.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        {message.sender === 'ai' ? (
          <Prose>
            {message.isStreaming ? (
              <>
                <div
                  id={`stream-content-${message.id.replace('ai-', '')}`}
                  className='whitespace-pre-wrap'
                >
                  {message.content}
                </div>
                <span className='inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse'></span>
              </>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            )}
          </Prose>
        ) : (
          <p className='text-sm leading-relaxed'>{message.content}</p>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        title='Copy to clipboard'
        className={cn(
          'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md',
          message.sender === 'user' ? 'hover:bg-primary-foreground/20' : 'hover:bg-background/80',
          copied ? 'text-green-500' : '',
        )}
      >
        {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
      </button>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

export default MessageItem;
