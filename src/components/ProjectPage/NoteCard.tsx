'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotes } from '@/contexts/NotesContext';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Pencil, Save, X } from 'lucide-react';
import { useRef, useState } from 'react';
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
  participants?: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  }[];
}

export function NoteCard({ note, participants = [] }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<EnhancedMessageEditorRef>(null);
  const [localNote, setLocalNote] = useState(note);
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

  const { updateNote } = useNotes();

  const handleSave = async () => {
    if (editorRef.current) {
      const content = editorRef.current.getHTML();
      // Update local state immediately
      setLocalNote((prev) => {
        return {
          ...prev,
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
          updatedAt: new Date().toISOString(),
        };
      });

      // Then make the API call
      await updateNote(note._id, content, attachments);
      setIsEditing(false);
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
    setLocalNote(note);
    setIsEditing(false);
  };

  return (
    <Card className='p-3'>
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0'>
          <Avatar>
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${localNote.createdBy.name}`}
            />
            <AvatarFallback>{localNote.createdBy.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium'>{localNote.createdBy.name}</p>
              <p className='text-xs text-gray-500'>{localNote.createdBy.email}</p>
            </div>
            <div className='flex items-center gap-2'>
              <p className='text-xs text-gray-500'>
                {formatDistanceToNow(new Date(localNote.createdAt), { addSuffix: true })}
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
                  content={localNote.content}
                  editable={true}
                  participants={participants}
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                />
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' size='sm' onClick={handleCancel}>
                    <X className='h-4 w-4 mr-1' />
                    Cancel
                  </Button>
                  <Button size='sm' onClick={handleSave}>
                    <Save className='h-4 w-4 mr-1' />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className='prose prose-sm max-w-none'
                dangerouslySetInnerHTML={{ __html: localNote.content }}
              />
            )}
          </div>
          {!isEditing && localNote.attachments && localNote.attachments.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-2'>
              {localNote.attachments.map((attachment) => {
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
