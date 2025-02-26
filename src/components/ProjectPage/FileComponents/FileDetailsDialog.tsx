import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Attachment, ProjectFile } from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import { Download, Link, Mail, Send } from 'lucide-react';
import React from 'react';

interface FileDetailsDialogProps {
  selectedFile: ProjectFile | null;
  getAttachmentIcon: (type: string) => React.ReactNode;
  getStatusBadgeClass: (status?: string) => string;
  commentText: string;
  setCommentText: (value: string) => void;
  handleAddComment: () => void;
  handleOpenVersionHistory: (attachment: Attachment) => void;
  onSendEmail: () => void;
}

const FileDetailsDialog: React.FC<FileDetailsDialogProps> = ({
  selectedFile,
  getAttachmentIcon,
  getStatusBadgeClass,
  commentText,
  setCommentText,
  handleAddComment,
  handleOpenVersionHistory,
  onSendEmail,
}) => {
  if (!selectedFile) return null;

  return (
    <DialogContent className='max-w-4xl h-[80vh]'>
      <DialogHeader className='sr-only'>
        <DialogTitle>{selectedFile.name}</DialogTitle>
      </DialogHeader>
      <div className='flex flex-col md:flex-row h-full overflow-hidden'>
        {/* Left side - file details and attachments */}
        <div className='w-full md:w-2/3 pr-0 md:pr-4 overflow-y-auto'>
          {selectedFile.description && (
            <div className='mb-4'>
              <h4 className='text-sm font-medium mb-1'>Description</h4>
              <p className='text-sm text-gray-600'>{selectedFile.description}</p>
            </div>
          )}

          <div className='mb-4'>
            <h2 className='text-lg font-medium mb-1'>{selectedFile.name}</h2>

            <h4 className='text-sm font-medium mb-1'>Status</h4>
            {selectedFile.status ? (
              <span
                className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                  selectedFile.status,
                )}`}
              >
                {selectedFile.status.replace('_', ' ')}
              </span>
            ) : (
              <span className='text-sm text-gray-600'>No status</span>
            )}
          </div>

          {selectedFile.emailSent && (
            <div className='mb-4'>
              <h4 className='text-sm font-medium mb-1'>Email Status</h4>
              <div className='flex items-center'>
                <Mail className='h-4 w-4 text-green-500 mr-2' />
                <span className='text-sm'>
                  Sent to {selectedFile.clientEmail} on {selectedFile.emailSentDate}
                </span>
              </div>
            </div>
          )}

          <div className='mb-6'>
            <h4 className='text-sm font-medium mb-2'>Files</h4>
            <div className='space-y-2'>
              {selectedFile.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className='flex items-center justify-between p-2 border rounded hover:bg-gray-50'
                >
                  <div className='flex items-center'>
                    {getAttachmentIcon(attachment.type)}
                    <span className='ml-2 text-sm'>{attachment.name}</span>
                  </div>
                  <div className='flex items-center'>
                    <span className='text-xs text-gray-500 mr-3'>{attachment.size}</span>
                    {attachment.versions && attachment.versions.length > 1 && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='mr-2'
                        onClick={() => handleOpenVersionHistory(attachment)}
                      >
                        <span className='text-xs'>{attachment.versions.length} versions</span>
                      </Button>
                    )}
                    <Button variant='ghost' size='icon'>
                      <Download className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-end space-x-2 mt-4'>
            {!selectedFile.emailSent && (
              <Button onClick={onSendEmail}>
                <Mail className='mr-2 h-4 w-4' />
                Email to Client
              </Button>
            )}
            <Button variant='outline'>
              <Link className='mr-2 h-4 w-4' />
              Copy Share Link
            </Button>
          </div>
        </div>

        {/* Right side - comments */}
        <div className='w-full md:w-1/3 mt-4 md:mt-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col h-full'>
          <h4 className='text-sm font-medium mb-2'>Comments</h4>

          <div className='flex-grow overflow-y-auto mb-4 space-y-4'>
            {selectedFile.comments.length === 0 ? (
              <p className='text-sm text-gray-500'>No comments yet</p>
            ) : (
              selectedFile.comments.map((comment) => (
                <div key={comment.id} className='flex space-x-3'>
                  <Avatar className='h-8 w-8'>
                    {comment.avatarUrl ? (
                      <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                    ) : (
                      <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium text-sm'>{comment.author}</span>
                      <span className='text-xs text-gray-500'>{comment.authorRole}</span>
                    </div>
                    <p className='text-sm mt-1'>{comment.text}</p>
                    <p className='text-xs text-gray-500 mt-1'>
                      {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='border-t pt-4'>
            <Textarea
              placeholder='Add a comment...'
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className='resize-none'
              rows={3}
            />
            <div className='flex justify-end mt-2'>
              <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                <Send className='mr-2 h-4 w-4' />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default FileDetailsDialog;
