import {
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
} from 'lucide-react';

export const getFileIcon = (type: string, contentType?: string) => {
  if (type === 'folder') {
    return <FolderIcon className='h-4 w-4 text-blue-500' />;
  }

  if (!contentType) {
    return <FileIcon className='h-4 w-4 text-gray-500' />;
  }

  // Text and Document types
  if (
    contentType.startsWith('text/') ||
    contentType === 'application/pdf' ||
    contentType === 'application/msword' ||
    contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <FileTextIcon className='h-4 w-4 text-gray-500' />;
  }

  // Image types
  if (contentType.startsWith('image/')) {
    return <FileImageIcon className='h-4 w-4 text-green-500' />;
  }

  // Code types
  if (
    contentType.includes('javascript') ||
    contentType.includes('typescript') ||
    contentType.includes('python') ||
    contentType.includes('java') ||
    contentType.includes('c++') ||
    contentType.includes('c#') ||
    contentType.includes('php') ||
    contentType.includes('ruby') ||
    contentType.includes('go') ||
    contentType.includes('rust') ||
    contentType.includes('swift') ||
    contentType.includes('kotlin') ||
    contentType.includes('scala') ||
    contentType.includes('html') ||
    contentType.includes('css') ||
    contentType.includes('json') ||
    contentType.includes('xml') ||
    contentType.includes('yaml') ||
    contentType.includes('markdown')
  ) {
    return <FileCodeIcon className='h-4 w-4 text-purple-500' />;
  }

  // Audio types
  if (contentType.startsWith('audio/')) {
    return <FileAudioIcon className='h-4 w-4 text-yellow-500' />;
  }

  // Video types
  if (contentType.startsWith('video/')) {
    return <FileVideoIcon className='h-4 w-4 text-orange-500' />;
  }

  // Default icon for unknown types
  return <FileIcon className='h-4 w-4 text-gray-500' />;
};
