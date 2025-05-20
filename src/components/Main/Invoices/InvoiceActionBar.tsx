import FileUploadManagerModal from '@/components/ProjectPage/FileComponents/FileUploadManagerModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { BsStarFill } from 'react-icons/bs';
import {
  FiBook,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiPaperclip,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { toast } from 'sonner';

interface InvoiceActionBarProps {
  onClose?: () => void;
  invoiceId: string;
  invoice?: {
    _id: string;
    starred: boolean;
    teamNotesAttachments?: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: string;
      _id: string;
    }>;
  };
  onEditInvoice?: () => void;
}

export default function InvoiceActionBar({
  onClose,
  invoiceId,
  invoice,
  onEditInvoice,
}: InvoiceActionBarProps) {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStarred, setIsStarred] = useState(invoice?.starred || false);

  // Update local state when invoice prop changes
  useEffect(() => {
    setIsStarred(invoice?.starred || false);
  }, [invoice?.starred]);

  // Star mutation
  const starMutation = useMutation({
    mutationFn: async () => {
      const newStarredState = !invoice?.starred;
      return newRequest.put(`/invoices/${invoiceId}/star`, {
        starred: newStarredState,
      });
    },
    onMutate: async () => {
      const newStarredState = !invoice?.starred;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['invoice', invoiceId] });

      // Snapshot the previous value
      const previousInvoice = queryClient.getQueryData(['invoice', invoiceId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['invoice', invoiceId], (old: any) => {
        return {
          ...old,
          starred: newStarredState,
        };
      });

      // Update invoices list as well
      queryClient.setQueryData(['invoices'], (old: any) => {
        return old.map((invoice: any) => {
          return invoice._id === invoiceId ? { ...invoice, starred: newStarredState } : invoice;
        });
      });

      // Return a context object with the snapshotted value
      return { previousInvoice };
    },
    onError: (err, newInvoice, context) => {
      // Revert local state on error
      setIsStarred(invoice?.starred || false);
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['invoice', invoiceId], context?.previousInvoice);
      toast.error('Failed to update star status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success(invoice?.starred ? 'Invoice unstarred' : 'Invoice starred');
    },
  });

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['invoice-notes', invoiceId],
    queryFn: async () => {
      const response = await newRequest.get(`/invoices/${invoiceId}/notes`);
      return response.data;
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async () => {
      await newRequest.delete(`/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete invoice');
    },
  });

  const handleDeleteInvoice = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteInvoice = () => {
    deleteInvoiceMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div className='flex items-center py-2.5 px-4 border-b border-border'>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='sm' className='text-muted-foreground' onClick={onClose}>
                <FiX size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Close</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className='w-[1px] h-[18px] bg-border mr-4' />
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='sm' className='text-muted-foreground'>
                <FiChevronLeft size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='sm' className='text-muted-foreground'>
                <FiChevronRight size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className='flex-1' />
        <div className='flex items-center gap-1 overflow-visible'>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='default'
                  size='icon'
                  className='text-muted-foreground bg-secondary hover:bg-secondary/80 h-8 w-8'
                  onClick={() => {
                    window.open(`/invoice/${invoiceId}`, '_blank');
                  }}
                >
                  <FiCreditCard size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pay Online</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant='default'
                      size='icon'
                      className='text-muted-foreground bg-secondary hover:bg-secondary/80 h-8 w-8 relative overflow-visible'
                      aria-label='Notes'
                    >
                      <FiBook
                        size={16}
                        className={`${
                          notes?.length > 0 ? 'text-[#f5a623]' : 'text-muted-foreground'
                        }`}
                      />
                      {notes?.length > 0 && (
                        <span className='absolute -top-1 -right-1 bg-background text-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                          {notes.length}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  <p>Notes</p>
                </TooltipContent>
                <PopoverContent className='w-[350px] p-0 bg-card text-foreground rounded-lg shadow-lg border-border'>
                  <NotesPopoverContent invoiceId={invoiceId} initialNotes={notes} />
                </PopoverContent>
              </Popover>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <Popover>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant='default'
                      size='icon'
                      className='text-muted-foreground bg-secondary hover:bg-secondary/80 h-8 w-8 relative overflow-visible'
                      aria-label='Attachments'
                    >
                      <FiPaperclip
                        size={16}
                        className={`${
                          invoice?.teamNotesAttachments?.length > 0
                            ? 'text-[#f5a623]'
                            : 'text-muted-foreground'
                        }`}
                      />
                      {invoice?.teamNotesAttachments?.length > 0 && (
                        <span className='absolute -top-1 -right-1 bg-background text-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                          {invoice.teamNotesAttachments.length}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  <p>Attachments</p>
                </TooltipContent>
                <PopoverContent className='w-[350px] p-0 bg-card text-foreground rounded-lg shadow-lg border-border'>
                  <AttachmentsPopoverContent
                    invoiceId={invoiceId}
                    attachments={invoice?.teamNotesAttachments || []}
                  />
                </PopoverContent>
              </Popover>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='default'
                  size='icon'
                  className={`text-muted-foreground bg-secondary hover:bg-secondary/80 h-8 w-8 ${
                    isStarred ? 'text-[#f5a623]' : ''
                  }`}
                  onClick={() => {
                    // Update local state immediately for instant feedback
                    setIsStarred(!isStarred);
                    starMutation.mutate();
                  }}
                >
                  {isStarred ? <BsStarFill size={14} /> : <FiStar size={14} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isStarred ? 'Unstar' : 'Star'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='default'
                  size='icon'
                  className='text-destructive bg-destructive/10 h-8 w-8 border-2 border-destructive/20 hover:bg-destructive/20'
                  onClick={handleDeleteInvoice}
                >
                  <FiTrash2 size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteInvoice}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const labelColors = [
  '#fff', // white
  '#f44336', // red
  '#ff9800', // orange
  '#ffc107', // yellow
  '#4caf50', // green
  '#2196f3', // blue
  '#9c27b0', // purple
  '#e91e63', // pink
];

interface Note {
  _id: string;
  text: string;
  label: string;
  createdAt: string;
  invoice: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

function NotesPopoverContent({
  invoiceId,
  initialNotes,
}: {
  invoiceId: string;
  initialNotes: Note[];
}) {
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState('');
  const [label, setLabel] = useState(labelColors[0]);
  const [editIndex, setEditIndex] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notes = initialNotes, isLoading } = useQuery({
    queryKey: ['invoice-notes', invoiceId],
    queryFn: async () => {
      const response = await newRequest.get(`/invoices/${invoiceId}/notes`);
      return response.data;
    },
  });

  // Add/Update note mutation
  const saveNoteMutation = useMutation({
    mutationFn: async (noteData: { text: string; label: string; id?: string }) => {
      if (noteData.id) {
        return newRequest.put(`/invoices/${invoiceId}/notes/${noteData.id}`, noteData);
      }
      return newRequest.post(`/invoices/${invoiceId}/notes`, noteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-notes', invoiceId] });
      setAdding(false);
      setNote('');
      setLabel(labelColors[0]);
      setEditIndex(null);
      toast.success('Note saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save note');
      console.error('Error saving note:', error);
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return newRequest.delete(`/invoices/${invoiceId}/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-notes', invoiceId] });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete note');
      console.error('Error deleting note:', error);
    },
  });

  // Filter notes by search
  const filteredNotes = notes.filter((n: Note) => {
    return n.text.toLowerCase().includes(search.toLowerCase());
  });

  // Edit note handler
  const handleEditNote = (note: Note) => {
    setNote(note.text);
    setLabel(note.label);
    setEditIndex(note._id);
    setAdding(true);
  };

  // Add or update note handler
  const handleSaveNote = () => {
    if (!note.trim()) return;
    const noteData = {
      text: note,
      label,
      id: editIndex,
    };
    saveNoteMutation.mutate(noteData);
  };

  // Delete note handler
  const handleDeleteNote = (noteId: string) => {
    deleteNoteMutation.mutate(noteId);
  };

  // Format time ago
  function timeAgo(date: string) {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff} second${diff !== 1 ? 's' : ''} ago`;
    if (diff < 3600)
      return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) !== 1 ? 's' : ''} ago`;
    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) !== 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  }

  // If adding a note, show the add note form
  if (adding) {
    return (
      <div className='p-4 rounded-lg bg-card min-h-[300px] flex flex-col'>
        <div className='text-lg font-medium mb-4 flex items-center gap-2'>Notes</div>
        <div className='flex-1 mb-4'>
          <textarea
            className='w-full min-h-[80px] bg-transparent border-none outline-none resize-none text-foreground placeholder-muted-foreground text-base p-0 mb-2'
            placeholder='Add your note here...'
            value={note}
            onChange={(e) => {
              return setNote(e.target.value);
            }}
            style={{ fontFamily: 'inherit' }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSaveNote();
            }}
          />
        </div>
        <div className='mb-4 flex items-center gap-2'>
          <span className='text-muted-foreground text-sm'>Label:</span>
          {labelColors.map((color) => {
            return (
              <button
                key={color}
                type='button'
                onClick={() => {
                  return setLabel(color);
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  label === color ? 'border-foreground' : 'border-transparent'
                }`}
                style={{ background: color }}
                aria-label={`Label color ${color}`}
              >
                {label === color && (
                  <span
                    className='block w-3 h-3 rounded-full border border-card'
                    style={{ background: color === '#fff' ? '#fff' : 'transparent' }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className='flex items-center gap-2 mb-4'>
          <kbd className='px-2 py-1 rounded bg-secondary text-muted-foreground text-xs border border-border'>
            ⌘+Enter
          </kbd>
          <span className='text-muted-foreground text-xs'>to save</span>
        </div>
        <div className='flex justify-between items-center mt-auto'>
          <Button
            variant='ghost'
            className='text-muted-foreground hover:bg-transparent hover:text-foreground'
            onClick={() => {
              setAdding(false);
              setEditIndex(null);
              setNote('');
              setLabel(labelColors[0]);
            }}
          >
            Cancel
          </Button>
          <Button
            variant='outline'
            className='bg-secondary text-foreground border border-border hover:bg-secondary/80 px-6 py-2 rounded-lg'
            disabled={!note.trim() || saveNoteMutation.isPending}
            onClick={handleSaveNote}
          >
            {editIndex ? 'Save changes' : 'Save note'}
          </Button>
        </div>
      </div>
    );
  }

  // If there are notes, show the notes list
  if (notes.length > 0) {
    return (
      <div className='flex flex-col h-[400px]'>
        {/* Header with badge */}
        <div className='flex items-center gap-2 px-4 pt-4 pb-2'>
          <span className='text-lg font-medium flex items-center gap-2'>Notes</span>
          <span className='ml-2 bg-secondary text-xs px-2 py-0.5 rounded-full'>{notes.length}</span>
        </div>
        {/* Search */}
        <div className='px-4 pb-2'>
          <div className='relative'>
            <input
              className='w-full bg-secondary text-foreground rounded-md px-3 py-2 pr-10 text-sm placeholder-muted-foreground border-none outline-none pl-8'
              placeholder='Search notes...'
              value={search}
              onChange={(e) => {
                return setSearch(e.target.value);
              }}
            />
            <span className='absolute left-2 top-2.5 text-muted-foreground pointer-events-none'>
              <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
                <path
                  d='M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          </div>
        </div>
        {/* Notes list */}
        <div className='flex-1 overflow-y-auto px-4 pb-2'>
          {isLoading ? (
            <div className='text-muted-foreground text-center mt-8'>Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className='text-muted-foreground text-center mt-8'>No notes found.</div>
          ) : (
            filteredNotes.map((n: Note) => {
              return (
                <div key={n._id} className='bg-secondary rounded-lg p-3 mb-3 relative'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className='w-3 h-3 rounded-full border border-card'
                      style={{ background: n.label }}
                    />
                    <span className='text-foreground text-sm whitespace-pre-line'>{n.text}</span>
                  </div>
                  <div className='flex items-center justify-between mt-2'>
                    <span className='text-muted-foreground text-xs flex items-center gap-1'>
                      <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                        <path
                          d='M8 2v4M16 2v4M3 10h18M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      {timeAgo(n.createdAt)}
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className='text-muted-foreground flex items-center gap-1 p-1 rounded hover:bg-secondary/80 focus:outline-none'>
                          <svg width='18' height='18' fill='none' viewBox='0 0 24 24'>
                            <circle cx='12' cy='6' r='1.5' fill='currentColor' />
                            <circle cx='12' cy='12' r='1.5' fill='currentColor' />
                            <circle cx='12' cy='18' r='1.5' fill='currentColor' />
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className='w-32 p-0 bg-card text-foreground rounded shadow-lg border-border'>
                        <button
                          className='w-full text-left px-4 py-2 hover:bg-secondary text-sm'
                          onClick={() => {
                            return handleEditNote(n);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className='w-full text-left px-4 py-2 hover:bg-secondary text-sm text-destructive'
                          onClick={() => {
                            return handleDeleteNote(n._id);
                          }}
                        >
                          Delete
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {/* Add note button */}
        <div className='p-4 border-t border-border bg-card'>
          <Button
            variant='outline'
            className='w-full bg-secondary text-foreground border border-border hover:bg-secondary/80 flex items-center gap-2 justify-center'
            onClick={() => {
              setAdding(true);
              setEditIndex(null);
              setNote('');
              setLabel(labelColors[0]);
            }}
          >
            <span className='text-lg'>＋</span> Add a note
          </Button>
        </div>
      </div>
    );
  }

  // If no notes, show the empty state
  return (
    <div className='flex flex-col items-center justify-center py-10 px-6'>
      <div className='mb-6'>
        <svg width='48' height='48' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <rect
            x='8'
            y='12'
            width='32'
            height='28'
            rx='4'
            fill='currentColor'
            className='text-secondary'
          />
          <rect
            x='12'
            y='16'
            width='24'
            height='20'
            rx='2'
            fill='currentColor'
            className='text-card'
          />
          <rect
            x='16'
            y='20'
            width='16'
            height='2'
            rx='1'
            fill='currentColor'
            className='text-secondary'
          />
          <rect
            x='16'
            y='24'
            width='12'
            height='2'
            rx='1'
            fill='currentColor'
            className='text-secondary'
          />
        </svg>
      </div>
      <div className='text-lg font-medium mb-2'>No notes for this invoice</div>
      <div className='text-muted-foreground text-center mb-6 text-sm'>
        Add notes to keep track of important information or follow-ups.
      </div>
      <Button
        variant='outline'
        className='bg-secondary text-foreground border border-border hover:bg-secondary/80 px-6 py-2 rounded-lg flex items-center gap-2'
        onClick={() => {
          return setAdding(true);
        }}
      >
        <span className='text-xl'>＋</span> Add a note
      </Button>
    </div>
  );
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  _id: string;
}

function AttachmentsPopoverContent({
  invoiceId,
  attachments,
}: {
  invoiceId: string;
  attachments: Attachment[];
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleAddAttachment = async (file: any) => {
    try {
      await newRequest.post(`/invoices/${invoiceId}/attachments`, {
        fileId: file._id,
        name: file.originalName,
        url: file.downloadURL,
        type: file.contentType,
        size: formatFileSize(file.size),
      });

      queryClient.invalidateQueries();
      toast.success('Attachment added successfully');
      setIsUploadModalOpen(false);
    } catch (error) {
      toast.error('Failed to add attachment');
      console.error('Error adding attachment:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await newRequest.delete(`/invoices/${invoiceId}/attachments/${attachmentId}`);
      queryClient.invalidateQueries();
      toast.success('Attachment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete attachment');
      console.error('Error deleting attachment:', error);
    }
  };

  const formatFileSize = (size: number): string => {
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('application/pdf')) return '📄';
    if (type.startsWith('text/')) return '📝';
    return '📎';
  };

  const isImageType = (type: string) => {
    return type.startsWith('image/');
  };

  return (
    <div className='flex flex-col h-[400px]'>
      {/* Header */}
      <div className='flex items-center gap-2 px-4 pt-4 pb-2'>
        <span className='text-lg font-medium flex items-center gap-2'>Attachments</span>
        <span className='ml-2 bg-secondary text-xs px-2 py-0.5 rounded-full'>
          {attachments.length}
        </span>
      </div>

      {/* Attachments list */}
      <div className='flex-1 overflow-y-auto px-4 pb-2'>
        {attachments.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-10'>
            <div className='text-4xl mb-4'>📎</div>
            <div className='text-lg font-medium mb-2'>No attachments yet</div>
            <div className='text-muted-foreground text-center mb-6 text-sm'>
              Add files to keep track of important documents.
            </div>
          </div>
        ) : (
          attachments.map((attachment) => {
            return (
              <div key={attachment._id} className='bg-secondary rounded-lg p-3 mb-3'>
                <div className='flex items-center gap-3'>
                  {isImageType(attachment.type) ? (
                    <div className='w-12 h-12 rounded overflow-hidden flex-shrink-0'>
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItaW1hZ2UiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDEzLjUgNi41IDQgMTYiPjwvcG9seWxpbmU+PC9zdmc+';
                        }}
                      />
                    </div>
                  ) : (
                    <span className='text-2xl'>{getFileIcon(attachment.type)}</span>
                  )}
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-sm truncate'>{attachment.name}</div>
                    <div className='text-xs text-muted-foreground'>{attachment.size}</div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-muted-foreground hover:text-foreground'
                      onClick={() => {
                        return window.open(attachment.url, '_blank');
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-destructive hover:text-destructive/80'
                      onClick={() => {
                        return handleDeleteAttachment(attachment._id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload button */}
      <div className='p-4 border-t border-border bg-card'>
        <Button
          variant='outline'
          className='w-full bg-secondary text-foreground border border-border hover:bg-secondary/80 flex items-center gap-2 justify-center'
          onClick={() => {
            return setIsUploadModalOpen(true);
          }}
        >
          <span className='text-lg'>＋</span> Add attachment
        </Button>
      </div>

      {/* File Upload Modal */}
      <FileUploadManagerModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          return setIsUploadModalOpen(false);
        }}
        handleAddFileToProject={handleAddAttachment}
        initialFiles={[]}
      />
    </div>
  );
}
