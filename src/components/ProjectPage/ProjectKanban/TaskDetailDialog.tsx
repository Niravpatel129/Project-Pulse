'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronDown,
  ChevronUp,
  FileImage,
  FileText,
  Link as LinkIcon,
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
  // Add state for sidebar visibility on mobile
  const [sidebarVisible, setSidebarVisible] = useState(true);

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
        <DialogContent className='max-w-6xl w-[95vw] md:w-[80vw] h-[85vh] p-0 gap-0 overflow-hidden rounded-md border shadow-sm'>
          {/* Add DialogTitle for accessibility */}
          <DialogTitle className='sr-only'>{task.title}</DialogTitle>

          {/* Close button positioned absolutely */}
          <Button
            variant='ghost'
            size='sm'
            className='absolute right-4 top-4 h-8 w-8 p-0 text-gray-500 z-10'
            onClick={() => {
              return onOpenChange(false);
            }}
          >
            <X size={14} />
          </Button>

          <div className='flex flex-col md:flex-row h-full overflow-hidden'>
            {/* Main content - left side */}
            <div className={`flex-1 overflow-auto p-4 md:p-6 ${!sidebarVisible ? 'pb-16' : ''}`}>
              {/* Mobile sidebar toggle - fixed at bottom */}
              <Button
                variant='outline'
                size='sm'
                className='md:hidden fixed bottom-4 right-4 z-10 flex items-center gap-1 px-3 rounded-full shadow-md bg-white'
                onClick={() => {
                  return setSidebarVisible(!sidebarVisible);
                }}
              >
                {sidebarVisible ? (
                  <>
                    Hide Details <ChevronDown size={14} />
                  </>
                ) : (
                  <>
                    Show Details <ChevronUp size={14} />
                  </>
                )}
              </Button>

              {/* Title - simplified */}
              {editingTitle ? (
                <div className='mb-4 md:mb-8'>
                  <Input
                    value={editedTitle}
                    onChange={(e) => {
                      return setEditedTitle(e.target.value);
                    }}
                    className='text-xl font-normal'
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
                </div>
              ) : (
                <h2
                  className='text-xl font-normal mb-4 md:mb-8 cursor-pointer'
                  onClick={() => {
                    return setEditingTitle(true);
                  }}
                >
                  {task.title}
                </h2>
              )}

              {/* Description - minimalist design */}
              <div className='mb-4 md:mb-8'>
                <div className='mb-3 text-sm text-gray-500 flex items-center justify-between'>
                  Description
                  {!editingDescription && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 text-gray-500'
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
                      className='min-h-[150px] md:min-h-[200px]'
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
                    <div className='mt-2 flex justify-end items-center gap-2'>
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
                      <Button size='sm' onClick={saveDescription}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className='text-sm whitespace-pre-wrap min-h-[80px] md:min-h-[100px] cursor-pointer'
                    onClick={() => {
                      return setEditingDescription(true);
                    }}
                  >
                    {task.description || (
                      <span className='text-gray-400 italic'>Add description</span>
                    )}
                  </div>
                )}
              </div>

              {/* Attachments - simplified */}
              <div className='mb-4 md:mb-8'>
                <div className='mb-3 text-sm text-gray-500 flex items-center justify-between'>
                  Attachments
                  <div className='flex gap-2'>
                    <input
                      type='file'
                      id='file-upload'
                      className='sr-only'
                      multiple
                      onChange={handleFileUpload}
                    />
                    <label htmlFor='file-upload'>
                      <Button variant='ghost' size='sm' className='h-7' asChild>
                        <span>Add</span>
                      </Button>
                    </label>
                  </div>
                </div>

                {showLinkInput && (
                  <div className='flex items-center gap-2 mb-3'>
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
                          className='flex items-center gap-2 border px-3 py-2 text-sm rounded-sm group'
                        >
                          <div className='text-gray-500'>{attachment.icon}</div>
                          <span>{attachment.title}</span>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-5 w-5 p-0 text-gray-400 opacity-0 group-hover:opacity-100'
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

              {/* Comments - simplified */}
              <div className='mb-4 md:mb-6'>
                <div className='mb-3 text-sm text-gray-500'>Comments</div>
                <div className='space-y-4 md:space-y-6'>
                  <div className='flex gap-3'>
                    <Avatar className='h-8 w-8 shrink-0'>
                      <AvatarImage src='/avatars/03.png' alt='Your avatar' />
                      <AvatarFallback className='flex items-center justify-center'>
                        <User size={14} />
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 space-y-3'>
                      <Textarea
                        placeholder='Add a comment...'
                        className='resize-none min-h-[80px]'
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
                      <div className='flex justify-end'>
                        <Button size='sm' onClick={handleAddComment} disabled={!commentText.trim()}>
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>

                  <ScrollArea className='max-h-[200px] md:max-h-[300px]'>
                    <div className='space-y-4'>
                      {comments.map((comment) => {
                        return (
                          <div key={comment.id} className='flex gap-3 group'>
                            <Avatar className='h-8 w-8 shrink-0'>
                              <AvatarImage src={comment.avatar} alt={comment.author} />
                              <AvatarFallback>{comment.author[0]}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-sm'>{comment.author}</span>
                                <span className='text-xs text-gray-400'>{comment.time}</span>
                              </div>
                              <div className='text-sm'>{comment.content}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Right sidebar - simplified */}
            <div
              className={`border-t md:border-t-0 md:border-l w-full md:w-[280px] overflow-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50 ${
                !sidebarVisible ? 'hidden md:block' : ''
              }`}
            >
              {/* Sidebar close button for mobile */}
              <div className='flex justify-between items-center mb-2 md:hidden'>
                <span className='text-sm font-medium'>Task Details</span>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 w-7 p-0'
                  onClick={() => {
                    return setSidebarVisible(false);
                  }}
                >
                  <X size={16} />
                </Button>
              </div>

              {/* Status field */}
              <div>
                <div className='text-xs text-gray-500 mb-2'>Status</div>
                {editingStatus ? (
                  <DropdownMenu
                    open={true}
                    onOpenChange={(open) => {
                      return !open && setEditingStatus(false);
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='w-full justify-between'>
                        <span>{currentColumn?.title}</span>
                        <ChevronDown size={14} className='ml-2 opacity-50' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='start'
                      className='w-[calc(100vw-2rem)] md:w-[250px]'
                    >
                      {columns.map((column) => {
                        return (
                          <DropdownMenuItem
                            key={column.id}
                            onClick={() => {
                              return saveColumnId(column.id);
                            }}
                          >
                            {column.title}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div
                    className='flex items-center p-2 text-sm cursor-pointer hover:bg-gray-100'
                    onClick={() => {
                      return setEditingStatus(true);
                    }}
                  >
                    {currentColumn?.title}
                  </div>
                )}
              </div>

              {/* Assignee field */}
              <div>
                <div className='text-xs text-gray-500 mb-2'>Assignee</div>
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
                    <DropdownMenuContent
                      align='start'
                      className='w-[calc(100vw-2rem)] md:w-[250px]'
                    >
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div
                    className='flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-100'
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
                    <span>{task.assignee?.name || 'John Doe'}</span>
                  </div>
                )}
              </div>

              {/* Priority field */}
              <div>
                <div className='text-xs text-gray-500 mb-2'>Priority</div>
                {editingPriority ? (
                  <DropdownMenu
                    open={true}
                    onOpenChange={(open) => {
                      return !open && setEditingPriority(false);
                    }}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' className='w-full justify-start'>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`h-2 w-2 rounded-full ${
                              task.priority === 'high'
                                ? 'bg-red-500'
                                : task.priority === 'low'
                                ? 'bg-green-500'
                                : 'bg-yellow-500'
                            }`}
                          ></span>
                          <span className='text-sm'>{task.priority || 'Medium'}</span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align='start'
                      className='w-[calc(100vw-2rem)] md:w-[250px]'
                    >
                      <DropdownMenuItem
                        onClick={() => {
                          return savePriority('high');
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='h-2 w-2 rounded-full bg-red-500'></span>
                          <span>High</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          return savePriority('medium');
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='h-2 w-2 rounded-full bg-yellow-500'></span>
                          <span>Medium</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          return savePriority('low');
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='h-2 w-2 rounded-full bg-green-500'></span>
                          <span>Low</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div
                    className='flex items-center gap-2 p-2 text-sm cursor-pointer hover:bg-gray-100'
                    onClick={() => {
                      return setEditingPriority(true);
                    }}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-500'
                          : task.priority === 'low'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                    ></span>
                    <span>{task.priority || 'Medium'}</span>
                  </div>
                )}
              </div>

              {/* Due date field */}
              <div>
                <div className='text-xs text-gray-500 mb-2'>Due Date</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal text-sm'
                    >
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
                    {dueDate && (
                      <div className='p-2 border-t flex justify-end'>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => {
                            setDueDate(null);
                            saveDueDate(null);
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Story Points - minimal version */}
              <div>
                <div className='text-xs text-gray-500 mb-2'>Story Points</div>
                {editingStoryPoints ? (
                  <div className='space-y-2'>
                    <div className='grid grid-cols-4 gap-1'>
                      {[1, 2, 3, 5, 8, 13].map((point) => {
                        return (
                          <Button
                            key={point}
                            variant={storyPoints === point ? 'default' : 'outline'}
                            size='sm'
                            className='h-8 w-full p-0'
                            onClick={() => {
                              return saveStoryPoints(point);
                            }}
                          >
                            {point}
                          </Button>
                        );
                      })}
                    </div>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          return setEditingStoryPoints(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className='flex items-center p-2 text-sm cursor-pointer hover:bg-gray-100'
                    onClick={() => {
                      return setEditingStoryPoints(true);
                    }}
                  >
                    {storyPoints !== undefined ? (
                      <span>{storyPoints} points</span>
                    ) : (
                      <span className='text-gray-400'>None</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDetailDialog;
