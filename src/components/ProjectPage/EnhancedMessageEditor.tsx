import { Button } from '@/components/ui/button';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { BubbleMenu, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { useState } from 'react';
import './EnhancedMessageEditor.css';
import mentionSuggestion from './mentionSuggestion';

interface Participant {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface LinkInputProps {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}

const LinkInput = ({ onSubmit, onCancel }: LinkInputProps) => {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (url) {
      onSubmit(url);
      setUrl('');
    }
  };

  return (
    <div className='flex gap-1 p-1'>
      <input
        type='text'
        placeholder='Enter URL'
        value={url}
        onChange={(e) => {
          return setUrl(e.target.value);
        }}
        className='border rounded px-2 py-1 text-sm w-48'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        autoFocus
      />
      <Button variant='ghost' size='sm' onClick={handleSubmit} disabled={!url}>
        Add
      </Button>
      <Button variant='ghost' size='sm' onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
};

interface EnhancedMessageEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  maxLength?: number;
  participants?: Participant[];
}

const EnhancedMessageEditor = ({
  content,
  onContentChange,
  maxLength = 10000,
  participants = [],
}: EnhancedMessageEditorProps) => {
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
      CharacterCount.configure({
        limit: maxLength,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          ...mentionSuggestion,
          items: ({ query }: { query: string }) => {
            return participants
              .filter((participant) => {
                const searchTerm = query.toLowerCase();
                return (
                  participant.name.toLowerCase().includes(searchTerm) ||
                  (participant.email && participant.email.toLowerCase().includes(searchTerm))
                );
              })
              .slice(0, 5);
          },
        },
        renderHTML({ node }) {
          const participant = participants.find((p) => {
            return p._id === node.attrs.id;
          });
          return [
            'span',
            { class: 'mention', 'data-mention-id': node.attrs.id },
            participant?.name || 'Unknown',
          ];
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange(html);
    },
  });

  if (!editor) {
    return null;
  }

  const handleAddLink = (url: string) => {
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setShowLinkInput(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const isLinkActive = editor.isActive('link');

  return (
    <div className='rounded-lg'>
      {editor && (
        <BubbleMenu
          className='flex flex-col gap-1 bg-white border rounded shadow-lg p-1'
          editor={editor}
          tippyOptions={{
            duration: 100,
            placement: 'top-start',
            popperOptions: {
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    boundary: 'viewport',
                  },
                },
                {
                  name: 'flip',
                  options: {
                    fallbackPlacements: ['top-start', 'top-end'],
                  },
                },
              ],
            },
          }}
        >
          <div className='flex gap-1'>
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
                return editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''}
            >
              <Heading3 className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                if (isLinkActive) {
                  handleRemoveLink();
                } else {
                  setShowLinkInput(true);
                }
              }}
              className={isLinkActive ? 'bg-gray-100' : ''}
            >
              <LinkIcon className='h-4 w-4' />
            </Button>
          </div>

          {showLinkInput && (
            <LinkInput
              onSubmit={handleAddLink}
              onCancel={() => {
                return setShowLinkInput(false);
              }}
            />
          )}
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className='min-h-[200px]' />

      {editor.storage.characterCount.characters() >= maxLength && (
        <div className='p-2 text-sm text-red-500 absolute bottom-0 right-0'>
          {editor.storage.characterCount.characters()}/{maxLength} characters
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageEditor;
