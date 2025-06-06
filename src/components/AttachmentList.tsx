import { Paperclip } from 'lucide-react';
import React from 'react';

export interface AttachmentListAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  storageUrl: string;
  headers?: any[];
}

interface AttachmentListProps {
  attachments: AttachmentListAttachment[];
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => {
  if (!attachments.length) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📑';
    return '📎';
  };

  return (
    <div className=''>
      <div className='flex items-center gap-2 mb-3'>
        <Paperclip className='h-4 w-4 text-muted-foreground' />
        <h3 className='text-sm font-medium'>Attachments ({attachments.length})</h3>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {attachments.map((attachment) => {
          return (
            <a
              key={attachment.attachmentId}
              href={attachment.storageUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-3 p-2 rounded-lg border border-slate-100 dark:border-[#232428] hover:bg-slate-50 dark:hover:bg-[#1a1b1e] transition-colors w-[158px] h-[114px]'
            >
              <div className='flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-[#232428] rounded-lg'>
                <span className='text-lg'>{getFileIcon(attachment.mimeType)}</span>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate' title={attachment.filename}>
                  {attachment.filename}
                </p>
                <p className='text-xs text-muted-foreground'>{formatFileSize(attachment.size)}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentList;
