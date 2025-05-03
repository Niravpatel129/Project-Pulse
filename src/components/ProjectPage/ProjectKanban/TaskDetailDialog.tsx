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
import { Attachment, Column, Comment, Task, TimeEntry } from '@/services/kanbanApi';
import { newRequest } from '@/utils/newRequest';
import { format } from 'date-fns';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  FileImage,
  FileText,
  Link as LinkIcon,
  Trash2,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import FileUploadManagerModal from '../FileComponents/FileUploadManagerModal';

// Helper function to format hours with proper singular/plural form
const formatHours = (hours: number): string => {
  if (hours === 0) return '0 hours';

  // For whole hours
  if (hours % 1 === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  // For values less than 1 hour or with decimal part, convert to minutes
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} ${totalMinutes === 1 ? 'minute' : 'minutes'}`;
  }

  // For mixed hours and minutes (e.g., 1h 30m)
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  const hourText = wholeHours === 1 ? '1 hour' : `${wholeHours} hours`;
  return minutes > 0 ? `${hourText} ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}` : hourText;
};

// Define props interface
interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: (updatedTask: Task) => void;
  onAddComment?: (taskId: string, comment: { content: string }) => Promise<Comment | null>;
  onAddAttachment?: (
    taskId: string,
    attachment: Omit<Attachment, 'id' | 'createdAt'>,
  ) => Promise<Attachment | null>;
  onRemoveAttachment?: (taskId: string, attachmentId: string) => Promise<boolean>;
  onLogTime?: (
    taskId: string,
    timeEntry: Omit<TimeEntry, 'id' | 'user'>,
  ) => Promise<TimeEntry | null>;
  columns: Column[];
  previewMode?: boolean;
}

// TaskDetailDialog component to display and edit task details
const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  open,
  onOpenChange,
  onTaskUpdate,
  onAddComment,
  onAddAttachment,
  onRemoveAttachment,
  onLogTime,
  columns,
  previewMode = false,
}) => {
  // Individual edit states for each field rather than a global edit mode
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAssignee, setEditingAssignee] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingStoryPoints, setEditingStoryPoints] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
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
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');
  const [labels, setLabels] = useState<string[]>([]);

  // Add state for story points
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined);

  // File upload modal state
  const [fileModalOpen, setFileModalOpen] = useState(false);

  // Track removals in progress
  const [removingAttachmentIds, setRemovingAttachmentIds] = useState<string[]>([]);

  // Add state for time tracking
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [timeToLog, setTimeToLog] = useState<number>(0);
  const [timeDescription, setTimeDescription] = useState('');
  const [timeEntryDate, setTimeEntryDate] = useState<Date>(new Date());

  // Add local state for time entries after the timeEntryDate state variable
  const [localTimeEntries, setLocalTimeEntries] = useState<TimeEntry[]>([]);

  // Add state for tracking time entries being deleted
  const [removingTimeEntryIds, setRemovingTimeEntryIds] = useState<string[]>([]);

  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description || '');
      setEditedColumnId(task.columnId);
      setDueDate(task.dueDate || null);

      // Reset labels when task changes
      setLabels(task.labels || []);

      // Set story points when task changes
      setStoryPoints(task.storyPoints);

      // Reset time tracking state
      setShowTimeInput(false);
      setTimeToLog(0);
      setTimeDescription('');
      setTimeEntryDate(new Date());
      setRemovingTimeEntryIds([]);

      // Initialize local time entries from task
      setLocalTimeEntries(task.timeEntries || []);
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

  const handleAddComment = async () => {
    if (!task || !commentText.trim() || !onAddComment) return;

    const newComment = await onAddComment(task.id, {
      content: commentText,
    });

    // Clear the comment input whether it succeeded or not
    setCommentText('');
  };

  const handleAddLink = async () => {
    if (!task || !linkUrl.trim() || !onAddAttachment) return;

    await onAddAttachment(task.id, {
      type: 'link',
      url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
      title: linkUrl.replace(/^https?:\/\//, '').split('/')[0],
    });

    setLinkUrl('');
    setShowLinkInput(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!task || !onAddAttachment) return;

    // In a real app, this would handle actual file uploads
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Add each file
    for (const file of Array.from(files)) {
      await onAddAttachment(task.id, {
        type: 'file',
        url: '#', // This would be replaced with the uploaded file URL in a real app
        title: file.name,
        size: file.size,
      });
    }

    // Clear the file input
    e.target.value = '';
  };

  const handleAddLabel = () => {
    if (!task || !newLabelText.trim()) return;

    const updatedLabels = [...labels, newLabelText.trim()];
    setLabels(updatedLabels);

    // Update task with new labels
    onTaskUpdate({
      ...task,
      labels: updatedLabels,
    });

    setNewLabelText('');
    setShowLabelInput(false);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    if (!task) return;

    const updatedLabels = labels.filter((label) => {
      return label !== labelToRemove;
    });
    setLabels(updatedLabels);

    onTaskUpdate({
      ...task,
      labels: updatedLabels,
    });
  };

  const saveStoryPoints = (points: number | undefined) => {
    if (!task) return;

    onTaskUpdate({
      ...task,
      storyPoints: points,
    });

    setEditingStoryPoints(false);
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!task) return toast.error('Cannot remove attachment: Task not found');

    // Add to loading state
    setRemovingAttachmentIds((prev) => {
      return [...prev, attachmentId];
    });

    try {
      const success = await onRemoveAttachment(task.id, attachmentId);

      if (success) {
        // Update local state if the server operation was successful
        const updatedAttachments = task.attachments?.filter((attachment) => {
          return attachment.id !== attachmentId;
        });

        onTaskUpdate({
          ...task,
          attachments: updatedAttachments,
        });

        toast.success('Attachment removed successfully');
      } else {
        toast.error('Failed to remove attachment');
      }
    } catch (error) {
      console.error('Failed to remove attachment:', error);
      toast.error('Error removing attachment');

      // Provide fallback behavior even on error
      const updatedAttachments = task.attachments?.filter((attachment) => {
        return attachment.id !== attachmentId;
      });

      onTaskUpdate({
        ...task,
        attachments: updatedAttachments,
      });
    } finally {
      // Remove from loading state
      setRemovingAttachmentIds((prev) => {
        return prev.filter((id) => {
          return id !== attachmentId;
        });
      });
    }
  };

  const logTimeToAPI = async (
    taskId: string,
    timeData: {
      hours: number;
      description: string;
      date: string;
    },
  ) => {
    try {
      // Extract project ID from the task ID or use a prop if available
      // Here we're hardcoding the project ID based on the URL provided
      const projectId = '680a0a86a3558269e39b6835';

      console.log('Making POST request to log time:', timeData);

      // Make the direct API call - note we're not using axios here to ensure a fresh implementation
      const response = await newRequest.post(`/kanban/${projectId}/tasks/${taskId}/time`, timeData);

      const responseData = response.data;
      console.log('Time logging API response:', responseData);

      return responseData;
    } catch (error) {
      console.error('Error logging time:', error);
      throw error;
    }
  };

  const handleLogTime = async () => {
    if (!task || !timeToLog || timeToLog <= 0) return;

    try {
      // Capture values locally to avoid any closure issues
      const hours = timeToLog;
      const description = timeDescription;
      const date = timeEntryDate.toISOString();

      // Clear form immediately to prevent double submissions
      setTimeToLog(0);
      setTimeDescription('');
      setShowTimeInput(false);

      // Create the time entry data
      const timeEntryData = {
        hours,
        description,
        date,
      };

      try {
        // Make the POST request directly
        const result = await logTimeToAPI(task.id, timeEntryData);

        if (result) {
          // Show success message
          toast.success('Time logged successfully');

          // Add to local time entries state to update UI without triggering task update
          const newEntry = result.timeEntry || {
            id: Date.now().toString(),
            hours,
            description,
            date,
            user: {
              id: '1',
              name: 'Current User',
              avatar: '/avatars/03.png',
            },
          };

          setLocalTimeEntries((prev) => {
            return [...prev, newEntry];
          });
        }
      } catch (error) {
        console.error('Failed to log time:', error);
        toast.error('Failed to log time');
      }
    } catch (error) {
      console.error('Failed to log time:', error);
      toast.error('Failed to log time');
    }
  };

  // Calculate total logged hours
  const getTotalLoggedHours = () => {
    if (!localTimeEntries.length) return 0;
    return localTimeEntries.reduce((total, entry) => {
      return total + entry.hours;
    }, 0);
  };

  // Add function to delete time entries
  const deleteTimeEntry = async (timeEntryId: string) => {
    if (!task) return;

    try {
      // Add to loading state
      setRemovingTimeEntryIds((prev) => {
        return [...prev, timeEntryId];
      });

      // Extract project ID from the task ID or use a prop if available
      const projectId = '680a0a86a3558269e39b6835';

      // Make the API call to delete the time entry
      const response = await newRequest.delete(
        `/kanban/${projectId}/tasks/${task.id}/time/${timeEntryId}`,
      );

      if (response.status === 200) {
        // Update local state if the server operation was successful
        setLocalTimeEntries((prev) => {
          return prev.filter((entry) => {
            return entry.id !== timeEntryId;
          });
        });
        toast.success('Time entry deleted successfully');
      } else {
        toast.error('Failed to delete time entry');
      }
    } catch (error) {
      console.error('Failed to delete time entry:', error);
      toast.error('Error deleting time entry');

      // Provide fallback behavior even on error
      setLocalTimeEntries((prev) => {
        return prev.filter((entry) => {
          return entry.id !== timeEntryId;
        });
      });
    } finally {
      // Remove from loading state
      setRemovingTimeEntryIds((prev) => {
        return prev.filter((id) => {
          return id !== timeEntryId;
        });
      });
    }
  };

  // Early return if no task
  if (!task) return null;

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
              {/* Mobile sidebar toggle - fixed at bottom - hide in preview mode */}
              {!previewMode && (
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
              )}

              {/* Title - simplified, no editing in preview mode */}
              {editingTitle && !previewMode ? (
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
                  className={`text-xl font-normal mb-4 md:mb-8 ${
                    previewMode ? '' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!previewMode) setEditingTitle(true);
                  }}
                >
                  {task.title}
                </h2>
              )}

              {/* Description - no editing in preview mode */}
              <div className='mb-6'>
                <div className='mb-2 text-sm text-gray-500'>Description</div>
                {editingDescription && !previewMode ? (
                  <div className='mb-4'>
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => {
                        return setEditedDescription(e.target.value);
                      }}
                      className='min-h-[100px]'
                      autoFocus
                      onBlur={saveDescription}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setEditedDescription(task.description || '');
                          setEditingDescription(false);
                        }
                      }}
                    />
                    <div className='flex justify-end mt-2'>
                      <Button size='sm' onClick={saveDescription}>
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`p-3 border rounded-md ${
                      previewMode ? '' : 'cursor-pointer'
                    } min-h-[100px] text-sm`}
                    onClick={() => {
                      if (!previewMode) setEditingDescription(true);
                    }}
                  >
                    {task.description || (previewMode ? 'No description' : 'Add a description...')}
                  </div>
                )}
              </div>

              {/* Attachments - simplified, no adding/removing in preview mode */}
              <div className='mb-4 md:mb-8'>
                <div className='mb-3 text-sm text-gray-500 flex items-center justify-between'>
                  Attachments
                  {!previewMode && (
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
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7'
                        onClick={() => {
                          return setFileModalOpen(true);
                        }}
                      >
                        Browse
                      </Button>
                    </div>
                  )}
                </div>

                {showLinkInput && !previewMode && (
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

                {task.attachments && task.attachments.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {task.attachments.map((attachment) => {
                      const isRemoving = removingAttachmentIds.includes(attachment.id);
                      return (
                        <div
                          key={attachment.id}
                          className={`flex items-center gap-2 border px-3 py-2 text-sm rounded-sm group relative ${
                            isRemoving ? 'opacity-50' : ''
                          }`}
                        >
                          <div className='text-gray-500'>
                            {attachment.type === 'link' ? (
                              <LinkIcon size={14} />
                            ) : attachment.type === 'image' ? (
                              <FileImage size={14} />
                            ) : (
                              <FileText size={14} />
                            )}
                          </div>
                          <span className='flex-grow'>{attachment.title}</span>
                          {isRemoving ? (
                            <div className='h-4 w-4 ml-1 animate-spin rounded-full border-2 border-current border-t-transparent' />
                          ) : (
                            !previewMode && (
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveAttachment(attachment.id);
                                }}
                              >
                                <Trash2 size={14} />
                                <span className='sr-only'>Delete attachment</span>
                              </Button>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Comments - simplified, no adding in preview mode */}
              <div className='mb-4 md:mb-6'>
                <div className='mb-3 text-sm text-gray-500'>Comments</div>
                <div className='space-y-4 md:space-y-6'>
                  {!previewMode && (
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
                          <Button
                            size='sm'
                            onClick={handleAddComment}
                            disabled={!commentText.trim()}
                          >
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing comments */}
                  {task.comments && task.comments.length > 0 ? (
                    <div className='space-y-4'>
                      {task.comments.map((comment) => {
                        return (
                          <div key={comment.id} className='flex gap-3'>
                            <Avatar className='h-8 w-8 shrink-0'>
                              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium text-sm'>{comment.author.name}</span>
                                <span className='text-xs text-gray-500'>
                                  {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <p className='text-sm mt-1'>{comment.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    !previewMode && <div className='text-sm text-gray-500'>No comments yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - right side (for properties) - simplified in preview mode */}
            <ScrollArea
              className={`w-full md:w-72 lg:w-80 h-full overflow-auto border-t md:border-t-0 md:border-l p-4 md:p-6 ${
                sidebarVisible ? 'block' : 'hidden md:block'
              }`}
            >
              <div className='space-y-5 p-1'>
                {/* Status (Column) */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Status</div>
                  {previewMode ? (
                    <div className='flex items-center px-3 py-2 border rounded-md text-sm'>
                      <div
                        className='w-2 h-2 rounded-full mr-2'
                        style={{
                          backgroundColor:
                            columns.find((col) => {
                              return col.id === task.columnId;
                            })?.color || '#94a3b8',
                        }}
                      ></div>
                      {columns.find((col) => {
                        return col.id === task.columnId;
                      })?.title || 'No Status'}
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' className='w-full justify-between' size='sm'>
                          <div className='flex items-center'>
                            <div
                              className='w-2 h-2 rounded-full mr-2'
                              style={{
                                backgroundColor:
                                  columns.find((col) => {
                                    return col.id === task.columnId;
                                  })?.color || '#94a3b8',
                              }}
                            ></div>
                            {columns.find((col) => {
                              return col.id === task.columnId;
                            })?.title || 'No Status'}
                          </div>
                          <ChevronDown size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-[200px]'>
                        {columns.map((column) => {
                          return (
                            <DropdownMenuItem
                              key={column.id}
                              onClick={() => {
                                return saveColumnId(column.id);
                              }}
                              className='flex items-center cursor-pointer'
                            >
                              <div
                                className='w-2 h-2 rounded-full mr-2'
                                style={{ backgroundColor: column.color }}
                              ></div>
                              {column.title}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Due Date */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Due Date</div>
                  {previewMode ? (
                    <div className='px-3 py-2 border rounded-md text-sm'>
                      {dueDate ? format(dueDate, 'PPP') : 'No due date'}
                    </div>
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={dueDate ? 'outline' : 'ghost'}
                          className='w-full justify-start h-9 px-3'
                          size='sm'
                        >
                          {dueDate ? format(dueDate, 'PPP') : 'Set due date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0 min-w-[350px]'>
                        <CalendarComponent
                          mode='single'
                          selected={dueDate || undefined}
                          onSelect={(date) => {
                            setDueDate(date);
                            saveDueDate(date);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                {/* Priority */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Priority</div>
                  {previewMode ? (
                    <div className='px-3 py-2 border rounded-md text-sm capitalize'>
                      {task.priority || 'No priority'}
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' className='w-full justify-between' size='sm'>
                          {task.priority || 'Set priority'}
                          <ChevronDown size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-[200px]'>
                        <DropdownMenuItem
                          onClick={() => {
                            return savePriority('low');
                          }}
                        >
                          Low
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return savePriority('medium');
                          }}
                        >
                          Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            return savePriority('high');
                          }}
                        >
                          High
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Time Tracking */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Time Tracking</div>

                  {showTimeInput && !previewMode ? (
                    <div className='space-y-2 mt-2'>
                      <div className='flex items-center gap-2'>
                        <Input
                          type='number'
                          placeholder='Hours'
                          value={timeToLog || ''}
                          min={0.25}
                          step={0.25}
                          onChange={(e) => {
                            return setTimeToLog(parseFloat(e.target.value) || 0);
                          }}
                          className='w-full h-9'
                        />
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant='outline' className='h-9'>
                              <Calendar />
                              {format(timeEntryDate, 'MMM d')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <CalendarComponent
                              mode='single'
                              selected={timeEntryDate}
                              onSelect={(date) => {
                                return date && setTimeEntryDate(date);
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Textarea
                        placeholder='Description (optional)'
                        value={timeDescription}
                        onChange={(e) => {
                          return setTimeDescription(e.target.value);
                        }}
                        className='resize-none min-h-[60px] text-sm'
                      />
                      <div className='flex justify-end gap-2'>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => {
                            return setShowTimeInput(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size='sm'
                          onClick={handleLogTime}
                          disabled={!timeToLog || timeToLog <= 0}
                        >
                          Log Time
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2 text-sm text-[#020817] font-medium'>
                          <Clock size={14} className='text-gray-500' />
                          <span>{formatHours(getTotalLoggedHours())}</span>
                        </div>
                      </div>
                      {!previewMode && (
                        <Button
                          variant='outline'
                          className='w-full justify-start h-9 mt-2'
                          size='sm'
                          onClick={() => {
                            return setShowTimeInput(true);
                          }}
                        >
                          + Log Hours
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Display time entries if they exist */}
                  {localTimeEntries.length > 0 && (
                    <div className='pt-3'>
                      <div className='text-xs text-gray-500'>Time History</div>
                      <div className='space-y-2 max-h-[200px] overflow-y-auto pr-1'>
                        {localTimeEntries.map((entry: any) => {
                          const isRemoving = removingTimeEntryIds.includes(entry.id || entry._id);
                          const entryId = entry.id || entry._id;
                          return (
                            <div
                              key={entryId}
                              className={`border rounded-sm p-2 pb-1.5 group relative ${
                                isRemoving ? 'opacity-50' : ''
                              }`}
                            >
                              <div className='flex justify-between items-center text-sm text-[#020817] font-medium'>
                                <span>{formatHours(entry.hours)}</span>
                                <div className='flex items-center gap-1'>
                                  <span className='text-xs text-gray-500'>
                                    {format(new Date(entry.date), 'MMM d')}
                                  </span>
                                  {isRemoving ? (
                                    <div className='h-4 w-4 ml-1 animate-spin rounded-full border-2 border-current border-t-transparent' />
                                  ) : (
                                    !previewMode && (
                                      <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          deleteTimeEntry(entryId);
                                        }}
                                      >
                                        <Trash2 size={12} />
                                        <span className='sr-only'>Delete time entry</span>
                                      </Button>
                                    )
                                  )}
                                </div>
                              </div>
                              {entry.description && (
                                <p className='text-xs text-gray-600 mt-1'>{entry.description}</p>
                              )}
                              <div className='flex items-center gap-1 mt-1.5 text-xs text-gray-500'>
                                <Avatar className='h-4 w-4'>
                                  <AvatarImage src={entry.user.avatar} alt={entry.user.name} />
                                  <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {entry.user.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Story Points */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Story Points</div>
                  {previewMode ? (
                    <div className='px-3 py-2 border rounded-md text-sm'>
                      {task.storyPoints !== undefined ? task.storyPoints : 'No points'}
                    </div>
                  ) : editingStoryPoints ? (
                    <div className='flex items-center gap-2'>
                      <Input
                        type='number'
                        value={storyPoints !== undefined ? storyPoints : ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setStoryPoints(isNaN(value) ? undefined : value);
                        }}
                        className='w-24 h-9'
                        autoFocus
                        onBlur={() => {
                          return saveStoryPoints(storyPoints);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveStoryPoints(storyPoints);
                          if (e.key === 'Escape') {
                            setStoryPoints(task.storyPoints);
                            setEditingStoryPoints(false);
                          }
                        }}
                      />
                      <Button
                        size='sm'
                        className='h-9'
                        onClick={() => {
                          return saveStoryPoints(storyPoints);
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant='outline'
                      className='w-full justify-start h-9'
                      size='sm'
                      onClick={() => {
                        return setEditingStoryPoints(true);
                      }}
                    >
                      {task.storyPoints !== undefined ? task.storyPoints : 'No points'}
                    </Button>
                  )}
                </div>

                {/* Labels */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Labels</div>
                  <div className='flex flex-wrap gap-1 mb-2'>
                    {task.labels &&
                      task.labels.map((label) => {
                        return (
                          <div
                            key={label}
                            className='bg-gray-100 px-2 py-1 rounded-sm text-xs flex items-center gap-1 group'
                          >
                            {label}
                            {!previewMode && (
                              <button
                                className='opacity-0 group-hover:opacity-100'
                                onClick={() => {
                                  return handleRemoveLabel(label);
                                }}
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        );
                      })}

                    {showLabelInput && !previewMode ? (
                      <div className='flex items-center gap-1 w-full'>
                        <Input
                          value={newLabelText}
                          onChange={(e) => {
                            return setNewLabelText(e.target.value);
                          }}
                          placeholder='Add label'
                          className='h-7 text-xs'
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddLabel();
                            if (e.key === 'Escape') setShowLabelInput(false);
                          }}
                        />
                        <Button size='sm' className='h-7' onClick={handleAddLabel}>
                          Add
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-7'
                          onClick={() => {
                            return setShowLabelInput(false);
                          }}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ) : (
                      !previewMode && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7'
                          onClick={() => {
                            return setShowLabelInput(true);
                          }}
                        >
                          + Add Label
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Manager Modal - don't show in preview mode */}
      {!previewMode && (
        <FileUploadManagerModal
          isOpen={fileModalOpen}
          onClose={() => {
            return setFileModalOpen(false);
          }}
          handleAddFileToProject={(file: any) => {
            if (!task || !onAddAttachment) return;

            onAddAttachment(task.id, {
              type: file.contentType.startsWith('image/') ? 'image' : 'file',
              url: file.downloadURL,
              title: file.originalName,
              size: file.size,
            });

            setFileModalOpen(false);
          }}
          initialFiles={task?.attachments?.map((attachment) => {
            return {
              _id: attachment.id,
              originalName: attachment.title,
              contentType: attachment.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
              downloadURL: attachment.url,
              size: attachment.size || 0,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              storagePath: attachment.url,
              uploadedBy: { name: 'Current User' },
            };
          })}
          onDeleteFile={async (file: any) => {
            if (!task) return false;

            if (file._id && !removingAttachmentIds.includes(file._id)) {
              if (!onRemoveAttachment) {
                // Provide a fallback behavior when onRemoveAttachment isn't available
                const updatedAttachments = task.attachments?.filter((attachment) => {
                  return attachment.id !== file._id;
                });

                onTaskUpdate({
                  ...task,
                  attachments: updatedAttachments,
                });

                toast.success('Attachment removed successfully');
                return true;
              }

              await handleRemoveAttachment(file._id);
              return true;
            }
            return false;
          }}
        />
      )}
    </>
  );
};

export default TaskDetailDialog;
