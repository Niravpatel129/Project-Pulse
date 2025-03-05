export interface Module {
  _id: string;
  name: string;
  description: string;
  workspace: string;
  project: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  order: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo: string[];
  isTemplate: boolean;
  elements: any[];
  createdAt: string;
  updatedAt: string;
}
