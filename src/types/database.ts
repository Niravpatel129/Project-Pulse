export interface Record {
  _id: string;
  tableId: string;
  values: {
    id: number;
    selected: boolean;
    tags: Array<{ id: string; name: string }>;
    [key: string]: any;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Column {
  id: string;
  name: string;
  type: string;
  order: number;
  hidden?: boolean;
  sortable?: boolean;
  width?: number;
  iconName?: string;
  isPrimary?: boolean;
  isRequired?: boolean;
  isUnique?: boolean;
  description?: string;
  options?: {
    selectOptions?: any[];
  };
}

export type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc' | null;
};
