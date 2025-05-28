'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DataSheet from './components/DataSheet';
import DataTable from './components/DataTable';

// Types
interface DataEntry {
  _id: string;
  name: string;
  content: string;
  workspace?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// Mock Data
const mockData: DataEntry[] = [
  {
    _id: uuidv4(),
    name: 'Customer Support FAQ',
    content: 'Q: How do I reset my password?\nA: Click on the "Forgot Password" link...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: uuidv4(),
    name: 'Product Documentation',
    content: 'Our product features include...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DataPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataSheetOpen, setIsDataSheetOpen] = useState(false);
  const [selectedData, setSelectedData] = useState<DataEntry | null>(null);
  const router = useRouter();

  const handleCreateData = () => {
    setSelectedData(null);
    setIsDataSheetOpen(true);
  };

  const handleEditData = (data: DataEntry) => {
    setSelectedData(data);
    setIsDataSheetOpen(true);
  };

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
        <Button onClick={handleCreateData} className='mt-4 sm:mt-0'>
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

      <DataTable searchQuery={searchQuery} onEditData={handleEditData} mockData={mockData} />
      <DataSheet
        open={isDataSheetOpen}
        onOpenChange={setIsDataSheetOpen}
        existingData={selectedData}
      />
    </div>
  );
};

export default DataPage;
