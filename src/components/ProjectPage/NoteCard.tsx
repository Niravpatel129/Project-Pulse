'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';

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
  onUpdate?: (noteId: string, content: string) => Promise<void>;
}

export function NoteCard({ note, onUpdate }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);

  const editor = useEditor({
    extensions: [StarterKit],
    content: note.content,
    editable: isEditing,
    onUpdate: ({ editor }) => {
      setEditedContent(editor.getHTML());
    },
  });

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(note._id, editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(note.content);
    editor?.commands.setContent(note.content);
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
                <div className='prose prose-sm max-w-none'>
                  <EditorContent editor={editor} />
                </div>
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
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            )}
          </div>
          {note.attachments && note.attachments.length > 0 && (
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
