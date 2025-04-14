'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotes } from '@/contexts/NotesContext';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Pencil, Save, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import EnhancedMessageEditor, { EnhancedMessageEditorRef } from './EnhancedMessageEditor';
import { MentionHoverCard } from './MentionHoverCard';

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
      avatar?: string;
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

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function NoteCard({ note, participants = [] }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<EnhancedMessageEditorRef>(null);
  const [localNote, setLocalNote] = useState(note);
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(null);
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

  useEffect(() => {
    const renderContentWithMentions = (content: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      // Convert the HTML content into React nodes
      const processNode = (node: Node, parentTag?: string): React.ReactNode => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();

          // If we're inside a p tag and encounter another p tag, convert it to a div
          if (parentTag === 'p' && tagName === 'p') {
            return React.createElement(
              'div',
              {
                key: Math.random(),
                className: element.className,
                ...Object.fromEntries(
                  Array.from(element.attributes).map((attr) => {
                    return [attr.name, attr.value];
                  }),
                ),
              },
              Array.from(element.childNodes).map((child, index) => {
                return processNode(child, 'div');
              }),
            );
          }

          if (element.classList.contains('mention')) {
            const userId = element.getAttribute('data-mention-id');
            const mentionText = element.textContent;
            if (userId && mentionText) {
              return (
                <MentionHoverCard key={`${userId}-${Math.random()}`} userId={userId}>
                  {mentionText}
                </MentionHoverCard>
              );
            }
          }

          const children = Array.from(element.childNodes).map((child, index) => {
            return processNode(child, tagName);
          });

          // Convert all p tags to div
          const finalTagName = tagName === 'p' ? 'div' : tagName;

          // For empty paragraphs, add a non-breaking space to ensure they take up space
          if (tagName === 'p' && children.length === 0) {
            return React.createElement(
              finalTagName,
              {
                key: Math.random(),
                className: `${element.className} min-h-[1.5em]`,
                ...Object.fromEntries(
                  Array.from(element.attributes).map((attr) => {
                    return [attr.name, attr.value];
                  }),
                ),
              },
              '\u00A0', // Non-breaking space
            );
          }

          return React.createElement(
            finalTagName,
            {
              key: Math.random(),
              className: element.className,
              ...Object.fromEntries(
                Array.from(element.attributes).map((attr) => {
                  return [attr.name, attr.value];
                }),
              ),
            },
            children,
          );
        }

        return null;
      };

      // Process all child nodes of the body
      return Array.from(doc.body.childNodes).map((node, index) => {
        return <React.Fragment key={index}>{processNode(node)}</React.Fragment>;
      });
    };

    setRenderedContent(renderContentWithMentions(localNote.content));
  }, [localNote.content]);

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
    <Card className='p-5 space-y-5 transition-all duration-200 hover:shadow-sm group'>
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0'>
          <Avatar className='h-8 w-8 shrink-0 mt-1'>
            <AvatarImage src={localNote.createdBy.avatar} alt='User' />
            <AvatarFallback className='bg-green-600 text-white font-bold text-sm uppercase'>
              {localNote.createdBy.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-3'>
            <div className='space-y-1'>
              <div className='text-sm font-medium text-gray-900 tracking-tight'>
                {localNote.createdBy.name}
              </div>
              <div className='text-xs text-gray-500 tracking-tight'>
                {localNote.createdBy.email}
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='text-xs text-gray-500 tracking-tight'>
                {formatDistanceToNow(new Date(localNote.createdAt), { addSuffix: true })}
              </div>
              {!isEditing && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100'
                  onClick={() => {
                    return setIsEditing(true);
                  }}
                >
                  <Pencil className='h-3.5 w-3.5 text-gray-500' />
                </Button>
              )}
            </div>
          </div>
          <div className='mt-3'>
            {isEditing ? (
              <div className='space-y-4'>
                <EnhancedMessageEditor
                  ref={editorRef}
                  content={localNote.content}
                  editable={true}
                  participants={participants}
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                />
                <div className='flex justify-end gap-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleCancel}
                    className='h-8 px-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors'
                  >
                    <X className='h-3.5 w-3.5 mr-1.5' />
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleSave}
                    className='h-8 px-3 text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors'
                  >
                    <Save className='h-3.5 w-3.5 mr-1.5' />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className='prose prose-sm max-w-none text-gray-700 leading-relaxed'>
                {renderedContent}
              </div>
            )}
          </div>
          {!isEditing && localNote.attachments && localNote.attachments.length > 0 && (
            <div className='mt-4 flex flex-wrap gap-2'>
              {localNote.attachments.map((attachment) => {
                return (
                  <a
                    key={attachment._id}
                    href={attachment.downloadURL}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-200'
                  >
                    <FileText className='h-3.5 w-3.5' />
                    <span className='truncate max-w-[200px]'>{attachment.originalName}</span>
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
