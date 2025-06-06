import {
  File,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Paperclip,
  Presentation,
} from 'lucide-react';
import React from 'react';

export interface AttachmentListAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  storageUrl: string;
  storagePath?: string;
  thumbnail?: {
    url: string;
    path: string;
    width: number;
    height: number;
  };
  headers?: any[];
}

interface AttachmentListProps {
  attachments: AttachmentListAttachment[];
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => {
  console.log('🚀 attachments:', attachments);
  if (!attachments.length) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/'))
      return <FileImage className='w-12 h-12 text-muted-foreground' />;
    if (mimeType.startsWith('video/'))
      return <FileVideo className='w-12 h-12 text-muted-foreground' />;
    if (mimeType.startsWith('audio/'))
      return <FileAudio className='w-12 h-12 text-muted-foreground' />;
    if (mimeType.includes('pdf')) return <FileText className='w-12 h-12 text-muted-foreground' />;
    if (mimeType.includes('word')) return <FileText className='w-12 h-12 text-muted-foreground' />;
    if (mimeType.includes('excel') || mimeType.includes('sheet'))
      return <FileSpreadsheet className='w-12 h-12 text-muted-foreground' />;
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
      return <Presentation className='w-12 h-12 text-muted-foreground' />;
    return <File className='w-12 h-12 text-muted-foreground' />;
  };

  return (
    <div className=''>
      <div className='flex items-center gap-2 mb-3'>
        <Paperclip className='h-4 w-4 text-muted-foreground' />
        <h3 className='text-sm font-medium'>Attachments ({attachments.length})</h3>
      </div>
      <div className='flex flex-wrap gap-3'>
        {attachments.map((attachment) => {
          const isImage = attachment.mimeType.startsWith('image/');
          return (
            <a
              key={attachment.attachmentId}
              href={attachment.storageUrl}
              target='_blank'
              rel='noopener noreferrer'
              className={`group relative flex flex-col rounded-lg border border-slate-100 dark:border-[#232428]  transition-colors w-[200px] h-[150px] overflow-hidden`}
            >
              {isImage && attachment.thumbnail ? (
                <>
                  <img
                    src={attachment.thumbnail.url}
                    alt={attachment.filename}
                    className='absolute inset-0 w-full h-full object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />
                  <div className='absolute bottom-0 left-0 right-0'>
                    <div className='p-3 transform transition-transform duration-300 group-hover:-translate-y-6'>
                      <p
                        className='text-sm font-medium truncate text-white'
                        title={attachment.filename}
                      >
                        {attachment.filename}
                      </p>
                    </div>
                    <div className='absolute bottom-0 left-0 right-0 p-3 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0'>
                      <p className='text-xs text-white/80'>{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='flex-1 flex items-center justify-center '>
                    {getFileIcon(attachment.mimeType)}
                  </div>
                  <div className='relative bg-white dark:bg-[#1a1b1e]'>
                    <div className='p-3 transform transition-transform duration-300 group-hover:-translate-y-6'>
                      <p className='text-sm font-medium truncate' title={attachment.filename}>
                        {attachment.filename}
                      </p>
                    </div>
                    <div className='absolute bottom-0 left-0 right-0 p-3 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0'>
                      <p className='text-xs text-muted-foreground'>
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentList;
