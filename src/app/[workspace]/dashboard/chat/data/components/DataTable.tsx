'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface EmbeddingDataEntry {
  _id: string;
  title: string;
  description?: string;
  text?: string;
  metadata: {
    type: 'workspace_data' | 'user_data' | 'project_data' | 'custom' | 'document';
    source?: string;
    category?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  };
  status: 'active' | 'archived' | 'deleted';
  workspace: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface DataTableProps {
  searchQuery: string;
  onEditData: (data: EmbeddingDataEntry) => void;
  data: EmbeddingDataEntry[];
  isLoading?: boolean;
  pagination?: Pagination;
}

const DataTable: React.FC<DataTableProps> = ({
  searchQuery,
  onEditData,
  data,
  isLoading,
  pagination,
}) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await newRequest.delete(`/new-ai/embeddings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['embeddings'] });
      toast.success('Data deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete data');
      console.error('Error deleting data:', error);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this data?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredData = data.filter((data) => {
    return (
      data.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (data.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (data.text?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  });

  if (isLoading) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className='h-24 text-center'>
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((data) => {
                return (
                  <TableRow key={data._id}>
                    <TableCell className='font-medium'>{data.title}</TableCell>
                    <TableCell className='max-w-md truncate'>
                      {data.description || data.text}
                    </TableCell>
                    <TableCell>
                      <span className='inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10'>
                        {data.metadata.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => {
                            return onEditData(data);
                          }}
                          className='p-2 hover:bg-accent rounded-md'
                        >
                          <Edit2 className='h-4 w-4' />
                        </button>
                        <button
                          onClick={() => {
                            return handleDelete(data._id);
                          }}
                          className='p-2 hover:bg-destructive/10 rounded-md text-destructive'
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-center'>
                  <div className='text-muted-foreground'>No data found</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            entries
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={pagination.page === 1}
              onClick={() => {
                // TODO: Implement page change
              }}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={pagination.page === pagination.pages}
              onClick={() => {
                // TODO: Implement page change
              }}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
