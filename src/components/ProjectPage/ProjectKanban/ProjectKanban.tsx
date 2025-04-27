'use client';
import { Card, CardContent } from '@/components/ui/card';
import { CommandShortcut } from '@/components/ui/command';
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
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// KanbanColumn now places Add Task directly after its children
const KanbanColumn = ({ title, children, id, onAddClick, isAdding }) => {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id });
  return (
    <div className='group flex flex-col min-w-[250px]'>
      <div className='px-3 py-2 bg-muted/40 rounded-t-lg border border-border'>
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
            className='flex items-center gap-1 mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition'
          >
            <Plus size={14} /> Add task
          </button>
        )}
      </div>
    </div>
  );
};

const SortableTaskCard = ({ task }) => {
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
      <Card className='mb-2 shadow-sm cursor-grab'>
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
      <CardContent className='p-3 flex items-center space-x-2'>
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
          className='bg-black text-white rounded px-2 py-1 flex items-center gap-1 text-xs font-medium'
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
    return setMounted(true);
  }, []);

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ];

  const initialTasks = [
    { id: '1', title: 'Research design options', description: 'Look for inspiration' },
    { id: '2', title: 'Create wireframes', description: 'For main screens' },
    { id: '3', title: 'Develop homepage', description: 'Implement basic structure' },
    { id: '4', title: 'Design review', description: 'With client' },
    { id: '5', title: 'Fix navigation bugs', description: 'Mobile menu issues' },
    { id: '6', title: 'Update documentation', description: 'Add recent changes' },
  ];

  const [columnsTasks, setColumnsTasks] = useState({
    todo: initialTasks.filter((t) => {
      return ['1', '2'].includes(t.id);
    }),
    'in-progress': initialTasks.filter((t) => {
      return ['3', '5'].includes(t.id);
    }),
    review: initialTasks.filter((t) => {
      return t.id === '4';
    }),
    done: initialTasks.filter((t) => {
      return t.id === '6';
    }),
  });

  const [activeTask, setActiveTask] = useState(null);
  const [addingColumn, setAddingColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const findContainer = (id: string) => {
    return (Object.keys(columnsTasks) as Array<keyof typeof columnsTasks>).find((col) => {
      return columnsTasks[col].some((t) => {
        return t.id === id;
      });
    });
  };

  const handleAddClick = (columnId: string) => {
    setAddingColumn(columnId);
    setNewTaskTitle('');
  };

  const handleSaveNew = () => {
    if (!addingColumn || !newTaskTitle.trim()) return;
    const id = Date.now().toString();
    const newTask = { id, title: newTaskTitle.trim(), description: '', status: addingColumn };
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
      destItems.splice(insertIndex, 0, activeTask!);
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

  return (
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
                onAddClick={handleAddClick}
                isAdding={addingColumn === col.id}
              >
                <SortableContext
                  id={col.id}
                  items={columnsTasks[col.id].map((t) => {
                    return t.id;
                  })}
                  strategy={verticalListSortingStrategy}
                >
                  {columnsTasks[col.id].map((task) => {
                    return <SortableTaskCard key={task.id} task={task} />;
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

        {mounted &&
          createPortal(
            <DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>,
            document.body,
          )}
      </DndContext>
    </div>
  );
};

export default ProjectKanban;
