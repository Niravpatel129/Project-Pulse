import { PopoverContent } from '@/components/ui/popover';
import Image from 'next/image';

interface InvoiceItemAttachmentProps {
  attachment: any;
}

const InvoiceItemAttachment = ({ attachment }: InvoiceItemAttachmentProps) => {
  const isImageUrl = attachment.url && attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  console.log('🚀 attachment:', attachment);

  return (
    <PopoverContent
      side='right'
      align='start'
      className='w-72 p-0 max-h-[80vh] overflow-y-auto flex flex-col'
    >
      <div className='p-3 border-b flex flex-col gap-1'>
        <h3 className='font-medium'>{attachment.title || 'Attachment'}</h3>
        <p className='text-xs text-gray-500'>{attachment.type || 'File'}</p>
      </div>
      <div className='p-3 overflow-y-auto'>
        {isImageUrl ? (
          <div className='aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden'>
            <Image
              width={100}
              height={100}
              src={attachment.url}
              alt={attachment.title || 'Preview'}
              className='max-w-full max-h-full object-contain'
            />
          </div>
        ) : (
          <div className='aspect-video bg-gray-100 rounded flex items-center justify-center'>
            <div className='text-center'>
              <svg
                viewBox='0 0 24 24'
                className='w-8 h-8 mx-auto text-gray-400'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' />
                <path d='M14 2v6h6M16 13H8M16 17H8M10 9H8' />
              </svg>
              <p className='mt-1 text-sm text-gray-600'>File Preview Not Available</p>
            </div>
          </div>
        )}

        <div className='mt-3'>
          <a
            href={attachment.url}
            target='_blank'
            rel='noopener noreferrer'
            className='w-full flex items-center justify-center gap-1 p-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors'
          >
            <svg
              viewBox='0 0 24 24'
              width='14'
              height='14'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' />
            </svg>
            View Full Size
          </a>
        </div>
      </div>
    </PopoverContent>
  );
};

export default InvoiceItemAttachment;
