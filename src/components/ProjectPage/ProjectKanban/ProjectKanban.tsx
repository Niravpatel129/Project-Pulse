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
import { Pencil, Plus, X } from 'lucide-react';
import React from 'react';
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
