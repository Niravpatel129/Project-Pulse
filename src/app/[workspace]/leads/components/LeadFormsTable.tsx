'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Column, DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDate } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Archive,
  Copy,
  ExternalLink,
  Eye,
  FileEdit,
  FilePlus,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { LeadForm, useLeadForms } from '../hooks/useLeadForms';

export default function LeadFormsTable() {
  const { leadForms, isLoading, error, deleteLeadForm, archiveLeadForm, publishLeadForm } =
    useLeadForms();
  const pathname = usePathname();

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
          const handleStatusChange = (newStatus: string) => {
            if (newStatus === 'published') {
              publishLeadForm.mutate(form._id);
            } else if (newStatus === 'archived') {
              archiveLeadForm.mutate(form._id);
            }
            // Note: If there's a specific function to change to draft status, it should be added here
          };

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 p-0'>
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Badge variant={statusBadgeVariant(form.status)} className='capitalize'>
                      {form.status}
                    </Badge>
                  </motion.div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => {
                    return handleStatusChange('published');
                  }}
                  disabled={form.status === 'published'}
                >
                  <Badge variant={statusBadgeVariant('published')} className='mr-2'>
                    Published
                  </Badge>
                  Make Published
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    return handleStatusChange('draft');
                  }}
                  disabled={form.status === 'draft'}
                >
                  <Badge variant={statusBadgeVariant('draft')} className='mr-2'>
                    Draft
                  </Badge>
                  Set as Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    return handleStatusChange('archived');
                  }}
                  disabled={form.status === 'archived'}
                >
                  <Badge variant={statusBadgeVariant('archived')} className='mr-2'>
                    Archived
                  </Badge>
                  Archive Form
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
            <motion.div
              layout
              className='text-sm'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
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
            <motion.div
              layout
              className='text-sm'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
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
              layout
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
                {form.status !== 'archived' && (
                  <DropdownMenuItem
                    onClick={() => {
                      return archiveLeadForm.mutate(form._id);
                    }}
                  >
                    <Archive className='h-4 w-4 mr-2' />
                    Archive form
                  </DropdownMenuItem>
                )}
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
  }, [publishLeadForm, archiveLeadForm, deleteLeadForm, pathname]);

  if (isLoading) {
    return <LoadingSpinner size='lg' fullPage />;
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
      layout
    >
      <div className='flex justify-between items-center'>
        <motion.h2 layout className='text-xl font-semibold'>
          Lead Forms
        </motion.h2>
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
          layout
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
