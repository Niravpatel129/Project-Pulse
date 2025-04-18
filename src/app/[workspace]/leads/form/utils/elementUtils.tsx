import {
  ArrowDownUp,
  Calendar,
  CheckCircle,
  CheckSquare,
  FileUp,
  List,
  MessageSquare,
  Phone,
  Radio,
  Star,
  User2,
} from 'lucide-react';
import { ReactElement } from 'react';

// Get icon for element type
export const getElementIcon = (type: string): ReactElement => {
  switch (type) {
    case 'Text Block':
      return <MessageSquare className='h-4 w-4' />;
    case 'Single Response':
      return <MessageSquare className='h-4 w-4 rotate-180' />;
    case 'Dropdown':
      return <CheckSquare className='h-4 w-4' />;
    case 'Long Answer':
      return <List className='h-4 w-4' />;
    case 'Short Answer':
      return <List className='h-4 w-4' />;
    case 'Phone Number':
      return <Phone className='h-4 w-4' />;
    case 'Rating':
      return <Star className='h-4 w-4' />;
    case 'File Upload':
      return <FileUp className='h-4 w-4' />;
    case 'Radio Buttons':
      return <Radio className='h-4 w-4' />;
    case 'Checkboxes':
      return <CheckCircle className='h-4 w-4' />;
    case 'Date':
      return <Calendar className='h-4 w-4' />;
    case 'Number':
      return <ArrowDownUp className='h-4 w-4' />;
    case 'Client Details':
      return <User2 className='h-4 w-4' />;
    default:
      return <MessageSquare className='h-4 w-4' />;
  }
};

// Get condition operator display text
export const getOperatorText = (operator: string): string => {
  switch (operator) {
    case 'equals':
      return 'equals';
    case 'not_equals':
      return 'does not equal';
    case 'contains':
      return 'contains';
    case 'not_contains':
      return 'does not contain';
    case 'greater_than':
      return 'is greater than';
    case 'less_than':
      return 'is less than';
    case 'is_empty':
      return 'is empty';
    case 'is_not_empty':
      return 'is not empty';
    case 'starts_with':
      return 'starts with';
    case 'ends_with':
      return 'ends with';
    default:
      return operator;
  }
};

// Generate a unique ID for form elements
export const generateId = (): string => {
  return `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};
