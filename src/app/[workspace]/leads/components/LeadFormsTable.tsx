'use client';

import { Button } from '@/components/ui/button';
import { Column, DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, ExternalLink, Eye, FileEdit, FilePlus, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { LeadForm, useLeadForms } from '../hooks/useLeadForms';

// Skeleton component for the table when loading
function TableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-10 w-36' />
      </div>
      <div className='border rounded-md'>
        <div className='grid grid-cols-6 gap-4 p-4 border-b bg-muted/40'>
          {Array(6)
            .fill(0)
            .map((_, i) => {
              return <Skeleton key={i} className='h-6 w-full' />;
            })}
        </div>
        {Array(5)
          .fill(0)
          .map((_, i) => {
            return (
              <div key={i} className='grid grid-cols-6 gap-4 p-4 border-b'>
                {Array(6)
                  .fill(0)
                  .map((_, j) => {
                    return <Skeleton key={j} className='h-6 w-full' />;
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default function LeadFormsTable() {
  const { leadForms, isLoading, error, deleteLeadForm } = useLeadForms();
  const pathname = usePathname();

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
        key: 'submissions',
        header: 'Submissions',
        cell: (form) => {
          return (
            <Link
              href={`${pathname}/submissions?form=${form._id}`}
              className='flex justify-center hover:underline'
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {form.submissions?.length || 0}
              </motion.div>
            </Link>
          );
        },
        sortable: true,
      },
      {
        key: 'createdAt',
        header: 'Created',
        cell: (form) => {
          return (
            <motion.div className='text-sm' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {formatDate(form.createdAt)}
            </motion.div>
          );
        },
        sortable: true,
      },
      {
        key: 'createdBy',
        header: 'Created By',
        cell: (form) => {
          return (
            <motion.div className='text-sm' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {form.createdBy?.name || 'Unknown'}
            </motion.div>
          );
        },
      },
      {
        key: 'share',
        header: 'Share',
        cell: (form) => {
          const shareUrl = `${
            process.env.NEXT_PUBLIC_APP_URL || window.location.origin
          }/portal/lead/${form._id}`;

          return (
            <motion.div
              className='flex items-center gap-1'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast.success('Share link copied to clipboard');
                }}
                title='Copy share link'
              >
                <Copy className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  return window.open(shareUrl, '_blank');
                }}
                title='Open in new tab'
              >
                <ExternalLink className='h-4 w-4' />
              </Button>
            </motion.div>
          );
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (form) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem asChild>
                  <Link href={`/leads/form/${form._id}`} className='flex items-center'>
                    <FileEdit className='h-4 w-4 mr-2' />
                    Edit form
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`${pathname}/submissions?form=${form._id}`}
                    className='flex items-center'
                  >
                    <Eye className='h-4 w-4 mr-2' />
                    View submissions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this form?')) {
                      deleteLeadForm.mutate(form._id);
                    }
                  }}
                  className='text-destructive'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete form
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, [deleteLeadForm, pathname]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <div className='p-4 text-destructive'>Error loading lead forms</div>;
  }

  return (
    <motion.div
      className='space-y-4'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex justify-between items-center'>
        <motion.h2 className='text-xl font-semibold'>Lead Forms</motion.h2>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button asChild>
            <Link href='/leads/form/new'>
              <FilePlus className='h-4 w-4 mr-2' />
              Create New Form
            </Link>
          </Button>
        </motion.div>
      </div>
      <AnimatePresence mode='wait'>
        <motion.div
          key='table'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
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
              <motion.div
                className='py-8 text-center'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <p className='text-muted-foreground'>No lead forms found</p>
                <Button variant='outline' className='mt-4' asChild>
                  <Link href='/leads/form/new'>Create your first form</Link>
                </Button>
              </motion.div>
            }
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
