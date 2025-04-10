export interface Client {
  _id: string;
  name: string;
  email: string;
}

export interface CreatedBy {
  _id: string;
  name: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client;
  total: number;
  status: string;
  dueDate: string;
  createdBy: CreatedBy;
  createdAt: string;
}
