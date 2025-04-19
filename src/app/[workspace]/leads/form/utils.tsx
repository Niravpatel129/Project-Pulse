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
import { FormElement } from './types';

// Generate a unique ID
export const generateId = () => {
  return `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Get icon for element type
export const getElementIcon = (type: string): React.ReactNode => {
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
    case 'Email':
      return <Mail className='h-4 w-4' />;
    case 'URL':
      return <Link className='h-4 w-4' />;
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

// Function to evaluate if an element should be shown based on its conditions
export const shouldShowElement = (
  element: FormElement,
  formElements: FormElement[],
  formValues: Record<string, any>,
  previewMode: boolean,
): boolean => {
  if (!previewMode) return true; // Always show in edit mode
  if (!element.conditions || element.conditions.length === 0) return true; // No conditions means always show

  const conditionResults = element.conditions.map((condition) => {
    const sourceElement = formElements.find((el) => {
      return el.id === condition.sourceElementId;
    });
    if (!sourceElement) return false;

    // Get the current value of the source element from form values
    const sourceValue = formValues[condition.sourceElementId];

    // If the source value is undefined or null, treat it as an empty string
    const actualSourceValue =
      sourceValue === undefined || sourceValue === null ? '' : String(sourceValue);

    switch (condition.operator) {
      case 'equals':
        return actualSourceValue === condition.value;
      case 'not_equals':
        return actualSourceValue !== condition.value;
      case 'contains':
        return actualSourceValue.includes(condition.value);
      case 'not_contains':
        return !actualSourceValue.includes(condition.value);
      case 'greater_than':
        return Number(actualSourceValue) > Number(condition.value);
      case 'less_than':
        return Number(actualSourceValue) < Number(condition.value);
      case 'is_empty':
        return actualSourceValue === '';
      case 'is_not_empty':
        return actualSourceValue !== '';
      case 'starts_with':
        return actualSourceValue.startsWith(condition.value);
      case 'ends_with':
        return actualSourceValue.endsWith(condition.value);
      default:
        return false;
    }
  });

  // Check if all conditions must be met or any condition
  return element.showWhen === 'all'
    ? conditionResults.every((result) => {
        return result;
      })
    : conditionResults.some((result) => {
        return result;
      });
};

// Get validation error message
export const getValidationErrorMessage = (element: FormElement, value: any): string | null => {
  if (!element.validation) return null;

  const { validation } = element;

  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `Minimum length is ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `Maximum length is ${validation.maxLength} characters`;
    }
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return "Input doesn't match the required format";
      }
    }
  }

  if (typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return `Minimum value is ${validation.min}`;
    }
    if (validation.max !== undefined && value > validation.max) {
      return `Maximum value is ${validation.max}`;
    }
  }

  return null;
};
