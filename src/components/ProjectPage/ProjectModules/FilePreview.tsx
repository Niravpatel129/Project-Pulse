import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { File, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface FilePreviewProps {
  file: {
    _id: string;
    downloadURL: string;
    originalName: string;
    contentType: string;
  };
  onRemove?: (fileId: string) => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isImage = file.contentType?.startsWith('image/');
  const fileExtension = file.contentType.split('/')[1]?.toUpperCase() || (isImage ? 'IMG' : 'FILE');

  return (
    <>
      <div className='relative w-24'>
        <div
          className={`
            relative w-24 h-24 rounded-md overflow-hidden border cursor-pointer group
            ${!isImage ? 'bg-gray-50 flex flex-col items-center justify-center p-2' : ''}
          `}
          onClick={() => {
            return setIsPreviewOpen(true);
          }}
        >
          {isImage ? (
            <Image src={file.downloadURL} alt={file.originalName} fill className='object-cover' />
          ) : (
            <>
              <File className='h-5 w-5 text-gray-400' />
              <span className='text-xs text-center text-gray-600 mt-1.5 line-clamp-2'>
                {file.originalName}
              </span>
            </>
          )}

          <div className='absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] font-medium py-0.5 px-1.5 text-center'>
            {fileExtension}
          </div>

          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file._id);
              }}
              className='absolute top-1.5 right-1.5 p-1 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <X className='h-3 w-3' />
            </button>
          )}
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='max-w-3xl h-[85vh] p-0 rounded-md border shadow-sm'>
          <DialogTitle className='sr-only'>File Preview</DialogTitle>
          <div className='relative w-full h-full flex items-center justify-center'>
            {isImage ? (
              <Image
                src={file.downloadURL}
                alt={file.originalName}
                fill
                className='object-contain'
              />
            ) : (
              <div className='flex flex-col items-center justify-center p-6'>
                <File className='h-12 w-12 text-gray-300' />
                <p className='mt-3 text-base font-medium text-gray-700'>{file.originalName}</p>
                <a
                  href={file.downloadURL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-3 text-sm text-blue-500 hover:text-blue-600 transition-colors'
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
