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
  reporter?: {
    id: string;
    name: string;
    avatar: string;
  };
  description?: string;
  dueDate?: Date;
  labels?: string[];
  storyPoints?: number;
  _archived?: boolean;
  _deleted?: boolean;
  archivedAt?: Date;
  comments?: Comment[];
  attachments?: Attachment[];
};

// Comment type
export type Comment = {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: Date;
};

// Attachment type
export type Attachment = {
  id: string;
  type: string;
  url: string;
  title: string;
  size?: number;
  createdAt?: Date;
  createdBy?: {
    id: string;
    name: string;
    avatar: string;
  };
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
  reporter?: {
    id: string;
    name: string;
    avatar: string;
  };
  description?: string;
  dueDate?: Date;
  labels?: string[];
  storyPoints?: number;
  _archived?: boolean;
  _deleted?: boolean;
  archivedAt?: Date;
  comments?: {
    _id: string;
    author: {
      id: string;
      name: string;
      avatar: string;
    };
    content: string;
    createdAt: Date;
  }[];
  attachments?: {
    _id: string;
    type: string;
    url: string;
    title: string;
    size?: number;
    createdAt?: Date;
    createdBy?: {
      id: string;
      name: string;
      avatar: string;
    };
  }[];
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
 * Transform a backend comment to frontend format
 */
const transformComment = (backendComment: any): Comment => {
  const { _id, ...rest } = backendComment;
  return {
    id: _id,
    ...rest,
  };
};

/**
 * Transform a backend attachment to frontend format
 */
const transformAttachment = (backendAttachment: any): Attachment => {
  const { _id, ...rest } = backendAttachment;
  return {
    id: _id,
    ...rest,
  };
};

/**
 * Transform a backend task to frontend format
 */
const transformTask = (backendTask: BackendTask): Task => {
  const { _id, comments, attachments, ...rest } = backendTask;

  // Transform comments if they exist
  const transformedComments = comments?.map(transformComment);

  // Transform attachments if they exist
  const transformedAttachments = attachments?.map(transformAttachment);

  return {
    id: _id,
    ...rest,
    comments: transformedComments,
    attachments: transformedAttachments,
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

  // Transform comments if they exist
  if (task.comments) {
    backendTask.comments = task.comments.map((comment) => {
      const { id, ...rest } = comment;
      return { _id: id, ...rest };
    });
  }

  // Transform attachments if they exist
  if (task.attachments) {
    backendTask.attachments = task.attachments.map((attachment) => {
      const { id, ...rest } = attachment;
      return { _id: id, ...rest };
    });
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
 * Add a comment to a task
 */
export const addComment = async (
  projectId: string,
  taskId: string,
  comment: { content: string },
): Promise<Comment> => {
  const response = await newRequest.post(
    `${BASE_PATH}/${projectId}/tasks/${taskId}/comments`,
    comment,
  );
  return transformComment(response.data);
};

/**
 * Add an attachment to a task
 */
export const addAttachment = async (
  projectId: string,
  taskId: string,
  attachment: Omit<Attachment, 'id' | 'createdAt'>,
): Promise<Attachment> => {
  const response = await newRequest.post(
    `${BASE_PATH}/${projectId}/tasks/${taskId}/attachments`,
    attachment,
  );
  return transformAttachment(response.data);
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
    const { id, comments, attachments, ...rest } = task;

    // Transform comments if they exist
    const transformedComments = comments?.map((comment) => {
      const { id: commentId, ...commentRest } = comment;
      return { _id: commentId, ...commentRest };
    });

    // Transform attachments if they exist
    const transformedAttachments = attachments?.map((attachment) => {
      const { id: attachmentId, ...attachmentRest } = attachment;
      return { _id: attachmentId, ...attachmentRest };
    });

    return {
      _id: id,
      ...rest,
      comments: transformedComments,
      attachments: transformedAttachments,
    };
  });

  await newRequest.put(`${BASE_PATH}/${projectId}`, {
    columns: backendColumns,
    tasks: backendTasks,
  });
};
