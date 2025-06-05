import { Card, CardContent } from '@/components/ui/card';
import { useCallback, useMemo, useState } from 'react';
import { FaFont } from 'react-icons/fa';
import { IoMdColorPalette } from 'react-icons/io';
import {
  MdArrowDropDown,
  MdAttachFile,
  MdCode,
  MdDelete,
  MdEmojiEmotions,
  MdFlashOn,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatQuote,
  MdFormatUnderlined,
  MdGif,
  MdImage,
  MdInsertDriveFile,
  MdLink,
  MdStrikethroughS,
} from 'react-icons/md';
import { createEditor, Descendant, Editor, Node, Element as SlateElement, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, RenderElementProps, RenderLeafProps, Slate, withReact } from 'slate-react';
import { EmailFields } from './EmailFields';

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
        <EmailFields
          from={from}
          to={to}
          cc={cc}
          bcc={bcc}
          subject={subject}
          onToChange={setTo}
          onCcChange={setCc}
          onBccChange={setBcc}
          onSubjectChange={setSubject}
          showSubject={showSubject}
        />

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
        {/* --- TWO-ROW TOOLBAR MATCHING GMAIL STYLE, COMPACT VERSION --- */}
        <div className='sticky bottom-0 z-10 bg-white border-t pt-2 pb-2 px-2'>
          {/* Top row: font and formatting controls */}
          <div className='flex items-center gap-1 w-full mb-1'>
            {/* Font family dropdown */}
            <div className='flex items-center bg-gray-100 rounded-full px-2 py-1 mr-0.5'>
              <FaFont className='mr-1 text-gray-500' size={16} />
              <select
                className='bg-transparent outline-none border-none text-xs font-medium appearance-none pr-3'
                style={{ minWidth: 60 }}
              >
                <option value='sans-serif'>Sans-Serif</option>
                <option value='serif'>Serif</option>
                <option value='monospace'>Mono</option>
              </select>
              <MdArrowDropDown className='ml-[-14px] text-gray-500' size={18} />
            </div>
            {/* Font size dropdown */}
            <div className='flex items-center bg-gray-100 rounded-full px-2 py-1 mr-0.5'>
              <span className='mr-1 text-gray-500 text-xs'>14</span>
              <select
                className='bg-transparent outline-none border-none text-xs font-medium appearance-none pr-3'
                style={{ width: 28 }}
              >
                <option value='12'>12</option>
                <option value='14'>14</option>
                <option value='16'>16</option>
                <option value='18'>18</option>
                <option value='20'>20</option>
                <option value='24'>24</option>
              </select>
              <MdArrowDropDown className='ml-[-14px] text-gray-500' size={18} />
            </div>
            {/* Text color dropdown */}
            <div className='flex items-center bg-gray-100 rounded-full px-2 py-1 mr-0.5'>
              <MdFormatUnderlined className='mr-1 text-gray-500' size={16} />
              <IoMdColorPalette className='mr-0.5 text-gray-500' size={16} />
              <select
                className='bg-transparent outline-none border-none text-xs font-medium appearance-none pr-3'
                style={{ width: 24 }}
              >
                <option value='#000000'>A</option>
                <option value='#ff0000'>A</option>
                <option value='#008000'>A</option>
                <option value='#0000ff'>A</option>
              </select>
              <MdArrowDropDown className='ml-[-14px] text-gray-500' size={18} />
            </div>
            {/* Highlight color dropdown */}
            <div className='flex items-center bg-gray-100 rounded-full px-2 py-1 mr-0.5'>
              <MdFormatUnderlined className='mr-1 text-gray-500' size={16} />
              <span className='w-3 h-3 rounded bg-yellow-200 border border-gray-300 mr-0.5' />
              <select
                className='bg-transparent outline-none border-none text-xs font-medium appearance-none pr-3'
                style={{ width: 24 }}
              >
                <option value='#ffff00'>A</option>
                <option value='#ffb300'>A</option>
                <option value='#00ff00'>A</option>
                <option value='#00ffff'>A</option>
              </select>
              <MdArrowDropDown className='ml-[-14px] text-gray-500' size={18} />
            </div>
            {/* Formatting icons */}
            <div className='flex items-center gap-0.5 ml-0.5'>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdFormatBold size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdFormatItalic size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdFormatUnderlined size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdStrikethroughS size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdFormatListBulleted size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdLink size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdImage size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdFormatQuote size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdCode size={16} />
              </button>
            </div>
          </div>
          {/* Bottom row: media/action icons left, send button right */}
          <div className='flex items-center w-full'>
            <div className='flex items-center gap-0.5'>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdEmojiEmotions size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdGif size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdAttachFile size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdFlashOn size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdInsertDriveFile size={16} />
              </button>
              <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
                <MdDelete size={16} />
              </button>
            </div>
            <div className='flex-1' />
            <button className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-full shadow flex items-center gap-1 text-sm'>
              Send & archive <MdArrowDropDown size={18} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
