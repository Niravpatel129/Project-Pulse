import { Button } from '@/components/ui/button';
import { Bold, Italic, Link, List, Underline } from 'lucide-react';
import { useCallback, useMemo } from 'react';
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
};

declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement;
    Text: CustomText;
  }
}

interface EmailEditorProps {
  initialValue: Descendant[];
  onChange: (value: Descendant[], plainText: string) => void;
}

export const EmailEditor = ({ initialValue, onChange }: EmailEditorProps) => {
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
    <div className='border rounded-md'>
      <div className='flex items-center gap-1 p-1 border-b bg-gray-50'>
        <Button
          type='button'
          variant={isMarkActive('bold') ? 'default' : 'ghost'}
          size='sm'
          onClick={toggleBold}
        >
          <Bold className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant={isMarkActive('italic') ? 'default' : 'ghost'}
          size='sm'
          onClick={toggleItalic}
        >
          <Italic className='h-4 w-4' />
        </Button>
        <Button
          type='button'
          variant={isMarkActive('underline') ? 'default' : 'ghost'}
          size='sm'
          onClick={toggleUnderline}
        >
          <Underline className='h-4 w-4' />
        </Button>
        <Button type='button' variant='ghost' size='sm' onClick={toggleList}>
          <List className='h-4 w-4' />
        </Button>
        <Button type='button' variant='ghost' size='sm' onClick={insertLink}>
          <Link className='h-4 w-4' />
        </Button>
      </div>
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(value) => {
          onChange(
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
          placeholder='Write your message here...'
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
            minHeight: '350px',
            padding: '10px',
          }}
        />
      </Slate>
    </div>
  );
};
