'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { useAiEnhancement } from '@/hooks/useAiEnhancement';
import { useClickOutside } from '@/hooks/useClickOutside';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Link2, MessageSquare, Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import EnhancedMessageEditor, { EnhancedMessageEditorRef } from './EnhancedMessageEditor';
import FileUploadManagerModal from './FileComponents/FileUploadManagerModal';

interface MessageAttachment {
  id: string;
  fileId: string;
  name: string;
  type: string;
  size: number;
  downloadURL: string;
}

const ProjectMessageInput = () => {
  const { project } = useProject();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [customEnhancePrompt, setCustomEnhancePrompt] = useState('');
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EnhancedMessageEditorRef>(null);
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [enhancementResult, setEnhancementResult] = useState<{
    original: string;
    enhanced: string;
  } | null>(null);

  const { mutate: enhanceText, isPending: isEnhancing } = useAiEnhancement();

  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async () => {
      if (!content.trim() && attachments.length === 0) {
        throw new Error('Please enter a message or attach a file');
      }

      const response = await newRequest.post('/notes', {
        content,
        attachments,
        projectId: project?._id,
      });

      return response.data;
    },
    onSuccess: () => {
      setContent('');
      editorRef.current?.clearContent();
      setAttachments([]);
      toast.success('Message sent', {
        description: 'Your message has been sent successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['notes', project?._id] });
      setIsExpanded(false);
    },
    onError: (error: Error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: error.message || 'There was a problem sending your message. Please try again.',
      });
    },
  });

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    sendMessage();
  };

  const handleAddFileToProject = (file: any) => {
    const newAttachment: MessageAttachment = {
      id: file._id,
      fileId: file._id,
      name: file.originalName,
      type: file.contentType,
      size: file.size,
      downloadURL: file.downloadURL,
    };

    setAttachments((prev) => {
      return [...prev, newAttachment];
    });
    setIsFileModalOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      return prev.filter((attachment) => {
        return attachment.id !== id;
      });
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useClickOutside(expandedRef, (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[role="dialog"]')) return;

    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAttachmentIcon = (type: string) => {
    if (type === 'link') {
      return <Link2 className='h-4 w-4 mr-2 text-gray-500' />;
    } else if (type.startsWith('image/')) {
      return <ImageIcon className='h-4 w-4 mr-2 text-gray-500' />;
    } else {
      return <Paperclip className='h-4 w-4 mr-2 text-gray-500' />;
    }
  };

  const handleEnhanceText = async (enhanceType: string) => {
    const selectedText = editorRef.current?.enhanceSelection();
    if (!selectedText) {
      toast.error('Please select some text to enhance');
      return;
    }

    enhanceText(
      {
        text: selectedText,
        enhanceType,
        customPrompt: customEnhancePrompt,
      },
      {
        onSuccess: (data) => {
          setEnhancementResult({
            original: data.originalText,
            enhanced: data.enhancedText,
          });
          editorRef.current?.updateSelection(data.enhancedText);
          setCustomEnhancePrompt('');
          toast.success('Text enhanced!', {
            description: 'Your text has been enhanced.',
          });
        },
      },
    );
  };

  return (
    <>
      <Card className='border border-gray-200 bg-white shadow-sm'>
        {!isExpanded ? (
          <div
            className='flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-lg'
            onClick={toggleExpand}
          >
            <Avatar className='h-8 w-8 mr-4'>
              <AvatarImage src='/message-icon.png' alt='Message' />
              <AvatarFallback>
                <MessageSquare className='h-5 w-5' />
              </AvatarFallback>
            </Avatar>
            <span className='text-gray-500 text-sm'>Add message or project note...</span>
          </div>
        ) : (
          <div
            ref={expandedRef}
            className='space-y-4 p-4'
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            <div className='flex items-start gap-4'>
              <Avatar className='h-8 w-8 shrink-0 mt-1'>
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=AS`} alt='User' />
                <AvatarFallback className='bg-green-600 text-white font-bold text-sm'>
                  AS
                </AvatarFallback>
              </Avatar>

              <div className='flex-1 min-w-0 space-y-3'>
                <div className='relative'>
                  <EnhancedMessageEditor
                    ref={editorRef}
                    content={content}
                    onContentChange={setContent}
                    maxLength={5000}
                    participants={project?.participants || []}
                  />
                </div>

                {attachments.length > 0 && (
                  <div className='space-y-2'>
                    {attachments.map((attachment) => {
                      return (
                        <div
                          key={attachment.id}
                          className='flex items-center justify-between bg-gray-50 p-2 rounded'
                        >
                          <div className='flex items-center'>
                            {getAttachmentIcon(attachment.type)}
                            <span className='text-sm'>{attachment.name}</span>
                            {attachment.size > 0 && (
                              <span className='text-xs text-gray-500 ml-2'>
                                ({formatFileSize(attachment.size)})
                              </span>
                            )}
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              return removeAttachment(attachment.id);
                            }}
                            className='h-6 w-6 p-0'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className='flex items-center justify-end gap-1.5 text-muted-foreground'>
                  <Button
                    variant='default'
                    size='sm'
                    className='text-sm text-muted-foreground hover:text-foreground text-white hover:text-white'
                    onClick={handleSend}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <>
                        <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent' />
                        Sending...
                      </>
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <FileUploadManagerModal
        isOpen={isFileModalOpen}
        onClose={() => {
          return setIsFileModalOpen(false);
        }}
        handleAddFileToProject={handleAddFileToProject}
      />
    </>
  );
};

export default ProjectMessageInput;
