'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { Eye, FileClock } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

interface Submission {
  _id: string;
  formId: string;
  formTitle: string;
  submittedAt: string;
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
  formValues: Record<string, any>;
}

type Column<T> = {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
};

export default function SubmissionsTable() {
  const {
    data: submissions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['lead-submissions'],
    queryFn: async () => {
      const res = await newRequest.get('/lead-forms/workspace/submissions');
      return res.data.data || [];
    },
  });

  const columns: Column<Submission>[] = useMemo(() => {
    return [
      {
        key: 'formTitle',
        header: 'Form',
        cell: (submission) => {
          return <div className='font-medium'>{submission.formTitle}</div>;
        },
        sortable: true,
      },
      {
        key: 'clientName',
        header: 'Name',
        cell: (submission) => {
          return <div>{submission.clientName || 'N/A'}</div>;
        },
        sortable: true,
      },
      {
        key: 'clientEmail',
        header: 'Email',
        cell: (submission) => {
          return <div>{submission.clientEmail || 'N/A'}</div>;
        },
        sortable: true,
      },
      {
        key: 'submittedAt',
        header: 'Submitted',
        cell: (submission) => {
          return <div>{formatDate(submission.submittedAt)}</div>;
        },
        sortable: true,
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (submission) => {
          return (
            <Button variant='ghost' size='sm' asChild>
              <Link href={`/leads/submissions/${submission._id}`}>
                <Eye className='h-4 w-4 mr-2' />
                View Details
              </Link>
            </Button>
          );
        },
      },
    ];
  }, []);

  if (isLoading) {
    return <LoadingSpinner size='lg' fullPage />;
  }

  if (error) {
    return <div className='p-4 text-destructive'>Error loading submissions</div>;
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold'>Form Submissions</h2>
      </div>
      <DataTable
        data={submissions || []}
        columns={columns}
        keyExtractor={(row) => {
          return row._id;
        }}
        searchable
        searchPlaceholder='Search submissions...'
        searchKeys={['formTitle', 'clientName', 'clientEmail']}
        pagination
        pageSize={10}
        emptyState={
          <div className='py-8 text-center'>
            <FileClock className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
            <p className='text-muted-foreground'>No submissions found</p>
            <p className='text-sm text-muted-foreground mt-1'>
              When users submit your forms, they will appear here.
            </p>
          </div>
        }
      />
    </div>
  );
}
