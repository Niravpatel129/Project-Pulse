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
  labels?: string[];
  storyPoints?: number;
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
  const [editingStoryPoints, setEditingStoryPoints] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedColumnId, setEditedColumnId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
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

  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');
  const [labels, setLabels] = useState<string[]>(['frontend', 'design']);

  // Add state for story points
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditedColumnId(task.columnId);
      setDueDate(task.dueDate || null);

      // Reset labels when task changes
      setLabels(task.labels || ['frontend', 'design']); // Assuming task has labels property

      // Set story points when task changes
      setStoryPoints(task.storyPoints);
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

    // Update the local state first for immediate UI feedback
    setEditedColumnId(columnId);

    // Then update the task via the callback
    onTaskUpdate({
      ...task,
      columnId,
    });

    // Close the dropdown
    setEditingStatus(false);
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

  const handleAddLabel = () => {
    if (!newLabelText.trim()) return;

    const updatedLabels = [...labels, newLabelText.trim()];
    setLabels(updatedLabels);

    // Update task with new labels
    if (task) {
      onTaskUpdate({
        ...task,
        labels: updatedLabels,
      });
    }

    setNewLabelText('');
    setShowLabelInput(false);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const updatedLabels = labels.filter((label) => {
      return label !== labelToRemove;
    });
    setLabels(updatedLabels);

    // Update task with new labels
    if (task) {
      onTaskUpdate({
        ...task,
        labels: updatedLabels,
      });
    }
  };

  // Add function to save story points
  const saveStoryPoints = (points: number | undefined) => {
    if (!task) return;

    setStoryPoints(points);
    onTaskUpdate({
      ...task,
      storyPoints: points,
    });
    setEditingStoryPoints(false);
  };

  if (!task) return null;

  // Use editedColumnId instead of task.columnId to ensure UI updates immediately
  const currentColumn =
    columns.find((col) => {
      // Use editedColumnId for local state representation
      return col.id === editedColumnId;
    }) || columns[0];

  // Create a JIRA-like ID from the task id
  const ticketId = `PULSE-${task.id}`;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden rounded-lg border shadow-lg'>
          {/* Header - Improved with better layout and visual hierarchy */}
          <div className='px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-white'>
            <div className='flex items-center gap-4'>
              <span className='text-sm font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded'>
                {ticketId}
              </span>
              {storyPoints !== undefined && (
                <Badge
                  variant='outline'
                  className='bg-blue-100 text-blue-800 font-medium border-blue-200'
                >
                  {storyPoints} {storyPoints === 1 ? 'point' : 'points'}
                </Badge>
              )}
              <Button
                variant='outline'
                size='sm'
                className='h-8 transition-all hover:bg-blue-50 hover:text-blue-700'
              >
                <ArrowUpRight size={14} className='mr-1' />
                Open
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 hover:bg-muted/80'>
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem className='text-red-600'>Delete task</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 hover:bg-muted/80'
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
              {/* Title - click to edit with better visual indication */}
              {editingTitle ? (
                <div className='mb-6'>
                  <Input
                    value={editedTitle}
                    onChange={(e) => {
                      return setEditedTitle(e.target.value);
                    }}
                    className='text-xl font-medium border-blue-200 focus-visible:ring-blue-500'
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
                  <div className='text-xs text-blue-500 mt-1 flex items-center gap-1'>
                    <kbd className='px-1 py-0.5 text-xs rounded border bg-gray-50'>Enter</kbd> to
                    save or
                    <kbd className='px-1 py-0.5 text-xs rounded border bg-gray-50'>Esc</kbd> to
                    cancel
                  </div>
                </div>
              ) : (
                <h2
                  className='text-xl font-medium mb-6 cursor-pointer px-3 py-2 -mx-3 rounded-md border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-2'
                  onClick={() => {
                    return setEditingTitle(true);
                  }}
                >
                  {task.title}
                  <span className='text-xs text-blue-500 opacity-0 group-hover:opacity-100'>
                    (Click to edit)
                  </span>
                </h2>
              )}

              {/* Attachment Action Bar - Modernized with better grouping */}
              <div className='mb-8 bg-muted/20 rounded-lg p-4 border'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-sm font-semibold flex items-center gap-2'>
                    <Paperclip size={16} className='text-blue-500' />
                    Attachments & Links
                  </h3>
                  <div className='flex gap-2'>
                    <input
                      type='file'
                      id='file-upload'
                      className='sr-only'
                      multiple
                      onChange={handleFileUpload}
                    />
                    <label htmlFor='file-upload'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-8 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors'
                        asChild
                      >
                        <span>
                          <Paperclip size={14} className='mr-1' />
                          File
                        </span>
                      </Button>
                    </label>

                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors'
                      onClick={() => {
                        return setShowLinkInput(true);
                      }}
                    >
                      <LinkIcon size={14} className='mr-1' />
                      Link
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors'
                        >
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
                  <div className='flex items-center gap-2 mt-2 mb-3 bg-white p-2 rounded-md border'>
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
                    <Button
                      size='sm'
                      onClick={handleAddLink}
                      className='bg-blue-600 hover:bg-blue-700'
                    >
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
                          className='flex items-center gap-2 bg-white rounded-md border px-3 py-2 text-sm hover:border-blue-200 transition-colors group'
                        >
                          <div className='text-blue-500'>{attachment.icon}</div>
                          <span className='font-medium'>{attachment.title}</span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-5 w-5 p-0 ml-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                            onClick={() => {
                              return handleDeleteAttachment(attachment.id);
                            }}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Description - click to edit with improved visual cues */}
              <div className='mb-8'>
                <div className='mb-3 font-medium text-sm flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <FileText size={16} className='text-blue-500' />
                    <span>Description</span>
                  </div>
                  {!editingDescription && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                      onClick={() => {
                        return setEditingDescription(true);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </div>

                {editingDescription ? (
                  <div>
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => {
                        return setEditedDescription(e.target.value);
                      }}
                      placeholder='Add a description...'
                      className='min-h-[200px] border-blue-200 focus-visible:ring-blue-500'
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
                    <div className='mt-2 flex justify-between items-center'>
                      <div className='text-xs text-blue-500 flex items-center gap-1'>
                        Press{' '}
                        <kbd className='px-1 py-0.5 text-xs rounded border bg-gray-50'>Ctrl</kbd> +
                        <kbd className='px-1 py-0.5 text-xs rounded border bg-gray-50'>Enter</kbd>{' '}
                        to save
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => {
                            setEditedDescription(task.description || '');
                            setEditingDescription(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size='sm'
                          className='bg-blue-600 hover:bg-blue-700'
                          onClick={saveDescription}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className='text-sm border rounded-md p-4 bg-white whitespace-pre-wrap min-h-[100px] cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors'
                    onClick={() => {
                      return setEditingDescription(true);
                    }}
                  >
                    {task.description || (
                      <span className='text-muted-foreground italic flex items-center gap-2'>
                        <Plus size={14} /> Click to add a description
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                <TabsList className='w-full justify-start mb-4 bg-muted/30 p-1'>
                  <TabsTrigger
                    value='comments'
                    className='flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm'
                  >
                    <MessageSquare size={14} />
                    <span>Comments</span>
                    <Badge
                      variant='outline'
                      className='ml-1 rounded-full bg-blue-100 text-blue-700 border-blue-200'
                    >
                      {comments.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value='activity'
                    className='flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm'
                  >
                    <Activity size={14} />
                    <span>Activity</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='comments' className='mt-0'>
                  <div className='space-y-6'>
                    <div className='flex gap-3 bg-white rounded-lg p-4 border'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src='/avatars/03.png' alt='Your avatar' />
                        <AvatarFallback>YOU</AvatarFallback>
                      </Avatar>
                      <div className='flex-1 space-y-3'>
                        <Textarea
                          placeholder='Add a comment...'
                          className='resize-none min-h-[80px] border-muted focus-visible:ring-blue-500'
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
                          <div className='text-xs text-muted-foreground flex items-center gap-1'>
                            Press <kbd className='border rounded px-1 py-0.5 bg-muted/30'>⌘</kbd> +{' '}
                            <kbd className='border rounded px-1 py-0.5 bg-muted/30'>Enter</kbd> to
                            submit
                          </div>
                          <Button
                            size='sm'
                            onClick={handleAddComment}
                            className='bg-blue-600 hover:bg-blue-700'
                            disabled={!commentText.trim()}
                          >
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>

                    <ScrollArea className='max-h-[300px] pr-4'>
                      <div className='space-y-4'>
                        {comments.map((comment) => {
                          return (
                            <div key={comment.id} className='flex gap-3 group'>
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
                                <div className='text-sm bg-muted/20 p-3 rounded-lg'>
                                  {comment.content}
                                </div>
                                <div className='mt-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 text-xs text-muted-foreground'
                                  >
                                    Reply
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 text-xs text-muted-foreground'
                                  >
                                    React
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value='activity' className='mt-0'>
                  <ScrollArea className='max-h-[400px] pr-4'>
                    <div className='space-y-4'>
                      <div className='flex gap-3 p-2 hover:bg-muted/20 rounded-md transition-colors'>
                        <div className='text-blue-500 bg-blue-100 p-2 rounded-full h-8 w-8 flex items-center justify-center'>
                          <Activity size={14} />
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
                      <div className='flex gap-3 p-2 hover:bg-muted/20 rounded-md transition-colors'>
                        <div className='text-blue-500 bg-blue-100 p-2 rounded-full h-8 w-8 flex items-center justify-center'>
                          <User size={14} />
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

            {/* Right sidebar with improved styling */}
            <div className='w-[320px] border-l overflow-auto bg-gray-50'>
              <div className='p-6 space-y-6'>
                <div>
                  <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2'>
                    <Coffee size={14} className='text-blue-500' />
                    Story Points
                  </h3>
                  {editingStoryPoints ? (
                    <div className='space-y-3 bg-white p-3 rounded-lg border'>
                      <div className='grid grid-cols-4 gap-2'>
                        {/* Fibonacci sequence with better visual styling */}
                        {[1, 2, 3, 5, 8, 13].map((point) => {
                          return (
                            <Button
                              key={point}
                              variant={storyPoints === point ? 'default' : 'outline'}
                              size='sm'
                              className={`h-10 w-full p-0 ${
                                storyPoints === point
                                  ? 'bg-blue-600 hover:bg-blue-700'
                                  : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                              }`}
                              onClick={() => {
                                return saveStoryPoints(point);
                              }}
                            >
                              {point}
                            </Button>
                          );
                        })}
                        {/* Question mark for unknown/unclear */}
                        <Button
                          variant={storyPoints === 0 ? 'default' : 'outline'}
                          size='sm'
                          className={`h-10 w-full p-0 col-span-1 ${
                            storyPoints === 0
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                          }`}
                          onClick={() => {
                            return saveStoryPoints(0);
                          }}
                        >
                          ?
                        </Button>
                      </div>
                      <div className='flex justify-between'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return setEditingStoryPoints(false);
                          }}
                          className='hover:bg-red-50 hover:text-red-700'
                        >
                          Cancel
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return saveStoryPoints(undefined);
                          }}
                          className='hover:bg-blue-50 hover:text-blue-700'
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className='flex items-center gap-2 p-3 rounded-md text-sm cursor-pointer bg-white hover:bg-blue-50 transition-colors border shadow-sm'
                      onClick={() => {
                        return setEditingStoryPoints(true);
                      }}
                    >
                      {storyPoints !== undefined ? (
                        <div className='flex items-center justify-between w-full'>
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='h-8 w-8 rounded-full flex items-center justify-center bg-blue-100 border-blue-200 text-blue-700'
                            >
                              {storyPoints === 0 ? '?' : storyPoints}
                            </Badge>
                            <span>
                              {storyPoints === 0
                                ? 'Unknown'
                                : `${storyPoints} ${storyPoints === 1 ? 'point' : 'points'}`}
                            </span>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 w-7 p-0 text-muted-foreground hover:text-blue-700'
                          >
                            <MoreHorizontal size={14} />
                          </Button>
                        </div>
                      ) : (
                        <div className='w-full text-center text-muted-foreground flex items-center justify-center gap-2'>
                          <Plus size={14} />
                          <span>Add estimate</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2'>
                    <User size={14} className='text-blue-500' />
                    Assignee
                  </h3>
                  {editingAssignee ? (
                    <DropdownMenu
                      open={true}
                      onOpenChange={(open) => {
                        return !open && setEditingAssignee(false);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-start bg-white shadow-sm'
                        >
                          <div className='flex items-center gap-2'>
                            <Avatar className='h-6 w-6'>
                              <AvatarImage src='/avatars/01.png' alt='John Doe' />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <span className='text-sm'>John Doe</span>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='start' className='min-w-[200px]'>
                        <DropdownMenuItem
                          onClick={() => {
                            return saveAssignee({
                              id: '1',
                              name: 'John Doe',
                              avatar: '/avatars/01.png',
                            });
                          }}
                          className='py-2'
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
                          className='py-2'
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
                          className='py-2'
                        >
                          <div className='flex items-center gap-2'>
                            <Avatar className='h-6 w-6 border-2 border-blue-500'>
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
                      className='flex items-center justify-between gap-2 p-3 rounded-md cursor-pointer hover:bg-blue-50 transition-colors bg-white shadow-sm'
                      onClick={() => {
                        return setEditingAssignee(true);
                      }}
                    >
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-6 w-6'>
                          <AvatarImage
                            src={task.assignee?.avatar || '/avatars/01.png'}
                            alt={task.assignee?.name || 'John Doe'}
                          />
                          <AvatarFallback>{(task.assignee?.name || 'John Doe')[0]}</AvatarFallback>
                        </Avatar>
                        <span className='text-sm'>{task.assignee?.name || 'John Doe'}</span>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-blue-700'
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2'>
                    <User size={14} className='text-green-500' />
                    Reporter
                  </h3>
                  <div className='flex items-center gap-2 p-3 bg-white rounded-md shadow-sm'>
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
                  <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2'>
                    <Activity size={14} className='text-red-500' />
                    Priority
                  </h3>
                  {editingPriority ? (
                    <DropdownMenu
                      open={true}
                      onOpenChange={(open) => {
                        return !open && setEditingPriority(false);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <div className='flex items-center gap-2 p-3 bg-white rounded-md cursor-pointer shadow-sm'>
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
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='start'>
                        <DropdownMenuItem
                          onClick={() => {
                            return savePriority('high');
                          }}
                          className='py-2'
                        >
                          <Badge className='bg-red-500 hover:bg-red-600 mr-2'>High</Badge>
                          <span>Urgent or critical issues</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return savePriority('medium');
                          }}
                          className='py-2'
                        >
                          <Badge className='bg-yellow-500 hover:bg-yellow-600 mr-2'>Medium</Badge>
                          <span>Default priority level</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return savePriority('low');
                          }}
                          className='py-2'
                        >
                          <Badge className='bg-green-500 hover:bg-green-600 mr-2'>Low</Badge>
                          <span>Low urgency tasks</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div
                      className='flex items-center gap-2 p-3 rounded-md cursor-pointer hover:bg-blue-50 transition-colors bg-white shadow-sm'
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
                  <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2'>
                    <Calendar size={14} className='text-purple-500' />
                    Due Date
                  </h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start text-left font-normal text-sm h-10 bg-white shadow-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {dueDate ? dueDate.toDateString() : 'Set due date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <div className='p-2 border-b'>
                        <h4 className='font-medium'>Select due date</h4>
                      </div>
                      <CalendarComponent
                        mode='single'
                        selected={dueDate}
                        onSelect={(date) => {
                          setDueDate(date);
                          saveDueDate(date);
                        }}
                        initialFocus
                      />
                      {dueDate && (
                        <div className='p-2 border-t flex justify-end'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => {
                              setDueDate(null);
                              saveDueDate(null);
                            }}
                            className='text-red-600 hover:text-red-700 hover:bg-red-50'
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2'>
                    <MessageSquare size={14} className='text-amber-500' />
                    Labels
                  </h3>
                  <div className='bg-white p-3 rounded-md shadow-sm'>
                    <div className='flex flex-wrap gap-2 mb-2'>
                      {labels.map((label) => {
                        return (
                          <Badge
                            key={label}
                            variant='outline'
                            className='bg-muted/50 flex items-center gap-1 px-2 py-1 hover:bg-muted/80 transition-colors group'
                          >
                            {label}
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-4 w-4 p-0 ml-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                              onClick={() => {
                                return handleRemoveLabel(label);
                              }}
                            >
                              <X size={10} />
                            </Button>
                          </Badge>
                        );
                      })}

                      {!showLabelInput && (
                        <Badge
                          variant='outline'
                          className='bg-blue-50 text-blue-700 cursor-pointer border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors'
                          onClick={() => {
                            return setShowLabelInput(true);
                          }}
                        >
                          <Plus size={10} className='mr-1' /> Add
                        </Badge>
                      )}
                    </div>

                    {showLabelInput && (
                      <div className='flex items-center gap-1 mt-2'>
                        <Input
                          value={newLabelText}
                          onChange={(e) => {
                            return setNewLabelText(e.target.value);
                          }}
                          className='h-8 text-xs flex-1'
                          placeholder='Enter label name'
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddLabel();
                            if (e.key === 'Escape') setShowLabelInput(false);
                          }}
                        />
                        <Button
                          size='sm'
                          className='h-8 bg-blue-600 hover:bg-blue-700 px-2'
                          onClick={handleAddLabel}
                          disabled={!newLabelText.trim()}
                        >
                          Add
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0 text-muted-foreground'
                          onClick={() => {
                            return setShowLabelInput(false);
                          }}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className='my-6' />

                <div className='bg-white p-4 rounded-lg shadow-sm'>
                  <h3 className='text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 flex items-center gap-2'>
                    <Calendar size={14} className='text-blue-500' />
                    Timeline
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2 text-sm'>
                        <div className='w-2 h-2 rounded-full bg-green-500'></div>
                        <span>Created</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='text-sm font-medium'>
                          {new Date().toLocaleDateString()}
                        </span>
                        <span className='text-xs text-muted-foreground'>(2 days ago)</span>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2 text-sm'>
                        <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                        <span>Updated</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='text-sm font-medium'>
                          {new Date().toLocaleDateString()}
                        </span>
                        <span className='text-xs text-muted-foreground'>(4 hours ago)</span>
                      </div>
                    </div>

                    {dueDate && (
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2 text-sm'>
                          <div className='w-2 h-2 rounded-full bg-red-500'></div>
                          <span>Due</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <span className='text-sm font-medium'>
                            {dueDate.toLocaleDateString()}
                          </span>
                          <span className='text-xs text-muted-foreground'>(in 3 days)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDetailDialog;
