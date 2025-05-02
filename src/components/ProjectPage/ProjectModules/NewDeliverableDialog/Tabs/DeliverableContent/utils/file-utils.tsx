import {
  FileCode,
  FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FileVideo,
} from 'lucide-react';

// Function to check if file is an image
export const isImageFile = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
};

// Function to get file icon based on file type
export const getFileIcon = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return <FileImage size={20} className='text-indigo-500' />;
  }

  // Document files
  if (['pdf'].includes(extension)) {
    return <FileText size={20} className='text-red-500' />;
  }

  // Word files
  if (['doc', 'docx', 'rtf', 'txt'].includes(extension)) {
    return <FileText size={20} className='text-blue-500' />;
  }

  // Spreadsheet files
  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return <FileSpreadsheet size={20} className='text-green-500' />;
  }

  // Code files
  if (['json', 'xml', 'html', 'css', 'js'].includes(extension)) {
    return <FileCode size={20} className='text-amber-500' />;
  }

  // Video files
  if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
    return <FileVideo size={20} className='text-purple-500' />;
  }

  // Presentation files
  if (['ppt', 'pptx'].includes(extension)) {
    return <FileType size={20} className='text-orange-500' />;
  }

  // Default for other files
  return <FileIcon size={20} className='text-gray-500' />;
};

// Function to get file type label
export const getFileTypeLabel = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return 'Image';
  } else if (['pdf'].includes(extension)) {
    return 'PDF';
  } else if (['doc', 'docx'].includes(extension)) {
    return 'Document';
  } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return 'Spreadsheet';
  } else if (['ppt', 'pptx'].includes(extension)) {
    return 'Presentation';
  } else if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
    return 'Video';
  }

  return extension.toUpperCase();
};

// Function to format file size
export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
