import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Bold, Italic, Link, List, Underline } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { createEditor, Descendant, Editor, Node, Element as SlateElement, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, RenderElementProps, RenderLeafProps, Slate, withReact } from 'slate-react';

// Custom types for Slate
type CustomElement = {
  type: 'paragraph' | 'list-item';
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  list?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}

interface InboxReplyProps {
  initialValue?: Descendant[];
  onChange?: (value: Descendant[], plainText: string) => void;
  height?: string;
}

export default function InboxReply({
  initialValue = [{ type: 'paragraph', children: [{ text: '' }] }],
  onChange,
  height = '200px',
}: InboxReplyProps) {
  // Email fields state
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showSubject, setShowSubject] = useState(true);
  const from = 'mrmapletv@gmail.com'; // Hardcoded for now

  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => {
    return withHistory(withReact(createEditor()));
  }, []);

  // Slate custom rendering functions
  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>;
      default:
        return <div {...props.attributes}>{props.children}</div>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { children } = props;
    const { leaf } = props;

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    return <span {...props.attributes}>{children}</span>;
  }, []);

  // Editor formatting functions
  const isMarkActive = (format: keyof Omit<CustomText, 'text'>) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const toggleMark = (format: keyof Omit<CustomText, 'text'>) => {
    const isActive = isMarkActive(format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const toggleBold = () => {
    toggleMark('bold');
  };

  const toggleItalic = () => {
    toggleMark('italic');
  };

  const toggleUnderline = () => {
    toggleMark('underline');
  };

  const toggleList = () => {
    const [match] = Editor.nodes(editor, {
      match: (n) => {
        return !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item';
      },
    });

    Transforms.setNodes(
      editor,
      { type: match ? 'paragraph' : 'list-item' },
      {
        match: (n) => {
          return !Editor.isEditor(n) && SlateElement.isElement(n);
        },
      },
    );
  };

  const insertLink = () => {
    const url = window.prompt('Enter the URL of the link:');
    if (!url) return;

    if (editor.selection) {
      const selectedText = Editor.string(editor, editor.selection);
      const linkText = selectedText || url;

      Editor.insertText(editor, linkText);
      Editor.addMark(editor, 'underline', true);
    }
  };

  return (
    <Card className='w-full mx-auto'>
      <CardContent className='p-0'>
        {/* Email fields */}
        <div className='px-4 pt-4 pb-2'>
          <div className='flex items-center mb-2'>
            <span className='w-16 text-gray-500 text-sm'>From:</span>
            <Input
              className='flex-1 bg-gray-100 text-gray-700 cursor-not-allowed'
              value={from}
              readOnly
            />
          </div>
          <div className='flex items-center mb-2'>
            <span className='w-16 text-gray-500 text-sm'>To:</span>
            <Input
              className='flex-1 text-sm'
              value={to}
              onChange={(e) => {
                return setTo(e.target.value);
              }}
              placeholder='Recipient email'
            />
            <Button
              variant='link'
              size='sm'
              className='ml-2 px-1 text-xs'
              type='button'
              onClick={() => {
                return setShowCc((v) => {
                  return !v;
                });
              }}
            >
              Cc
            </Button>
            <Button
              variant='link'
              size='sm'
              className='ml-1 px-1 text-xs'
              type='button'
              onClick={() => {
                return setShowBcc((v) => {
                  return !v;
                });
              }}
            >
              Bcc
            </Button>
          </div>
          {showCc && (
            <div className='flex items-center mb-2'>
              <span className='w-16 text-gray-500 text-sm'>Cc:</span>
              <Input
                className='flex-1 text-sm'
                value={cc}
                onChange={(e) => {
                  return setCc(e.target.value);
                }}
                placeholder='Cc email(s)'
              />
            </div>
          )}
          {showBcc && (
            <div className='flex items-center mb-2'>
              <span className='w-16 text-gray-500 text-sm'>Bcc:</span>
              <Input
                className='flex-1 text-sm'
                value={bcc}
                onChange={(e) => {
                  return setBcc(e.target.value);
                }}
                placeholder='Bcc email(s)'
              />
            </div>
          )}
          {showSubject && (
            <div className='flex items-center mb-2'>
              <span className='w-16 text-gray-500 text-sm'>Subject:</span>
              <Input
                className='flex-1 text-sm'
                value={subject}
                onChange={(e) => {
                  return setSubject(e.target.value);
                }}
                placeholder='Subject'
              />
            </div>
          )}
        </div>
        {/* Toolbar and Editor */}
        <div className='border-b p-2 flex gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleBold}
            className={isMarkActive('bold') ? 'bg-gray-100' : ''}
          >
            <Bold className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleItalic}
            className={isMarkActive('italic') ? 'bg-gray-100' : ''}
          >
            <Italic className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleUnderline}
            className={isMarkActive('underline') ? 'bg-gray-100' : ''}
          >
            <Underline className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={toggleList}
            className={isMarkActive('list') ? 'bg-gray-100' : ''}
          >
            <List className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='sm' onClick={insertLink}>
            <Link className='h-4 w-4' />
          </Button>
        </div>
        <Slate
          editor={editor}
          initialValue={initialValue}
          onChange={(value) => {
            onChange?.(
              value,
              value
                .map((n) => {
                  return Node.string(n);
                })
                .join('\n'),
            );
          }}
        >
          <Editable
            className='outline-none focus:outline-none focus-visible:outline-none border-none'
            placeholder='Write your reply here...'
            renderPlaceholder={({ children, attributes }) => {
              return (
                <div {...attributes} className='text-gray-500 pt-[10px]'>
                  {children}
                </div>
              );
            }}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            style={{
              minHeight: height,
              padding: '10px',
              border: 'none',
            }}
          />
        </Slate>
        <div className='px-4 pb-4 flex justify-end'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='bg-blue-600 text-white font-semibold px-6 py-2 rounded shadow'>
                Send & archive
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>Send only</DropdownMenuItem>
              <DropdownMenuItem>Send & archive</DropdownMenuItem>
              <DropdownMenuItem>Send & delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
