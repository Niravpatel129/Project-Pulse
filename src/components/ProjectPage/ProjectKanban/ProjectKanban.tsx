'use client';
import { Card, CardContent } from '@/components/ui/card';
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
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// KanbanColumn now registers itself as droppable
const KanbanColumn = ({ title, children, id }) => {
  const { setNodeRef: setDroppableNodeRef } = useDroppable({ id });
  return (
    <div className='flex flex-col min-w-[250px]'>
      <div className='px-3 py-2 bg-muted/40 rounded-t-lg border border-border'>
        <h3 className='font-medium text-sm'>{title}</h3>
      </div>
      <div
        ref={setDroppableNodeRef}
        className='flex-1 p-3 rounded-b-lg border border-t-0 border-border min-h-[300px]'
      >
        {children}
      </div>
    </div>
  );
};

// SortableTaskCard unchanged
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
          <h4 className='font-medium text-sm'>{task.title}</h4>
          {task.description && (
            <p className='text-xs text-muted-foreground mt-1'>{task.description}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// TaskCard for overlay
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

  // map columnId → array of tasks
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // find the column containing a given task id
  const findContainer = (id) => {
    return Object.keys(columnsTasks).find((col) => {
      return columnsTasks[col].some((t) => {
        return t.id === id;
      });
    });
  };

  const handleDragStart = ({ active }) => {
    const fromCol = findContainer(active.id);
    setActiveTask(
      columnsTasks[fromCol].find((t) => {
        return t.id === active.id;
      }),
    );
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;

    // over.id will be either a task.id or a column.id (due to useDroppable)
    const overId = over.data?.current?.sortable?.containerId ?? over.id;
    const fromCol = findContainer(active.id);
    const toCol = columnsTasks.hasOwnProperty(overId) ? overId : findContainer(over.id);

    // same-column reorder preview
    if (fromCol && fromCol === toCol && toCol) {
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
      return;
    }

    // cross-column preview (including into empty)
    if (fromCol && toCol && fromCol !== toCol) {
      const sourceItems = columnsTasks[fromCol].filter((t) => {
        return t.id !== active.id;
      });
      const destItems = [...columnsTasks[toCol]];
      // determine insert position in dest:
      const overIndex = destItems.findIndex((t) => {
        return t.id === over.id;
      });
      const insertIndex = overIndex >= 0 ? overIndex : destItems.length;
      destItems.splice(insertIndex, 0, activeTask);

      setColumnsTasks((prev) => {
        return {
          ...prev,
          [fromCol]: sourceItems,
          [toCol]: destItems,
        };
      });
    }
  };

  const handleDragEnd = ({ active, over }) => {
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
              <KanbanColumn key={col.id} id={col.id} title={col.title}>
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
                  {columnsTasks[col.id].length === 0 && (
                    <div className='h-full flex items-center justify-center'>
                      <p className='text-xs text-muted-foreground'>No items</p>
                    </div>
                  )}
                </SortableContext>
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
