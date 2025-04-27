import { newRequest } from '@/utils/newRequest';

// Frontend Task type
export type Task = {
  id: string;
  title: string;
  columnId: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate?: Date;
  labels?: string[];
  storyPoints?: number;
  _archived?: boolean;
  _deleted?: boolean;
  archivedAt?: Date;
};

// Backend Task type
export type BackendTask = {
  _id: string;
  title: string;
  columnId: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate?: Date;
  labels?: string[];
  storyPoints?: number;
  _archived?: boolean;
  _deleted?: boolean;
  archivedAt?: Date;
};

// Backend Column type
export type BackendColumn = {
  _id: string;
  projectId: string;
  title: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// Frontend Column type (used in UI)
export type Column = {
  id: string;
  title: string;
  color: string;
  order: number;
};

export type KanbanBoard = {
  columns: Column[];
  tasks: Task[];
};

// Base path for Kanban API endpoints
const BASE_PATH = '/kanban';

/**
 * Transform a backend column to frontend format
 */
const transformColumn = (backendColumn: BackendColumn): Column => {
  return {
    id: backendColumn._id,
    title: backendColumn.title,
    color: backendColumn.color,
    order: backendColumn.order,
  };
};

/**
 * Transform a frontend column to backend format for creation/updates
 */
const prepareColumnForBackend = (column: Partial<Column>): Partial<BackendColumn> => {
  const backendColumn: any = { ...column };

  if ('id' in column) {
    backendColumn._id = column.id;
    delete backendColumn.id;
  }

  return backendColumn as Partial<BackendColumn>;
};

/**
 * Transform a backend task to frontend format
 */
const transformTask = (backendTask: BackendTask): Task => {
  const { _id, ...rest } = backendTask;
  return {
    id: _id,
    ...rest,
  };
};

/**
 * Transform a frontend task to backend format for creation/updates
 */
const prepareTaskForBackend = (task: Partial<Task>): Partial<BackendTask> => {
  const backendTask: any = { ...task };

  if ('id' in task) {
    backendTask._id = task.id;
    delete backendTask.id;
  }

  return backendTask as Partial<BackendTask>;
};

/**
 * Transform an array of backend tasks to frontend format
 */
const transformTasks = (backendTasks: BackendTask[]): Task[] => {
  return backendTasks.map(transformTask);
};

/**
 * Get all Kanban data for a project
 */
export const getKanbanBoard = async (projectId: string): Promise<KanbanBoard> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}`);
  const data = response.data;

  // Transform backend columns to frontend format
  const columns = data.columns.map(transformColumn);

  // Transform backend tasks to frontend format
  const tasks = data.tasks ? transformTasks(data.tasks) : [];

  return {
    columns,
    tasks,
  };
};

/**
 * Get all columns for a project
 */
export const getColumns = async (projectId: string): Promise<Column[]> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}/columns`);
  return response.data.map(transformColumn);
};

/**
 * Create a new column
 */
export const createColumn = async (
  projectId: string,
  column: Omit<Column, 'id'>,
): Promise<Column> => {
  const backendColumn = prepareColumnForBackend(column);
  const response = await newRequest.post(`${BASE_PATH}/${projectId}/columns`, backendColumn);
  return transformColumn(response.data);
};

/**
 * Update a column
 */
export const updateColumn = async (
  projectId: string,
  columnId: string,
  updates: Partial<Column>,
): Promise<Column> => {
  const backendUpdates = prepareColumnForBackend(updates);
  const response = await newRequest.put(
    `${BASE_PATH}/${projectId}/columns/${columnId}`,
    backendUpdates,
  );
  return transformColumn(response.data);
};

/**
 * Delete a column
 */
export const deleteColumn = async (projectId: string, columnId: string): Promise<void> => {
  await newRequest.delete(`${BASE_PATH}/${projectId}/columns/${columnId}`);
};

/**
 * Update column order
 */
export const updateColumnOrder = async (projectId: string, columnIds: string[]): Promise<void> => {
  await newRequest.put(`${BASE_PATH}/${projectId}/columns/order`, { columnIds });
};

/**
 * Get all tasks for a project
 */
export const getTasks = async (projectId: string): Promise<Task[]> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}/tasks`);
  return transformTasks(response.data);
};

/**
 * Get tasks for a specific column
 */
export const getTasksByColumn = async (projectId: string, columnId: string): Promise<Task[]> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}/columns/${columnId}/tasks`);
  return transformTasks(response.data);
};

/**
 * Create a new task
 */
export const createTask = async (projectId: string, task: Omit<Task, 'id'>): Promise<Task> => {
  const backendTask = prepareTaskForBackend(task);
  const response = await newRequest.post(`${BASE_PATH}/${projectId}/tasks`, backendTask);
  return transformTask(response.data);
};

/**
 * Update a task
 */
export const updateTask = async (
  projectId: string,
  taskId: string,
  updates: Partial<Task>,
): Promise<Task> => {
  const backendUpdates = prepareTaskForBackend(updates);
  const response = await newRequest.put(
    `${BASE_PATH}/${projectId}/tasks/${taskId}`,
    backendUpdates,
  );
  return transformTask(response.data);
};

/**
 * Move a task to a different column
 */
export const moveTask = async (
  projectId: string,
  taskId: string,
  targetColumnId: string,
  position?: number,
): Promise<Task> => {
  const response = await newRequest.put(`${BASE_PATH}/${projectId}/tasks/${taskId}/move`, {
    columnId: targetColumnId,
    position,
  });
  return transformTask(response.data);
};

/**
 * Delete a task
 */
export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
  await newRequest.delete(`${BASE_PATH}/${projectId}/tasks/${taskId}`);
};

/**
 * Archive a task
 */
export const archiveTask = async (projectId: string, taskId: string): Promise<Task> => {
  const response = await newRequest.put(`${BASE_PATH}/${projectId}/tasks/${taskId}/archive`);
  return transformTask(response.data);
};

/**
 * Restore an archived task
 */
export const restoreTask = async (projectId: string, taskId: string): Promise<Task> => {
  const response = await newRequest.put(`${BASE_PATH}/${projectId}/tasks/${taskId}/restore`);
  return transformTask(response.data);
};

/**
 * Get all archived tasks
 */
export const getArchivedTasks = async (projectId: string): Promise<Task[]> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}/tasks/archived`);
  return transformTasks(response.data);
};

/**
 * Save the entire board state (all columns and tasks)
 */
export const saveKanbanBoard = async (projectId: string, board: KanbanBoard): Promise<void> => {
  // Transform columns back to backend format
  const backendColumns = board.columns.map((column) => {
    return {
      _id: column.id,
      title: column.title,
      color: column.color,
      order: column.order,
    };
  });

  // Transform tasks back to backend format
  const backendTasks = board.tasks.map((task) => {
    const { id, ...rest } = task;
    return {
      _id: id,
      ...rest,
    };
  });

  await newRequest.put(`${BASE_PATH}/${projectId}`, {
    columns: backendColumns,
    tasks: backendTasks,
  });
};
