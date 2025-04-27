'use client';
import { Button } from '@/components/ui/button';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useKanbanBoard } from '@/hooks/useKanbanBoard';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, MoreVertical, Pencil, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import KanbanHeader from './KanbanHeader';
import TaskDetailDialog from './TaskDetailDialog';

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
const KanbanColumn = ({
  title,
  children,
  id,
  onAddClick,
  isAdding,
  color = '#e2e8f0',
  onEditTitle,
}) => {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      onEditTitle(id, editTitle);
      setIsEditing(false);
    }
  };

  return (
    <div className='flex flex-col w-full min-w-[246px]'>
      <div
        className='px-3 py-2 rounded-t-lg border border-border flex justify-between items-center'
        style={{
          backgroundColor: `${color}30`,
          borderBottomColor: color,
        }}
      >
        {isEditing ? (
          <div className='flex items-center gap-2 w-full'>
            <input
              className='text-sm bg-background px-1 py-0.5 rounded border flex-1'
              value={editTitle}
              onChange={(e) => {
                return setEditTitle(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditTitle(title);
                }
              }}
              onBlur={handleTitleSave}
              autoFocus
            />
          </div>
        ) : (
          <h3
            className='font-medium text-sm cursor-pointer hover:text-foreground transition-colors'
            onClick={() => {
              setEditTitle(title);
              setIsEditing(true);
            }}
          >
            {title}
          </h3>
        )}
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
            className='flex items-center gap-1 mt-2 text-xs text-muted-foreground transition w-full'
          >
            <Plus size={14} /> Add task
          </button>
        )}
      </div>
    </div>
  );
};

const SortableTaskCard = ({
  task,
  onTaskClick,
  onTaskDelete,
  onTaskArchive,
  columns,
  onMoveTask,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onTaskDelete(task.id);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    onTaskArchive(task.id);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className='mb-2 shadow-sm cursor-grab group relative'
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
          <div className='absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition'>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => {
                  return e.stopPropagation();
                }}
              >
                <button className='text-muted-foreground hover:text-foreground'>
                  <MoreVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {columns.map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTask(task.id, column.id);
                      }}
                      disabled={task.columnId === column.id}
                    >
                      <div className='flex items-center'>
                        <div
                          className='w-3 h-3 rounded-full mr-2'
                          style={{ backgroundColor: column.color }}
                        />
                        Move to {column.title}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(e);
                  }}
                >
                  <Archive className='mr-2 h-4 w-4' />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(e);
                  }}
                  className='text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className='text-muted-foreground hover:text-destructive'
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Task</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h4 className='font-medium text-sm text-wrap break-all pr-6'>{task.title}</h4>
        </CardContent>
      </Card>
    </div>
  );
};

// Non-draggable version of TaskCard for server-side rendering
const StaticTaskCard = ({
  task,
  onTaskClick,
  onTaskDelete,
  onTaskArchive,
  columns,
  onMoveTask,
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    onTaskDelete(task.id);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    onTaskArchive(task.id);
  };

  return (
    <div>
      <Card
        className='mb-2 shadow-sm cursor-pointer group relative'
        onClick={() => {
          return onTaskClick(task);
        }}
      >
        <CardContent className='p-3'>
          <div className='absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition'>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => {
                  return e.stopPropagation();
                }}
              >
                <button className='text-muted-foreground hover:text-foreground'>
                  <MoreVertical size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                >
                  <Pencil className='mr-2 h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {columns.map((column) => {
                  return (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveTask(task.id, column.id);
                      }}
                      disabled={task.columnId === column.id}
                    >
                      <div className='flex items-center'>
                        <div
                          className='w-3 h-3 rounded-full mr-2'
                          style={{ backgroundColor: column.color }}
                        />
                        Move to {column.title}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive(e);
                  }}
                >
                  <Archive className='mr-2 h-4 w-4' />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(e);
                  }}
                  className='text-destructive'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className='text-muted-foreground hover:text-destructive' onClick={handleDelete}>
              <Trash2 size={14} />
            </button>
          </div>
          <h4 className='font-medium text-sm text-wrap break-all pr-6'>{task.title}</h4>
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
  const {
    mounted,
    loading,
    error,
    columns,
    columnsTasks,
    filteredTasks,
    activeTask,
    addingColumn,
    newTaskTitle,
    boardActionsOpen,
    editingColumn,
    newColumnName,
    editColumnName,
    newColumnColor,
    selectedTask,
    taskDialogOpen,
    archivedTasks,
    handleAddClick,
    handleSaveNew,
    handleCancelNew,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getTotalTaskCount,
    getFilteredTaskCount,
    handleSearch,
    handleAddColumn,
    setBoardActionsOpen,
    setEditingColumn,
    setEditColumnName,
    setNewColumnName,
    setNewColumnColor,
    handleEditColumn,
    handleRemoveColumn,
    handleTaskClick,
    handleTaskUpdate,
    setTaskDialogOpen,
    setNewTaskTitle,
    setColumns,
    handleUpdateColumnColor,
    handleTaskDelete,
    handleTaskArchive,
    handleRestoreTask,
    refreshData,
  } = useKanbanBoard();

  // Add state for archived tasks
  const [showArchived, setShowArchived] = useState(false);

  // Set up sensors for drag and drop - must be declared before any conditional returns
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Add keyboard shortcut effect for adding new tasks
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt/Option + N to add new task to first column
      if (e.altKey && e.key === 'n' && columns.length > 0 && !addingColumn) {
        e.preventDefault();
        handleAddClick(columns[0].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      return window.removeEventListener('keydown', handleKeyDown);
    };
  }, [columns, addingColumn, handleAddClick]);

  // Add new handler for moving tasks between columns
  const handleMoveTask = (taskId, targetColumnId) => {
    // Find which column contains this task
    let sourceColumnId = null;
    let taskToMove = null;

    for (const [colId, tasks] of Object.entries(columnsTasks)) {
      const foundTask = tasks.find((task) => {
        return task.id === taskId;
      });
      if (foundTask) {
        sourceColumnId = colId;
        taskToMove = foundTask;
        break;
      }
    }

    if (sourceColumnId && taskToMove && sourceColumnId !== targetColumnId) {
      // Update the task with the new column ID and use the existing handleTaskUpdate function
      const updatedTask = { ...taskToMove, columnId: targetColumnId };
      handleTaskUpdate(updatedTask);
    }
  };

  // Render a simplified version for server-side rendering or loading state
  if (!mounted || loading) {
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
        <div className='w-full h-96 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='mt-2 text-sm text-muted-foreground'>Loading kanban board...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='w-full'>
        <KanbanHeader
          title='Project Kanban Board'
          totalTasks={0}
          filteredTasks={0}
          onSearch={handleSearch}
          onAddColumn={handleAddColumn}
          onBoardActions={() => {
            return setBoardActionsOpen(true);
          }}
        />
        <div className='w-full h-96 flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-destructive mb-2'>
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='mx-auto'
              >
                <path
                  d='M12 9V13M12 16V16.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </div>
            <h3 className='font-medium mb-1'>Failed to load kanban board</h3>
            <p className='text-sm text-muted-foreground mb-4'>{error}</p>
            <button
              onClick={refreshData}
              className='px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state if no columns
  if (columns.length === 0) {
    return (
      <div className='w-full'>
        <KanbanHeader
          title='Project Kanban Board'
          totalTasks={0}
          filteredTasks={0}
          onSearch={handleSearch}
          onAddColumn={handleAddColumn}
          onBoardActions={() => {
            return setBoardActionsOpen(true);
          }}
        />
        <div className='w-full h-96 flex items-center justify-center'>
          <div className='text-center max-w-md mx-auto'>
            <h3 className='font-medium mb-2'>No columns yet</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Get started by creating your first column
            </p>
            <button
              onClick={() => {
                return setBoardActionsOpen(true);
              }}
              className='px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium'
            >
              <Plus size={16} className='inline-block mr-1' /> Add Column
            </button>
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
        onToggleArchived={() => {
          return setShowArchived((prev) => {
            return !prev;
          });
        }}
        showArchived={showArchived}
      />

      {showArchived && archivedTasks.length > 0 ? (
        <div className='p-4 border rounded-lg mb-4'>
          <h3 className='font-medium mb-3'>Archived Tasks</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
            {archivedTasks.map((task) => {
              return (
                <Card key={task.id} className='relative group'>
                  <CardContent className='p-3'>
                    <div className='absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => {
                          return handleRestoreTask(task.id);
                        }}
                      >
                        Restore
                      </Button>
                    </div>
                    <h4 className='font-medium text-sm'>{task.title}</h4>
                    <div className='text-xs text-muted-foreground mt-2'>
                      Archived {new Date(task.archivedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

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
              // Filter out tasks marked as deleted or archived
              const visibleTasks = (filteredTasks[col.id] || []).filter((task) => {
                return !task._deleted && !task._archived;
              });

              return (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  color={col.color}
                  onAddClick={handleAddClick}
                  isAdding={addingColumn === col.id}
                  onEditTitle={handleEditColumn}
                >
                  <SortableContext
                    id={col.id}
                    items={
                      visibleTasks.map((t) => {
                        return t.id;
                      }) || []
                    }
                    strategy={verticalListSortingStrategy}
                  >
                    {visibleTasks.map((task) => {
                      return (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onTaskClick={handleTaskClick}
                          onTaskDelete={handleTaskDelete}
                          onTaskArchive={handleTaskArchive}
                          columns={columns}
                          onMoveTask={handleMoveTask}
                        />
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
                            handleUpdateColumnColor(column.id, color);
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
