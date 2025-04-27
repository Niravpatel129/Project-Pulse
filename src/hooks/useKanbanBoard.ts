'use client';
import { toast } from '@/components/ui/use-toast';
import { useProject } from '@/contexts/ProjectContext';
import * as kanbanApi from '@/services/kanbanApi';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';

export function useKanbanBoard() {
  const { project } = useProject();
  const projectId = project?._id as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [columns, setColumns] = useState<kanbanApi.Column[]>([]);
  const [columnsTasks, setColumnsTasks] = useState<{ [key: string]: kanbanApi.Task[] }>({});
  const [archivedTasks, setArchivedTasks] = useState<kanbanApi.Task[]>([]);

  const [activeTask, setActiveTask] = useState<kanbanApi.Task | null>(null);
  const [addingColumn, setAddingColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<{ [key: string]: any[] }>({});
  const [boardActionsOpen, setBoardActionsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [editColumnName, setEditColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#e2e8f0');
  const [selectedTask, setSelectedTask] = useState<kanbanApi.Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    setMounted(true);

    if (projectId) {
      loadKanbanData();
    }
  }, [projectId]);

  const loadKanbanData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      // Load kanban data from API
      const data = await kanbanApi.getKanbanBoard(projectId);

      // Set columns
      setColumns(data.columns);

      // Organize tasks by column
      const tasksByColumn: { [key: string]: kanbanApi.Task[] } = {};

      // Initialize columns with empty arrays
      data.columns.forEach((column) => {
        tasksByColumn[column.id] = [];
      });

      // Populate tasks by column
      data.tasks.forEach((task) => {
        if (!task._archived && !task._deleted) {
          if (tasksByColumn[task.columnId]) {
            tasksByColumn[task.columnId].push(task);
          }
        }
      });

      setColumnsTasks(tasksByColumn);

      // Get archived tasks
      const archived = await kanbanApi.getArchivedTasks(projectId);
      setArchivedTasks(archived);
    } catch (err) {
      setError('Failed to load kanban data');
      console.error('Error loading kanban data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load kanban board data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const findContainer = (id: string) => {
    return (Object.keys(columnsTasks) as Array<keyof typeof columnsTasks>).find((col) => {
      return columnsTasks[col].some((t) => {
        return t.id === id;
      });
    });
  };

  const findContainerById = (taskId: string) => {
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

  const handleSaveNew = async () => {
    if (!addingColumn || !newTaskTitle.trim() || !projectId) return;

    try {
      const newTask = {
        title: newTaskTitle.trim(),
        columnId: addingColumn,
      };

      const createdTask = await kanbanApi.createTask(projectId, newTask);

      setColumnsTasks((prev) => {
        return {
          ...prev,
          [addingColumn]: [...prev[addingColumn], createdTask],
        };
      });

      setAddingColumn(null);
      setNewTaskTitle('');
    } catch (err) {
      console.error('Error creating task:', err);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  const handleCancelNew = () => {
    setAddingColumn(null);
    setNewTaskTitle('');
  };

  const handleDragStart = ({ active }: { active: any }) => {
    const from = findContainer(active.id)!;
    setActiveTask(
      columnsTasks[from].find((t) => {
        return t.id === active.id;
      })!,
    );
  };

  const handleDragOver = ({ active, over }: { active: any; over: any }) => {
    if (!over) return;
    const overId = over.data?.current?.sortable?.containerId ?? over.id;
    const fromCol = findContainer(active.id)!;
    const toCol = columnsTasks.hasOwnProperty(overId)
      ? (overId as string)
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

      const updatedTask = { ...activeTask!, columnId: toCol as string };
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

  const handleDragEnd = async ({ active, over }: { active: any; over: any }) => {
    setActiveTask(null);

    if (!over || !projectId) return;

    try {
      const fromCol = findContainer(active.id)!;
      const toCol = columnsTasks.hasOwnProperty(over.id)
        ? (over.id as string)
        : findContainer(over.id)!;

      if (fromCol && toCol) {
        const taskId = active.id;
        const position = columnsTasks[toCol].findIndex((t) => {
          return t.id === over.id;
        });

        // Only make API call if there was an actual change
        if (fromCol !== toCol || position !== -1) {
          await kanbanApi.moveTask(
            projectId,
            taskId,
            toCol as string,
            position >= 0 ? position : undefined,
          );
        }
      }
    } catch (err) {
      console.error('Error moving task:', err);
      toast({
        title: 'Error',
        description: 'Failed to move task',
        variant: 'destructive',
      });

      // Reload data to ensure UI is in sync with backend
      loadKanbanData();
    }
  };

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
            return task.title.toLowerCase().includes(lowerQuery);
          }),
        ];
      }),
    );
    setFilteredTasks(filtered);
  };

  const handleAddColumn = async (name: string, color: string) => {
    if (!projectId) return;

    try {
      const newColumn = await kanbanApi.createColumn(projectId, {
        title: name,
        color,
      });

      setColumns((prev) => {
        return [...prev, newColumn];
      });

      setColumnsTasks((prev) => {
        return { ...prev, [newColumn.id]: [] };
      });

      setFilteredTasks((prev) => {
        return { ...prev, [newColumn.id]: [] };
      });

      setNewColumnName('');
      setNewColumnColor('#e2e8f0');
    } catch (err) {
      console.error('Error creating column:', err);
      toast({
        title: 'Error',
        description: 'Failed to create column',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!searchQuery) {
      setFilteredTasks({ ...columnsTasks });
    } else {
      handleSearch(searchQuery);
    }
  }, [columnsTasks]);

  const handleEditColumn = async (columnId: string, newName: string) => {
    if (!projectId) return;

    try {
      await kanbanApi.updateColumn(projectId, columnId, { title: newName });

      setColumns((prev) => {
        return prev.map((col) => {
          return col.id === columnId ? { ...col, title: newName } : col;
        });
      });
    } catch (err) {
      console.error('Error updating column:', err);
      toast({
        title: 'Error',
        description: 'Failed to update column',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveColumn = async (columnId: string) => {
    if (!projectId) return;

    try {
      await kanbanApi.deleteColumn(projectId, columnId);

      setColumns((prev) => {
        return prev.filter((col) => {
          return col.id !== columnId;
        });
      });

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
    } catch (err) {
      console.error('Error deleting column:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete column',
        variant: 'destructive',
      });
    }
  };

  const handleTaskClick = (task: kanbanApi.Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskUpdate = async (updatedTask: kanbanApi.Task) => {
    if (!projectId) return;

    try {
      const currentColumnId = findContainer(updatedTask.id);
      const targetColumnId = updatedTask.columnId;

      // Only make the API call if there's been a change
      await kanbanApi.updateTask(projectId, updatedTask.id, updatedTask);

      if (currentColumnId === targetColumnId) {
        setColumnsTasks((prev) => {
          return {
            ...prev,
            [currentColumnId]: prev[currentColumnId].map((t) => {
              return t.id === updatedTask.id ? updatedTask : t;
            }),
          };
        });
      } else {
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
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateColumnColor = async (columnId: string, color: string) => {
    if (!projectId) return;

    try {
      await kanbanApi.updateColumn(projectId, columnId, { color });

      setColumns((prev) => {
        return prev.map((col) => {
          return col.id === columnId ? { ...col, color } : col;
        });
      });
    } catch (err) {
      console.error('Error updating column color:', err);
      toast({
        title: 'Error',
        description: 'Failed to update column color',
        variant: 'destructive',
      });
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!projectId) return;

    try {
      await kanbanApi.deleteTask(projectId, taskId);

      // Find which column contains the task
      const columnId = findContainerById(taskId);

      if (columnId) {
        setColumnsTasks((prev) => {
          return {
            ...prev,
            [columnId]: prev[columnId].filter((t) => {
              return t.id !== taskId;
            }),
          };
        });
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const handleTaskArchive = async (taskId: string) => {
    if (!projectId) return;

    try {
      const archivedTask = await kanbanApi.archiveTask(projectId, taskId);

      // Add to archived tasks
      setArchivedTasks((prev) => {
        return [...prev, archivedTask];
      });

      // Remove from column tasks
      const columnId = findContainerById(taskId);

      if (columnId) {
        setColumnsTasks((prev) => {
          return {
            ...prev,
            [columnId]: prev[columnId].filter((t) => {
              return t.id !== taskId;
            }),
          };
        });
      }
    } catch (err) {
      console.error('Error archiving task:', err);
      toast({
        title: 'Error',
        description: 'Failed to archive task',
        variant: 'destructive',
      });
    }
  };

  const handleRestoreTask = async (taskId: string) => {
    if (!projectId) return;

    try {
      const restoredTask = await kanbanApi.restoreTask(projectId, taskId);

      // Remove from archived tasks
      setArchivedTasks((prev) => {
        return prev.filter((t) => {
          return t.id !== taskId;
        });
      });

      // Add to column tasks
      setColumnsTasks((prev) => {
        return {
          ...prev,
          [restoredTask.columnId]: [...prev[restoredTask.columnId], restoredTask],
        };
      });
    } catch (err) {
      console.error('Error restoring task:', err);
      toast({
        title: 'Error',
        description: 'Failed to restore task',
        variant: 'destructive',
      });
    }
  };

  return {
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
    findContainer,
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
    handleUpdateColumnColor,
    handleTaskDelete,
    handleTaskArchive,
    handleRestoreTask,
    setTaskDialogOpen,
    setNewTaskTitle,
    setColumns,
    refreshData: loadKanbanData,
  };
}
