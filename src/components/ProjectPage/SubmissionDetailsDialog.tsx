import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SelectSeparator } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { X } from 'lucide-react';

interface FormValue {
  id?: string;
  label?: string;
  value?: any;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

interface Submission {
  _id: string;
  workspace: string;
  leadForm: any;
  clientEmail: string;
  clientName: string | null;
  clientPhone: string | null;
  clientCompany: string | null;
  clientAddress: string | null;
  submittedAt: string;
  submittedBy: string;
  formValues?: Record<string, FormValue>;
}

interface SubmissionDetailsDialogProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formTitle?: string;
}

export function SubmissionDetailsDialog({
  submission,
  open,
  onOpenChange,
  formTitle,
}: SubmissionDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex justify-between items-center'>
            <span>Submission Details</span>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              <X className='h-4 w-4' />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {submission && (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Form</h3>
                <p>
                  {formTitle ||
                    (submission.leadForm && submission.leadForm.title) ||
                    'Unknown Form'}
                </p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Submitted</h3>
                <p>{formatDate(submission.submittedAt)}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Email</h3>
                <p>{submission.clientEmail || 'N/A'}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Name</h3>
                <p>{submission.clientName || 'N/A'}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Phone</h3>
                <p>{submission.clientPhone || 'N/A'}</p>
              </div>
              <div>
                <h3 className='text-sm font-medium text-muted-foreground'>Company</h3>
                <p>{submission.clientCompany || 'N/A'}</p>
              </div>
            </div>

            <div className='border-t pt-4'>
              <h3 className='text-lg font-medium mb-4'>Form Values</h3>
              <div className='flex flex-col gap-2'>
                {submission.formValues &&
                  Object.entries(submission.formValues).map(([key, value]) => {
                    const label = value?.label || key.replace('element-', '');
                    return (
                      <div key={key}>
                        <div className='p-3 rounded-md'>
                          <h4 className='text-sm font-medium text-muted-foreground'>{label}</h4>
                          <div className='font-medium mt-1'>{renderFormValue(key, value)}</div>
                        </div>
                        <SelectSeparator className='' />
                      </div>
                    );
                  })}
                {(!submission.formValues || Object.keys(submission.formValues).length === 0) && (
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
  );
}
