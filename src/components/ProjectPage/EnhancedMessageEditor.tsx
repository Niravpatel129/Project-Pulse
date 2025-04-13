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
  Underline as UnderlineIcon,
} from 'lucide-react';
import { useState } from 'react';
import './EnhancedMessageEditor.css';
import mentionSuggestion from './mentionSuggestion';

interface EnhancedMessageEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  maxLength?: number;
}

const EnhancedMessageEditor = ({
  content,
  onContentChange,
  maxLength = 10000,
}: EnhancedMessageEditorProps) => {
  const [linkUrl, setLinkUrl] = useState('');

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
        suggestion: mentionSuggestion,
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

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
    }
  };

  return (
    <div className=' rounded-lg'>
      {editor && (
        <BubbleMenu
          className='flex gap-1 bg-white border rounded shadow-lg p-1'
          editor={editor}
          tippyOptions={{ duration: 100, placement: 'top-start' }}
        >
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
        </BubbleMenu>
      )}

      <EditorContent editor={editor} className=' min-h-[200px]' />

      <div className='p-2 text-sm text-gray-500 absolute bottom-0 right-0'>
        {editor.storage.characterCount.characters()}/{maxLength} characters
      </div>
    </div>
  );
};

export default EnhancedMessageEditor;
