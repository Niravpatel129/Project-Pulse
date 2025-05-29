import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  agent?: {
    id: string;
    name: string;
    icon?: string;
  };
  parts?: {
    type: 'text' | 'reasoning' | 'action' | 'tool_call' | 'status';
    content: string;
    step?: string;
    timestamp: Date;
  }[];
  tool_calls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
  images?: {
    url: string;
    alt?: string;
  }[];
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
  isTyping: boolean;
  isLatestMessage?: boolean;
}

function TypingAnimation() {
  return (
    <span className='inline-flex items-center'>
      <span className='animate-bounce'>.</span>
      <span className='animate-bounce delay-100'>.</span>
      <span className='animate-bounce delay-200'>.</span>
    </span>
  );
}

function ToolCall({ tool }: { tool: Message['tool_calls'][0] }) {
  return (
    <div className='mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md'>
      <div className='text-xs text-gray-500 dark:text-gray-400'>
        Using tool: {tool.function.name}
      </div>
      <div className='text-xs text-gray-600 dark:text-gray-300 mt-1'>{tool.function.arguments}</div>
    </div>
  );
}

function MessageImages({ images }: { images: Message['images'] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className='mt-2 grid grid-cols-2 gap-2'>
      {images.map((image, index) => {
        return (
          <div
            key={`${image.url}-${index}`}
            className='relative aspect-video rounded-md overflow-hidden'
          >
            <img
              src={image.url}
              alt={image.alt || 'Message image'}
              className='w-full h-full object-cover'
            />
          </div>
        );
      })}
    </div>
  );
}

function MessagePart({ part }: { part: Message['parts'][0] }) {
  switch (part.type) {
    case 'text':
      return <ReactMarkdown remarkPlugins={[remarkGfm]}>{part.content}</ReactMarkdown>;
    case 'reasoning':
      return <div className='text-sm text-gray-500 dark:text-gray-400 italic'>{part.content}</div>;
    case 'action':
      return (
        <div className='text-sm text-blue-500 dark:text-blue-400'>
          {part.step && <span className='font-semibold'>{part.step}: </span>}
          {part.content}
        </div>
      );
    case 'status':
      return <div className='text-sm text-gray-500 dark:text-gray-400'>{part.content}</div>;
    case 'tool_call':
      try {
        const toolCall = JSON.parse(part.content);
        return <ToolCall tool={toolCall} />;
      } catch (e) {
        return null;
      }
    default:
      return null;
  }
}

export function ChatMessage({ message, isTyping, isLatestMessage }: ChatMessageProps) {
  console.log('🚀 message:', message);
  const isUser = message.role === 'user';

  // Check if message has content either directly or in parts
  const hasContent =
    message.content ||
    (message.parts && message.parts.length > 0) ||
    message.tool_calls ||
    message.images;

  if (!hasContent) {
    return null;
  }

  // Group parts by type to handle text parts together
  const groupedParts =
    message.parts?.reduce((acc, part) => {
      if (part.type === 'text') {
        if (!acc.text) acc.text = [];
        acc.text.push(part);
      } else {
        if (!acc.other) acc.other = [];
        acc.other.push(part);
      }
      return acc;
    }, {} as { text?: typeof message.parts; other?: typeof message.parts }) || {};

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && message.agent && (
          <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>{message.agent.name}</div>
        )}
        <div
          className={`px-4 py-3 rounded-lg text-sm prose dark:prose-invert max-w-none ${
            isUser
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 dark:bg-[#141414] text-gray-900 dark:text-gray-100'
          }`}
        >
          {message.parts ? (
            <>
              {/* Render text parts as a single sentence */}
              {groupedParts.text && groupedParts.text.length > 0 && (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {groupedParts.text
                    .map((part) => {
                      return part.content;
                    })
                    .join('')}
                </ReactMarkdown>
              )}
              {/* Render other parts */}
              {groupedParts.other?.map((part, index) => {
                return <MessagePart key={`${part.type}-${index}`} part={part} />;
              })}
            </>
          ) : (
            message.content && (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            )
          )}
          {message.images && <MessageImages images={message.images} />}
          {message.tool_calls?.map((tool) => {
            return <ToolCall key={tool.id} tool={tool} />;
          })}
          {!isUser && (isTyping || message.isStreaming) && isLatestMessage && <TypingAnimation />}
        </div>
        <div
          className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
