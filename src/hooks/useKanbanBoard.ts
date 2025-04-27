'use client';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';

type Task = {
  id: string;
  title: string;
  description: string;
  columnId: string;
};

type Column = {
  id: string;
  title: string;
  color: string;
};

export function useKanbanBoard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [columns, setColumns] = useState<Column[]>([
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

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [addingColumn, setAddingColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<{ [key: string]: any[] }>({ ...columnsTasks });
  const [boardActionsOpen, setBoardActionsOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [newColumnName, setNewColumnName] = useState('');
  const [editColumnName, setEditColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#e2e8f0');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

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

  const handleAddColumn = (name: string, color: string) => {
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
    if (!searchQuery) {
      setFilteredTasks({ ...columnsTasks });
    } else {
      handleSearch(searchQuery);
    }
  }, [columnsTasks]);

  const handleEditColumn = (columnId: string, newName: string) => {
    setColumns((prev) => {
      return prev.map((col) => {
        return col.id === columnId ? { ...col, title: newName } : col;
      });
    });
  };

  const handleRemoveColumn = (columnId: string) => {
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
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    const currentColumnId = findContainer(updatedTask.id);
    const targetColumnId = updatedTask.columnId;

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
  };

  const handleUpdateColumnColor = (columnId: string, color: string) => {
    setColumns((prev) => {
      return prev.map((col) => {
        return col.id === columnId ? { ...col, color } : col;
      });
    });
  };

  return {
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
    setTaskDialogOpen,
    setNewTaskTitle,
    setColumns,
  };
}
