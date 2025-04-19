import { Button } from '@/components/ui/button';
import {
  ArrowDownUp,
  Calendar,
  CheckCircle,
  CheckSquare,
  FileUp,
  Link,
  List,
  Mail,
  MessageSquare,
  Phone,
  Radio,
  Star,
  User2,
} from 'lucide-react';
import React from 'react';
import { useFormBuilder } from '../context/FormBuilderContext';

const ElementTypeMenu: React.FC = () => {
  const {
    showElementTypeMenu,
    elementTypeMenuPosition,
    setShowElementTypeMenu,
    addElement,
    addClientDetailsSection,
  } = useFormBuilder();

  if (!showElementTypeMenu) return null;

  return (
    <div
      className='fixed z-50 bg-white rounded-md shadow-md border border-gray-200 w-56 max-h-[400px] overflow-hidden'
      style={{ top: elementTypeMenuPosition.y, left: elementTypeMenuPosition.x }}
      onBlur={() => {
        return setShowElementTypeMenu(false);
      }}
      tabIndex={0}
    >
      <div className='p-3 font-medium text-sm text-gray-700 border-b border-gray-200'>
        Add Element
      </div>
      <div className='space-y-1 p-2'>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Text Block');
          }}
        >
          <MessageSquare className='h-4 w-4' />
          <span>Text Block</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Single Response');
          }}
        >
          <MessageSquare className='h-4 w-4 rotate-180' />
          <span>Single Response</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Long Answer');
          }}
        >
          <List className='h-4 w-4' />
          <span>Long Answer</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Short Answer');
          }}
        >
          <List className='h-4 w-4' />
          <span>Short Answer</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Phone Number');
          }}
        >
          <Phone className='h-4 w-4' />
          <span>Phone Number</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Email');
          }}
        >
          <Mail className='h-4 w-4' />
          <span>Email</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('URL');
          }}
        >
          <Link className='h-4 w-4' />
          <span>URL</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Number');
          }}
        >
          <ArrowDownUp className='h-4 w-4' />
          <span>Number</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Date');
          }}
        >
          <Calendar className='h-4 w-4' />
          <span>Date</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Rating');
          }}
        >
          <Star className='h-4 w-4' />
          <span>Rating</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Dropdown');
          }}
        >
          <CheckSquare className='h-4 w-4' />
          <span>Dropdown</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Radio Buttons');
          }}
        >
          <Radio className='h-4 w-4' />
          <span>Radio Buttons</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('Checkboxes');
          }}
        >
          <CheckCircle className='h-4 w-4' />
          <span>Checkboxes</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addElement('File Upload');
          }}
        >
          <FileUp className='h-4 w-4' />
          <span>File Upload</span>
        </Button>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3'
          onClick={() => {
            return addClientDetailsSection();
          }}
        >
          <User2 className='h-4 w-4' />
          <span>Client Details</span>
        </Button>
      </div>
    </div>
  );
};

export default ElementTypeMenu;
