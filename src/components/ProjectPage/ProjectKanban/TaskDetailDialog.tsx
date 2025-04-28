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
import { Attachment, Column, Comment, Task } from '@/services/kanbanApi';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronUp,
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
  columns: Column[];
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
  columns,
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

              {/* Description */}
              <div className='mb-6'>
                <div className='mb-2 text-sm text-gray-500'>Description</div>
                {editingDescription ? (
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
                    className='p-3 border rounded-md cursor-pointer min-h-[100px] text-sm'
                    onClick={() => {
                      return setEditingDescription(true);
                    }}
                  >
                    {task.description || 'Add a description...'}
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
                          )}
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

                  {/* Existing comments */}
                  {task.comments && task.comments.length > 0 && (
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
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - right side (for properties) */}
            <ScrollArea
              className={`w-full md:w-72 lg:w-80 h-full overflow-auto border-t md:border-t-0 md:border-l p-4 md:p-6 ${
                sidebarVisible ? 'block' : 'hidden md:block'
              }`}
            >
              <div className='space-y-5'>
                {/* Status (Column) */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Status</div>
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
                </div>

                {/* Due Date */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Due Date</div>
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
                    <PopoverContent className='w-auto p-0'>
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
                </div>

                {/* Priority */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Priority</div>
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
                            <button
                              className='opacity-0 group-hover:opacity-100'
                              onClick={() => {
                                return handleRemoveLabel(label);
                              }}
                            >
                              <X size={10} />
                            </button>
                          </div>
                        );
                      })}

                    {showLabelInput ? (
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
                    )}
                  </div>
                </div>

                {/* Story Points */}
                <div className='space-y-1.5'>
                  <div className='text-xs text-gray-500'>Story Points</div>
                  {editingStoryPoints ? (
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
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Manager Modal */}
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
    </>
  );
};

export default TaskDetailDialog;
