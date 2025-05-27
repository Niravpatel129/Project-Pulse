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
  };
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

export function ChatMessage({ message, isTyping, isLatestMessage }: ChatMessageProps) {
  console.log('🚀 message:', message);
  const isUser = message.role === 'user';

  if (message.content === '' && !message.tool_calls && !message.images) {
    return null;
  }

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
          {message.content && (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          )}
          {message.images && <MessageImages images={message.images} />}
          {message.tool_calls?.map((tool) => {
            return <ToolCall key={tool.id} tool={tool} />;
          })}
          {!isUser && isTyping && isLatestMessage && <TypingAnimation />}
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
