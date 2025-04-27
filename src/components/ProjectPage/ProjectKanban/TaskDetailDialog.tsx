'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
  Activity,
  ArrowUpRight,
  Calendar,
  CalendarIcon,
  Coffee,
  FileImage,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Timer,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Define task and column types for type safety
type Task = {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
  reporter?: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate?: Date;
};

type Column = {
  id: string;
  title: string;
  color: string;
  taskIds?: string[];
};

// Define props interface
interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: (updatedTask: Task) => void;
  columns: Column[];
}

// Define the attachment type for type safety
type Attachment = {
  id: string;
  type: string;
  url: string;
  title: string;
  icon: React.ReactNode;
  size?: number;
};

type Comment = {
  id: number;
  author: string;
  content: string;
  time: string;
  avatar: string;
};

type TimeTracking = {
  originalEstimate: string;
  timeSpent: string;
  remainingEstimate: string;
};

// TaskDetailDialog component to display and edit task details
const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  open,
  onOpenChange,
  onTaskUpdate,
  columns,
}) => {
  // Individual edit states for each field rather than a global edit mode
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedColumnId, setEditedColumnId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('attachments');
  const [dueDate, setDueDate] = useState<Date | null>(null);

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

  const [comments, setComments] = useState<Comment[]>([
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

  const [timeTracking, setTimeTracking] = useState<TimeTracking>({
    originalEstimate: '4h',
    timeSpent: '2h 30m',
    remainingEstimate: '1h 30m',
  });

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditedColumnId(task.columnId);
      setDueDate(task.dueDate || null);
    }
  }, [task]);

  // Save individual field changes
  const saveTitle = () => {
    if (!task || !editedTitle.trim()) return;

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

  const saveColumnId = (columnId: string) => {
    if (!task) return;

    onTaskUpdate({
      ...task,
      columnId,
    });

    setEditingStatus(false);
    setEditedColumnId(columnId);
  };

  const saveDueDate = (date: Date | null) => {
    if (!task) return;

    onTaskUpdate({
      ...task,
      dueDate: date || undefined,
    });
  };

  const savePriority = (priority: 'low' | 'medium' | 'high') => {
    if (!task) return;

    onTaskUpdate({
      ...task,
      priority,
    });

    setEditingPriority(false);
  };

  const saveAssignee = (assignee: { id: string; name: string; avatar: string }) => {
    if (!task) return;

    onTaskUpdate({
      ...task,
      assignee,
    });

    setEditingAssignee(false);
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

  const handleDeleteAttachment = (id: string) => {
    setAttachments(
      attachments.filter((attachment) => {
        return attachment.id !== id;
      }),
    );
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

  const handleLogTime = () => {
    // In a real app, this would open a time logging dialog
    console.log('Log time clicked');
  };

  if (!task) return null;

  const currentColumn =
    columns.find((col) => {
      return col.id === task.columnId;
    }) || columns[0];
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

        {/* Add DialogTitle for accessibility */}
        <DialogTitle className='sr-only'>{task.title}</DialogTitle>

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
                          onClick={() => {
                            return handleDeleteAttachment(attachment.id);
                          }}
                        >
                          <X size={10} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
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
                  <label htmlFor='file-upload-2'>
                    <Button size='sm' variant='outline' asChild>
                      <span>Upload files</span>
                    </Button>
                  </label>
                  <input
                    id='file-upload-2'
                    type='file'
                    className='sr-only'
                    multiple
                    onChange={handleFileUpload}
                  />
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
                <Popover>
                  <PopoverTrigger asChild>
                    <div
                      className='flex items-center gap-2 p-3 rounded-md font-medium text-sm cursor-pointer hover:bg-muted/40 transition-colors'
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
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align='start' className='p-1'>
                    <div className='space-y-1'>
                      {columns.map((column) => {
                        return (
                          <Button
                            key={column.id}
                            variant='ghost'
                            className='w-full justify-start'
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
                          </Button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
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
                          return saveAssignee({
                            id: '1',
                            name: 'John Doe',
                            avatar: '/avatars/01.png',
                          });
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
                          return saveAssignee({
                            id: '2',
                            name: 'Sarah Smith',
                            avatar: '/avatars/02.png',
                          });
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
                          return saveAssignee({
                            id: '3',
                            name: 'You',
                            avatar: '/avatars/03.png',
                          });
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
                      <AvatarImage
                        src={task.assignee?.avatar || '/avatars/01.png'}
                        alt={task.assignee?.name || 'John Doe'}
                      />
                      <AvatarFallback>{(task.assignee?.name || 'John Doe')[0]}</AvatarFallback>
                    </Avatar>
                    <span className='text-sm'>{task.assignee?.name || 'John Doe'}</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className='text-sm text-muted-foreground mb-2'>REPORTER</h3>
                <div className='flex items-center gap-2 p-3'>
                  <Avatar className='h-6 w-6'>
                    <AvatarImage
                      src={task.reporter?.avatar || '/avatars/02.png'}
                      alt={task.reporter?.name || 'Sarah Smith'}
                    />
                    <AvatarFallback>{(task.reporter?.name || 'Sarah Smith')[0]}</AvatarFallback>
                  </Avatar>
                  <span className='text-sm'>{task.reporter?.name || 'Sarah Smith'}</span>
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
                        <Badge className='bg-yellow-500 hover:bg-yellow-600'>
                          {task.priority || 'Medium'}
                        </Badge>
                        <span className='text-sm'>Priority</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start'>
                      <DropdownMenuItem
                        onClick={() => {
                          return savePriority('high');
                        }}
                      >
                        <Badge className='bg-red-500 hover:bg-red-600 mr-2'>High</Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          return savePriority('medium');
                        }}
                      >
                        <Badge className='bg-yellow-500 hover:bg-yellow-600 mr-2'>Medium</Badge>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          return savePriority('low');
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
                    <Badge
                      className={
                        task.priority === 'high'
                          ? 'bg-red-500 hover:bg-red-600'
                          : task.priority === 'low'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-yellow-500 hover:bg-yellow-600'
                      }
                    >
                      {task.priority || 'Medium'}
                    </Badge>
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
                      onSelect={(date) => {
                        setDueDate(date);
                        saveDueDate(date);
                      }}
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
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full text-xs justify-center'
                    onClick={handleLogTime}
                  >
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

export default TaskDetailDialog;
