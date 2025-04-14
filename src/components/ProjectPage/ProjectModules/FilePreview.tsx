import { Dialog, DialogContent } from '@/components/ui/dialog';
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

  return (
    <>
      <div className='relative w-24'>
        {isImage ? (
          <div
            className='relative w-24 h-24 rounded-md overflow-hidden border cursor-pointer group'
            onClick={() => {
              return setIsPreviewOpen(true);
            }}
          >
            <Image src={file.downloadURL} alt={file.originalName} fill className='object-cover' />
            <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold py-0.5 px-1 text-center'>
              {file.contentType.split('/')[1]?.toUpperCase() || 'IMG'}
            </div>
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(file._id);
                }}
                className='absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10'
              >
                <X className='h-3 w-3' />
              </button>
            )}
          </div>
        ) : (
          <div
            className='relative w-24 h-24 rounded-md overflow-hidden border bg-gray-100 flex flex-col items-center justify-center p-2 group cursor-pointer'
            onClick={() => {
              return setIsPreviewOpen(true);
            }}
          >
            <File className='h-6 w-6 text-gray-500' />
            <span className='text-xs text-center text-gray-700 mt-1 line-clamp-2'>
              {file.originalName}
            </span>
            <div className='absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold py-0.5 px-1 text-center'>
              {file.contentType.split('/')[1]?.toUpperCase() || 'FILE'}
            </div>
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(file._id);
                }}
                className='absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10'
              >
                <X className='h-3 w-3' />
              </button>
            )}
          </div>
        )}
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='max-w-4xl h-[90vh] p-0'>
          <div className='relative w-full h-full flex items-center justify-center'>
            {isImage ? (
              <Image
                src={file.downloadURL}
                alt={file.originalName}
                fill
                className='object-contain'
              />
            ) : (
              <div className='flex flex-col items-center justify-center p-8'>
                <File className='h-16 w-16 text-gray-400' />
                <p className='mt-4 text-lg font-medium'>{file.originalName}</p>
                <a
                  href={file.downloadURL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-4 text-blue-500 hover:underline'
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
