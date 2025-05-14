import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BsStarFill } from 'react-icons/bs';
import { FiBook, FiRefreshCw, FiSearch, FiSidebar } from 'react-icons/fi';
import { IoPerson } from 'react-icons/io5';
import { toast } from 'sonner';

interface InvoicesProps {
  invoices: any[];
  onPreviewClick?: (invoice: any) => void;
  isPreviewOpen?: boolean;
  showStarredOnly?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'bg-green-500/10 text-green-500';
    case 'open':
      return 'bg-gray-300/10 text-gray-300';
    case 'overdue':
      return 'bg-red-500/10 text-red-500';
    case 'overpaid':
      return 'bg-blue-500/10 text-blue-500';
    case 'partially_paid':
      return 'bg-orange-500/10 text-orange-500';
    case 'sent':
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

export default function Invoices({
  invoices,
  onPreviewClick,
  isPreviewOpen,
  showStarredOnly = false,
}: InvoicesProps) {
  const { toggleSidebar } = useSidebar();
  const queryClient = useQueryClient();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  // Fetch notes for each invoice
  const { data: notesMap = {} } = useQuery({
    queryKey: ['invoices-notes'],
    queryFn: async () => {
      const notesPromises = invoices.map(async (invoice) => {
        const response = await newRequest.get(`/invoices/${invoice._id}/notes`);
        return { [invoice._id]: response.data };
      });
      const notesResults = await Promise.all(notesPromises);
      return Object.assign({}, ...notesResults);
    },
  });

  // Filter invoices based on starred status
  const filteredInvoices = showStarredOnly
    ? invoices.filter((invoice) => {
        return invoice.starred;
      })
    : invoices;

  // Star mutation
  const starMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const invoice = invoices.find((inv) => {
        return inv._id === invoiceId;
      });
      return newRequest.put(`/invoices/${invoiceId}/star`, {
        starred: !invoice?.starred,
      });
    },
    onMutate: async (invoiceId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['invoices'] });
      await queryClient.cancelQueries({ queryKey: ['invoices-notes'] });

      // Snapshot the previous value
      const previousInvoices = queryClient.getQueryData(['invoices']);

      // Optimistically update to the new value
      queryClient.setQueryData(['invoices'], (old: any) => {
        return old.map((invoice: any) => {
          if (invoice._id === invoiceId) {
            return { ...invoice, starred: !invoice.starred };
          }
          return invoice;
        });
      });

      // Return a context object with the snapshotted value
      return { previousInvoices };
    },
    onError: (err, newInvoice, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['invoices'], context?.previousInvoices);
      toast.error('Failed to update star status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-notes'] });
    },
  });

  // Add effect to clear selection when preview is closed
  useEffect(() => {
    if (!isPreviewOpen) {
      console.log('Clearing selected invoice state');
      setSelectedInvoice(null);
    }
  }, [isPreviewOpen]);

  return (
    <motion.div
      className='flex flex-col h-full'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1], // Custom easing for smoother fade
      }}
    >
      <motion.div
        className='flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7] dark:border-[#232428]'
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
          delay: 0.1,
        }}
      >
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className='text-[#3F3F46]/60 dark:text-[#8b8b8b] hover:text-[#3F3F46] dark:hover:text-white'
            onClick={toggleSidebar}
          >
            <FiSidebar size={20} />
          </Button>
          <h1 className='text-lg font-semibold text-[#3F3F46] dark:text-white'>
            {showStarredOnly ? 'Starred Invoices' : 'Invoices'}
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className='text-[#3F3F46]/60 dark:text-[#8b8b8b] hover:text-[#3F3F46] dark:hover:text-white'
            onClick={() => {
              return queryClient.invalidateQueries({ queryKey: ['invoices'] });
            }}
          >
            <FiRefreshCw size={20} />
          </Button>
        </div>
      </motion.div>
      <motion.div
        className='px-4 py-2'
        initial={{ y: -5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
          delay: 0.2,
        }}
      >
        <div className='relative'>
          <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3F3F46]/60 dark:text-[#8C8C8C]' />
          <Input
            type='text'
            placeholder='Search...'
            className='w-full pl-9 bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C] focus-visible:ring-1 focus-visible:ring-[#3F3F46]/60 dark:focus-visible:ring-[#8C8C8C]'
          />
        </div>
      </motion.div>
      <div className='flex-1 overflow-y-auto px-1 scrollbar-hide'>
        <AnimatePresence mode='popLayout'>
          {filteredInvoices?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='flex flex-col items-center justify-center h-full text-[#3F3F46]/60 dark:text-[#8C8C8C] py-8'
            >
              <p className='text-lg'>No invoices found</p>
              <p className='text-sm mt-2'>
                {showStarredOnly
                  ? "You haven't starred any invoices yet"
                  : 'Create your first invoice to get started'}
              </p>
            </motion.div>
          ) : (
            filteredInvoices?.map((invoice, index) => {
              return (
                <motion.div
                  key={invoice._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8,
                    opacity: {
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    },
                    delay: index * 0.03,
                  }}
                  className={`group relative flex items-center px-3 py-2 my-2 rounded-lg hover:bg-[#F4F4F5] dark:hover:bg-[#252525] transition-all duration-300 ease-in-out cursor-pointer ${
                    selectedInvoice === invoice._id ? 'bg-[#F4F4F5] dark:bg-[#252525]' : ''
                  }`}
                  onClick={(e) => {
                    if (onPreviewClick) {
                      setSelectedInvoice(invoice._id);
                      onPreviewClick(invoice);
                    }
                  }}
                >
                  <div className='relative mr-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarFallback className='bg-[#E4E4E7] dark:bg-[#373737] text-[#3F3F46] dark:text-[#9f9f9f] text-xs font-semibold capitalize'>
                        {invoice.client?.user.name[0] || <IoPerson />}
                        {invoice.client?.contact.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-[#3F3F46] dark:text-[#fafafa] text-[14px] truncate'>
                          {invoice.client?.user.name || 'Unnamed'}
                        </span>
                        <Badge
                          variant='secondary'
                          className={`${getStatusColor(
                            invoice.status,
                          )} text-xs px-2 py-0.5 rounded-sm`}
                        >
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <TooltipProvider delayDuration={500}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm truncate max-w-[120px] hover:text-[#3F3F46] dark:hover:text-white transition-colors'>
                                {invoice.items[0]?.description || 'No description'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className='w-80 p-4 bg-white dark:bg-[#232323] border border-[#E4E4E7] dark:border-[#313131] shadow-lg'>
                              <div className='space-y-2'>
                                <h4 className='font-medium text-[#3F3F46] dark:text-white mb-2'>
                                  Invoice Items
                                </h4>
                                {invoice.items.map((item: any, index: number) => {
                                  return (
                                    <div key={index} className='flex items-start gap-2 text-sm'>
                                      <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] min-w-[20px]'>
                                        {index + 1}.
                                      </span>
                                      <div className='flex-1'>
                                        <p className='text-[#3F3F46] dark:text-white'>
                                          {item.description}
                                        </p>
                                        <p className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs'>
                                          {item.quantity} ×{' '}
                                          {item.price.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}{' '}
                                          {invoice.currency}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <span className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm'>
                          •{' '}
                          {invoice.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          {invoice.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 ml-4'>
                    <div className='relative flex gap-0'>
                      {notesMap[invoice._id]?.length > 0 && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <Popover>
                              <PopoverTrigger asChild>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='text-[#f5a623] hover:text-[#3F3F46] dark:hover:text-white relative'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    <FiBook size={14} />
                                  </Button>
                                </TooltipTrigger>
                              </PopoverTrigger>
                              <TooltipContent>
                                <p>Notes</p>
                              </TooltipContent>
                              <PopoverContent className='w-[350px] p-0 bg-white dark:bg-[#181818] text-[#3F3F46] dark:text-white rounded-lg shadow-lg border border-[#E4E4E7] dark:border-none'>
                                <NotesPopoverContent
                                  invoiceId={invoice._id}
                                  initialNotes={notesMap[invoice._id] || []}
                                />
                              </PopoverContent>
                            </Popover>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {invoice.starred && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='text-[#f5a623] hover:text-[#3F3F46] dark:hover:text-white'
                          onClick={(e) => {
                            e.stopPropagation();
                            starMutation.mutate(invoice._id);
                          }}
                          disabled={starMutation.isPending}
                        >
                          {starMutation.isPending ? (
                            <div className='w-4 h-4 border-2 border-[#3F3F46]/60 dark:border-[#8b8b8b] border-t-transparent rounded-full animate-spin' />
                          ) : (
                            <BsStarFill size={14} />
                          )}
                        </Button>
                      )}
                    </div>

                    <div className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] ml-0 whitespace-nowrap'>
                      {(() => {
                        const date = new Date(invoice.createdAt);
                        const today = new Date();
                        const isToday = date.toDateString() === today.toDateString();
                        const isThisYear = date.getFullYear() === today.getFullYear();

                        if (isToday) {
                          return format(date, 'h:mm a');
                        } else if (!isThisYear) {
                          return format(date, 'MMM d, yyyy');
                        } else {
                          return format(date, 'MMM d');
                        }
                      })()}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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
      queryClient.invalidateQueries({ queryKey: ['invoices-notes'] });
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
      queryClient.invalidateQueries({ queryKey: ['invoices-notes'] });
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
      <div className='p-4 rounded-lg bg-white dark:bg-[#181818] min-h-[300px] flex flex-col'>
        <div className='text-lg font-medium mb-4 flex items-center gap-2 text-[#3F3F46] dark:text-white'>
          Notes
        </div>
        <div className='flex-1 mb-4'>
          <textarea
            className='w-full min-h-[80px] bg-transparent border-none outline-none resize-none text-[#3F3F46] dark:text-white placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8b8b8b] text-base p-0 mb-2'
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
          <span className='text-[#3F3F46]/60 dark:text-[#8b8b8b] text-sm'>Label:</span>
          {labelColors.map((color) => {
            return (
              <button
                key={color}
                type='button'
                onClick={() => {
                  return setLabel(color);
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  label === color ? 'border-[#3F3F46] dark:border-white' : 'border-transparent'
                }`}
                style={{ background: color }}
                aria-label={`Label color ${color}`}
              >
                {label === color && (
                  <span
                    className='block w-3 h-3 rounded-full border border-white dark:border-[#181818]'
                    style={{ background: color === '#fff' ? '#fff' : 'transparent' }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className='flex items-center gap-2 mb-4'>
          <kbd className='px-2 py-1 rounded bg-[#F4F4F5] dark:bg-[#232323] text-[#3F3F46]/60 dark:text-[#8b8b8b] text-xs border border-[#E4E4E7] dark:border-[#313131]'>
            ⌘+Enter
          </kbd>
          <span className='text-[#3F3F46]/60 dark:text-[#8b8b8b] text-xs'>to save</span>
        </div>
        <div className='flex justify-between items-center mt-auto'>
          <Button
            variant='ghost'
            className='text-[#3F3F46]/60 dark:text-[#8b8b8b] hover:bg-transparent hover:text-[#3F3F46] dark:hover:text-white'
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
            className='bg-[#F4F4F5] dark:bg-[#313131] text-[#3F3F46] dark:text-white border border-[#E4E4E7] dark:border-[#313131] hover:bg-[#E4E4E7] dark:hover:bg-[#232323]/80 px-6 py-2 rounded-lg'
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
          <span className='text-lg font-medium flex items-center gap-2 text-[#3F3F46] dark:text-white'>
            Notes
          </span>
          <span className='ml-2 bg-[#F4F4F5] dark:bg-[#232323] text-[#3F3F46] dark:text-[#8b8b8b] text-xs px-2 py-0.5 rounded-full'>
            {notes.length}
          </span>
        </div>
        {/* Search */}
        <div className='px-4 pb-2'>
          <div className='relative'>
            <input
              className='w-full bg-[#F4F4F5] dark:bg-[#232323] text-[#3F3F46] dark:text-white rounded-md px-3 py-2 pr-10 text-sm placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8b8b8b] border-none outline-none pl-8'
              placeholder='Search notes...'
              value={search}
              onChange={(e) => {
                return setSearch(e.target.value);
              }}
            />
            <span className='absolute left-2 top-2.5 text-[#3F3F46]/60 dark:text-[#8b8b8b] pointer-events-none'>
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
            <div className='text-[#3F3F46]/60 dark:text-[#8b8b8b] text-center mt-8'>
              Loading notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className='text-[#3F3F46]/60 dark:text-[#8b8b8b] text-center mt-8'>
              No notes found.
            </div>
          ) : (
            filteredNotes.map((n: Note) => {
              return (
                <div
                  key={n._id}
                  className='bg-[#F4F4F5] dark:bg-[#232323] rounded-lg p-3 mb-3 relative'
                >
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className='w-3 h-3 rounded-full border border-white dark:border-[#181818]'
                      style={{ background: n.label }}
                    />
                    <span className='text-[#3F3F46] dark:text-white text-sm whitespace-pre-line'>
                      {n.text}
                    </span>
                  </div>
                  <div className='flex items-center justify-between mt-2'>
                    <span className='text-[#3F3F46]/60 dark:text-[#8b8b8b] text-xs flex items-center gap-1'>
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
                        <button className='text-[#3F3F46]/40 dark:text-[#444] flex items-center gap-1 p-1 rounded hover:bg-[#E4E4E7] dark:hover:bg-[#232323] focus:outline-none'>
                          <svg width='18' height='18' fill='none' viewBox='0 0 24 24'>
                            <circle cx='12' cy='6' r='1.5' fill='currentColor' />
                            <circle cx='12' cy='12' r='1.5' fill='currentColor' />
                            <circle cx='12' cy='18' r='1.5' fill='currentColor' />
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className='w-32 p-0 bg-white dark:bg-[#232323] text-[#3F3F46] dark:text-white rounded shadow-lg border border-[#E4E4E7] dark:border-none'>
                        <button
                          className='w-full text-left px-4 py-2 hover:bg-[#F4F4F5] dark:hover:bg-[#313131] text-sm'
                          onClick={() => {
                            return handleEditNote(n);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className='w-full text-left px-4 py-2 hover:bg-[#F4F4F5] dark:hover:bg-[#313131] text-sm text-[#f63e68]'
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
        <div className='p-4 border-t border-[#E4E4E7] dark:border-[#232323] bg-white dark:bg-[#181818]'>
          <Button
            variant='outline'
            className='w-full bg-[#F4F4F5] dark:bg-[#232323] text-[#3F3F46] dark:text-white border border-[#E4E4E7] dark:border-[#313131] hover:bg-[#E4E4E7] dark:hover:bg-[#232323]/80 flex items-center gap-2 justify-center'
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
            style={{ fill: 'var(--fill-color, #F4F4F5)' }}
            className='dark:[--fill-color:#232323]'
          />
          <rect
            x='12'
            y='16'
            width='24'
            height='20'
            rx='2'
            style={{ fill: 'var(--fill-color, white)' }}
            className='dark:[--fill-color:#181818]'
          />
          <rect
            x='16'
            y='20'
            width='16'
            height='2'
            rx='1'
            style={{ fill: 'var(--fill-color, #F4F4F5)' }}
            className='dark:[--fill-color:#232323]'
          />
          <rect
            x='16'
            y='24'
            width='12'
            height='2'
            rx='1'
            style={{ fill: 'var(--fill-color, #F4F4F5)' }}
            className='dark:[--fill-color:#232323]'
          />
        </svg>
      </div>
      <div className='text-lg font-medium mb-2 text-[#3F3F46] dark:text-white'>
        No notes for this invoice
      </div>
      <div className='text-[#3F3F46]/60 dark:text-[#8b8b8b] text-center mb-6 text-sm'>
        Add notes to keep track of important information or follow-ups.
      </div>
      <Button
        variant='outline'
        className='bg-[#F4F4F5] dark:bg-[#232323] text-[#3F3F46] dark:text-white border border-[#E4E4E7] dark:border-[#313131] hover:bg-[#E4E4E7] dark:hover:bg-[#232323]/80 px-6 py-2 rounded-lg flex items-center gap-2'
        onClick={() => {
          return setAdding(true);
        }}
      >
        <span className='text-xl'>＋</span> Add a note
      </Button>
    </div>
  );
}
