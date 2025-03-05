import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Send } from 'lucide-react';
import { Module } from './types';

interface ModuleDetailsDialogProps {
  selectedModule: Module | null;
  commentText: string;
  setCommentText: (value: string) => void;
  handleAddComment: () => void;
  onClose: () => void;
}

export function ModuleDetailsDialog({
  selectedModule,
  commentText,
  setCommentText,
  handleAddComment,
  onClose,
}: ModuleDetailsDialogProps) {
  if (!selectedModule) return null;

  return (
    <DialogContent className='max-w-4xl h-[80vh]'>
      <div className='flex flex-col md:flex-row h-full overflow-hidden'>
        {/* Left side - module details */}
        <div className='w-full md:w-2/3 pr-0 md:pr-4 overflow-y-auto'>
          <h2 className='text-2xl mb-4'>{selectedModule.name}</h2>
          {selectedModule.description && (
            <div className='mb-4'>
              <h4 className='text-sm font-medium mb-1'>Description</h4>
              <p className='text-sm text-gray-600'>{selectedModule.description}</p>
            </div>
          )}

          <div className='mb-4'>
            <h4 className='text-sm font-medium mb-1'>Status</h4>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                selectedModule.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : selectedModule.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : selectedModule.status === 'archived'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {selectedModule.status}
            </span>
          </div>

          <div className='mb-4'>
            <h4 className='text-sm font-medium mb-1'>Created By</h4>
            <div className='flex items-center space-x-2'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback>{selectedModule.createdBy.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm font-medium'>{selectedModule.createdBy.name}</p>
                <p className='text-xs text-gray-500'>{selectedModule.createdBy.email}</p>
              </div>
            </div>
          </div>

          <div className='mb-4'>
            <h4 className='text-sm font-medium mb-1'>Created At</h4>
            <p className='text-sm text-gray-600'>
              {format(new Date(selectedModule.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>

          {selectedModule.assignedTo.length > 0 && (
            <div className='mb-4'>
              <h4 className='text-sm font-medium mb-1'>Assigned To</h4>
              <div className='flex flex-wrap gap-2'>
                {selectedModule.assignedTo.map((userId) => {
                  return (
                    <span
                      key={userId}
                      className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
                    >
                      {userId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right side - comments */}
        <div className='w-full md:w-1/3 mt-4 md:mt-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col h-full p-1'>
          <h4 className='text-sm font-medium mb-2'>Comments</h4>

          <div className='flex-grow overflow-y-auto mb-4 space-y-4'>
            <p className='text-sm text-gray-500'>No comments yet</p>
          </div>

          <div className='border-t pt-4'>
            <Textarea
              placeholder='Add a comment...'
              value={commentText}
              onChange={(e) => {
                return setCommentText(e.target.value);
              }}
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
}
