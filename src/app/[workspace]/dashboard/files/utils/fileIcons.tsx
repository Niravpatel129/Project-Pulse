import {
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
} from 'lucide-react';

export const getFileIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return <FolderIcon className='h-4 w-4 text-blue-500' />;
    case 'text':
      return <FileTextIcon className='h-4 w-4 text-gray-500' />;
    case 'pdf':
      return <FileIcon className='h-4 w-4 text-red-500' />;
    case 'image':
      return <FileImageIcon className='h-4 w-4 text-green-500' />;
    case 'code':
      return <FileCodeIcon className='h-4 w-4 text-purple-500' />;
    case 'audio':
      return <FileAudioIcon className='h-4 w-4 text-yellow-500' />;
    case 'video':
      return <FileVideoIcon className='h-4 w-4 text-orange-500' />;
    default:
      return <FileIcon className='h-4 w-4 text-gray-500' />;
  }
};
