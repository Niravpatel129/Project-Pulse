'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Pencil, Save, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import EnhancedMessageEditor, { EnhancedMessageEditorRef } from './EnhancedMessageEditor';

interface NoteCardProps {
  note: {
    _id: string;
    content: string;
    attachments: {
      _id: string;
      name: string;
      originalName: string;
      downloadURL: string;
      contentType: string;
      size: number;
    }[];
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  onUpdate?: (noteId: string, content: string, attachments: any[]) => Promise<void>;
  participants?: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  }[];
}

export function NoteCard({ note, onUpdate, participants = [] }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<EnhancedMessageEditorRef>(null);
  const [attachments, setAttachments] = useState(
    note.attachments.map((attachment) => {
      return {
        id: attachment._id,
        fileId: attachment._id,
        name: attachment.originalName,
        type: attachment.contentType,
        size: attachment.size,
        downloadURL: attachment.downloadURL,
      };
    }),
  );

  const queryClient = useQueryClient();

  const { mutate: updateNote, isPending: isUpdating } = useMutation({
    mutationFn: async ({ content, attachments }: { content: string; attachments: any[] }) => {
      const response = await newRequest.put(`/notes/${note._id}`, {
        content,
        attachments: attachments.map((attachment) => {
          return {
            _id: attachment.fileId,
            name: attachment.name,
            originalName: attachment.name,
            downloadURL: attachment.downloadURL,
            contentType: attachment.type,
            size: attachment.size,
          };
        }),
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Note updated successfully');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast.error('Failed to update note', {
        description: error.message || 'There was a problem updating the note. Please try again.',
      });
    },
  });

  const handleSave = async () => {
    if (editorRef.current) {
      const content = editorRef.current.getHTML();
      updateNote({ content, attachments });
    }
  };

  const handleCancel = () => {
    editorRef.current?.setContent(note.content);
    setAttachments(
      note.attachments.map((attachment) => {
        return {
          id: attachment._id,
          fileId: attachment._id,
          name: attachment.originalName,
          type: attachment.contentType,
          size: attachment.size,
          downloadURL: attachment.downloadURL,
        };
      }),
    );
    setIsEditing(false);
  };

  return (
    <Card className='p-3'>
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0'>
          <Avatar>
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${note.createdBy.name}`}
            />
            <AvatarFallback>{note.createdBy.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>{note.createdBy.name}</p>
              <p className='text-xs text-gray-500'>{note.createdBy.email}</p>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-xs text-gray-500'>
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </p>
              {!isEditing && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={() => {
                    return setIsEditing(true);
                  }}
                >
                  <Pencil className='h-4 w-4' />
                </Button>
              )}
            </div>
          </div>
          <div className='mt-2'>
            {isEditing ? (
              <div className='space-y-2'>
                <EnhancedMessageEditor
                  ref={editorRef}
                  content={note.content}
                  editable={true}
                  participants={participants}
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                />
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' size='sm' onClick={handleCancel} disabled={isUpdating}>
                    <X className='h-4 w-4 mr-1' />
                    Cancel
                  </Button>
                  <Button size='sm' onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent' />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className='h-4 w-4 mr-1' />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className='prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            )}
          </div>
          {!isEditing && note.attachments && note.attachments.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {note.attachments.map((attachment) => {
                return (
                  <a
                    key={attachment._id}
                    href={attachment.downloadURL}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-xs text-blue-500 hover:underline'
                  >
                    <FileText className='h-3 w-3' />
                    {attachment.originalName}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
