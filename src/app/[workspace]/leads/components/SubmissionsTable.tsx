'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Column, DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SelectSeparator } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { FileClock, MoreHorizontal, Trash, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface FormSubmission {
  _id: string;
  formId: string;
  submittedBy: string;
  clientEmail: string;
  clientName: string | null;
  clientPhone: string | null;
  clientCompany: string | null;
  clientAddress: string | null;
  submittedAt: string;
  formValues: Record<string, any>;
  formTitle: string;
}

// Extended type used for displaying in the table after flattening
interface EnhancedFormSubmission extends FormSubmission {
  formId: string;
  formTitle: string;
}

interface FormWithSubmissions {
  _id: string;
  formTitle?: string;
  submissions: FormSubmission[];
}

interface SubmissionsTableProps {
  formIdFilter?: string | null;
}

export default function SubmissionsTable({ formIdFilter }: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<EnhancedFormSubmission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  const {
    data: formsWithSubmissions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lead-submissions', formIdFilter],
    queryFn: async () => {
      const res = await newRequest.get('/lead-forms/workspace/submissions');
      return res.data || [];
    },
  });

  // Delete submission function
  const deleteSubmission = async (submissionId: string) => {
    try {
      await newRequest.delete(`/lead-forms/submissions/${submissionId}`);
      toast({
        title: 'Submission deleted',
        description: 'The submission has been successfully deleted.',
      });
      refetch(); // Refresh data after deletion
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete submission. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Mass delete function
  const deleteSelectedSubmissions = async () => {
    const submissionIds = Object.entries(selectedSubmissions)
      .filter(([_, isSelected]) => {
        return isSelected;
      })
      .map(([id]) => {
        return id;
      });

    if (submissionIds.length === 0) {
      toast({
        title: 'No submissions selected',
        description: 'Please select at least one submission to delete.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Delete each submission sequentially
      for (const id of submissionIds) {
        await deleteSubmission(id);
      }

      // Reset selection state
      setSelectedSubmissions({});
      setSelectAll(false);

      toast({
        title: 'Submissions deleted',
        description: `Successfully deleted ${submissionIds.length} submissions.`,
      });

      refetch();
    } catch (error) {
      console.error('Error deleting submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete some submissions. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle checkbox change
  const toggleSubmission = (id: string, checked: boolean) => {
    setSelectedSubmissions((prev) => {
      return {
        ...prev,
        [id]: checked,
      };
    });
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);

    if (checked) {
      // Select all submissions
      const allSelected = submissions.reduce((acc, submission) => {
        acc[submission._id] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setSelectedSubmissions(allSelected);
    } else {
      // Deselect all
      setSelectedSubmissions({});
    }
  };

  // Flatten the submissions for the table
  const submissions = useMemo(() => {
    if (!formsWithSubmissions) return [];

    let allSubmissions = formsWithSubmissions.flatMap((form: FormWithSubmissions) => {
      return form.submissions.map((submission: FormSubmission) => {
        console.log('🚀 submission:', submission.formTitle);
        return {
          ...submission,
          formId: submission.formId,
          formTitle: submission.formTitle || 'Untitled Form',
        };
      });
    });

    // Apply form ID filter if provided
    if (formIdFilter) {
      allSubmissions = allSubmissions.filter((submission) => {
        return submission.formId === formIdFilter;
      });
    }

    return allSubmissions;
  }, [formsWithSubmissions, formIdFilter]);

  const columns: Column<EnhancedFormSubmission>[] = useMemo(() => {
    return [
      {
        key: 'selection',
        header: (
          <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label='Select all' />
        ),
        cell: (submission) => {
          return (
            <Checkbox
              checked={selectedSubmissions[submission._id] || false}
              onCheckedChange={(checked) => {
                toggleSubmission(submission._id, !!checked);
              }}
              onClick={(e) => {
                return e.stopPropagation();
              }}
              aria-label='Select row'
            />
          );
        },
      },
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
    ];
  }, [selectAll, selectedSubmissions]);

  const renderFormValue = (key: string, value: any) => {
    if (!value) return 'N/A';

    // Handle nested objects with label/value structure
    if (
      value &&
      typeof value === 'object' &&
      value.id &&
      value.label &&
      value.value !== undefined
    ) {
      value = value.value;
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (value && typeof value === 'object' && value.fileUrl) {
      return (
        <div>
          <a
            href={value.fileUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            {value.fileName || 'File'} ({Math.round((value.fileSize || 0) / 1024)}KB)
          </a>
        </div>
      );
    }

    // Handle multiple file uploads
    if (value && Array.isArray(value) && value.length > 0 && value[0].fileUrl) {
      return (
        <div className='flex flex-col gap-2'>
          {value.map((file, index) => {
            return (
              <a
                key={file.fileId || index}
                href={file.fileUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-primary hover:underline'
              >
                {file.fileName || `File ${index + 1}`} ({Math.round((file.fileSize || 0) / 1024)}KB)
              </a>
            );
          })}
        </div>
      );
    }

    if (typeof value === 'string' && value.includes('T04:00:00.000Z')) {
      return formatDate(value);
    }

    return String(value);
  };

  if (isLoading) {
    return <LoadingSpinner size='lg' fullPage />;
  }

  if (error) {
    return <div className='p-4 text-destructive'>Error loading submissions</div>;
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-xl font-semibold'>Form Submissions</h2>
          <p className='text-sm text-muted-foreground'>
            {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
            {formIdFilter ? ' matching filters' : ' total'}
          </p>
        </div>

        {submissions.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent align='end' className='w-48'>
              <Button
                variant='ghost'
                size='sm'
                className='flex w-full justify-start text-destructive'
                onClick={deleteSelectedSubmissions}
              >
                <Trash className='h-4 w-4 mr-2' />
                Delete Selected
              </Button>
            </PopoverContent>
          </Popover>
        )}
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
        onRowClick={(row) => {
          setSelectedSubmission(row);
          setDialogOpen(true);
        }}
        emptyState={
          <div className='py-8 text-center'>
            <FileClock className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
            {formIdFilter ? (
              <>
                <p className='text-muted-foreground'>No submissions found for this form</p>
                <p className='text-sm text-muted-foreground mt-1'>
                  Try removing filters or check back later when the form receives submissions.
                </p>
              </>
            ) : (
              <>
                <p className='text-muted-foreground'>No submissions found</p>
                <p className='text-sm text-muted-foreground mt-1'>
                  When users submit your forms, they will appear here.
                </p>
              </>
            )}
          </div>
        }
      />

      {/* Full Screen Dialog for Submission Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex justify-between items-center'>
              <span>Submission Details</span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  return setDialogOpen(false);
                }}
              >
                <X className='h-4 w-4' />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>Form</h3>
                  <p>{selectedSubmission.formTitle}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>Submitted</h3>
                  <p>{formatDate(selectedSubmission.submittedAt)}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>Email</h3>
                  <p>{selectedSubmission.clientEmail || 'N/A'}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>Name</h3>
                  <p>{selectedSubmission.clientName || 'N/A'}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>Phone</h3>
                  <p>{selectedSubmission.clientPhone || 'N/A'}</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-muted-foreground'>Company</h3>
                  <p>{selectedSubmission.clientCompany || 'N/A'}</p>
                </div>
              </div>

              <div className='border-t pt-4'>
                <h3 className='text-lg font-medium mb-4'>Form Values</h3>
                <div className='flex flex-col gap-2'>
                  {selectedSubmission.formValues &&
                    Object.entries(selectedSubmission.formValues).map(([key, value]) => {
                      const label = value?.label || key.replace('element-', '');
                      return (
                        <div key={key}>
                          <div className=' p-3 rounded-md'>
                            <h4 className='text-sm font-medium text-muted-foreground'>{label}</h4>
                            <div className='font-medium mt-1'>{renderFormValue(key, value)}</div>
                          </div>
                          <SelectSeparator className='' />
                        </div>
                      );
                    })}
                  {(!selectedSubmission.formValues ||
                    Object.keys(selectedSubmission.formValues).length === 0) && (
                    <div className='text-center text-muted-foreground py-4'>
                      No form values submitted
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
