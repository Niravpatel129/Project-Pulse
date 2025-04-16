import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  File as FilePdf,
  File as FilePresentation,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Mail,
} from 'lucide-react';
import React from 'react';

interface FileIconProps {
  className?: string;
}

const DEFAULT_ICON_SIZE = 'h-6 w-6';

// File type color mapping
const FILE_TYPE_COLORS = {
  // Documents
  pdf: '#FF5252', // Red
  doc: '#4285F4', // Google blue
  docx: '#4285F4',
  txt: '#757575', // Gray
  md: '#757575',
  rtf: '#757575',
  odt: '#4285F4',

  // Spreadsheets
  xls: '#34A853', // Google green
  xlsx: '#34A853',
  csv: '#34A853',
  ods: '#34A853',

  // Presentations
  ppt: '#FBBC05', // Google yellow
  pptx: '#FBBC05',
  odp: '#FBBC05',

  // Images
  jpg: '#E91E63', // Pink
  jpeg: '#E91E63',
  png: '#E91E63',
  gif: '#E91E63',
  svg: '#9C27B0', // Purple
  webp: '#E91E63',

  // Audio
  mp3: '#FF9800', // Orange
  wav: '#FF9800',
  ogg: '#FF9800',
  m4a: '#FF9800',
  flac: '#FF9800',

  // Video
  mp4: '#FF4081', // Pink accent
  mov: '#FF4081',
  avi: '#FF4081',
  webm: '#FF4081',
  mkv: '#FF4081',

  // Code
  js: '#F7DF1E', // JavaScript yellow
  ts: '#3178C6', // TypeScript blue
  jsx: '#61DAFB', // React blue
  tsx: '#3178C6',
  html: '#E44D26', // HTML orange
  css: '#2965F1', // CSS blue
  scss: '#CD6799', // SASS pink
  php: '#777BB4', // PHP purple
  py: '#3776AB', // Python blue
  java: '#007396', // Java blue
  cpp: '#00599C', // C++ blue
  go: '#00ADD8', // Go blue
  rb: '#CC342D', // Ruby red
  swift: '#FA7343', // Swift orange
  kt: '#7F52FF', // Kotlin purple

  // Archives
  zip: '#FFC107', // Amber
  rar: '#FFC107',
  tar: '#FFC107',
  gz: '#FFC107',
  '7z': '#FFC107',

  // JSON
  json: '#1976D2', // Blue

  // Email
  eml: '#78909C', // Blue gray
  msg: '#78909C',

  // Default
  default: '#90A4AE', // Blue gray light
};

/**
 * Get the appropriate icon component for a file based on its name and content type
 * @param fileName - The name of the file
 * @param contentType - The MIME type of the file (optional)
 * @param className - Additional CSS classes to apply to the icon (optional)
 * @returns A React component with the appropriate icon
 */
export const getFileIcon = (
  fileName: string = '',
  contentType?: string,
  className: string = DEFAULT_ICON_SIZE,
): React.ReactNode => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  const color = FILE_TYPE_COLORS[fileExtension] || FILE_TYPE_COLORS.default;
  const iconClassName = `${className}`;

  // Get the appropriate icon component based on content type and file extension
  let IconComponent = File;

  // First check content type
  if (contentType) {
    // Image files
    if (contentType.startsWith('image/')) {
      IconComponent = FileImage;
    }
    // Audio files
    else if (contentType.startsWith('audio/')) {
      IconComponent = FileAudio;
    }
    // Video files
    else if (contentType.startsWith('video/')) {
      IconComponent = FileVideo;
    }
    // PDF files
    else if (contentType === 'application/pdf') {
      IconComponent = FilePdf;
    }
    // Spreadsheet files
    else if (
      contentType.includes('spreadsheet') ||
      contentType === 'application/vnd.ms-excel' ||
      contentType.includes('excel')
    ) {
      IconComponent = FileSpreadsheet;
    }
    // Text/document files
    else if (
      contentType.includes('document') ||
      contentType.startsWith('text/') ||
      contentType === 'application/msword' ||
      contentType.includes('wordprocessing')
    ) {
      IconComponent = FileText;
    }
    // Presentation files
    else if (
      contentType.includes('presentation') ||
      contentType === 'application/vnd.ms-powerpoint'
    ) {
      IconComponent = FilePresentation;
    }
    // Archive files
    else if (
      contentType.includes('zip') ||
      contentType.includes('compressed') ||
      contentType.includes('archive')
    ) {
      IconComponent = FileArchive;
    }
    // JSON files
    else if (contentType === 'application/json') {
      IconComponent = FileJson;
    }
    // Email files
    else if (contentType === 'message/rfc822') {
      IconComponent = Mail;
    }
  } else {
    // If content type isn't provided, check file extension
    switch (fileExtension) {
      // Images
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
      case 'svg':
        IconComponent = FileImage;
        break;

      // Documents
      case 'doc':
      case 'docx':
      case 'odt':
      case 'rtf':
      case 'txt':
      case 'md':
        IconComponent = FileText;
        break;

      // Spreadsheets
      case 'xls':
      case 'xlsx':
      case 'csv':
      case 'ods':
        IconComponent = FileSpreadsheet;
        break;

      // PDFs
      case 'pdf':
        IconComponent = FilePdf;
        break;

      // Audio
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'm4a':
      case 'flac':
        IconComponent = FileAudio;
        break;

      // Video
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'webm':
      case 'mkv':
        IconComponent = FileVideo;
        break;

      // Code
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'scss':
      case 'php':
      case 'py':
      case 'java':
      case 'c':
      case 'cpp':
      case 'go':
      case 'rb':
      case 'swift':
      case 'kt':
        IconComponent = FileCode;
        break;

      // Archives
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
      case '7z':
        IconComponent = FileArchive;
        break;

      // Presentations
      case 'ppt':
      case 'pptx':
      case 'odp':
        IconComponent = FilePresentation;
        break;

      // JSON
      case 'json':
        IconComponent = FileJson;
        break;

      // Email
      case 'eml':
      case 'msg':
        IconComponent = Mail;
        break;

      // Default
      default:
        IconComponent = File;
        break;
    }
  }

  // Render icon with extension badge
  return (
    <div className='relative' style={{ width: 'fit-content', height: 'fit-content' }}>
      <IconComponent className={iconClassName} style={{ color }} />
      {fileExtension && (
        <div
          className='absolute bottom-0 right-0 flex items-center justify-center rounded-sm text-white text-[8px] font-bold px-1 uppercase'
          style={{
            backgroundColor: color,
            fontSize: '7px',
            lineHeight: '1.1',
            transform: 'translate(25%, 25%)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            minWidth: '14px',
            height: '12px',
          }}
        >
          {fileExtension.length > 4 ? fileExtension.slice(0, 3) : fileExtension}
        </div>
      )}
    </div>
  );
};
