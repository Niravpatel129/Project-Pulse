export type Column = {
  id: string;
  name: string;
  sortable: boolean;
  iconName?: string;
  hidden?: boolean;
  isPrimary?: boolean;
  width?: number;
};

export type Record = {
  id: number;
  [key: string]: any;
  selected?: boolean;
  tags?: Array<{ id: string; name: string }>;
};

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;
