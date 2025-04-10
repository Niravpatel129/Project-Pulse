import { NextResponse } from 'next/server';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  createdAt: string;
  note?: string;
}

// Mock data - replace with actual database calls
const invoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    amount: 1500.0,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    status: 'paid',
    dueDate: '2024-03-15',
    createdAt: '2024-03-01',
    note: 'Website redesign project',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    amount: 2500.0,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    status: 'pending',
    dueDate: '2024-03-20',
    createdAt: '2024-03-05',
    note: 'Mobile app development',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    amount: 1000.0,
    customerName: 'Bob Johnson',
    customerEmail: 'bob@example.com',
    status: 'overdue',
    dueDate: '2024-03-10',
    createdAt: '2024-03-01',
    note: 'Logo design',
  },
];

export async function GET() {
  return NextResponse.json(invoices);
}
