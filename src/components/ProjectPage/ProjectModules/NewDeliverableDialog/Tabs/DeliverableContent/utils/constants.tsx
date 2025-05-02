import {
  AlertCircle,
  Database,
  FileText,
  Link as LinkIcon,
  List,
  ListChecks,
  Paperclip,
  Type,
} from 'lucide-react';
import React from 'react';

// Define custom field types for dropdown menu
export const FIELD_TYPES = [
  { id: 'shortText', label: 'Short Text', icon: <Type className='mr-2' size={16} /> },
  { id: 'longText', label: 'Long Text', icon: <FileText className='mr-2' size={16} /> },
  { id: 'bulletList', label: 'Bullet List', icon: <List className='mr-2' size={16} /> },
  { id: 'numberList', label: 'Numbered List', icon: <ListChecks className='mr-2' size={16} /> },
  { id: 'link', label: 'Link', icon: <LinkIcon className='mr-2' size={16} /> },
  { id: 'attachment', label: 'Attachment', icon: <Paperclip className='mr-2' size={16} /> },
  { id: 'specification', label: 'Specification', icon: <AlertCircle className='mr-2' size={16} /> },
  { id: 'databaseItem', label: 'Database Item', icon: <Database className='mr-2' size={16} /> },
];
