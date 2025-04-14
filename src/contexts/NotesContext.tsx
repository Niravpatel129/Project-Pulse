'use client';

import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext } from 'react';
import { toast } from 'sonner';

interface Note {
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
}

interface NotesContextType {
  notes: Note[];
  isLoading: boolean;
  updateNote: (noteId: string, content: string, attachments: any[]) => Promise<void>;
  addNote: (content: string, attachments: any[]) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) {
  const queryClient = useQueryClient();

  const { data: notesResponse, isLoading } = useQuery({
    queryKey: ['notes', projectId],
    queryFn: async () => {
      const response = await newRequest.get(`/notes/project/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  // Ensure we always have an array of notes
  const notes = Array.isArray(notesResponse) ? notesResponse : [];

  const updateNoteMutation = useMutation({
    mutationFn: async ({
      noteId,
      content,
      attachments,
    }: {
      noteId: string;
      content: string;
      attachments: any[];
    }) => {
      const response = await newRequest.put(`/notes/${noteId}`, {
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
      return response.data.data;
    },
    onMutate: async ({ noteId, content, attachments }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notes', projectId] });

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData(['notes', projectId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['notes', projectId], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((note: Note) => {
          if (note._id === noteId) {
            return {
              ...note,
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
          }
          return note;
        });
      });

      return { previousNotes };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes', projectId], context.previousNotes);
      }
      toast.error('Failed to update note', {
        description: error.message || 'There was a problem updating the note. Please try again.',
      });
    },
    onSuccess: (updatedNote) => {
      // Update the cache with the server response
      queryClient.setQueryData(['notes', projectId], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((note: Note) => {
          if (note._id === updatedNote._id) {
            return updatedNote;
          }
          return note;
        });
      });
      toast.success('Note updated successfully');
    },
  });

  const updateNote = useCallback(
    async (noteId: string, content: string, attachments: any[]) => {
      await updateNoteMutation.mutateAsync({ noteId, content, attachments });
    },
    [updateNoteMutation],
  );

  const addNote = useCallback(async (content: string, attachments: any[]) => {
    // Implementation for adding a new note
    // Similar pattern to updateNote but with POST request
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    // Implementation for deleting a note
    // Similar pattern to updateNote but with DELETE request
  }, []);

  return (
    <NotesContext.Provider value={{ notes, isLoading, updateNote, addNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
