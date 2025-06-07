import { Card, CardContent } from '@/components/ui/card';
import { useSendEmail } from '@/hooks/useSendEmail';
import { useCallback, useMemo, useState } from 'react';
import {
  BaseEditor,
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Transforms,
} from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from 'slate-react';
import { toast } from 'sonner';
import { EmailFields } from './EmailFields';
import { InboxReplyToolbar } from './InboxReplyToolbar';

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
  fontFamily?: string;
  fontSize?: string;
  color?: string;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Extend the Slate types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Extend the Slate React types
declare module 'slate-react' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface InboxReplyProps {
  inReplyToEmailId: string;
  initialValue?: Descendant[];
  onChange?: (value: Descendant[], plainText: string) => void;
  height?: string;
  email?: {
    id: string;
    from: {
      email: string;
    };
    to: Array<{
      email: string;
    }>;
    subject: string;
    messageId?: string;
    messageReferences?: Array<{
      messageId: string;
    }>;
    inReplyToEmailId?: string;
  };
  isReply?: boolean;
  onSend?: () => void;
}

export default function InboxReply({
  initialValue = [{ type: 'paragraph', children: [{ text: '' }] }],
  onChange,
  height = '200px',
  email,
  isReply = false,
  onSend,
}: InboxReplyProps) {
  // Email fields state
  const [to, setTo] = useState(isReply ? email?.from.email || '' : '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(email?.subject ? `Re: ${email.subject}` : '');
  const [showSubject, setShowSubject] = useState(!isReply);
  const from = isReply ? email?.to[0]?.email || 'mrmapletv@gmail.com' : 'mrmapletv@gmail.com'; // Use the email address from the selected email or fallback to default

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
    const { leaf } = props as { leaf: CustomText };

    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
      children = <em>{children}</em>;
    }

    if (leaf.underline) {
      children = <u>{children}</u>;
    }

    const style: React.CSSProperties = {};

    if (leaf.fontFamily) {
      style.fontFamily = leaf.fontFamily;
    }

    if (leaf.fontSize) {
      style.fontSize = leaf.fontSize;
    }

    if (leaf.color) {
      style.color = leaf.color;
    }

    return (
      <span {...props.attributes} style={style}>
        {children}
      </span>
    );
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

  const setFontFamily = (fontFamily: string) => {
    Editor.addMark(editor, 'fontFamily', fontFamily);
  };

  const setFontSize = (fontSize: string) => {
    Editor.addMark(editor, 'fontSize', fontSize);
  };

  const setTextColor = (color: string) => {
    Editor.addMark(editor, 'color', color);
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

  const sendEmailMutation = useSendEmail();

  const handleSendEmail = async () => {
    try {
      // Get the HTML content from the editor
      const htmlContent = editor.children
        .map((node) => {
          if (SlateElement.isElement(node) && node.type === 'paragraph') {
            return node.children
              .map((child) => {
                if (typeof child.text === 'string') {
                  let text = child.text;
                  if (child.bold) text = `<strong>${text}</strong>`;
                  if (child.italic) text = `<em>${text}</em>`;
                  if (child.underline) text = `<u>${text}</u>`;
                  return text;
                }
                return '';
              })
              .join('');
          }
          return '';
        })
        .join('<br/>');

      // Convert single email addresses to arrays
      const toArray = to.split(',').map((email) => {
        return email.trim();
      });
      const ccArray = cc
        ? cc.split(',').map((email) => {
            return email.trim();
          })
        : [];
      const bccArray = bcc
        ? bcc.split(',').map((email) => {
            return email.trim();
          })
        : [];

      console.log('🚀 email:', email);
      if (!email?.id) {
        toast.error('No message ID found');
        return;
      }

      await sendEmailMutation.mutateAsync({
        fromEmail: from,
        to: toArray,
        cc: ccArray,
        bcc: bccArray,
        subject,
        body: htmlContent || ' ', // Ensure we always send some content
        inReplyTo: email?.id,
        references:
          email?.messageReferences?.map((ref) => {
            return ref.messageId;
          }) || [],
      });

      toast.success('Email sent successfully');
      onSend?.();
    } catch (error) {
      toast.error('Failed to send email');
      console.error('Error sending email:', error);
    }
  };

  return (
    <Card className='w-full mx-auto border border-slate-100 dark:border-[#232428] overflow-hidden shadow-none'>
      <CardContent className='p-0 '>
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
            // Ensure we're capturing the editor content
            const content = value
              .map((node) => {
                if (SlateElement.isElement(node) && node.type === 'paragraph') {
                  return node.children
                    .map((child) => {
                      if (typeof child.text === 'string') {
                        let text = child.text;
                        if (child.bold) text = `<strong>${text}</strong>`;
                        if (child.italic) text = `<em>${text}</em>`;
                        if (child.underline) text = `<u>${text}</u>`;
                        return text;
                      }
                      return '';
                    })
                    .join('');
                }
                return '';
              })
              .join('<br/>');

            onChange?.(value, content);
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
        <InboxReplyToolbar
          onBold={toggleBold}
          onItalic={toggleItalic}
          onUnderline={toggleUnderline}
          onList={toggleList}
          onLink={insertLink}
          onFontFamily={setFontFamily}
          onFontSize={setFontSize}
          onTextColor={setTextColor}
          onSend={handleSendEmail}
          isSending={sendEmailMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
