'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { CommandShortcut } from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  CalendarIcon,
  ChevronDown,
  Coffee,
  FileImage,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Timer,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import KanbanHeader from './KanbanHeader';

// Define the attachment type for type safety
type Attachment = {
  id: string;
  type: string;
  url: string;
  title: string;
  icon: React.ReactNode;
  size?: number;
};

// KanbanColumn now places Add Task directly after its children
const KanbanColumn = ({ title, children, id, onAddClick, isAdding, color = '#e2e8f0' }) => {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id });
  return (
    <div className='group flex flex-col w-full min-w-[246px]'>
      <div
        className='px-3 py-2 rounded-t-lg border border-border'
        style={{
          backgroundColor: `${color}30`,
          borderBottomColor: color,
        }}
      >
        <h3 className='font-medium text-sm'>{title}</h3>
      </div>
      <div
        ref={setDroppableNodeRef}
        className='p-3 rounded-b-lg border border-t-0 border-border min-h-[300px] space-y-2'
      >
        {children}
        {!isAdding && (
          <button
            onClick={() => {
              return onAddClick(id);
            }}
            className='flex items-center gap-1 mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition w-full'
          >
            <Plus size={14} /> Add task
          </button>
        )}
      </div>
    </div>
  );
};

// TaskDetailDialog component to display and edit task details
const TaskDetailDialog = ({ task, open, onOpenChange, onTaskUpdate, columns }) => {
  // Individual edit states for each field rather than a global edit mode
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');
  const [editedColumnId, setEditedColumnId] = useState(task?.columnId || '');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'John Doe',
      content: "Let's prioritize this for the next sprint.",
      time: '2 days ago',
      avatar: '/avatars/01.png',
    },
    {
      id: 2,
      author: 'Sarah Smith',
      content: "I've started working on this.",
      time: '1 day ago',
      avatar: '/avatars/02.png',
    },
  ]);
  const [activeTab, setActiveTab] = useState('attachments');

  // Attachment states
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: 'a1',
      type: 'link',
      url: 'https://example.com/design-specs',
      title: 'Design Specifications',
      icon: <FileText size={14} />,
    },
    {
      id: 'a2',
      type: 'image',
      url: '/mockup.png',
      title: 'UI Mockup',
      icon: <FileImage size={14} />,
    },
  ]);

  const [dueDate, setDueDate] = useState(null);
  const [timeTracking, setTimeTracking] = useState({
    originalEstimate: '4h',
    timeSpent: '2h 30m',
    remainingEstimate: '1h 30m',
  });

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditedColumnId(task.columnId);
    }
  }, [task]);

  // Save individual field changes
  const saveTitle = () => {
    if (!task) return;

    onTaskUpdate({
      ...task,
      title: editedTitle,
    });

    setEditingTitle(false);
  };

  const saveDescription = () => {
    if (!task) return;

    onTaskUpdate({
      ...task,
      description: editedDescription,
    });

    setEditingDescription(false);
  };

  const saveColumnId = (columnId) => {
    if (!task) return;

    onTaskUpdate({
      ...task,
      columnId,
    });

    setEditingStatus(false);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    setComments([
      ...comments,
      {
        id: Date.now(),
        author: 'You',
        content: commentText,
        time: 'Just now',
        avatar: '/avatars/03.png',
      },
    ]);

    setCommentText('');
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    setAttachments([
      ...attachments,
      {
        id: `a${Date.now()}`,
        type: 'link',
        url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
        title: linkUrl.replace(/^https?:\/\//, '').split('/')[0],
        icon: <LinkIcon size={14} />,
        size: 0,
      },
    ]);

    setLinkUrl('');
    setShowLinkInput(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, this would handle actual file uploads
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Simulate adding file references
    const newAttachments: Attachment[] = Array.from(files).map((file) => {
      return {
        id: `a${Date.now()}-${file.name}`,
        type: 'file',
        url: '#', // Adding required url property
        title: file.name,
        size: file.size,
        icon: <FileText size={14} />,
      };
    });

    setAttachments([...attachments, ...newAttachments]);
  };

  const handleTransition = (columnId) => {
    saveColumnId(columnId);
  };

  if (!task) return null;

  const currentColumn = columns.find((col) => {
    return col.id === task.columnId;
  });
  // Create a JIRA-like ID from the task id
  const ticketId = `PULSE-${task.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl h-[90vh] p-0 gap-0'>
        {/* Header */}
        <div className='px-6 py-3 border-b flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-blue-500'>{ticketId}</span>
            <Button variant='ghost' size='sm' className='h-7'>
              <ArrowUpRight size={14} className='mr-1' />
              Open
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='ghost' size='sm' className='h-7'>
              <MoreHorizontal size={16} />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-7'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        <div className='flex h-full overflow-hidden'>
          {/* Main content - left side */}
          <div className='flex-1 overflow-auto p-6'>
            {/* Attachment Action Bar - Slack/Notion style */}
            <div className='mb-6 bg-muted/30 rounded-lg p-3 border'>
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-sm font-medium'>Attachments & Links</h3>
                <div className='flex gap-1'>
                  <input
                    type='file'
                    id='file-upload'
                    className='sr-only'
                    multiple
                    onChange={handleFileUpload}
                  />
                  <label htmlFor='file-upload'>
                    <Button variant='outline' size='sm' className='h-7' asChild>
                      <span>
                        <Paperclip size={14} className='mr-1' />
                        File
                      </span>
                    </Button>
                  </label>

                  <Button
                    variant='outline'
                    size='sm'
                    className='h-7'
                    onClick={() => {
                      return setShowLinkInput(true);
                    }}
                  >
                    <LinkIcon size={14} className='mr-1' />
                    Link
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' size='sm' className='h-7'>
                        <Plus size={14} className='mr-1' />
                        More
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-48 p-1'>
                      <div className='space-y-1'>
                        <Button variant='ghost' size='sm' className='w-full justify-start'>
                          <FileImage size={14} className='mr-2' />
                          Add image
                        </Button>
                        <Button variant='ghost' size='sm' className='w-full justify-start'>
                          <FileText size={14} className='mr-2' />
                          Add document
                        </Button>
                        <Button variant='ghost' size='sm' className='w-full justify-start'>
                          <Coffee size={14} className='mr-2' />
                          Add Figma
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {showLinkInput && (
                <div className='flex items-center gap-2 mt-2 mb-3'>
                  <Input
                    placeholder='Paste or type a link'
                    value={linkUrl}
                    onChange={(e) => {
                      return setLinkUrl(e.target.value);
                    }}
                    className='flex-1'
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddLink();
                      if (e.key === 'Escape') setShowLinkInput(false);
                    }}
                  />
                  <Button size='sm' onClick={handleAddLink}>
                    Add
                  </Button>
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => {
                      return setShowLinkInput(false);
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}

              {attachments.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {attachments.map((attachment) => {
                    return (
                      <div
                        key={attachment.id}
                        className='flex items-center gap-1 bg-background rounded border px-2 py-1 text-xs'
                      >
                        <div className='text-muted-foreground'>{attachment.icon}</div>
                        <span className='font-medium'>{attachment.title}</span>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-4 w-4 p-0 ml-1 text-muted-foreground'
                        >
                          <X size={10} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status section - clickable to edit */}
            <div className='mb-6 flex items-center gap-2'>
              {editingStatus ? (
                <DropdownMenu
                  open={true}
                  onOpenChange={(open) => {
                    return !open && setEditingStatus(false);
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className='px-3 py-1.5 h-auto gap-2 rounded-md font-medium text-sm flex items-center'
                      style={{
                        backgroundColor: `${currentColumn?.color}30`,
                        color: currentColumn?.color,
                      }}
                    >
                      <div
                        className='w-2 h-2 rounded-full'
                        style={{ backgroundColor: currentColumn?.color }}
                      ></div>
                      {currentColumn?.title}
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    {columns.map((column) => {
                      return (
                        <DropdownMenuItem
                          key={column.id}
                          disabled={column.id === task.columnId}
                          onClick={() => {
                            return handleTransition(column.id);
                          }}
                        >
                          <div className='flex items-center gap-2'>
                            <div
                              className='w-2 h-2 rounded-full'
                              style={{ backgroundColor: column.color }}
                            ></div>
                            {column.title}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant='ghost'
                  className='px-3 py-1.5 h-auto gap-2 rounded-md font-medium text-sm flex items-center'
                  style={{
                    backgroundColor: `${currentColumn?.color}30`,
                    color: currentColumn?.color,
                  }}
                  onClick={() => {
                    return setEditingStatus(true);
                  }}
                >
                  <div
                    className='w-2 h-2 rounded-full'
                    style={{ backgroundColor: currentColumn?.color }}
                  ></div>
                  {currentColumn?.title}
                </Button>
              )}
            </div>

            {/* Title - click to edit */}
            {editingTitle ? (
              <div className='mb-6'>
                <Input
                  value={editedTitle}
                  onChange={(e) => {
                    return setEditedTitle(e.target.value);
                  }}
                  className='text-xl font-medium'
                  autoFocus
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle();
                    if (e.key === 'Escape') {
                      setEditedTitle(task.title);
                      setEditingTitle(false);
                    }
                  }}
                />
                <div className='text-xs text-muted-foreground mt-1'>
                  Press Enter to save or Esc to cancel
                </div>
              </div>
            ) : (
              <h2
                className='text-xl font-medium mb-6 cursor-pointer hover:bg-muted/50 px-2 py-1 -mx-2 rounded-md'
                onClick={() => {
                  return setEditingTitle(true);
                }}
              >
                {task.title}
              </h2>
            )}

            {/* Description - click to edit */}
            <div className='mb-8'>
              <div className='mb-3 font-medium text-sm'>
                <span>Description</span>
              </div>

              {editingDescription ? (
                <div>
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => {
                      return setEditedDescription(e.target.value);
                    }}
                    placeholder='Add a description...'
                    className='min-h-[200px]'
                    autoFocus
                    onBlur={saveDescription}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) saveDescription();
                      if (e.key === 'Escape') {
                        setEditedDescription(task.description || '');
                        setEditingDescription(false);
                      }
                    }}
                  />
                  <div className='text-xs text-muted-foreground mt-1'>
                    Press Ctrl+Enter to save or Esc to cancel
                  </div>
                </div>
              ) : (
                <div
                  className='text-sm border rounded-md p-4 bg-muted/20 whitespace-pre-wrap min-h-[100px] cursor-pointer hover:bg-muted/30'
                  onClick={() => {
                    return setEditingDescription(true);
                  }}
                >
                  {task.description || 'Click to add a description...'}
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
              <TabsList className='w-full justify-start mb-6'>
                <TabsTrigger value='attachments' className='flex items-center gap-2'>
                  <Paperclip size={14} />
                  <span>Attachments</span>
                </TabsTrigger>
                <TabsTrigger value='comments' className='flex items-center gap-2'>
                  <MessageSquare size={14} />
                  <span>Comments</span>
                  <Badge variant='outline' className='ml-1 rounded-full'>
                    {comments.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value='activity' className='flex items-center gap-2'>
                  <Activity size={14} />
                  <span>Activity</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value='attachments' className='mt-0'>
                <div className='border-2 border-dashed rounded-md p-6 text-center'>
                  <Paperclip className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
                  <h3 className='font-medium mb-1'>Drop files to attach</h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    or select files from your computer
                  </p>
                  <Button size='sm' variant='outline'>
                    Upload files
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value='comments' className='mt-0'>
                <div className='space-y-5'>
                  <div className='flex gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage src='/avatars/03.png' alt='Your avatar' />
                      <AvatarFallback>YOU</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 space-y-2'>
                      <Textarea
                        placeholder='Add a comment...'
                        className='resize-none'
                        value={commentText}
                        onChange={(e) => {
                          return setCommentText(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.metaKey) {
                            handleAddComment();
                          }
                        }}
                      />
                      <div className='flex justify-between items-center'>
                        <div className='text-xs text-muted-foreground'>
                          Press <kbd className='border rounded px-1'>⌘</kbd> +{' '}
                          <kbd className='border rounded px-1'>Enter</kbd> to submit
                        </div>
                        <Button size='sm' onClick={handleAddComment}>
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className='max-h-[300px]'>
                    <div className='space-y-6'>
                      {comments.map((comment) => {
                        return (
                          <div key={comment.id} className='flex gap-3'>
                            <Avatar className='h-8 w-8'>
                              <AvatarImage src={comment.avatar} alt={comment.author} />
                              <AvatarFallback>{comment.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='font-medium text-sm'>{comment.author}</span>
                                <span className='text-xs text-muted-foreground'>
                                  {comment.time}
                                </span>
                              </div>
                              <div className='text-sm'>{comment.content}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value='activity' className='mt-0'>
                <ScrollArea className='max-h-[400px]'>
                  <div className='space-y-4'>
                    <div className='flex gap-3'>
                      <div className='text-blue-500'>
                        <Activity size={16} />
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-sm'>System</span>
                          <span className='text-xs text-muted-foreground'>1 hour ago</span>
                        </div>
                        <p className='text-sm'>
                          Status changed from <span className='font-medium'>To Do</span> to{' '}
                          <span className='font-medium' style={{ color: currentColumn?.color }}>
                            {currentColumn?.title}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className='flex gap-3'>
                      <div className='text-blue-500'>
                        <User size={16} />
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium text-sm'>John Doe</span>
                          <span className='text-xs text-muted-foreground'>2 days ago</span>
                        </div>
                        <p className='text-sm'>Created this task</p>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar */}
          <div className='w-[320px] border-l overflow-auto'>
            <div className='p-6 space-y-6'>
              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>STATUS</h3>
                <div
                  className='flex items-center gap-2 p-3 rounded-md font-medium text-sm cursor-pointer hover:bg-muted/40 transition-colors'
                  style={{
                    backgroundColor: `${currentColumn?.color}30`,
                    color: currentColumn?.color,
                  }}
                  onClick={() => {
                    return setEditingStatus(true);
                  }}
                >
                  <div
                    className='w-2 h-2 rounded-full'
                    style={{ backgroundColor: currentColumn?.color }}
                  ></div>
                  {currentColumn?.title}
                </div>
              </div>

              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>ASSIGNEE</h3>
                {editingAssignee ? (
                  <DropdownMenu
                    open={true}
                    onOpenChange={(open) => {
                      return !open && setEditingAssignee(false);
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='w-full justify-start'>
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-6 w-6'>
                            <AvatarImage src='/avatars/01.png' alt='John Doe' />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <span className='text-sm'>John Doe</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start'>
                      <DropdownMenuItem
                        onClick={() => {
                          return setEditingAssignee(false);
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-6 w-6'>
                            <AvatarImage src='/avatars/01.png' alt='John Doe' />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <span className='text-sm'>John Doe</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          return setEditingAssignee(false);
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-6 w-6'>
                            <AvatarImage src='/avatars/02.png' alt='Sarah Smith' />
                            <AvatarFallback>SS</AvatarFallback>
                          </Avatar>
                          <span className='text-sm'>Sarah Smith</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          return setEditingAssignee(false);
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-6 w-6'>
                            <AvatarImage src='/avatars/03.png' alt='You' />
                            <AvatarFallback>YOU</AvatarFallback>
                          </Avatar>
                          <span className='text-sm'>Assign to me</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div
                    className='flex items-center gap-2 p-3 rounded-md cursor-pointer hover:bg-muted/40 transition-colors'
                    onClick={() => {
                      return setEditingAssignee(true);
                    }}
                  >
                    <Avatar className='h-6 w-6'>
                      <AvatarImage src='/avatars/01.png' alt='John Doe' />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className='text-sm'>John Doe</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>REPORTER</h3>
                <div className='flex items-center gap-2 p-3'>
                  <Avatar className='h-6 w-6'>
                    <AvatarImage src='/avatars/02.png' alt='Sarah Smith' />
                    <AvatarFallback>SS</AvatarFallback>
                  </Avatar>
                  <span className='text-sm'>Sarah Smith</span>
                </div>
              </div>

              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>PRIORITY</h3>
                {editingPriority ? (
                  <DropdownMenu
                    open={true}
                    onOpenChange={(open) => {
                      return !open && setEditingPriority(false);
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='w-full justify-start gap-2'>
                        <Badge className='bg-yellow-500 hover:bg-yellow-600'>Medium</Badge>
                        <span className='text-sm'>Priority</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start'>
                      <DropdownMenuItem
                        onClick={() => {
                          return setEditingPriority(false);
                        }}
                      >
                        <Badge className='bg-red-500 hover:bg-red-600 mr-2'>High</Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          return setEditingPriority(false);
                        }}
                      >
                        <Badge className='bg-yellow-500 hover:bg-yellow-600 mr-2'>Medium</Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          return setEditingPriority(false);
                        }}
                      >
                        <Badge className='bg-green-500 hover:bg-green-600 mr-2'>Low</Badge>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div
                    className='flex items-center gap-2 p-3 rounded-md cursor-pointer hover:bg-muted/40 transition-colors'
                    onClick={() => {
                      return setEditingPriority(true);
                    }}
                  >
                    <Badge className='bg-yellow-500 hover:bg-yellow-600'>Medium</Badge>
                    <span className='text-sm'>Priority</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>DUE DATE</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal text-sm h-9 hover:bg-muted/40'
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dueDate ? dueDate.toDateString() : 'Set due date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <CalendarComponent
                      mode='single'
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>TIME TRACKING</h3>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <Timer size={14} className='text-muted-foreground' />
                    <div className='flex-1'>
                      <Progress value={62.5} className='h-2' />
                    </div>
                    <span className='text-xs'>{timeTracking.remainingEstimate}</span>
                  </div>
                  <div className='flex justify-between text-xs text-muted-foreground'>
                    <span>Logged: {timeTracking.timeSpent}</span>
                    <span>Estimated: {timeTracking.originalEstimate}</span>
                  </div>
                  <Button variant='outline' size='sm' className='w-full text-xs justify-center'>
                    Log time
                  </Button>
                </div>
              </div>

              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>LABELS</h3>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant='outline' className='bg-muted/50'>
                    frontend
                  </Badge>
                  <Badge variant='outline' className='bg-muted/50'>
                    design
                  </Badge>
                  <Badge variant='outline' className='bg-muted/50 cursor-pointer'>
                    + Add
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>DATES</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar size={14} />
                      <span>Created</span>
                    </div>
                    <span className='text-sm'>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar size={14} />
                      <span>Updated</span>
                    </div>
                    <span className='text-sm'>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SortableTaskCard = ({ task, onTaskClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className='mb-2 shadow-sm cursor-grab'
        onClick={(e) => {
          // Only open dialog when clicking on the card, not when starting to drag
          const target = e.target as HTMLElement;
          const currentTarget = e.currentTarget as HTMLElement;
          if (currentTarget.contains(target)) {
            onTaskClick(task);
          }
        }}
      >
        <CardContent className='p-3'>
          <h4 className='font-medium text-sm text-wrap break-all'>{task.title}</h4>
          {task.description && (
            <p className='text-xs text-muted-foreground mt-1'>{task.description}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Non-draggable version of TaskCard for server-side rendering
const StaticTaskCard = ({ task, onTaskClick }) => {
  return (
    <div>
      <Card
        className='mb-2 shadow-sm cursor-pointer'
        onClick={() => {
          return onTaskClick(task);
        }}
      >
        <CardContent className='p-3'>
          <h4 className='font-medium text-sm text-wrap break-all'>{task.title}</h4>
          {task.description && (
            <p className='text-xs text-muted-foreground mt-1'>{task.description}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const TaskCard = ({ task }) => {
  return (
    <Card className='mb-2 shadow-sm'>
      <CardContent className='p-3'>
        <h4 className='font-medium text-sm'>{task.title}</h4>
        {task.description && (
          <p className='text-xs text-muted-foreground mt-1'>{task.description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const NewTaskInput = ({ value, onChange, onSave, onCancel }) => {
  return (
    <Card className='mb-2 border border-dashed border-border'>
      <CardContent className='p-3 flex items-center space-x-2 relative'>
        <input
          autoFocus
          value={value}
          onChange={(e) => {
            return onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder='New task title'
          className='flex-1 bg-transparent outline-none text-sm'
        />
        <button
          onClick={onSave}
          className='bg-black text-white rounded px-2 py-1 flex items-center gap-1 text-xs font-medium absolute right-2'
        >
          Save <CommandShortcut className='text-white'>⏎</CommandShortcut>
        </button>
      </CardContent>
    </Card>
  );
};

const ProjectKanban = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [columns, setColumns] = useState([
    { id: 'todo', title: 'To Do', color: '#e2e8f0' },
    { id: 'in-progress', title: 'In Progress', color: '#bfdbfe' },
    { id: 'review', title: 'Review', color: '#fef3c7' },
    { id: 'done', title: 'Done', color: '#dcfce7' },
  ]);

  const initialTasks = [
    {
      id: '1',
      title: 'Research design options',
      description: 'Look for inspiration',
      columnId: 'todo',
    },
    { id: '2', title: 'Create wireframes', description: 'For main screens', columnId: 'todo' },
    {
      id: '3',
      title: 'Develop homepage',
      description: 'Implement basic structure',
      columnId: 'in-progress',
    },
    { id: '4', title: 'Design review', description: 'With client', columnId: 'review' },
    {
      id: '5',
      title: 'Fix navigation bugs',
      description: 'Mobile menu issues',
      columnId: 'in-progress',
    },
    { id: '6', title: 'Update documentation', description: 'Add recent changes', columnId: 'done' },
  ];

  const [columnsTasks, setColumnsTasks] = useState({
    todo: initialTasks.filter((t) => {
      return t.columnId === 'todo';
    }),
    'in-progress': initialTasks.filter((t) => {
      return t.columnId === 'in-progress';
    }),
    review: initialTasks.filter((t) => {
      return t.columnId === 'review';
    }),
    done: initialTasks.filter((t) => {
      return t.columnId === 'done';
    }),
  });

  const [activeTask, setActiveTask] = useState(null);
  const [addingColumn, setAddingColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<{ [key: string]: any[] }>({ ...columnsTasks });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findContainer = (id: string) => {
    return (Object.keys(columnsTasks) as Array<keyof typeof columnsTasks>).find((col) => {
      return columnsTasks[col].some((t) => {
        return t.id === id;
      });
    });
  };

  // Alternative implementation that would be used with a real backend
  // This demonstrates how to find a container using columnId rather than an array search
  const findContainerById = (taskId: string) => {
    // In a real implementation with MongoDB, you might do:
    // 1. First find the task by ID from a tasks collection
    // 2. Then use its columnId reference to get the column

    // Simulated version for our current data structure:
    for (const colId in columnsTasks) {
      const task = columnsTasks[colId].find((t) => {
        return t.id === taskId;
      });
      if (task) {
        return task.columnId;
      }
    }
    return null;
  };

  const handleAddClick = (columnId: string) => {
    setAddingColumn(columnId);
    setNewTaskTitle('');
  };

  const handleSaveNew = () => {
    if (!addingColumn || !newTaskTitle.trim()) return;
    const id = Date.now().toString();
    const newTask = {
      id,
      title: newTaskTitle.trim(),
      description: '',
      columnId: addingColumn,
    };
    setColumnsTasks((prev) => {
      return {
        ...prev,
        [addingColumn]: [...prev[addingColumn], newTask],
      };
    });
    setAddingColumn(null);
    setNewTaskTitle('');
  };

  const handleCancelNew = () => {
    setAddingColumn(null);
    setNewTaskTitle('');
  };

  const handleDragStart = ({ active }) => {
    const from = findContainer(active.id)!;
    setActiveTask(
      columnsTasks[from].find((t) => {
        return t.id === active.id;
      })!,
    );
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const overId = over.data?.current?.sortable?.containerId ?? over.id;
    const fromCol = findContainer(active.id)!;
    const toCol = columnsTasks.hasOwnProperty(overId)
      ? (overId as keyof typeof columnsTasks)
      : findContainer(over.id)!;

    if (fromCol && toCol && fromCol !== toCol) {
      const sourceItems = columnsTasks[fromCol].filter((t) => {
        return t.id !== active.id;
      });
      const destItems = [...columnsTasks[toCol]];
      const overIndex = destItems.findIndex((t) => {
        return t.id === over.id;
      });
      const insertIndex = overIndex >= 0 ? overIndex : destItems.length;

      // Update task's columnId when moved to another column
      const updatedTask = { ...activeTask!, columnId: toCol };
      destItems.splice(insertIndex, 0, updatedTask);

      setColumnsTasks((prev) => {
        return {
          ...prev,
          [fromCol]: sourceItems,
          [toCol]: destItems,
        };
      });
      return;
    }

    if (fromCol === toCol) {
      const items = columnsTasks[fromCol];
      const oldIndex = items.findIndex((t) => {
        return t.id === active.id;
      });
      const newIndex = items.findIndex((t) => {
        return t.id === over.id;
      });
      if (oldIndex !== newIndex && newIndex >= 0) {
        setColumnsTasks((prev) => {
          return {
            ...prev,
            [fromCol]: arrayMove(prev[fromCol], oldIndex, newIndex),
          };
        });
      }
    }
  };

  const handleDragEnd = () => {
    setActiveTask(null);
  };

  // Count total tasks and filtered tasks
  const getTotalTaskCount = () => {
    return Object.values(columnsTasks).reduce((acc, tasks) => {
      return acc + tasks.length;
    }, 0);
  };

  const getFilteredTaskCount = () => {
    return Object.values(filteredTasks).reduce((acc, tasks) => {
      return acc + tasks.length;
    }, 0);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTasks({ ...columnsTasks });
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = Object.fromEntries(
      Object.entries(columnsTasks).map(([colId, tasks]) => {
        return [
          colId,
          tasks.filter((task) => {
            return (
              task.title.toLowerCase().includes(lowerQuery) ||
              (task.description && task.description.toLowerCase().includes(lowerQuery))
            );
          }),
        ];
      }),
    );
    setFilteredTasks(filtered);
  };

  // Handle adding a new column
  const handleAddColumn = (name: string, color: string) => {
    // Generate a unique ID (in a real app with MongoDB, you would use ObjectId)
    const id = `col-${Date.now()}`;
    setColumns((prev) => {
      return [...prev, { id, title: name, color }];
    });
    setColumnsTasks((prev) => {
      return { ...prev, [id]: [] };
    });
    setFilteredTasks((prev) => {
      return { ...prev, [id]: [] };
    });
  };

  useEffect(() => {
    // Update filtered tasks whenever columns tasks change
    if (!searchQuery) {
      setFilteredTasks({ ...columnsTasks });
    } else {
      handleSearch(searchQuery);
    }
  }, [columnsTasks]);

  const [boardActionsOpen, setBoardActionsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [editColumnName, setEditColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#e2e8f0');

  // Handle editing a column name
  const handleEditColumn = (columnId, newName) => {
    setColumns((prev) => {
      return prev.map((col) => {
        return col.id === columnId ? { ...col, title: newName } : col;
      });
    });
  };

  // Handle removing a column
  const handleRemoveColumn = (columnId) => {
    setColumns((prev) => {
      return prev.filter((col) => {
        return col.id !== columnId;
      });
    });

    // Remove tasks from this column
    setColumnsTasks((prev) => {
      const newTasks = { ...prev };
      delete newTasks[columnId];
      return newTasks;
    });

    setFilteredTasks((prev) => {
      const newFiltered = { ...prev };
      delete newFiltered[columnId];
      return newFiltered;
    });
  };

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Handle opening the task detail dialog
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  // Handle updating a task
  const handleTaskUpdate = (updatedTask) => {
    // Get current column and destination column
    const currentColumnId = findContainer(updatedTask.id);
    const targetColumnId = updatedTask.columnId;

    if (currentColumnId === targetColumnId) {
      // Update task within the same column
      setColumnsTasks((prev) => {
        return {
          ...prev,
          [currentColumnId]: prev[currentColumnId].map((t) => {
            return t.id === updatedTask.id ? updatedTask : t;
          }),
        };
      });
    } else {
      // Move task to another column
      setColumnsTasks((prev) => {
        const sourceItems = prev[currentColumnId].filter((t) => {
          return t.id !== updatedTask.id;
        });
        const destItems = [...prev[targetColumnId], updatedTask];

        return {
          ...prev,
          [currentColumnId]: sourceItems,
          [targetColumnId]: destItems,
        };
      });
    }
  };

  // Render a simplified version for server-side rendering
  if (!mounted) {
    return (
      <div className='w-full'>
        <KanbanHeader
          title='Project Kanban Board'
          totalTasks={getTotalTaskCount()}
          filteredTasks={getFilteredTaskCount()}
          onSearch={handleSearch}
          onAddColumn={handleAddColumn}
          onBoardActions={() => {
            return setBoardActionsOpen(true);
          }}
        />
        <div className='w-full overflow-x-auto pb-4'>
          <div className='flex gap-4 p-2'>
            {columns.map((col) => {
              return (
                <div key={col.id} className='group flex flex-col min-w-[250px]'>
                  <div
                    className='px-3 py-2 rounded-t-lg border border-border'
                    style={{
                      backgroundColor: `${col.color}30`,
                      borderBottomColor: col.color,
                    }}
                  >
                    <h3 className='font-medium text-sm'>{col.title}</h3>
                  </div>
                  <div className='p-3 rounded-b-lg border border-t-0 border-border min-h-[300px] space-y-2'>
                    {(filteredTasks[col.id] || []).map((task) => {
                      return (
                        <StaticTaskCard key={task.id} task={task} onTaskClick={handleTaskClick} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <KanbanHeader
        title='Project Kanban Board'
        totalTasks={getTotalTaskCount()}
        filteredTasks={getFilteredTaskCount()}
        onSearch={handleSearch}
        onAddColumn={handleAddColumn}
        onBoardActions={() => {
          return setBoardActionsOpen(true);
        }}
      />
      <div className='w-full overflow-x-auto pb-4'>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className='flex gap-4 p-2'>
            {columns.map((col) => {
              return (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  onAddClick={handleAddClick}
                  isAdding={addingColumn === col.id}
                >
                  <SortableContext
                    id={col.id}
                    items={
                      filteredTasks[col.id]?.map((t) => {
                        return t.id;
                      }) || []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    {(filteredTasks[col.id] || []).map((task) => {
                      return (
                        <SortableTaskCard key={task.id} task={task} onTaskClick={handleTaskClick} />
                      );
                    })}
                  </SortableContext>
                  {addingColumn === col.id && (
                    <NewTaskInput
                      value={newTaskTitle}
                      onChange={setNewTaskTitle}
                      onSave={handleSaveNew}
                      onCancel={handleCancelNew}
                    />
                  )}
                </KanbanColumn>
              );
            })}
          </div>

          {createPortal(
            <DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>

      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onTaskUpdate={handleTaskUpdate}
          columns={columns}
        />
      )}

      <Dialog open={boardActionsOpen} onOpenChange={setBoardActionsOpen}>
        <DialogContent className='sm:max-w-md'>
          <Button
            className='absolute top-2 right-2'
            variant='ghost'
            onClick={() => {
              return setBoardActionsOpen(false);
            }}
          >
            <X size={12} />
          </Button>
          <DialogHeader>
            <DialogTitle>Board Columns</DialogTitle>
            <DialogDescription>
              Manage your board columns. Edit, add, or remove columns.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4 max-h-[60vh] overflow-y-auto'>
            {columns.map((column) => {
              return (
                <div
                  key={column.id}
                  className={`border rounded-md overflow-hidden ${
                    editingColumn === column.id ? 'shadow-md' : ''
                  }`}
                  style={{ borderLeftColor: column.color, borderLeftWidth: '4px' }}
                >
                  {editingColumn === column.id ? (
                    <div className='p-4 space-y-4'>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>Column Name</label>
                        <Input
                          value={editColumnName}
                          onChange={(e) => {
                            return setEditColumnName(e.target.value);
                          }}
                          className='w-full h-10'
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditColumn(column.id, editColumnName);
                              setEditingColumn(null);
                            } else if (e.key === 'Escape') {
                              setEditingColumn(null);
                            }
                          }}
                        />
                      </div>

                      <div className='space-y-2'>
                        <label className='text-sm font-medium'>Column Color</label>
                        <ColorPicker
                          value={column.color}
                          onChange={(color) => {
                            setColumns((prev) => {
                              return prev.map((col) => {
                                return col.id === column.id ? { ...col, color } : col;
                              });
                            });
                          }}
                          label=''
                        />
                      </div>

                      <div className='flex justify-end gap-2 pt-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            return setEditingColumn(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant='default'
                          size='sm'
                          onClick={() => {
                            handleEditColumn(column.id, editColumnName);
                            setEditingColumn(null);
                          }}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center justify-between p-3'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='w-4 h-4 rounded-full'
                          style={{ backgroundColor: column.color }}
                        ></div>
                        <span className='font-medium'>{column.title}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setEditColumnName(column.title);
                            setEditingColumn(column.id);
                          }}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return handleRemoveColumn(column.id);
                          }}
                          disabled={Object.keys(columnsTasks).length <= 1}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className='space-y-4 pt-4 border-t'>
            <h3 className='font-medium'>Add New Column</h3>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Column Name</label>
                <Input
                  placeholder='New column name'
                  value={newColumnName}
                  className='h-10'
                  onChange={(e) => {
                    return setNewColumnName(e.target.value);
                  }}
                />
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Column Color</label>
                <ColorPicker
                  value={newColumnColor}
                  onChange={(color) => {
                    return setNewColumnColor(color);
                  }}
                  label=''
                />
              </div>

              <div className='flex justify-end'>
                <Button
                  onClick={() => {
                    if (newColumnName.trim()) {
                      handleAddColumn(newColumnName, newColumnColor);
                      setNewColumnName('');
                      setNewColumnColor('#e2e8f0');
                    }
                  }}
                >
                  <Plus size={16} className='mr-2' /> Add Column
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectKanban;
