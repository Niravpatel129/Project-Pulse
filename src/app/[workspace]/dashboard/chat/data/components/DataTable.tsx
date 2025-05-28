'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Edit2 } from 'lucide-react';
import React from 'react';

interface DataEntry {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DataTableProps {
  searchQuery: string;
  onEditData: (data: DataEntry) => void;
  mockData: DataEntry[];
}

const DataTable: React.FC<DataTableProps> = ({ searchQuery, onEditData, mockData }) => {
  const filteredData = mockData.filter((data) => {
    return data.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Content Preview</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((data) => {
            return (
              <TableRow key={data._id}>
                <TableCell className='font-medium'>{data.name}</TableCell>
                <TableCell className='max-w-md truncate'>{data.content}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => {
                      return onEditData(data);
                    }}
                    className='p-2 hover:bg-accent rounded-md'
                  >
                    <Edit2 className='h-4 w-4' />
                  </button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
