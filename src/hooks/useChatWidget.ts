import { newRequest, streamRequest } from '@/utils/newRequest';
import { useCallback, useEffect, useRef, useState } from 'react';

// Types
export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isStreaming?: boolean;
  mentions?: TableInfo[];
};

export type TableInfo = {
  id: string;
  name: string;
  description?: string;
};

export type PageContext = {
  pageId?: string;
  title?: string;
  url?: string;
  content?: string;
  tables?: TableInfo[];
};

export function useChatWidget(pageContext?: PageContext) {
  // Chat state
  const [wiggle, setWiggle] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    // Try to get open state from localStorage on initial render
    if (typeof window !== 'undefined') {
      const savedOpenState = localStorage.getItem('chat-is-open');
      return savedOpenState === 'true';
    }
    return false;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<TableInfo[]>([]);
  const [leftSize, setLeftSize] = useState(80);

  // Refs
  const isSendingRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mentionTriggerRef = useRef<HTMLButtonElement>(null);
  const inputValueRef = useRef('');
  const cursorPositionRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const contentAccumulatorRef = useRef<{ [key: string]: string }>({});
  const userScrollingRef = useRef(false);
  const lastMessageIdRef = useRef<string | null>(null);

  // Load session ID from localStorage on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    // Set sample tables for demo (in real app, get from pageContext)
    const demoTables: TableInfo[] = pageContext?.tables || [
      { id: '1', name: 'users', description: 'User accounts and profiles' },
      { id: '2', name: 'orders', description: 'Customer orders data' },
      { id: '3', name: 'products', description: 'Product catalog information' },
      { id: '4', name: 'customers', description: 'Customer information' },
      { id: '5', name: 'payments', description: 'Payment transactions' },
      { id: '6', name: 'inventory', description: 'Product inventory' },
    ];
    setTables(demoTables);
  }, [pageContext]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && !userScrollingRef.current) {
      scrollToBottom();
    }
    if (messages.length > 0) {
      lastMessageIdRef.current = messages[messages.length - 1].id;
    }
  }, [messages.length]);

  // Global styling for page shifting
  useEffect(() => {
    // Apply the class-based styling when the chat is open
    document.documentElement.style.setProperty('--content-margin-right', isOpen ? '350px' : '0px');

    // Create and add a style element for dynamic styles
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      body {
        transition: padding-right 0.3s ease;
        padding-right: var(--content-margin-right, 0px);
      }
      
      /* Target app-specific navigation elements */
      header.fixed, 
      header.sticky,
      header.fixed.top-0, 
      .fixed.top-0,
      nav.fixed {
        transition: width 0.3s ease;
        width: calc(100% - var(--content-margin-right, 0px));
      }
      
      /* For mobile */
      @media (max-width: 768px) {
        body {
          padding-right: 0 !important;
        }
        header.fixed, 
        header.sticky,
        header.fixed.top-0,
        .fixed.top-0,
        nav.fixed {
          width: 100% !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Apply class to body for more styling options
    if (isOpen) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }

    return () => {
      document.documentElement.style.setProperty('--content-margin-right', '0px');
      document.body.classList.remove('chat-open');
      document.head.removeChild(styleEl);
    };
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      const isScrolledToBottom =
        scrollArea.scrollHeight - scrollArea.scrollTop <= scrollArea.clientHeight + 100;
      userScrollingRef.current = !isScrolledToBottom;
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
      return () => {
        return scrollArea.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // Effect for panel resize and content shifting
  useEffect(() => {
    if (!isOpen) return;

    // Set initial body styles
    const originalPaddingRight = document.body.style.paddingRight;
    const originalOverflow = document.body.style.overflow;

    // Add transition to body
    document.body.style.transition = 'padding-right 0.2s ease';
    document.body.style.paddingRight = `${100 - leftSize}vw`;
    document.body.style.overflow = 'hidden auto';

    // Apply to fixed elements as well
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      header.fixed, header.sticky, .fixed.top-0, nav.fixed {
        transition: width 0.2s ease;
        width: calc(${leftSize}vw);
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      // Cleanup
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.overflow = originalOverflow;
      document.body.style.transition = '';
      document.head.removeChild(styleEl);
    };
  }, [leftSize, isOpen]);

  // An effect to ensure input focus is maintained when mentions dropdown appears
  useEffect(() => {
    // When mentions dropdown state changes, ensure we keep focus
    if (showMentions && inputRef.current) {
      const cursorPos = cursorPositionRef.current;
      // Use rAF to ensure focus happens after render is complete
      requestAnimationFrame(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(cursorPos, cursorPos);
        }
      });
    }
  }, [showMentions]);

  // Toggle chat open/closed
  const toggleChat = useCallback(() => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat-is-open', newIsOpen.toString());
    }
  }, [isOpen]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Save focus state
      const activeElement = document.activeElement;
      const selectionStart = inputRef.current?.selectionStart;
      const selectionEnd = inputRef.current?.selectionEnd;

      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });

      // Restore focus if it was on input
      if (activeElement === inputRef.current && inputRef.current) {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
          // Restore cursor position if available
          if (selectionStart !== undefined && selectionEnd !== undefined) {
            inputRef.current.setSelectionRange(selectionStart, selectionEnd);
          }
        });
      }
    }
  }, []);

  // This function handles input changes without state updates that cause re-renders
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Store value in ref instead of state
      inputValueRef.current = e.target.value;

      // Track cursor position
      if (e.target.selectionStart !== undefined) {
        cursorPositionRef.current = e.target.selectionStart;
      }

      // Only use state for controlling the mention dropdown UI
      const value = e.target.value;
      const pos = e.target.selectionStart || 0;
      const beforeCursor = value.substring(0, pos);
      const match = beforeCursor.match(/@([^\s@]*)$/);

      // Detect if we need to show mentions without state updates
      const shouldShowMentions = !!match;
      const newFilter = match ? match[1]?.toLowerCase() || '' : '';

      // Only update state if something changed to minimize re-renders
      if (shouldShowMentions !== showMentions) {
        // Record active element before state update
        const activeElement = document.activeElement;
        const cursorPos = inputRef.current?.selectionStart || 0;

        // Batch state updates
        if (shouldShowMentions) {
          setMentionFilter(newFilter);
          setShowMentions(true);
        } else {
          setShowMentions(false);
        }

        // Restore focus after state update via rAF
        requestAnimationFrame(() => {
          if (activeElement === inputRef.current && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(cursorPos, cursorPos);
          }
        });
      } else if (shouldShowMentions && newFilter !== mentionFilter) {
        // Just update filter if dropdown is already showing
        setMentionFilter(newFilter);
      }
    },
    [showMentions, mentionFilter],
  );

  // Handle @ button click
  const handleAtButtonClick = useCallback(() => {
    if (!inputRef.current) return;

    const selStart = inputRef.current.selectionStart || 0;
    const selEnd = inputRef.current.selectionEnd || selStart;
    const value = inputRef.current.value;

    // Insert @ symbol at cursor
    const newValue = value.substring(0, selStart) + '@' + value.substring(selEnd);

    // Update ref and input directly without state
    inputValueRef.current = newValue;
    inputRef.current.value = newValue;

    // Update cursor position
    const newPosition = selStart + 1;
    cursorPositionRef.current = newPosition;

    // Focus and set cursor position
    inputRef.current.focus();
    inputRef.current.setSelectionRange(newPosition, newPosition);

    // Show mentions dropdown (this won't affect input focus)
    setShowMentions(true);
    setMentionFilter('');
  }, []);

  // KeyDown handler for textarea
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        if (showMentions) {
          return; // If mentions dropdown is open, do nothing
        }

        handleSendMessage();
      }

      // Close mentions dropdown on escape
      if (e.key === 'Escape' && showMentions) {
        setShowMentions(false);
      }
    },
    [showMentions],
  );

  // Stream response from AI
  const setupStreamConnection = useCallback(
    (
      userMessageId: string,
      messageContent: string,
      mentionsForAPI: string[] = [],
      contextSettings?: string,
    ) => {
      // Track if input had focus before we start streaming
      const inputHadFocus = document.activeElement === inputRef.current;

      // Cancel ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // New controller for this request
      abortControllerRef.current = new AbortController();

      // Initialize content accumulator
      const streamMessageId = `ai-${userMessageId}`;
      contentAccumulatorRef.current[streamMessageId] = '';

      // Create placeholder message
      const streamingMessage: Message = {
        id: streamMessageId,
        content: '',
        sender: 'ai',
        timestamp: new Date(),
        isStreaming: true,
      };

      // Add placeholder to messages
      setMessages((prev) => {
        return [...prev, streamingMessage];
      });
      setIsStreaming(true);
      userScrollingRef.current = false;

      try {
        const streamController = streamRequest({
          endpoint: '/ai/chat/stream',
          method: 'POST',
          data: {
            message: messageContent,
            sessionId: sessionId,
            pageContext: pageContext || null,
            mentions: mentionsForAPI.length > 0 ? mentionsForAPI : undefined,
            contextSettings: contextSettings || undefined,
          },
          onStart: (data) => {
            // Save session ID
            setWiggle(true);
            if (data.sessionId && (!sessionId || sessionId !== data.sessionId)) {
              setSessionId(data.sessionId);
              localStorage.setItem('chatSessionId', data.sessionId);
            }

            // Restore focus if input had focus before streaming
            if (inputHadFocus && inputRef.current) {
              inputRef.current.focus();
            }
          },
          onChunk: (data) => {
            // Accumulate content
            if (data.content) {
              contentAccumulatorRef.current[streamMessageId] += data.content;
            }

            // Update DOM directly for streaming
            const streamElement = document.getElementById(`stream-content-${userMessageId}`);
            if (streamElement) {
              streamElement.textContent = contentAccumulatorRef.current[streamMessageId];
              if (!userScrollingRef.current) {
                // Save focus state
                const activeElement = document.activeElement;
                scrollToBottom();
                // Restore focus if it was on the input
                if (activeElement === inputRef.current && inputRef.current) {
                  requestAnimationFrame(() => {
                    inputRef.current?.focus();
                  });
                }
              }
            } else {
              // Fallback to React state update
              setMessages((prev) => {
                return prev.map((msg) => {
                  if (msg.id === streamMessageId) {
                    return { ...msg, content: contentAccumulatorRef.current[streamMessageId] };
                  }
                  return msg;
                });
              });

              // Restore focus if needed
              if (
                inputHadFocus &&
                inputRef.current &&
                document.activeElement !== inputRef.current
              ) {
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }
            }
          },

          onEnd: () => {
            // Final update with complete content
            setWiggle(false);
            setMessages((prev) => {
              return prev.map((msg) => {
                if (msg.id === streamMessageId) {
                  return {
                    ...msg,
                    content: contentAccumulatorRef.current[streamMessageId],
                    isStreaming: false,
                  };
                }
                return msg;
              });
            });

            setIsStreaming(false);
            setIsLoading(false);
            abortControllerRef.current = null;

            // Save focus state before scrolling
            const focusWasOnInput = document.activeElement === inputRef.current;

            setTimeout(() => {
              scrollToBottom();
              // Restore focus if it was on input
              if ((focusWasOnInput || inputHadFocus) && inputRef.current) {
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }
            }, 50);
          },
          onError: (error) => {
            console.error('Error in stream:', error);

            // Update with error message
            setMessages((prev) => {
              return prev.map((msg) => {
                if (msg.id === streamMessageId) {
                  return {
                    ...msg,
                    content: 'Sorry, there was an error processing your request. Please try again.',
                    isStreaming: false,
                  };
                }
                return msg;
              });
            });

            setIsStreaming(false);
            setIsLoading(false);
            abortControllerRef.current = null;

            // Restore focus if input had focus before error
            if (inputHadFocus && inputRef.current) {
              requestAnimationFrame(() => {
                inputRef.current?.focus();
              });
            }
          },
        });

        // Store cancel function
        if (abortControllerRef.current) {
          const originalAbort = abortControllerRef.current.abort;
          abortControllerRef.current.abort = () => {
            streamController.cancel();
            originalAbort.call(abortControllerRef.current);
          };
        }
      } catch (error) {
        console.error('Error in setupStreamConnection:', error);

        // Update with error message
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.id === streamMessageId) {
              return {
                ...msg,
                content: 'Connection error. Please try again later.',
                isStreaming: false,
              };
            }
            return msg;
          });
        });

        setIsStreaming(false);
        setIsLoading(false);
      }
    },
    [sessionId, pageContext, scrollToBottom],
  );

  // Send message handler
  const handleSendMessage = useCallback(
    async (contextSettings?: string) => {
      if (!inputRef.current) return;

      const messageContent = inputRef.current.value.trim();
      if ((!messageContent && selectedMentions.length === 0) || isSendingRef.current) return;

      // If we're streaming, cancel the current stream
      if (isStreaming && abortControllerRef.current) {
        abortControllerRef.current.abort();
        // Add a note to the last AI message that it was interrupted
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.sender === 'ai' && lastMessage.isStreaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: lastMessage.content + '\n\n*Message interrupted*',
                isStreaming: false,
              },
            ];
          }
          return prev;
        });
        setIsStreaming(false);
      }

      // Set sending flag
      isSendingRef.current = true;

      // Create user message with mentions
      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageContent,
        sender: 'user',
        timestamp: new Date(),
        mentions: selectedMentions.length > 0 ? [...selectedMentions] : undefined,
      };

      // Add to messages
      setMessages((prev) => {
        return [...prev, userMessage];
      });

      // Clear input and mentions
      inputValueRef.current = '';
      inputRef.current.value = '';
      cursorPositionRef.current = 0;
      setSelectedMentions([]);

      // Set loading state but allow typing
      setIsLoading(true);
      userScrollingRef.current = false;
      setTimeout(scrollToBottom, 50);

      try {
        // Stream response - prepare content for API with mentions included
        const apiMessageContent = messageContent;
        const mentionsForAPI = selectedMentions.map((m) => {
          return m.name;
        });

        // Stream response - modify to include mentions
        setupStreamConnection(userMessage.id, messageContent, mentionsForAPI, contextSettings);
      } catch (error) {
        console.error('Error sending message:', error);

        // Show error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, there was an error processing your request. Please try again.',
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages((prev) => {
          return [...prev, errorMessage];
        });
        setIsLoading(false);
      } finally {
        // Clear sending flag
        isSendingRef.current = false;
      }
    },
    [isStreaming, selectedMentions, scrollToBottom, setupStreamConnection],
  );

  // Clear conversation handler
  const clearConversation = useCallback(async () => {
    if (!sessionId || isLoading) return;

    try {
      setIsLoading(true);
      await newRequest.delete(`/ai/chat/history/${sessionId}`);
      setMessages([]);
      contentAccumulatorRef.current = {};
      if (inputRef.current) {
        inputRef.current.value = '';
        inputValueRef.current = '';
        cursorPositionRef.current = 0;
      }
      setSelectedMentions([]);
      setSessionId(null);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  // Handle mention selection
  const handleSelectMention = useCallback(
    (tableName: string) => {
      if (!inputRef.current) return;

      // Find the selected table
      const selectedTable = tables.find((table) => {
        return table.name === tableName;
      });
      if (!selectedTable) return;

      // Add to selected mentions if not already there
      if (
        !selectedMentions.some((mention) => {
          return mention.id === selectedTable.id;
        })
      ) {
        setSelectedMentions((prev) => {
          return [...prev, selectedTable];
        });
      }

      // Close mentions dropdown
      setShowMentions(false);

      // Focus back on input
      inputRef.current.focus();
    },
    [tables, selectedMentions],
  );

  // Remove a selected mention
  const removeMention = useCallback((tableId: string) => {
    setSelectedMentions((prev) => {
      return prev.filter((mention) => {
        return mention.id !== tableId;
      });
    });
  }, []);

  // Handle panel resize
  const handleResize = useCallback((sizes: number[]) => {
    if (!sizes.length) return;

    // Use the first size (left panel) to calculate right panel width
    setLeftSize(sizes[0]);

    // Simple right panel width calculation
    const rightPanelVw = 100 - sizes[0];
    const rightPanelWidth = `${rightPanelVw}vw`;

    // Update CSS variable for content margin
    document.documentElement.style.setProperty('--content-margin-right', rightPanelWidth);

    // Direct body padding update
    document.body.style.paddingRight = rightPanelWidth;
  }, []);

  // Handle stop streaming
  const handleStopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.isStreaming) {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: lastMessage.content + '\n\n*Message interrupted*',
              isStreaming: false,
            },
          ];
        }
        return prev;
      });
      setIsStreaming(false);
    }
  }, []);

  // Get filtered tables based on mention filter
  const filteredTables = tables.filter((table) => {
    if (!mentionFilter) return true;
    return table.name.toLowerCase().includes(mentionFilter.toLowerCase());
  });

  return {
    // State
    isOpen,
    messages,
    isLoading,
    sessionId,
    isStreaming,
    showMentions,
    mentionFilter,
    tables,
    selectedMentions,
    filteredTables,
    leftSize,

    // Refs
    inputRef,
    mentionTriggerRef,
    messagesEndRef,
    scrollAreaRef,

    // Actions
    toggleChat,
    handleInputChange,
    handleAtButtonClick,
    handleKeyDown,
    handleSendMessage,
    clearConversation,
    handleSelectMention,
    removeMention,
    handleResize,
    handleStopStreaming,
    scrollToBottom,
    wiggle,
    setWiggle,
    setShowMentions,
  };
}
