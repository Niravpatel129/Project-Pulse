import FileUploadManagerModal from '@/components/ProjectPage/FileComponents/FileUploadManagerModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFileIcon } from '@/utils/fileIcons';
import { File, Star, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Attachment } from './AttachmentCellEditor';

// Date formatter for table cells
export const dateFormatter = (params) => {
  if (!params.value) return '-';
  // Format date in a user-friendly way
  const date = new Date(params.value);
  return date.toLocaleDateString();
};

// Time formatter for table cells
export const timeFormatter = (params) => {
  if (!params.value) return '-';
  try {
    console.log('timeFormatter received:', params.value, 'type:', typeof params.value);
    // Format time in HH:MM format
    const time = new Date(params.value);
    if (!isNaN(time.getTime())) {
      const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      console.log('timeFormatter output:', formattedTime);
      return formattedTime;
    }
    // If not a valid date, try to return directly if it matches time format
    if (
      typeof params.value === 'string' &&
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(params.value)
    ) {
      return params.value;
    }
    return '-';
  } catch (error) {
    console.error('Error in timeFormatter:', error);
    return '-';
  }
};

// Currency formatter for table cells
export const currencyFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  // Format as currency with 2 decimal places
  return `$${Number(params.value).toFixed(2)}`;
};

// Percentage formatter for table cells
export const percentFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  // Format as percentage
  return `${Number(params.value).toFixed(1)}%`;
};

// Number formatter for table cells
export const numberFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  // Format number with commas for thousands
  return Number(params.value).toLocaleString();
};

// Link cell renderer
export const linkCellRenderer = (params) => {
  if (!params.value) return '-';

  const value = params.value;
  const displayText = value.length > 30 ? value.substring(0, 27) + '...' : value;

  return (
    <div className='text-blue-500 underline'>
      <a
        href={value.startsWith('http') ? value : `https://${value}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        {displayText}
      </a>
    </div>
  );
};

// Time cell renderer
export const timeCellRenderer = (params) => {
  if (!params.value) return '-';

  try {
    console.log('timeCellRenderer received:', params.value, 'type:', typeof params.value);
    // Try to parse as Date
    const time = new Date(params.value);
    if (!isNaN(time.getTime())) {
      const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      console.log('timeCellRenderer output:', timeString);
      return timeString;
    }

    // If it's already in HH:MM format, return it
    if (
      typeof params.value === 'string' &&
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(params.value)
    ) {
      return params.value;
    }

    return '-';
  } catch (error) {
    console.error('Error in timeCellRenderer:', error);
    return '-';
  }
};

// Renderer for image cells
export const imageCellRenderer = (params) => {
  if (!params.value) return '-';
  // Display an image with a maximum width
  return (
    <img
      src={params.value}
      alt='Image'
      className='max-w-[100px] max-h-[50px] object-contain'
      onClick={(e) => {
        return e.stopPropagation();
      }}
    />
  );
};

// Helper function to format file size in bytes to human-readable format
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const AttachmentManager = ({
  value,
  onUpdate,
}: {
  value: any;
  onUpdate: (newVal: any) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fix: Check if value is a string that needs parsing or already an object/array
  const attachments = value ? (typeof value === 'string' ? JSON.parse(value) : value) : [];

  console.log('🚀 value:', value);

  const handleAddFileToProject = (file) => {
    console.log('🚀 file:', file);
    const newAttachments = [...attachments];

    // Create a new attachment object
    const attachment: Attachment = {
      name: file.originalName || file.name,
      url: file.downloadURL || URL.createObjectURL(file),
      size: file.size ? formatBytes(file.size) : undefined,
      id: file._id || uuidv4(),
      fileId: file._id,
      contentType: file.contentType,
      originalName: file.originalName,
      storagePath: file.storagePath,
      downloadURL: file.downloadURL,
      workspaceId: file.workspaceId,
      uploadedBy: file.uploadedBy,
      status: file.status,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };

    newAttachments.push(attachment);

    onUpdate(typeof value === 'string' ? JSON.stringify(newAttachments) : newAttachments);
    setIsModalOpen(false);
  };

  return (
    <div>
      {attachments.length === 0 ? (
        <Button
          className='w-full'
          onClick={() => {
            return setIsModalOpen(true);
          }}
        >
          Attach Files
        </Button>
      ) : (
        <Button
          className='w-full'
          onClick={() => {
            return setIsModalOpen(true);
          }}
        >
          Manage ({attachments.length})
        </Button>
      )}

      <FileUploadManagerModal
        isOpen={isModalOpen}
        onClose={() => {
          return setIsModalOpen(false);
        }}
        handleAddFileToProject={handleAddFileToProject}
      />
    </div>
  );
};

// Update the fileCellRenderer to use our new AttachmentManager component
export const fileCellRenderer = (params: {
  value?: Attachment | Attachment[];
  api?: any;
  rowIndex?: number;
  node?: any;
  column?: any;
  data?: any;
}) => {
  // Create a wrapper component that uses React hooks properly
  const FileAttachmentDisplay = () => {
    const [showAttachmentsList, setShowAttachmentsList] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Handle both single attachment and array of attachments
    const attachments = Array.isArray(params.value)
      ? params.value
      : params.value
      ? [params.value]
      : [];

    const handleUpdateAttachments = (newVal) => {
      // Update the cell value directly
      if (params.node && params.column) {
        params.node.setDataValue(params.column.getId(), newVal);

        // Refresh the cell
        if (params.api) {
          params.api.refreshCells({
            force: true,
            rowNodes: [params.node],
            columns: [params.column.getId()],
          });
        }
      }
    };

    const handleRemoveAttachment = (attachmentId, e) => {
      if (e) e.stopPropagation();
      const updatedAttachments = attachments.filter((attachment) => {
        return attachment.id !== attachmentId;
      });
      handleUpdateAttachments(updatedAttachments);
    };

    const openAttachmentManager = (e) => {
      if (e) e.stopPropagation();
      // Create a placeholder element for modal
      setIsModalOpen(true);
    };

    // Return to hide the FileUploadManagerModal when not in use
    if (attachments.length === 0) {
      return (
        <div className='flex items-center space-x-1'>
          <Button
            variant='ghost'
            size='sm'
            className='p-0 h-6 w-6 bg-blue-100 hover:bg-blue-200'
            onClick={openAttachmentManager}
          >
            <span className='text-blue-500 text-xs font-bold'>+</span>
          </Button>

          {isModalOpen && (
            <FileUploadManagerModal
              isOpen={isModalOpen}
              onClose={() => {
                return setIsModalOpen(false);
              }}
              handleAddFileToProject={(file) => {
                handleUpdateAttachments([
                  ...attachments,
                  {
                    name: file.originalName || file.name,
                    url: file.downloadURL || URL.createObjectURL(file),
                    size: file.size ? formatBytes(file.size) : undefined,
                    id: file._id || uuidv4(),
                    fileId: file._id,
                    contentType: file.contentType,
                    originalName: file.originalName,
                    storagePath: file.storagePath,
                    downloadURL: file.downloadURL,
                    workspaceId: file.workspaceId,
                    uploadedBy: file.uploadedBy,
                    status: file.status,
                    createdAt: file.createdAt,
                    updatedAt: file.updatedAt,
                  },
                ]);
                setIsModalOpen(false);
              }}
            />
          )}
        </div>
      );
    }
    return (
      <div
        className='flex items-center gap-1 relative'
        onMouseLeave={() => {
          return setShowAttachmentsList(false);
        }}
      >
        {/* Count indicator for additional files */}
        {attachments.length >= 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className='flex items-center gap-1 text-xs bg-none rounded-full py-0.5 text-blue-600 cursor-pointer  transition-colors'
                onMouseEnter={() => {
                  return setShowAttachmentsList(true);
                }}
              >
                {/* Display image preview or file type icon based on content type */}
                {attachments[0].contentType?.startsWith('image/') ? (
                  <div className='h-6 w-6 relative overflow-hidden rounded-sm border border-blue-200'>
                    <Image
                      src={attachments[0].url || attachments[0].downloadURL}
                      alt={attachments[0].name}
                      width={24}
                      height={24}
                      className='h-full w-full object-cover'
                    />
                  </div>
                ) : (
                  getFileIcon(attachments[0].name, attachments[0].contentType)
                )}
                {attachments.length > 1 && `+${attachments.length - 1}`}
              </div>
            </TooltipTrigger>
            <TooltipContent className='w-60 bg-white text-black'>
              <div className='flex flex-col space-y-1.5 p-2'>
                {attachments.map((attachment, index) => {
                  return (
                    <div
                      key={`${attachment.id}-${index}`}
                      className='flex items-center justify-between py-0.5 hover:bg-gray-50 rounded px-1'
                    >
                      <div className='flex items-center space-x-2'>
                        {attachment.contentType?.startsWith('image/') ? (
                          <div className='h-5 w-5 overflow-hidden rounded-sm border border-gray-200'>
                            <Image
                              src={attachment.url || attachment.downloadURL}
                              alt={attachment.name}
                              width={20}
                              height={20}
                              className='object-cover'
                            />
                          </div>
                        ) : (
                          getFileIcon(attachment.name, attachment.contentType, 'h-4 w-4')
                        )}
                        <div className='flex flex-col'>
                          <span className='text-xs font-medium text-gray-700 truncate max-w-[180px]'>
                            {attachment.name}
                          </span>
                          <span className='text-[10px] text-gray-500'>{attachment.size || ''}</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-1'>
                        <a
                          href={attachment.downloadURL}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:text-blue-700'
                          onClick={(e) => {
                            return e.stopPropagation();
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger>
                              <Star className='h-3 w-3' />
                            </TooltipTrigger>
                            <TooltipContent side='bottom' className='text-xs'>
                              Open file
                            </TooltipContent>
                          </Tooltip>
                        </a>
                        <button
                          className='text-gray-400 hover:text-red-500 transition-colors'
                          onClick={(e) => {
                            return handleRemoveAttachment(attachment.id, e);
                          }}
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Add more button */}
        <Button
          variant='ghost'
          size='sm'
          className='p-0 h-6 w-6 bg-blue-100 hover:bg-blue-200 ml-2'
          onClick={openAttachmentManager}
        >
          <span className='text-blue-500 text-xs font-bold'>+</span>
        </Button>

        {/* Hover list of all attachments */}
        {showAttachmentsList && attachments.length > 1 && (
          <div className='absolute top-full left-0 mt-1 bg-white shadow-md rounded-md p-2 z-10 w-60'>
            <ul className='text-xs'>
              {attachments.map((attachment, index) => {
                return (
                  <li
                    key={`${attachment.id}-${index}`}
                    className='py-1 flex items-center justify-between'
                  >
                    <div className='flex items-center'>
                      <File className='h-3 w-3 mr-1 text-blue-500' />
                      <a
                        href={attachment.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline truncate'
                        onClick={(e) => {
                          return e.stopPropagation();
                        }}
                      >
                        {attachment.name || `File ${index + 1}`}
                      </a>
                    </div>
                    <div
                      className='text-xs text-red-500 cursor-pointer ml-2'
                      onClick={(e) => {
                        return handleRemoveAttachment(attachment.id, e);
                      }}
                    >
                      X
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {isModalOpen && (
          <FileUploadManagerModal
            isOpen={isModalOpen}
            onClose={() => {
              return setIsModalOpen(false);
            }}
            handleAddFileToProject={(file) => {
              console.log('🚀 file:', file);
              handleUpdateAttachments([
                ...attachments,
                {
                  name: file.originalName || file.name,
                  url: file.downloadURL || URL.createObjectURL(file),
                  size: file.size ? formatBytes(file.size) : undefined,
                  id: file._id || uuidv4(),
                  fileId: file._id,
                  contentType: file.contentType,
                  originalName: file.originalName,
                  storagePath: file.storagePath,
                  downloadURL: file.downloadURL,
                  workspaceId: file.workspaceId,
                  uploadedBy: file.uploadedBy,
                  status: file.status,
                  createdAt: file.createdAt,
                  updatedAt: file.updatedAt,
                },
              ]);
              setIsModalOpen(false);
            }}
          />
        )}
      </div>
    );
  };

  // Return the React component
  return <FileAttachmentDisplay />;
};

// Renderer for rating cells (stars)
export const ratingCellRenderer = (params) => {
  if (!params.value && params.value !== 0) return '-';
  // Display stars for rating (1-5)
  const rating = Math.min(Math.max(0, Number(params.value)), 5);
  return (
    <div className='flex items-center'>
      {Array.from({ length: 5 }).map((_, i) => {
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
};

// Renderer for tags/multi-select values
export const tagsCellRenderer = (params) => {
  if (!params.value) return '-';

  // Assuming tags are in the format [{id: string, name: string}]
  return (
    <div className='flex flex-wrap gap-1'>
      {params.value.map((tag) => {
        return (
          <Badge key={tag.id} variant='outline' className='bg-amber-50 text-amber-700'>
            {tag.name}
          </Badge>
        );
      })}
    </div>
  );
};

// Phone cell renderer
export const phoneCellRenderer = (params) => {
  if (!params.value) return '-';

  // Get phone format from column definition or use international as default
  const phoneFormat = params.colDef?.cellRendererParams?.phoneFormat || 'international';
  const phoneNumber = params.value.toString();
  let formattedNumber = phoneNumber;

  try {
    // Format the phone number based on the specified format
    if (phoneNumber) {
      // Clean the phone number to just digits
      const digits = phoneNumber.replace(/\D/g, '');

      switch (phoneFormat) {
        case 'international':
          // Format as international number with country code
          if (digits.length === 10) {
            formattedNumber = `+1 ${digits.substring(0, 3)} ${digits.substring(
              3,
              6,
            )} ${digits.substring(6)}`;
          } else if (digits.length > 10) {
            // Assume first digit(s) are country code
            const countryCode = digits.substring(0, digits.length - 10);
            const nationalDigits = digits.substring(digits.length - 10);
            formattedNumber = `+${countryCode} ${nationalDigits.substring(
              0,
              3,
            )} ${nationalDigits.substring(3, 6)} ${nationalDigits.substring(6)}`;
          }
          break;
        case 'us':
          // Format as US number (123-456-7890)
          if (digits.length >= 10) {
            const nationalDigits = digits.substring(Math.max(0, digits.length - 10));
            formattedNumber = `${nationalDigits.substring(0, 3)}-${nationalDigits.substring(
              3,
              6,
            )}-${nationalDigits.substring(6)}`;
          }
          break;
        default:
          // Keep as cleaned digits with spaces for readability
          if (digits.length >= 10) {
            const nationalDigits = digits.substring(Math.max(0, digits.length - 10));
            formattedNumber = `${nationalDigits.substring(0, 3)} ${nationalDigits.substring(
              3,
              6,
            )} ${nationalDigits.substring(6)}`;
          }
      }
    }

    // Display the formatted phone number with a phone icon
    return (
      <div className='flex items-center'>
        <span className='mr-1'>📞</span>
        <a href={`tel:${phoneNumber}`} className='text-blue-600 hover:underline'>
          {formattedNumber}
        </a>
      </div>
    );
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phoneNumber;
  }
};

// Helper function to get the appropriate value formatter based on name
export const getValueFormatter = (formatterName) => {
  switch (formatterName) {
    case 'dateFormatter':
      return dateFormatter;
    case 'timeFormatter':
      return timeFormatter;
    case 'numberFormatter':
      return numberFormatter;
    case 'currencyFormatter':
      return currencyFormatter;
    case 'percentFormatter':
      return percentFormatter;
    default:
      return undefined;
  }
};
