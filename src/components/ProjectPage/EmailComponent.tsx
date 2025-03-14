import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import {
  Bold,
  Italic,
  Link,
  List,
  Mail,
  Paperclip,
  Plus,
  Save,
  Send,
  Underline,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createEditor, Descendant, Editor, Node, Element as SlateElement, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, RenderElementProps, RenderLeafProps, Slate, withReact } from 'slate-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface EmailHistoryItem {
  id: string;
  date: string;
  subject: string;
  recipients: string[];
  snippet: string;
}

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

export const EmailComponent = ({ initialSubject = '', initialMessage = '' }) => {
  const { project } = useProject();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => {
    return withHistory(withReact(createEditor()));
  }, []);

  // Initial value for Slate editor
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: initialMessage || '' }],
    },
  ];

  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState(initialSubject);
  const [emailBody, setEmailBody] = useState(initialMessage);
  const [editorValue, setEditorValue] = useState<Descendant[]>(initialValue);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [selectedCcParticipant, setSelectedCcParticipant] = useState('');
  const [selectedBccParticipant, setSelectedBccParticipant] = useState('');
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [emailHistory, setEmailHistory] = useState<EmailHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchEmailHistory = useCallback(async () => {
    if (!project?._id) return;

    setIsLoadingHistory(true);
    try {
      // In a real app, this would fetch from an API
      setTimeout(() => {
        const mockHistory: EmailHistoryItem[] = [
          {
            id: '1',
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            subject: 'Project Kickoff Meeting',
            recipients: ['client@example.com', 'team@example.com'],
            snippet: "I'm looking forward to our kickoff meeting tomorrow...",
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000 * 5).toISOString(),
            subject: 'Initial Project Proposal',
            recipients: ['client@example.com'],
            snippet: 'Please find attached our proposal for the project...',
          },
        ];
        setEmailHistory(mockHistory);
        setIsLoadingHistory(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching email history:', error);
      setIsLoadingHistory(false);
    }
  }, [project?._id]);

  // Load email templates and history when component mounts
  useEffect(() => {
    if (isExpanded) {
      fetchTemplates();
      fetchEmailHistory();
    }
  }, [isExpanded, project?._id, fetchEmailHistory]);

  // Update subject and body when props change
  useEffect(() => {
    if (initialSubject) setSubject(initialSubject);
    if (initialMessage) {
      setEmailBody(initialMessage);
      setEditorValue([
        {
          type: 'paragraph',
          children: [{ text: initialMessage }],
        },
      ]);
    }
  }, [initialSubject, initialMessage]);

  const fetchTemplates = async () => {
    try {
      // In a real app, this would fetch from an API
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Project Update',
          subject: 'Update on Project: {{projectName}}',
          body: 'Dear {{recipient}},\n\nI wanted to provide you with an update on our project. We have made significant progress on the following items:\n\n- Item 1\n- Item 2\n- Item 3\n\nPlease let me know if you have any questions.\n\nBest regards,\n{{senderName}}',
        },
        {
          id: '2',
          name: 'Meeting Request',
          subject: 'Meeting Request: {{projectName}}',
          body: 'Hello {{recipient}},\n\nI would like to schedule a meeting to discuss our project. Would any of the following times work for you?\n\n- Option 1\n- Option 2\n- Option 3\n\nThank you,\n{{senderName}}',
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const addRecipient = (type: 'to' | 'cc' | 'bcc') => {
    if (type === 'to' && selectedParticipant && !recipients.includes(selectedParticipant)) {
      setRecipients([...recipients, selectedParticipant]);
      setSelectedParticipant('');
    } else if (type === 'cc' && selectedCcParticipant && !cc.includes(selectedCcParticipant)) {
      setCc([...cc, selectedCcParticipant]);
      setSelectedCcParticipant('');
    } else if (type === 'bcc' && selectedBccParticipant && !bcc.includes(selectedBccParticipant)) {
      setBcc([...bcc, selectedBccParticipant]);
      setSelectedBccParticipant('');
    }
  };

  const removeRecipient = (recipient: string, type: 'to' | 'cc' | 'bcc') => {
    if (type === 'to') {
      setRecipients(
        recipients.filter((r) => {
          return r !== recipient;
        }),
      );
    } else if (type === 'cc') {
      setCc(
        cc.filter((r) => {
          return r !== recipient;
        }),
      );
    } else if (type === 'bcc') {
      setBcc(
        bcc.filter((r) => {
          return r !== recipient;
        }),
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: EmailAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newAttachments.push({
        id: `attachment-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    }

    setAttachments([...attachments, ...newAttachments]);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(
      attachments.filter((a) => {
        return a.id !== id;
      }),
    );
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => {
      return t.id === templateId;
    });
    if (!template) return;

    // Replace template variables with actual values
    let subject = template.subject;
    let body = template.body;

    if (project) {
      subject = subject.replace('{{projectName}}', project.name || '');
      body = body.replace('{{projectName}}', project.name || '');
    }

    body = body.replace('{{senderName}}', 'Your Name');

    if (recipients.length > 0) {
      body = body.replace('{{recipient}}', recipients[0].split('@')[0] || 'Client');
    }

    setSubject(subject);
    setEmailBody(body);
    setEditorValue([
      {
        type: 'paragraph',
        children: [{ text: body }],
      },
    ]);
  };

  const saveAsTemplate = async () => {
    if (!subject || !emailBody) {
      toast({
        title: 'Cannot save empty template',
        description: 'Please add a subject and message body before saving as a template.',
        variant: 'destructive',
      });
      return;
    }

    if (!newTemplateName) {
      toast({
        title: 'Template name required',
        description: 'Please provide a name for your template.',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingTemplate(true);

    try {
      // In a real app, this would save to an API
      const newTemplate: EmailTemplate = {
        id: `template-${Date.now()}`,
        name: newTemplateName,
        subject,
        body: emailBody,
      };

      setTemplates([...templates, newTemplate]);
      setNewTemplateName('');

      toast({
        title: 'Template saved',
        description: 'Your email template has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error saving template',
        description: 'There was a problem saving your template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const sendEmail = async () => {
    if (recipients.length === 0) {
      toast({
        title: 'No recipients',
        description: 'Please add at least one recipient before sending.',
        variant: 'destructive',
      });
      return;
    }

    if (!subject) {
      toast({
        title: 'Subject required',
        description: 'Please add a subject to your email.',
        variant: 'destructive',
      });
      return;
    }

    if (!emailBody) {
      toast({
        title: 'Message required',
        description: 'Please add a message to your email.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      // Prepare form data for attachments
      const formData = new FormData();
      formData.append('to', JSON.stringify(recipients));
      formData.append('cc', JSON.stringify(cc));
      formData.append('bcc', JSON.stringify(bcc));
      formData.append('subject', subject);
      formData.append('body', emailBody);
      formData.append('projectId', project?._id || '');

      // Add attachments
      attachments.forEach((attachment) => {
        if (attachment.file) {
          formData.append('attachments', attachment.file);
        }
      });

      // In a real app, this would send to an API
      // const response = await newRequest.post('/email/send', formData);

      // Simulate API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 1000);
      });

      toast({
        title: 'Email sent',
        description: `Your email has been sent to ${recipients.length} recipient${
          recipients.length > 1 ? 's' : ''
        }.`,
      });

      // Reset form and collapse
      setRecipients([]);
      setCc([]);
      setBcc([]);
      setSubject('');
      setEmailBody('');
      setEditorValue(initialValue);
      setAttachments([]);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Error sending email',
        description: 'There was a problem sending your email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

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

      // Insert the link text with formatting that indicates it's a link
      // (In a real implementation, you'd use a proper link element)
      Editor.insertText(editor, linkText);
      Editor.addMark(editor, 'underline', true);
    }
  };

  return (
    <Card
      className={`transition-all duration-300 ${isExpanded ? 'p-4' : 'cursor-pointer'}`}
      onClick={() => {
        return !isExpanded && toggleExpand();
      }}
    >
      {!isExpanded ? (
        <div className='flex items-center p-4'>
          <Avatar className='h-10 w-10 mr-4'>
            <AvatarImage src='/mail-icon.png' alt='Email' />
            <AvatarFallback>
              <Mail className='h-5 w-5' />
            </AvatarFallback>
          </Avatar>
          <span className='text-gray-500'>Send email</span>
        </div>
      ) : (
        <div
          className='space-y-4'
          onClick={(e) => {
            return e.stopPropagation();
          }}
        >
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-medium'>Compose</h3>
            <Button variant='ghost' size='sm' onClick={toggleExpand}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          <Tabs defaultValue='compose'>
            <TabsList className='mb-4'>
              <TabsTrigger value='compose'>Compose</TabsTrigger>
              <TabsTrigger value='templates'>Templates</TabsTrigger>
              <TabsTrigger value='history'>History</TabsTrigger>
            </TabsList>

            <TabsContent value='compose' className='space-y-4'>
              <div>
                <div className='flex justify-between'>
                  <Label htmlFor='recipients'>To:</Label>
                  <div className='space-x-2 text-xs'>
                    {!showCc && (
                      <button
                        className='text-blue-500 hover:underline'
                        onClick={() => {
                          return setShowCc(true);
                        }}
                      >
                        Cc
                      </button>
                    )}
                    {!showBcc && (
                      <button
                        className='text-blue-500 hover:underline'
                        onClick={() => {
                          return setShowBcc(true);
                        }}
                      >
                        Bcc
                      </button>
                    )}
                  </div>
                </div>
                <div className='flex flex-wrap gap-2 mt-1 mb-2'>
                  {recipients.map((recipient) => {
                    return (
                      <Badge
                        key={recipient}
                        variant='secondary'
                        className='flex items-center gap-1'
                      >
                        {recipient}
                        <button
                          onClick={() => {
                            return removeRecipient(recipient, 'to');
                          }}
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
                <div className='flex gap-2'>
                  <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                    <SelectTrigger className='w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0'>
                      <SelectValue placeholder='Select participant' />
                    </SelectTrigger>
                    <SelectContent className='[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2'>
                      <SelectGroup>
                        <SelectLabel className='ps-2'>Project participants</SelectLabel>
                        {project?.participants.map((participant) => {
                          return (
                            <SelectItem key={participant._id} value={participant.email || ''}>
                              <Avatar className='size-5'>
                                <AvatarImage
                                  src={participant.avatar || ''}
                                  alt={participant.name}
                                />
                                <AvatarFallback className='text-xs'>
                                  {participant.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className='truncate'>{participant.name}</span>
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    type='button'
                    onClick={() => {
                      return addRecipient('to');
                    }}
                    size='sm'
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              {showCc && (
                <div>
                  <div className='flex justify-between'>
                    <Label htmlFor='cc'>Cc:</Label>
                    <button
                      className='text-xs text-gray-500 hover:text-gray-700'
                      onClick={() => {
                        return setShowCc(false);
                      }}
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-1 mb-2'>
                    {cc.map((recipient) => {
                      return (
                        <Badge
                          key={recipient}
                          variant='secondary'
                          className='flex items-center gap-1'
                        >
                          {recipient}
                          <button
                            onClick={() => {
                              return removeRecipient(recipient, 'cc');
                            }}
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                  <div className='flex gap-2'>
                    <Select value={selectedCcParticipant} onValueChange={setSelectedCcParticipant}>
                      <SelectTrigger className='w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0'>
                        <SelectValue placeholder='Select participant' />
                      </SelectTrigger>
                      <SelectContent className='[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2'>
                        <SelectGroup>
                          <SelectLabel className='ps-2'>Project participants</SelectLabel>
                          {project?.participants.map((participant) => {
                            return (
                              <SelectItem key={participant._id} value={participant.email || ''}>
                                <Avatar className='size-5'>
                                  <AvatarImage
                                    src={participant.avatar || ''}
                                    alt={participant.name}
                                  />
                                  <AvatarFallback className='text-xs'>
                                    {participant.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className='truncate'>{participant.name}</span>
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      type='button'
                      onClick={() => {
                        return addRecipient('cc');
                      }}
                      size='sm'
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}

              {showBcc && (
                <div>
                  <div className='flex justify-between'>
                    <Label htmlFor='bcc'>Bcc:</Label>
                    <button
                      className='text-xs text-gray-500 hover:text-gray-700'
                      onClick={() => {
                        return setShowBcc(false);
                      }}
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-1 mb-2'>
                    {bcc.map((recipient) => {
                      return (
                        <Badge
                          key={recipient}
                          variant='secondary'
                          className='flex items-center gap-1'
                        >
                          {recipient}
                          <button
                            onClick={() => {
                              return removeRecipient(recipient, 'bcc');
                            }}
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                  <div className='flex gap-2'>
                    <Select
                      value={selectedBccParticipant}
                      onValueChange={setSelectedBccParticipant}
                    >
                      <SelectTrigger className='w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0'>
                        <SelectValue placeholder='Select participant' />
                      </SelectTrigger>
                      <SelectContent className='[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2'>
                        <SelectGroup>
                          <SelectLabel className='ps-2'>Project participants</SelectLabel>
                          {project?.participants.map((participant) => {
                            return (
                              <SelectItem key={participant._id} value={participant.email || ''}>
                                <Avatar className='size-5'>
                                  <AvatarImage
                                    src={participant.avatar || ''}
                                    alt={participant.name}
                                  />
                                  <AvatarFallback className='text-xs'>
                                    {participant.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className='truncate'>{participant.name}</span>
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      type='button'
                      onClick={() => {
                        return addRecipient('bcc');
                      }}
                      size='sm'
                    >
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor='subject'>Subject:</Label>
                <Input
                  id='subject'
                  value={subject}
                  onChange={(e) => {
                    return setSubject(e.target.value);
                  }}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='body'>Message:</Label>
                <div className='mt-1 border rounded-md'>
                  <Slate
                    editor={editor}
                    initialValue={editorValue}
                    onChange={(value) => {
                      setEditorValue(value);
                      // Extract plain text for compatibility with existing code
                      const plainText = value
                        .map((n) => {
                          return Node.string(n);
                        })
                        .join('\n');
                      setEmailBody(plainText);
                    }}
                  >
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
              </div>

              {attachments.length > 0 && (
                <div className='border rounded-md p-3'>
                  <Label className='mb-2 block'>Attachments:</Label>
                  <div className='space-y-2'>
                    {attachments.map((attachment) => {
                      return (
                        <div
                          key={attachment.id}
                          className='flex items-center justify-between bg-gray-50 p-2 rounded'
                        >
                          <div className='flex items-center'>
                            <Paperclip className='h-4 w-4 mr-2 text-gray-500' />
                            <span className='text-sm'>{attachment.name}</span>
                            <span className='text-xs text-gray-500 ml-2'>
                              ({formatFileSize(attachment.size)})
                            </span>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              return removeAttachment(attachment.id);
                            }}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className='flex justify-between'>
                <div className='flex gap-2'>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className='hidden'
                    multiple
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      return fileInputRef.current?.click();
                    }}
                  >
                    <Paperclip className='h-4 w-4 mr-2' />
                    Attach Files
                  </Button>
                </div>

                <Button type='button' onClick={sendEmail} disabled={isSending}>
                  {isSending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className='h-4 w-4 mr-2' />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value='templates' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {templates.map((template) => {
                  return (
                    <Card key={template.id} className='p-4'>
                      <div className='flex justify-between items-start mb-2'>
                        <h4 className='font-medium'>{template.name}</h4>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            applyTemplate(template.id);
                            // Switch back to compose tab
                            const composeTab = document.querySelector(
                              '[data-value="compose"]',
                            ) as HTMLElement;
                            if (composeTab) composeTab.click();
                          }}
                        >
                          Use
                        </Button>
                      </div>
                      <div className='text-sm font-medium'>Subject: {template.subject}</div>
                      <div className='text-xs text-gray-500 mt-2 line-clamp-3'>{template.body}</div>
                    </Card>
                  );
                })}
              </div>

              <Card className='p-4 mt-4'>
                <h4 className='font-medium mb-2'>Save Current Email as Template</h4>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='templateName'>Template Name</Label>
                    <Input
                      id='templateName'
                      value={newTemplateName}
                      onChange={(e) => {
                        return setNewTemplateName(e.target.value);
                      }}
                      placeholder='Enter template name'
                    />
                  </div>
                  <Button onClick={saveAsTemplate} disabled={isSavingTemplate || !newTemplateName}>
                    <Save className='h-4 w-4 mr-2' />
                    Save as Template
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value='history' className='space-y-4'>
              {isLoadingHistory ? (
                <div className='text-center py-8'>Loading email history...</div>
              ) : emailHistory.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>No email history found</div>
              ) : (
                <div className='space-y-3'>
                  {emailHistory.map((email) => {
                    return (
                      <Card key={email.id} className='p-4'>
                        <div className='flex justify-between items-start'>
                          <h4 className='font-medium'>{email.subject}</h4>
                          <span className='text-xs text-gray-500'>{formatDate(email.date)}</span>
                        </div>
                        <div className='text-sm mt-1'>To: {email.recipients.join(', ')}</div>
                        <div className='text-sm text-gray-600 mt-2'>{email.snippet}</div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
};
