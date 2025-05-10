import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  FiArchive,
  FiBook,
  FiChevronLeft,
  FiChevronRight,
  FiStar,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { toast } from 'sonner';

interface InvoiceActionBarProps {
  onClose?: () => void;
  invoiceId: string;
}

export default function InvoiceActionBar({ onClose, invoiceId }: InvoiceActionBarProps) {
  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['invoice-notes', invoiceId],
    queryFn: async () => {
      const response = await newRequest.get(`/invoices/${invoiceId}/notes`);
      return response.data;
    },
  });

  return (
    <div className='flex items-center py-2.5 px-4 border-b border-b-[#222]'>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='sm' className='text-[#8b8b8b]' onClick={onClose}>
              <FiX size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Close</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className='w-[1px] h-[18px] bg-[#222] mr-4' />
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='sm' className='text-[#8b8b8b]'>
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
            <Button variant='ghost' size='sm' className='text-[#8b8b8b]'>
              <FiChevronRight size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Next</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className='flex-1' />
      <div className='flex items-center gap-1'>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant='default'
                    size='icon'
                    className='text-[#8b8b8b] bg-[#313131] hover:bg-[#3a3a3a] h-8 w-8 relative'
                    aria-label='Notes'
                  >
                    <FiBook size={16} className='text-[#f5a623]' />
                    {notes?.length > 0 && (
                      <span className='absolute -top-1 -right-1 bg-[#ffffff] text-[#030303] text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                        {notes.length}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <TooltipContent>
                <p>Notes</p>
              </TooltipContent>
              <PopoverContent className='w-[350px] p-0 bg-[#181818] text-white rounded-lg shadow-lg border-none'>
                <NotesPopoverContent invoiceId={invoiceId} initialNotes={notes} />
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
                className='text-[#8b8b8b] bg-[#313131] hover:bg-[#3a3a3a] h-8 w-8'
              >
                <FiStar size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Star</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='default'
                size='icon'
                className='text-[#8b8b8b] bg-[#313131] hover:bg-[#3a3a3a] h-8 w-8'
              >
                <FiArchive size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='default'
                size='icon'
                className='text-[#f63e68] bg-[#451a26] h-8 w-8 border-2 border-[#6e2535] hover:bg-[#6e2535]'
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
      <div className='p-4 rounded-lg bg-[#181818] min-h-[300px] flex flex-col'>
        <div className='text-lg font-medium mb-4 flex items-center gap-2'>Notes</div>
        <div className='flex-1 mb-4'>
          <textarea
            className='w-full min-h-[80px] bg-transparent border-none outline-none resize-none text-white placeholder-[#8b8b8b] text-base p-0 mb-2'
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
          <span className='text-[#8b8b8b] text-sm'>Label:</span>
          {labelColors.map((color) => {
            return (
              <button
                key={color}
                type='button'
                onClick={() => {
                  return setLabel(color);
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  label === color ? 'border-white' : 'border-transparent'
                }`}
                style={{ background: color }}
                aria-label={`Label color ${color}`}
              >
                {label === color && (
                  <span
                    className='block w-3 h-3 rounded-full border border-[#181818]'
                    style={{ background: color === '#fff' ? '#fff' : 'transparent' }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <div className='flex items-center gap-2 mb-4'>
          <kbd className='px-2 py-1 rounded bg-[#232323] text-[#8b8b8b] text-xs border border-[#313131]'>
            ⌘+Enter
          </kbd>
          <span className='text-[#8b8b8b] text-xs'>to save</span>
        </div>
        <div className='flex justify-between items-center mt-auto'>
          <Button
            variant='ghost'
            className='text-[#8b8b8b] hover:bg-transparent hover:text-white'
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
            className='bg-[#313131] text-white border border-[#313131] hover:bg-[#232323]/80 px-6 py-2 rounded-lg'
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
          <span className='ml-2 bg-[#232323] text-xs px-2 py-0.5 rounded-full'>{notes.length}</span>
        </div>
        {/* Search */}
        <div className='px-4 pb-2'>
          <div className='relative'>
            <input
              className='w-full bg-[#232323] text-white rounded-md px-3 py-2 pr-10 text-sm placeholder-[#8b8b8b] border-none outline-none'
              placeholder='Search notes...'
              value={search}
              onChange={(e) => {
                return setSearch(e.target.value);
              }}
            />
            <span className='absolute left-2 top-2.5 text-[#8b8b8b] pointer-events-none'>
              <svg width='16' height='16' fill='none' viewBox='0 0 24 24'>
                <path
                  d='M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z'
                  stroke='#8b8b8b'
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
            <div className='text-[#8b8b8b] text-center mt-8'>Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className='text-[#8b8b8b] text-center mt-8'>No notes found.</div>
          ) : (
            filteredNotes.map((n: Note) => {
              return (
                <div key={n._id} className='bg-[#232323] rounded-lg p-3 mb-3 relative'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className='w-3 h-3 rounded-full border border-[#181818]'
                      style={{ background: n.label }}
                    />
                    <span className='text-white text-sm whitespace-pre-line'>{n.text}</span>
                  </div>
                  <div className='flex items-center justify-between mt-2'>
                    <span className='text-[#8b8b8b] text-xs flex items-center gap-1'>
                      <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                        <path
                          d='M8 2v4M16 2v4M3 10h18M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                          stroke='#8b8b8b'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                      {timeAgo(n.createdAt)}
                    </span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className='text-[#444] flex items-center gap-1 p-1 rounded hover:bg-[#232323] focus:outline-none'>
                          <svg width='18' height='18' fill='none' viewBox='0 0 24 24'>
                            <circle cx='12' cy='6' r='1.5' fill='#444' />
                            <circle cx='12' cy='12' r='1.5' fill='#444' />
                            <circle cx='12' cy='18' r='1.5' fill='#444' />
                          </svg>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className='w-32 p-0 bg-[#232323] text-white rounded shadow-lg border-none'>
                        <button
                          className='w-full text-left px-4 py-2 hover:bg-[#313131] text-sm'
                          onClick={() => {
                            return handleEditNote(n);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className='w-full text-left px-4 py-2 hover:bg-[#313131] text-sm text-[#f63e68]'
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
        <div className='p-4 border-t border-[#232323] bg-[#181818]'>
          <Button
            variant='outline'
            className='w-full bg-[#232323] text-white border border-[#313131] hover:bg-[#232323]/80 flex items-center gap-2 justify-center'
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
          <rect x='8' y='12' width='32' height='28' rx='4' fill='#232323' />
          <rect x='12' y='16' width='24' height='20' rx='2' fill='#181818' />
          <rect x='16' y='20' width='16' height='2' rx='1' fill='#232323' />
          <rect x='16' y='24' width='12' height='2' rx='1' fill='#232323' />
        </svg>
      </div>
      <div className='text-lg font-medium mb-2'>No notes for this invoice</div>
      <div className='text-[#8b8b8b] text-center mb-6 text-sm'>
        Add notes to keep track of important information or follow-ups.
      </div>
      <Button
        variant='outline'
        className='bg-[#232323] text-white border border-[#313131] hover:bg-[#232323]/80 px-6 py-2 rounded-lg flex items-center gap-2'
        onClick={() => {
          return setAdding(true);
        }}
      >
        <span className='text-xl'>＋</span> Add a note
      </Button>
    </div>
  );
}
