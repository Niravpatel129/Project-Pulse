import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useDocuments } from '@/hooks/useDocuments';
import { formatDistanceToNow } from 'date-fns';
import { Download, File, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface DocumentUploadProps {
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: any) => void;
}

const SUPPORTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'text/csv',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentUpload({ onUploadSuccess, onUploadError }: DocumentUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { documents, isLoading, uploadDocument, deleteDocument, isUploading, isDeleting } =
    useDocuments();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Supported types: PDF, Word, Excel, Text, Markdown, CSV');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setError(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      uploadDocument(formData, {
        onSuccess: (response) => {
          toast({
            title: 'Document uploaded successfully',
            description: 'Your document has been processed and is ready to use.',
          });
          onUploadSuccess?.(response);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || 'Failed to upload document';
          setError(errorMessage);
          toast({
            title: 'Error uploading document',
            description: errorMessage,
            variant: 'destructive',
          });
          onUploadError?.(error);
        },
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteDocument = (documentUrl: string) => {
    deleteDocument(documentUrl, {
      onSuccess: () => {
        toast({
          title: 'Document deleted successfully',
          description: 'The document has been removed from your storage.',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error deleting document',
          description: 'There was a problem deleting the document. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='space-y-4'>
      <div className='border-2 border-dashed rounded-lg p-6 text-center'>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileUpload}
          className='hidden'
          accept={SUPPORTED_TYPES.join(',')}
        />
        <div className='flex flex-col items-center justify-center gap-2'>
          <File className='h-10 w-10 text-gray-400' />
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Upload a document</p>
            <p className='text-xs text-gray-500'>
              Supported formats: PDF, Word, Excel, Text, Markdown, CSV
            </p>
            <p className='text-xs text-gray-500'>Max file size: 10MB</p>
          </div>
          <Button
            onClick={triggerFileUpload}
            disabled={isUploading}
            className='mt-2'
            variant='outline'
          >
            {isUploading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='h-4 w-4 mr-2' />
                Select File
              </>
            )}
          </Button>
        </div>
      </div>

      {error && <div className='text-sm text-red-500 bg-red-50 p-3 rounded-md'>{error}</div>}

      {/* Documents List */}
      <div className='space-y-2'>
        <h3 className='text-sm font-medium'>Uploaded Documents</h3>
        {isLoading ? (
          <div className='text-sm text-gray-500'>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className='text-sm text-gray-500'>No documents uploaded yet</div>
        ) : (
          <div className='space-y-2'>
            {documents.map((doc, index) => {
              return (
                <div
                  key={`${doc.filename}-${index}`}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <File className='h-5 w-5 text-gray-400' />
                    <div>
                      <p className='text-sm font-medium'>{doc.filename}</p>
                      <p className='text-xs text-gray-500'>
                        {formatDistanceToNow(new Date(doc.uploadDate), { addSuffix: true })} •{' '}
                        {doc.chunks} chunks • {doc.documentType.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        return window.open(doc.documentUrl, '_blank');
                      }}
                    >
                      <Download className='h-4 w-4 text-gray-500' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        return handleDeleteDocument(doc.documentUrl);
                      }}
                      disabled={isDeleting}
                    >
                      <Trash2 className='h-4 w-4 text-gray-500' />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
