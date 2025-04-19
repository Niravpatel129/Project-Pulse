'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Column, DataTable } from '@/components/ui/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate } from '@/lib/utils';
import { Archive, Eye, FileEdit, FilePlus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { LeadForm, useLeadForms } from '../hooks/useLeadForms';

export default function LeadFormsTable() {
  const { leadForms, isLoading, error, deleteLeadForm, archiveLeadForm, publishLeadForm } =
    useLeadForms();

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const columns: Column<LeadForm>[] = useMemo(() => {
    return [
      {
        key: 'title',
        header: 'Form Title',
        cell: (form) => {
          return (
            <div className='font-medium'>
              <Link href={`/leads/form/${form._id}`} className='hover:underline'>
                {form.title}
              </Link>
            </div>
          );
        },
        sortable: true,
      },
      {
        key: 'description',
        header: 'Description',
        cell: (form) => {
          return (
            <div className='line-clamp-2 text-sm text-muted-foreground'>
              {form.description || 'No description'}
            </div>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        cell: (form) => {
          return (
            <Badge variant={statusBadgeVariant(form.status)} className='capitalize'>
              {form.status}
            </Badge>
          );
        },
        sortable: true,
      },
      {
        key: 'submissions',
        header: 'Submissions',
        cell: (form) => {
          return <div className='text-center'>{form.submissions?.length || 0}</div>;
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        header: 'Created',
        cell: (form) => {
          return <div className='text-sm'>{formatDate(form.createdAt)}</div>;
        },
        sortable: true,
      },
      {
        key: 'createdBy',
        header: 'Created By',
        cell: (form) => {
          return <div className='text-sm'>{form.createdBy?.name || 'Unknown'}</div>;
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (form) => {
          return (
            <div className='flex space-x-2'>
              <Button variant='ghost' size='icon' asChild title='Edit form'>
                <Link href={`/leads/form/${form._id}`}>
                  <FileEdit className='h-4 w-4' />
                </Link>
              </Button>
              <Button variant='ghost' size='icon' asChild title='View submissions'>
                <Link href={`/leads/form/${form._id}/submissions`}>
                  <Eye className='h-4 w-4' />
                </Link>
              </Button>

              {form.status !== 'archived' && (
                <Button
                  variant='ghost'
                  size='icon'
                  title='Archive form'
                  onClick={() => {
                    return archiveLeadForm.mutate(form._id);
                  }}
                >
                  <Archive className='h-4 w-4' />
                </Button>
              )}
              <Button
                variant='ghost'
                size='icon'
                title='Delete form'
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this form?')) {
                    deleteLeadForm.mutate(form._id);
                  }
                }}
              >
                <Trash2 className='h-4 w-4 text-destructive' />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [publishLeadForm, archiveLeadForm, deleteLeadForm]);

  if (isLoading) {
    return <LoadingSpinner size='lg' fullPage />;
  }

  if (error) {
    return <div className='p-4 text-destructive'>Error loading lead forms</div>;
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold'>Lead Forms</h2>
        <Button asChild>
          <Link href='/leads/form/new'>
            <FilePlus className='h-4 w-4 mr-2' />
            Create New Form
          </Link>
        </Button>
      </div>
      <DataTable
        data={leadForms}
        columns={columns}
        keyExtractor={(row) => {
          return row._id;
        }}
        searchable
        searchPlaceholder='Search forms...'
        searchKeys={['title', 'description']}
        pagination
        pageSize={10}
        emptyState={
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>No lead forms found</p>
            <Button variant='outline' className='mt-4' asChild>
              <Link href='/leads/form/new'>Create your first form</Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
