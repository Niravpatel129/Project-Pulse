'use client';
import { FormBuilder } from '@/components/LeadForm/FormBuilder';
import { useToast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';

interface FormData {
  email?: string;
  name?: string;
  phone?: string;
  company?: string;
  address?: string;
  [key: string]: string | undefined;
}

export default function LeadPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string }>>([]);

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const res = await newRequest.get(`/lead-forms/p/${id}`);
      return res.data.data;
    },
  });

  const handleSubmit = async (formData: {
    formId: string;
    fields: Array<{
      id: string;
      label: string;
      value: any;
      type?: string;
    }>;
    files: Record<string, File[]>;
  }) => {
    setIsSubmitting(true);

    try {
      // Create FormData object for submitting files
      const submitFormData = new FormData();

      // Add form ID
      submitFormData.append('formId', formData.formId);

      // Add serialized form fields data using labels as keys instead of IDs
      const fieldsData = {};

      formData.fields.forEach((field) => {
        // Use field label as key if available, otherwise fall back to ID
        const key = field.label && field.label.trim() !== '' ? field.label : field.id;
        fieldsData[key] = field.value;
      });

      submitFormData.append('data', JSON.stringify(fieldsData));

      // Add files if any
      Object.entries(formData.files).forEach(([fieldId, files]) => {
        // If multiple files for a field, append with index
        if (files.length > 0) {
          files.forEach((file, index) => {
            submitFormData.append(`file_${fieldId}_${index}`, file);
          });
          // Also add the count of files for this field
          submitFormData.append(`file_${fieldId}_count`, String(files.length));
        }
      });

      // Submit form data to your API
      const response = await newRequest.post(`/lead-forms/${id}/submit`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Get the submissionId from the response
      const { submissionId } = response.data;

      // Get uploaded files data (if returned by the API)
      const uploadedFilesData = response.data.files || [];
      setUploadedFiles(uploadedFilesData);

      // Set success state and store submissionId
      setSubmissionId(submissionId);
      setSubmissionSuccess(true);

      toast({
        title: 'Form submitted',
        description: 'Thank you for your submission.',
        variant: 'default',
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your form. Please try again.',
        variant: 'destructive',
      });
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    setSubmissionSuccess(false);
    setSubmissionId(null);
    setUploadedFiles([]);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='w-full max-w-md'>
          <h1 className='text-xl font-medium'>Form not found</h1>
          <p className='text-muted-foreground'>The requested lead form could not be found.</p>
        </div>
      </div>
    );
  }

  // If form was successfully submitted, show success screen
  if (submissionSuccess && submissionId) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center'>
          <div className='mb-4 flex justify-center'>
            <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6 text-green-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
          </div>
          <h2 className='text-2xl font-bold mb-2'>Submission Successful!</h2>
          <p className='text-gray-600 mb-4'>
            Thank you for your submission. We&apos;ve received your information.
          </p>
          <div className='bg-gray-50 p-4 rounded-md mb-6'>
            <p className='text-sm text-gray-500 mb-1'>Submission ID</p>
            <p className='font-mono text-sm'>{submissionId}</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className='bg-gray-50 p-4 rounded-md mb-6 text-left'>
              <p className='text-sm text-gray-500 mb-3 text-center'>Files</p>
              <div className='space-y-2'>
                {uploadedFiles.map((file, index) => {
                  return (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-white p-2 rounded border'
                    >
                      <span className='text-sm truncate max-w-[200px]'>{file.name}</span>
                      <a
                        href={file.url}
                        download
                        className='flex items-center text-primary hover:text-primary/80 text-xs px-2 py-1'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mr-1'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                          />
                        </svg>
                        Download
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleStartOver}
            className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors'
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-3xl mx-auto'>
        <FormBuilder formData={lead} onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </div>
  );
}
