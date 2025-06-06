import { useCallback, useEffect } from 'react';

interface EmailThread {
  threadId: string;
  subject: string;
  participants: string[];
  snippet: string;
  timestamp: Date;
  isUnread: boolean;
  emails: any[];
}

interface UseKeyboardShortcutsProps {
  threads: EmailThread[];
  selectedThreadId?: string;
  onThreadSelect: (threadId: string) => void;
}

export function useKeyboardShortcuts({
  threads,
  selectedThreadId,
  onThreadSelect,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!threads.length) return;

      const currentIndex = threads.findIndex((thread) => {
        return thread.threadId === selectedThreadId;
      });

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = currentIndex < threads.length - 1 ? currentIndex + 1 : 0;
          onThreadSelect(threads[nextIndex].threadId);
          break;

        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : threads.length - 1;
          onThreadSelect(threads[prevIndex].threadId);
          break;

        case 'Enter':
          event.preventDefault();
          if (selectedThreadId) {
            onThreadSelect(selectedThreadId);
          }
          break;

        case 'Home':
          event.preventDefault();
          if (threads.length > 0) {
            onThreadSelect(threads[0].threadId);
          }
          break;

        case 'End':
          event.preventDefault();
          if (threads.length > 0) {
            onThreadSelect(threads[threads.length - 1].threadId);
          }
          break;
      }
    },
    [threads, selectedThreadId, onThreadSelect],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      return window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
