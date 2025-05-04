'use client';

import { Prose } from '@/components/ui/prose';
import type { Message } from '@/hooks/useChatWidget';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { FC, memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Renders mention tags
const Mentions: FC<{ mentions?: Message['mentions'] }> = ({ mentions = [] }) => {
  if (!mentions.length) return null;
  return (
    <div className='flex flex-wrap gap-1 mb-2'>
      {mentions.map(({ id, name }) => {
        return (
          <span key={id} className='px-2 py-0.5 text-xs rounded-full bg-primary-foreground/20'>
            @{name}
          </span>
        );
      })}
    </div>
  );
};

// Copy-to-clipboard button with feedback
const CopyButton: FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      return setCopied(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title='Copy'
      className={cn(
        'absolute top-2 right-2 p-1 rounded-md transition-opacity opacity-0 group-hover:opacity-100',
        copied && 'text-green-500',
      )}
    >
      {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
    </button>
  );
};

// Renders AI message content with Markdown support
const MessageContent: FC<{
  content: string;
  isStreaming?: boolean;
  id: string;
}> = ({ content, isStreaming, id }) => {
  return (
    <Prose className='max-w-full'>
      {isStreaming ? (
        <>
          <div id={`stream-${id}`} className='whitespace-pre-wrap'>
            {content}
          </div>
          <span className='inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse' />
        </>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      )}
    </Prose>
  );
};

// Main MessageItem component
const MessageItem: FC<{ message: Message }> = memo(({ message }) => {
  const { sender, content, mentions, isStreaming, id } = message;
  const alignmentClass =
    sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted';

  return (
    <div
      className={cn(
        'relative group flex max-w-[80%] w-full gap-2 p-3 rounded-lg transition-all',
        alignmentClass,
      )}
    >
      <div className='flex flex-col w-full'>
        <Mentions mentions={mentions} />
        {sender === 'ai' ? (
          <MessageContent content={content} isStreaming={isStreaming} id={id} />
        ) : (
          <p className='text-sm leading-relaxed'>{content}</p>
        )}
      </div>

      <CopyButton text={content} />
    </div>
  );
});

MessageItem.displayName = 'MessageItem';
export default MessageItem;
