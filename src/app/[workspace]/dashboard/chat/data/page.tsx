'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import DataSheet from './components/DataSheet';
import DataTable from './components/DataTable';

// Types
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

interface DataSheetEntry {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PaginatedResponse {
  status: number;
  data: {
    embeddings: EmbeddingDataEntry[];
    pagination: Pagination;
  };
  message: string;
}

const DataPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingData, setEditingData] = useState<EmbeddingDataEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const { data, isLoading, error } = useQuery<PaginatedResponse>({
    queryKey: ['embeddings', currentPage],
    queryFn: async () => {
      const response = await newRequest.get(`/new-ai/embeddings?page=${currentPage}&limit=10`);
      return response.data;
    },
  });

  const handleEditData = (data: EmbeddingDataEntry) => {
    setEditingData(data);
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setEditingData(null);
  };

  // Convert EmbeddingDataEntry to DataSheetEntry
  const convertToDataSheetEntry = (data: EmbeddingDataEntry): DataSheetEntry => {
    return {
      _id: data._id,
      title: data.title,
      content: data.text || data.description || '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  };

  if (error) {
    toast.error('Failed to load data');
    console.error('Error loading data:', error);
  }

  return (
    <div className='container mx-auto py-8 px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8'>
        <div className='flex items-center gap-4'>
          <div>
            <div className='flex items-center gap-2'>
              <div
                onClick={() => {
                  return router.push('/dashboard/chat');
                }}
                className='cursor-pointer'
              >
                <ArrowLeft className='h-4 w-4' />
              </div>
              <h1 className='text-3xl font-bold tracking-tight'>Data</h1>
            </div>
            <p className='text-muted-foreground mt-1'>Manage and store data for your AI agents.</p>
          </div>
        </div>
        <Button
          onClick={() => {
            return setIsSheetOpen(true);
          }}
          className='mt-4 sm:mt-0'
        >
          <Plus className='mr-2 h-4 w-4' /> Add New Data
        </Button>
      </div>

      <div className='flex items-center space-x-2 mb-6'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search data...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      <DataTable
        searchQuery={searchQuery}
        onEditData={handleEditData}
        data={data?.data.embeddings ?? []}
        isLoading={isLoading}
        pagination={data?.data.pagination}
      />
      <DataSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        existingData={editingData ? convertToDataSheetEntry(editingData) : null}
      />
    </div>
  );
};

export default DataPage;
