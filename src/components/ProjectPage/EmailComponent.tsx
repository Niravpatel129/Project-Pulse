import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/contexts/ProjectContext';
import { useEmails } from '@/hooks/useEmails';
import { Mail, Paperclip, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Descendant } from 'slate';
import { toast } from 'sonner';
import { EmailEditor } from './EmailComponents/EmailEditor';
import { EmailHistory } from './EmailComponents/EmailHistory';
import { EmailTemplates } from './EmailComponents/EmailTemplates';
import { RecipientSelector } from './EmailComponents/RecipientSelector';

interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

export const EmailComponent = ({ initialSubject = '', initialMessage = '' }) => {
  const { project } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  // Use the emails hook
  const {
    templates,
    isLoadingTemplates,
    history,
    isLoadingHistory,
    sendEmail,
    isSending,
    saveTemplate,
    isSavingTemplate,
  } = useEmails(project?._id || '');

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

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSelectedParticipant = (participant: string, type: 'to' | 'cc' | 'bcc') => {
    if (type === 'to') {
      setRecipients([...recipients, participant]);
    } else if (type === 'cc') {
      setCc([...cc, participant]);
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
      toast.error('Cannot save empty template', {
        description: 'Please add a subject and message body before saving as a template.',
      });
      return;
    }

    if (!newTemplateName) {
      toast.error('Template name required', {
        description: 'Please provide a name for your template.',
      });
      return;
    }

    try {
      await saveTemplate({
        name: newTemplateName,
        subject,
        body: emailBody,
      });

      setNewTemplateName('');
      toast.success('Template saved', {
        description: 'Your email template has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error saving template', {
        description: 'There was a problem saving your template. Please try again.',
      });
    }
  };

  const handleSendEmail = async () => {
    console.log('Starting email send process');
    console.log('Current recipients:', recipients);

    if (recipients.length === 0) {
      console.log('Error: No recipients provided');
      toast.error('No recipients', {
        description: 'Please add at least one recipient before sending.',
      });
      return;
    }

    if (!subject) {
      console.log('Error: No subject provided');
      toast.error('Subject required', {
        description: 'Please add a subject to your email.',
      });
      return;
    }

    if (!emailBody) {
      console.log('Error: No message body provided');
      toast.error('Message required', {
        description: 'Please add a message to your email.',
      });
      return;
    }

    try {
      console.log('Sending email with:', {
        recipients: recipients.length,
        cc: cc.length,
        bcc: bcc.length,
        subject: subject,
        bodyLength: emailBody.length,
        projectId: project?._id,
        attachments: attachments.length,
      });

      await sendEmail({
        to: recipients,
        cc,
        bcc,
        subject,
        body: emailBody,
        projectId: project?._id || '',
        attachments: attachments
          .map((a) => {
            return a.file;
          })
          .filter((f): f is File => {
            return !!f;
          }),
      });

      console.log('Email sent successfully');

      setSelectedParticipant('');

      toast.success('Email sent', {
        description: `Your email has been sent to ${recipients.length} recipient${
          recipients.length > 1 ? 's' : ''
        }.`,
      });

      // Reset form and collapse
      console.log('Resetting form state');
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
      toast.error('Error sending email', {
        description: 'There was a problem sending your email. Please try again.',
      });
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
              <RecipientSelector
                type='to'
                label='To:'
                recipients={recipients}
                selectedParticipant={selectedParticipant}
                onSelectParticipant={(participant) => {
                  setSelectedParticipant(participant);
                  handleSelectedParticipant(participant, 'to');
                }}
                // onAddRecipient={() => {
                //   return addRecipient('to');
                // }}
                onRemoveRecipient={(recipient) => {
                  return removeRecipient(recipient, 'to');
                }}
                participants={
                  project?.clients.map((c) => {
                    return c.user;
                  }) || []
                }
              />

              {showCc && (
                <RecipientSelector
                  type='cc'
                  label='Cc:'
                  recipients={cc}
                  selectedParticipant={selectedCcParticipant}
                  onSelectParticipant={setSelectedCcParticipant}
                  // onAddRecipient={() => {
                  //   return addRecipient('cc');
                  // }}
                  onRemoveRecipient={(recipient) => {
                    return removeRecipient(recipient, 'cc');
                  }}
                  participants={
                    project?.clients.map((c) => {
                      return c.user;
                    }) || []
                  }
                  showRemoveButton
                  onToggleVisibility={() => {
                    return setShowCc(false);
                  }}
                />
              )}

              {showBcc && (
                <RecipientSelector
                  type='bcc'
                  label='Bcc:'
                  recipients={bcc}
                  selectedParticipant={selectedBccParticipant}
                  onSelectParticipant={setSelectedBccParticipant}
                  onRemoveRecipient={(recipient) => {
                    return removeRecipient(recipient, 'bcc');
                  }}
                  participants={
                    project?.clients.map((c) => {
                      return c.user;
                    }) || []
                  }
                  showRemoveButton
                  onToggleVisibility={() => {
                    return setShowBcc(false);
                  }}
                />
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
                <EmailEditor
                  initialValue={editorValue}
                  onChange={(value, plainText) => {
                    setEditorValue(value);
                    setEmailBody(plainText);
                  }}
                />
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

                <Button
                  type='button'
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className={isSending ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {isSending ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className='h-4 w-4 mr-2' />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value='templates'>
              <EmailTemplates
                templates={templates}
                isLoading={isLoadingTemplates}
                newTemplateName={newTemplateName}
                onTemplateNameChange={setNewTemplateName}
                onSaveTemplate={saveAsTemplate}
                onApplyTemplate={applyTemplate}
                isSaving={isSavingTemplate}
              />
            </TabsContent>

            <TabsContent value='history'>
              <EmailHistory
                history={history}
                isLoading={isLoadingHistory}
                formatDate={formatDate}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
};
