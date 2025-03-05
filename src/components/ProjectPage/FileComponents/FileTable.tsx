import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Attachment, FileType, ProjectFile } from '@/lib/mock/projectFiles';
import {
  Check,
  Download,
  FilePlus,
  FileText,
  History,
  Mail,
  MessageSquare,
  MoreHorizontal,
  X,
} from 'lucide-react';
import React from 'react';

interface FileTableProps {
  filteredFiles: ProjectFile[];
  getFileIcon: (type: FileType) => React.ReactNode;
  getAttachmentIcon: (type: string) => React.ReactNode;
  getStatusBadgeClass: (status?: string) => string;
  handleFileClick: (file: ProjectFile) => void;
  onViewDetails: (file: ProjectFile) => void;
  onViewVersionHistory: (file: ProjectFile, attachment: Attachment) => void;
  onSendEmail: (file: ProjectFile) => void;
  onSimulateApproval: (file: ProjectFile) => void;
  onCreateVariation: (file: ProjectFile) => void;
}

const FileTable: React.FC<FileTableProps> = ({
  filteredFiles,
  getFileIcon,
  getAttachmentIcon,
  getStatusBadgeClass,
  handleFileClick,
  onViewDetails,
  onViewVersionHistory,
  onSendEmail,
  onSimulateApproval,
  onCreateVariation,
}) => {
  if (filteredFiles.length === 0) {
    return (
      <div className='text-center py-10'>
        <p className='text-gray-500'>No file items found</p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead>
          <tr className='border-b text-left'>
            <th className='px-4 py-3 text-sm font-medium'>Name</th>
            <th className='px-4 py-3 text-sm font-medium'>Files</th>
            <th className='px-4 py-3 text-sm font-medium'>Date</th>
            <th className='px-4 py-3 text-sm font-medium'>Size</th>
            <th className='px-4 py-3 text-sm font-medium'>Status</th>
            <th className='px-4 py-3 text-sm font-medium'>Comments</th>
            <th className='px-4 py-3 text-sm font-medium'></th>
          </tr>
        </thead>
        <tbody>
          {filteredFiles.map((file) => {return (
            <tr
              key={file.id}
              className='border-b hover:bg-gray-50 cursor-pointer'
              onClick={() => {return handleFileClick(file)}}
            >
              <td className='px-4 py-3'>
                <div className='flex items-center'>
                  {getFileIcon(file.type)}
                  <span className='ml-2'>{file.name}</span>
                </div>
              </td>
              <td className='px-4 py-3'>
                <div className='flex items-center'>
                  {file.attachments.length > 0 && (
                    <>
                      <div className='w-8 h-8 rounded border bg-gray-100 flex items-center justify-center'>
                        {getAttachmentIcon(file.attachments[0].type)}
                      </div>
                      {file.attachments.length > 1 && (
                        <span className='ml-2 text-xs text-gray-500'>
                          +{file.attachments.length - 1}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </td>
              <td className='px-4 py-3'>{file.dateUploaded}</td>
              <td className='px-4 py-3'>{file.size}</td>
              <td className='px-4 py-3'>
                {file.status && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(file.status)}`}
                  >
                    {file.status.replace('_', ' ')}
                  </span>
                )}
              </td>
              <td className='px-4 py-3'>
                <div className='flex items-center'>
                  <MessageSquare className='h-4 w-4 text-gray-500 mr-1' />
                  <span>{file.comments.length}</span>
                </div>
              </td>
              <td className='px-4 py-3' onClick={(e) => {return e.stopPropagation()}}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {return onViewDetails(file)}}>
                      <FileText className='mr-2 h-4 w-4' />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className='mr-2 h-4 w-4' />
                      Download All
                    </DropdownMenuItem>
                    {file.attachments[0]?.versions && file.attachments[0].versions.length > 0 && (
                      <DropdownMenuItem
                        onClick={() => {return onViewVersionHistory(file, file.attachments[0])}}
                      >
                        <History className='mr-2 h-4 w-4' />
                        View Version History
                      </DropdownMenuItem>
                    )}
                    {!file.emailSent && (
                      <DropdownMenuItem onClick={() => {return onSendEmail(file)}}>
                        <Mail className='mr-2 h-4 w-4' />
                        Email to Client
                      </DropdownMenuItem>
                    )}
                    {file.status === 'awaiting_approval' && (
                      <DropdownMenuItem onClick={() => {return onSimulateApproval(file)}}>
                        <Check className='mr-2 h-4 w-4' />
                        Simulate Approval
                      </DropdownMenuItem>
                    )}
                    {file.variation && (
                      <DropdownMenuItem onClick={() => {return onCreateVariation(file)}}>
                        <FilePlus className='mr-2 h-4 w-4' />
                        Create Variation
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-red-600'>
                      <X className='mr-2 h-4 w-4' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
};

export default FileTable;
