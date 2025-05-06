export type Item = {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity?: string;
};

export type Client = {
  id: string;
  name: string;
  email: string;
};

export type AIItem = Item & {
  type: string;
  reasoning: string;
};

export type Attachment = {
  id: string;
  type: string;
  name: string;
  size?: number;
  timestamp: string;
};

export type NotificationType = 'success' | 'error' | 'info';

export type Notification = {
  show: boolean;
  message: string;
  type: NotificationType;
};

export type Section = 'items' | 'client' | 'comments';
