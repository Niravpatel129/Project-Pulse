import { newRequest } from '@/utils/newRequest';

// Define types
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

export type Column = {
  id: string;
  title: string;
  color: string;
};

export type KanbanBoard = {
  columns: Column[];
  tasks: Task[];
};

// Base path for Kanban API endpoints
const BASE_PATH = '/kanban';

/**
 * Get all Kanban data for a project
 */
export const getKanbanBoard = async (projectId: string): Promise<KanbanBoard> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}`);
  return response.data;
};

/**
 * Get all columns for a project
 */
export const getColumns = async (projectId: string): Promise<Column[]> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}/columns`);
  return response.data;
};

/**
 * Create a new column
 */
export const createColumn = async (
  projectId: string,
  column: Omit<Column, 'id'>,
): Promise<Column> => {
  const response = await newRequest.post(`${BASE_PATH}/${projectId}/columns`, column);
  return response.data;
};

/**
 * Update a column
 */
export const updateColumn = async (
  projectId: string,
  columnId: string,
  updates: Partial<Column>,
): Promise<Column> => {
  const response = await newRequest.put(`${BASE_PATH}/${projectId}/columns/${columnId}`, updates);
  return response.data;
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
  return response.data;
};

/**
 * Get tasks for a specific column
 */
export const getTasksByColumn = async (projectId: string, columnId: string): Promise<Task[]> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}/columns/${columnId}/tasks`);
  return response.data;
};

/**
 * Create a new task
 */
export const createTask = async (projectId: string, task: Omit<Task, 'id'>): Promise<Task> => {
  const response = await newRequest.post(`${BASE_PATH}/${projectId}/tasks`, task);
  return response.data;
};

/**
 * Update a task
 */
export const updateTask = async (
  projectId: string,
  taskId: string,
  updates: Partial<Task>,
): Promise<Task> => {
  const response = await newRequest.put(`${BASE_PATH}/${projectId}/tasks/${taskId}`, updates);
  return response.data;
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
  return response.data;
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
  return response.data;
};

/**
 * Restore an archived task
 */
export const restoreTask = async (projectId: string, taskId: string): Promise<Task> => {
  const response = await newRequest.put(`${BASE_PATH}/${projectId}/tasks/${taskId}/restore`);
  return response.data;
};

/**
 * Get all archived tasks
 */
export const getArchivedTasks = async (projectId: string): Promise<Task[]> => {
  const response = await newRequest.get(`${BASE_PATH}/${projectId}/tasks/archived`);
  return response.data;
};

/**
 * Save the entire board state (all columns and tasks)
 */
export const saveKanbanBoard = async (projectId: string, board: KanbanBoard): Promise<void> => {
  await newRequest.put(`${BASE_PATH}/${projectId}`, board);
};
