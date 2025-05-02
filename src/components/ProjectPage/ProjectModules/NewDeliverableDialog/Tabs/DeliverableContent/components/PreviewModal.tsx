import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { PreviewModalProps } from '../types';
import { formatFileSize, getFileIcon, isImageFile } from '../utils/file-utils';

// Preview Modal Component for larger file previews
const PreviewModal = ({ isOpen, onClose, attachment }: PreviewModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70'
      onClick={onClose}
    >
      <div
        className='relative max-w-4xl w-full bg-white rounded-lg shadow-xl p-1'
        onClick={(e) => {
          return e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-3 border-b'>
          <div className='flex items-center space-x-3'>
            <div className='shrink-0'>{getFileIcon(attachment.name)}</div>
            <div>
              <h3 className='font-medium'>{attachment.name}</h3>
              <p className='text-xs text-neutral-500'>{formatFileSize(attachment.size)}</p>
            </div>
          </div>
          <Button variant='ghost' size='icon' className='rounded-full' onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Preview Content */}
        <div
          className='p-4 flex justify-center items-center bg-neutral-50'
          style={{ minHeight: '400px' }}
        >
          {isImageFile(attachment.name) ? (
            <img
              src={attachment.url}
              alt={attachment.name}
              className='max-h-[70vh] max-w-full object-contain'
            />
          ) : (
            <div className='text-center'>
              <div className='mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-neutral-100 rounded-full'>
                {getFileIcon(attachment.name)}
              </div>
              <p className='text-neutral-600 mb-2'>Preview not available</p>
              <Button
                variant='outline'
                size='sm'
                className='mt-2'
                onClick={() => {
                  return window.open(attachment.url, '_blank');
                }}
              >
                <Download size={14} className='mr-1.5' />
                Download File
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
