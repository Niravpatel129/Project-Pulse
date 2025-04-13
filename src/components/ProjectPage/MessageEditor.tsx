import { Button } from '@/components/ui/button';
import Mention, { MentionNodeAttrs } from '@tiptap/extension-mention';
import { Underline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import './MessageEditor.css';

interface MessageEditorProps {
  project: any; // Replace with actual Project type
  onUpdate?: (content: string) => void;
}

interface SuggestionItem {
  id: string;
  name: string;
  email: string;
}

const MessageEditor = ({ project, onUpdate }: MessageEditorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestionItems, setSuggestionItems] = useState<SuggestionItem[]>([]);

  const handleKeyDown = useCallback(
    ({ event }: SuggestionKeyDownProps) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((index) => {
          return (index + suggestionItems.length - 1) % suggestionItems.length;
        });
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((index) => {
          return (index + 1) % suggestionItems.length;
        });
        return true;
      }

      if (event.key === 'Enter') {
        return true;
      }

      return false;
    },
    [suggestionItems],
  );

  const Suggestion = ({
    items,
    command,
    editor,
    query,
  }: SuggestionProps<SuggestionItem, MentionNodeAttrs>) => {
    setSuggestionItems(items);
    return (
      <div className='suggestion-list'>
        {items.map((item, index) => {
          return (
            <button
              key={item.id}
              className={`suggestion-item ${index === selectedIndex ? 'is-selected' : ''}`}
              onClick={() => {
                return command(item);
              }}
            >
              <div className='suggestion-item-content'>
                <div className='suggestion-item-name'>{item.name}</div>
                <div className='suggestion-item-email'>{item.email}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline.configure({
        HTMLAttributes: {
          class: 'underline',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            return project.participants
              .filter((participant: any) => {
                const searchTerm = query.toLowerCase();
                return (
                  participant.name.toLowerCase().includes(searchTerm) ||
                  participant.email.toLowerCase().includes(searchTerm)
                );
              })
              .map((participant: any) => {
                return {
                  id: participant._id,
                  name: participant.name,
                  email: participant.email,
                };
              });
          },
          render: () => {
            return {
              onStart: (props) => {
                return <Suggestion {...props} />;
              },
              onUpdate: (props) => {
                return <Suggestion {...props} />;
              },
              onKeyDown: (props) => {
                return handleKeyDown(props);
              },
              onExit: () => {
                setSelectedIndex(0);
              },
            };
          },
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className='border rounded-md'>
      <div className='border-b p-2 flex gap-1'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            return editor.chain().focus().toggleBold().run();
          }}
          className={editor.isActive('bold') ? 'bg-gray-100' : ''}
        >
          <Bold className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            return editor.chain().focus().toggleItalic().run();
          }}
          className={editor.isActive('italic') ? 'bg-gray-100' : ''}
        >
          <Italic className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            return editor.chain().focus().toggleUnderline().run();
          }}
          className={editor.isActive('underline') ? 'bg-gray-100' : ''}
        >
          <UnderlineIcon className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            return editor.chain().focus().toggleStrike().run();
          }}
          className={editor.isActive('strike') ? 'bg-gray-100' : ''}
        >
          <Strikethrough className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            return editor.chain().focus().toggleCode().run();
          }}
          className={editor.isActive('code') ? 'bg-gray-100' : ''}
        >
          <Code className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            return editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
        >
          <Heading1 className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            return editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
        >
          <Heading2 className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            return editor.chain().focus().toggleBlockquote().run();
          }}
          className={editor.isActive('blockquote') ? 'bg-gray-100' : ''}
        >
          <Quote className='h-4 w-4' />
        </Button>
      </div>
      <EditorContent editor={editor} className='prose prose-sm max-w-none p-4 focus:outline-none' />
    </div>
  );
};

export default MessageEditor;
