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
    <div className='group flex flex-col w-full min-w-[246px]'>
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
            className='flex items-center gap-1 mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition w-full'
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
          <div className='absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition'>
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
          {task.description && (
            <p className='text-xs text-muted-foreground mt-1'>{task.description}</p>
          )}
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
          <div className='absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition'>
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
  const {
    mounted,
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
  } = useKanbanBoard();

  // State for archived tasks
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

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

  // Add handler for archiving tasks
  const handleTaskArchive = (taskId) => {
    // Find which column contains this task
    let columnId = null;
    let taskToArchive = null;

    for (const [colId, tasks] of Object.entries(columnsTasks)) {
      const foundTask = tasks.find((task) => {
        return task.id === taskId;
      });
      if (foundTask) {
        columnId = colId;
        taskToArchive = foundTask;
        break;
      }
    }

    if (columnId && taskToArchive) {
      // Add task to archived tasks
      setArchivedTasks((prev) => {
        return [...prev, { ...taskToArchive, archivedAt: new Date() }];
      });

      // Instead of using a non-existent column, simply filter the task out directly
      // using the existing hook methods

      // 1. Find all tasks in the same column except the one to archive
      const remainingTasks = columnsTasks[columnId].filter((t) => {
        return t.id !== taskId;
      });

      // 2. Use the handleRemoveColumn and handleAddColumn to effectively rebuild
      // the column without the archived task
      const oldColumnId = columnId;
      const columnToRecreate = columns.find((col) => {
        return col.id === oldColumnId;
      });

      // 3. Create a temporary column copy with the same properties
      if (columnToRecreate) {
        // Remove the task directly by updating the hook state
        // Set the task to a stringified empty object so it gets filtered out
        // but doesn't cause iteration errors
        handleTaskUpdate({
          ...taskToArchive,
          title: '[ARCHIVED] ' + taskToArchive.title,
          _archived: true,
        });
      }
    }
  };

  // Handler to restore tasks from archive
  const handleRestoreTask = (taskId) => {
    const taskToRestore = archivedTasks.find((task) => {
      return task.id === taskId;
    });
    if (taskToRestore) {
      // Remove archived status
      const { archivedAt, ...restoredTask } = taskToRestore;

      // Add back to its original column or the first column if original doesn't exist
      const targetColumnId = columns.find((col) => {
        return col.id === restoredTask.columnId;
      })
        ? restoredTask.columnId
        : columns[0]?.id;

      if (targetColumnId) {
        // Update task with proper column ID and add back to active tasks
        // Also remove the _archived flag
        const { _archived, ...cleanTask } = restoredTask;
        handleTaskUpdate({ ...cleanTask, columnId: targetColumnId });

        // Remove from archived tasks
        setArchivedTasks((prev) => {
          return prev.filter((task) => {
            return task.id !== taskId;
          });
        });
      }
    }
  };

  // Add new handler for task deletion
  const handleTaskDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      // Since we can't directly delete tasks with the current hook API,
      // use our archive functionality but don't add to archived tasks

      // Find the task
      let columnId = null;
      let taskToDelete = null;

      for (const [colId, tasks] of Object.entries(columnsTasks)) {
        const foundTask = tasks.find((task) => {
          return task.id === taskId;
        });
        if (foundTask) {
          columnId = colId;
          taskToDelete = foundTask;
          break;
        }
      }

      if (columnId && taskToDelete) {
        // Use the first existing column as a temporary holding place
        const firstColId = columns[0].id;

        // Move the task to the first column, then filter it out in the UI
        // This avoids the "not iterable" error by using existing columns
        handleTaskUpdate({
          ...taskToDelete,
          columnId: firstColId,
          title: '[DELETED]',
          _deleted: true,
        });

        // Then filter it out in the UI rendering
      }
    }
  };

  const handleDirectColumnEdit = (columnId, newTitle) => {
    handleEditColumn(columnId, newTitle);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
                    className='px-3 py-2 rounded-t-lg border border-border flex justify-between items-center'
                    style={{
                      backgroundColor: `${col.color}30`,
                      borderBottomColor: col.color,
                    }}
                  >
                    <h3 className='font-medium text-sm cursor-pointer hover:text-foreground transition-colors'>
                      {col.title}
                    </h3>
                  </div>
                  <div className='p-3 rounded-b-lg border border-t-0 border-border min-h-[300px] space-y-2'>
                    {(filteredTasks[col.id] || []).map((task) => {
                      return (
                        <StaticTaskCard
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
                    <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100'>
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
                    {task.description && (
                      <p className='text-xs text-muted-foreground mt-1'>{task.description}</p>
                    )}
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
                  onEditTitle={handleDirectColumnEdit}
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
