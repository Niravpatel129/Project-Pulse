import { Badge } from '@/components/ui/badge';
import { PopoverContent } from '@/components/ui/popover';
import { ReactNode } from 'react';
import { InvoiceItem } from './types';

interface InvoiceItemDetailsProps {
  item: InvoiceItem;
}

const InvoiceItemDetails = ({ item }: InvoiceItemDetailsProps) => {
  const renderAttachmentPreview = (attachment: any) => {
    console.log('🚀 attachment:', attachment);
    // "https://cdn.printshop.com/mockups/stickers.png"
    const isImageUrl = attachment.url && attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    console.log('🚀 isImageUrl:', !!isImageUrl);
    console.log('🚀 isImageUrl:', attachment.url, isImageUrl);

    return (
      <div className='p-3'>
        {!!isImageUrl ? (
          <div className='aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden'>
            <img
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
    );
  };

  const renderLinkedItemValue = (value: any) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className='text-gray-500 text-xs'>None</span>;

      // Handle attachment arrays specially
      if (value[0]?.name && value[0]?.url) {
        return (
          <div className='flex gap-2 flex-wrap'>
            {value.slice(0, 2).map((file, i) => {
              console.log('🚀 file:', file);
              return (
                <span
                  key={`file-${i}`}
                  className='text-xs  text-blue-600 rounded flex items-center gap-1 cursor-pointer'
                  onClick={() => {
                    window.open(file.url, '_blank');
                  }}
                >
                  <svg
                    viewBox='0 0 24 24'
                    width='12'
                    height='12'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48' />
                  </svg>
                  {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                </span>
              );
            })}
            {value.length > 2 && (
              <span className='text-xs text-gray-500'>+{value.length - 2} more</span>
            )}
          </div>
        );
      }

      // Regular arrays
      return (
        <div className='text-xs'>
          {value.length} {value.length === 1 ? 'item' : 'items'}
        </div>
      );
    }

    // Handle numbers and strings
    return typeof value === 'string' && value.length > 20
      ? value.substring(0, 20) + '...'
      : String(value);
  };

  return (
    <PopoverContent side='right' align='start' className='w-80 p-0 max-h-[80vh] flex flex-col'>
      <div className='px-4 py-3 border-b'>
        <h3 className='font-medium'>{item.name}</h3>
        <p className='text-sm text-gray-500'>{item.description}</p>
      </div>

      <div className='p-4 overflow-y-auto'>
        {/* Item Fields */}
        {item.fields &&
          Object.entries(item.fields)
            .filter(([key]) => {
              return !['total', 'unitPrice', 'quantity'].includes(key);
            })
            .map(([key, value]) => {
              // Format the value based on its type
              let displayValue: ReactNode = '';

              if (key === 'linkedItems' && Array.isArray(value)) {
                displayValue = (
                  <div className='flex flex-col gap-2 mt-1'>
                    {value.length > 0 ? (
                      value.map((linkedItem, i) => {
                        return (
                          <div
                            key={`linkedItem-${i}`}
                            className='border rounded p-2 bg-gray-50 text-sm'
                          >
                            <div className='font-medium mb-1'>
                              {linkedItem.tableName || 'Linked Record'}
                            </div>
                            {linkedItem.displayValues && (
                              <div className='grid grid-cols-1 gap-1'>
                                {Object.entries(linkedItem.displayValues).map(([dKey, dValue]) => {
                                  return (
                                    <div key={`display-${dKey}`} className='flex items-start'>
                                      <span className='text-xs text-gray-500 min-w-[80px] mr-1'>
                                        {dKey}:
                                      </span>
                                      <span className='text-xs text-gray-700 flex-1'>
                                        {renderLinkedItemValue(dValue)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <span className='text-gray-500 text-xs'>No linked items</span>
                    )}
                  </div>
                );
              } else if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                  // Handle array values (like multiSelectColors)
                  displayValue = (
                    <div className='flex gap-1 mt-1 flex-wrap'>
                      {value.map((v, i) => {
                        return (
                          <Badge key={`${key}-${i}`} variant='outline' className='text-xs'>
                            {String(v)}
                          </Badge>
                        );
                      })}
                    </div>
                  );
                } else {
                  // Handle object values (like sizeBreakdown)
                  displayValue = (
                    <div className='grid grid-cols-2 gap-2 mt-1'>
                      {Object.entries(value).map(([k, v]) => {
                        return (
                          <div
                            key={`${key}-${k}`}
                            className='flex justify-between items-center p-1 bg-gray-50 rounded text-xs'
                          >
                            <span className='font-medium'>{k}:</span>
                            <span>{String(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
              } else if (value !== null && value !== undefined) {
                // Format based on content and type
                if (typeof value === 'number') {
                  displayValue = value.toString();
                } else if (typeof value === 'string') {
                  // Check if it's a URL
                  if (value.match(/^https?:\/\//)) {
                    displayValue = (
                      <a
                        href={value}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-500 hover:underline truncate block'
                      >
                        {value.length > 30 ? `${value.substring(0, 30)}...` : value}
                      </a>
                    );
                  } else {
                    displayValue = value;
                  }
                } else {
                  displayValue = String(value);
                }
              }

              return (
                <div key={`field-${key}`} className='mb-4 last:mb-0'>
                  <div className='text-sm font-medium capitalize mb-1'>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className='text-sm text-gray-700'>{displayValue}</div>
                </div>
              );
            })}

        {/* Attachments Section */}
        {item.attachments && item.attachments.length > 0 && (
          <div className='mt-4 pt-4 border-t'>
            <h3 className='text-sm font-medium mb-3'>Attachments</h3>
            <div className='space-y-3'>
              {item.attachments.map((attachment, index) => {
                return (
                  <div key={`attachment-${index}`} className='border rounded overflow-hidden'>
                    <div className='px-3 py-2 bg-gray-50 border-b flex justify-between items-center'>
                      <div>
                        <h4 className='font-medium text-sm'>{attachment.title || 'Attachment'}</h4>
                        <p className='text-xs text-gray-500'>{attachment.type || 'File'}</p>
                      </div>
                    </div>
                    {renderAttachmentPreview(attachment)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PopoverContent>
  );
};

export default InvoiceItemDetails;
