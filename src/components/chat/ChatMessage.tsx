interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isTyping: boolean;
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

export function ChatMessage({ message, isTyping }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (message.content === '') {
    return null;
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            isUser
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'bg-gray-100 dark:bg-[#141414] text-gray-900 dark:text-gray-100'
          }`}
        >
          {message.content}
          {!isUser && isTyping && <TypingAnimation />}
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
