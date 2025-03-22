export interface Participant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'pending' | 'inactive';
  permissions: string[];
  dateAdded: string;
  lastActive?: string;
  contractSigned?: boolean;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  notes?: string;
}

export interface Collaborator {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: string;
  status?: 'active' | 'pending' | 'inactive';
}

export interface Team {
  id: string;
  _id: string;
  name: string;
  avatar?: string;
  members?: number;
  description?: string;
  email?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  color: string;
  description?: string;
}

export interface ProjectData {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;
  [key: string]: unknown;
}
