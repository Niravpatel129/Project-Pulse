'use client';
import { Card, CardContent } from '@/components/ui/card';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

// Simple column component
const KanbanColumn = ({ title, children, id }) => {
  return (
    <div className='flex flex-col min-w-[250px]'>
      <div className='px-3 py-2 bg-muted/40 rounded-t-lg border border-border'>
        <h3 className='font-medium text-sm'>{title}</h3>
      </div>
      <div className='flex-1 p-3 rounded-b-lg border border-t-0 border-border min-h-[300px]'>
        {children}
      </div>
    </div>
  );
};

// Sortable task card component
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

// Task card for overlay when dragging
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
  // Sample data - replace with your actual project data
  const [columns] = useState([
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Research design options',
      description: 'Look for inspiration',
      status: 'todo',
    },
    { id: '2', title: 'Create wireframes', description: 'For main screens', status: 'todo' },
    {
      id: '3',
      title: 'Develop homepage',
      description: 'Implement basic structure',
      status: 'in-progress',
    },
    { id: '4', title: 'Design review', description: 'With client', status: 'review' },
    {
      id: '5',
      title: 'Fix navigation bugs',
      description: 'Mobile menu issues',
      status: 'in-progress',
    },
    { id: '6', title: 'Update documentation', description: 'Add recent changes', status: 'done' },
  ]);

  // Active dragging task state
  const [activeTask, setActiveTask] = useState(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  // Filter tasks by status/column
  const getTasksByStatus = (status) => {
    return tasks.filter((task) => {
      return task.status === status;
    });
  };

  // Drag handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const draggedTask = tasks.find((task) => {
      return task.id === active.id;
    });
    setActiveTask(draggedTask);
  };

  const handleDragOver = (event) => {
    // We could implement more complex sorting logic here
    // For now we'll just handle column changes in handleDragEnd
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    // Find the containers (columns) that tasks are moving between
    const activeTaskId = active.id;
    const activeTask = tasks.find((task) => {
      return task.id === activeTaskId;
    });

    // Find which column the task was dropped over
    const overContainer = over.data?.current?.sortable?.containerId || over.id;

    // If the task's status hasn't changed, do nothing
    if (activeTask.status === overContainer) {
      setActiveTask(null);
      return;
    }

    // Update the task's status
    setTasks(
      tasks.map((task) => {
        return task.id === activeTaskId ? { ...task, status: overContainer } : task;
      }),
    );

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
          {columns.map((column) => {
            return (
              <KanbanColumn key={column.id} id={column.id} title={column.title}>
                <SortableContext
                  id={column.id}
                  items={getTasksByStatus(column.id).map((task) => {
                    return task.id;
                  })}
                  strategy={verticalListSortingStrategy}
                >
                  {getTasksByStatus(column.id).map((task) => {
                    return <SortableTaskCard key={task.id} task={task} />;
                  })}
                  {getTasksByStatus(column.id).length === 0 && (
                    <div className='h-full flex items-center justify-center'>
                      <p className='text-xs text-muted-foreground'>No items</p>
                    </div>
                  )}
                </SortableContext>
              </KanbanColumn>
            );
          })}
        </div>

        {/* Drag overlay */}
        <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
};

export default ProjectKanban;
