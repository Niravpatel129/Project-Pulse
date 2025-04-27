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
import { Input } from '@/components/ui/input';
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
import { Pencil, Plus, X } from 'lucide-react';
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
