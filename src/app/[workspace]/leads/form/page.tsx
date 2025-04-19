'use client';

import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ArrowDownUp,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Copy,
  Edit2,
  Eye,
  FileUp,
  HelpCircle,
  Home,
  Layout,
  List,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Radio,
  Save,
  Settings,
  Star,
  Trash2,
  User2,
  X,
} from 'lucide-react';
import { Mona_Sans as FontSans } from 'next/font/google';
import { useEffect, useState } from 'react';
import FormBuilderSidebar from './components/FormBuilderSidebar';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Define the condition type
type Condition = {
  id: string;
  sourceElementId: string; // Element that triggers the condition
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'is_empty'
    | 'is_not_empty'
    | 'starts_with'
    | 'ends_with';
  value: string; // Value to compare against
};

// Define the form element type
type FormElement = {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  section?: string;
  options?: string[]; // For radio buttons, checkboxes, dropdowns
  placeholder?: string;
  defaultValue?: string;
  conditions?: Condition[]; // Conditions that determine if this element is shown
  showWhen: 'all' | 'any'; // Whether all conditions must be met or any condition
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  clientFields?: {
    email: boolean;
    name: boolean;
    phone: boolean;
    address: boolean;
    company: boolean;
    custom: string[];
  };
};

// Define the form values type for preview mode
type FormValues = {
  [key: string]: string | string[] | boolean | number | null;
};

export default function FormBuilder() {
  const [formElements, setFormElements] = useState<FormElement[]>([]);
  const [changesSaved, setChangesSaved] = useState(true);
  const [activeTab, setActiveTab] = useState('elements');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<FormElement | null>(null);
  const [showConditionBuilder, setShowConditionBuilder] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null);
  const [showElementTypeMenu, setShowElementTypeMenu] = useState(false);
  const [elementTypeMenuPosition, setElementTypeMenuPosition] = useState({ x: 0, y: 0 });
  const [showValidationSettings, setShowValidationSettings] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Generate a unique ID
  const generateId = () => {
    return `element-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Load form elements from localStorage on initial load
  useEffect(() => {
    const savedElements = localStorage.getItem('formElements');
    if (savedElements) {
      try {
        setFormElements(JSON.parse(savedElements));
      } catch (e) {
        console.error('Failed to parse saved form elements', e);
      }
    }
  }, []);

  // Save form elements to localStorage when they change
  useEffect(() => {
    if (formElements.length > 0) {
      localStorage.setItem('formElements', JSON.stringify(formElements));
    }
  }, [formElements]);

  // Initialize form values for preview mode
  useEffect(() => {
    if (previewMode) {
      const initialValues: FormValues = {};
      formElements.forEach((element) => {
        if (element.defaultValue) {
          initialValues[element.id] = element.defaultValue;
        } else if (element.type === 'Checkboxes') {
          initialValues[element.id] = [];
        } else if (element.type === 'Rating') {
          initialValues[element.id] = 0;
        } else {
          initialValues[element.id] = '';
        }
      });
      setFormValues(initialValues);
    }
  }, [previewMode, formElements]);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => {
      return window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const addElement = (elementType: string) => {
    const newElement: FormElement = {
      id: generateId(),
      type: elementType,
      title: `New ${elementType}`,
      required: false,
      order: formElements.length,
      showWhen: 'all',
      options:
        elementType === 'Radio Buttons' ||
        elementType === 'Checkboxes' ||
        elementType === 'Dropdown'
          ? ['Option 1', 'Option 2', 'Option 3']
          : undefined,
    };

    setFormElements([...formElements, newElement]);
    setChangesSaved(false);
    // Switch to My Form tab after adding an element
    setActiveTab('myform');
    // Select the new element
    setSelectedElementId(newElement.id);
  };

  const addClientDetailsSection = () => {
    const newElement: FormElement = {
      id: generateId(),
      type: 'Client Details',
      title: 'Client Details',
      description: 'Collect client information',
      required: true, // Client details section is required
      order: formElements.length,
      showWhen: 'all',
      clientFields: {
        email: true, // Email is required by default
        name: false,
        phone: false,
        address: false,
        company: false,
        custom: [],
      },
    };

    setFormElements([...formElements, newElement]);
    setChangesSaved(false);
    // Switch to My Form tab after adding an element
    setActiveTab('myform');
    // Select the new element
    setSelectedElementId(newElement.id);
  };

  const saveChanges = () => {
    localStorage.setItem('formElements', JSON.stringify(formElements));
    setChangesSaved(true);
  };

  const selectElement = (id: string) => {
    setSelectedElementId(id);
    // Scroll to the element in the form canvas
    const element = document.getElementById(`form-element-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const deleteElement = (id: string) => {
    // First, remove any conditions that reference this element
    const updatedElements = formElements.map((element) => {
      if (element.conditions) {
        return {
          ...element,
          conditions: element.conditions.filter((condition) => {
            return condition.sourceElementId !== id;
          }),
        };
      }
      return element;
    });

    // Then remove the element itself
    setFormElements(
      updatedElements.filter((element) => {
        return element.id !== id;
      }),
    );
    setChangesSaved(false);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const openElementEditor = (element: FormElement) => {
    setEditingElement({ ...element });
  };

  const saveElementChanges = () => {
    if (!editingElement) return;

    const updatedElements = formElements.map((element) => {
      return element.id === editingElement.id ? editingElement : element;
    });
    setFormElements(updatedElements);
    setEditingElement(null);
    setChangesSaved(false);
    setShowValidationSettings(false);
  };

  const removeCondition = (elementId: string, conditionId: string) => {
    const updatedElements = formElements.map((element) => {
      if (element.id === elementId && element.conditions) {
        return {
          ...element,
          conditions: element.conditions.filter((condition) => {
            return condition.id !== conditionId;
          }),
        };
      }
      return element;
    });

    setFormElements(updatedElements);

    if (editingElement && editingElement.id === elementId) {
      setEditingElement({
        ...editingElement,
        conditions: editingElement.conditions?.filter((condition) => {
          return condition.id !== conditionId;
        }),
      });
    }

    setChangesSaved(false);
  };

  // Handle form value changes in preview mode
  const handleFormValueChange = (
    elementId: string,
    value: string | string[] | boolean | number,
  ) => {
    setFormValues({
      ...formValues,
      [elementId]: value,
    });
  };

  // Function to evaluate if an element should be shown based on its conditions
  const shouldShowElement = (element: FormElement): boolean => {
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

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setIsDragging(true);
    setDraggedElementId(elementId);
    e.dataTransfer.setData('text/plain', elementId);
    // Use a custom drag image (optional)
    const element = formElements.find((el) => {
      return el.id === elementId;
    });
    if (element) {
      const dragImage = document.createElement('div');
      dragImage.className = 'bg-white border rounded-md p-2 shadow-md';
      dragImage.textContent = element.title;
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    if (draggedElementId === elementId) return;
    setDragOverElementId(elementId);
  };

  const handleDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault();
    if (!draggedElementId || draggedElementId === targetElementId) {
      setIsDragging(false);
      setDraggedElementId(null);
      setDragOverElementId(null);
      return;
    }

    const sourceIndex = formElements.findIndex((el) => {
      return el.id === draggedElementId;
    });
    const targetIndex = formElements.findIndex((el) => {
      return el.id === targetElementId;
    });

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newElements = [...formElements];
    const [movedElement] = newElements.splice(sourceIndex, 1);
    newElements.splice(targetIndex, 0, movedElement);

    // Update order property
    newElements.forEach((element, idx) => {
      element.order = idx;
    });

    setFormElements(newElements);
    setChangesSaved(false);
    setIsDragging(false);
    setDraggedElementId(null);
    setDragOverElementId(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedElementId(null);
    setDragOverElementId(null);
  };

  // Show element type menu at cursor position
  const showElementMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Ensure the menu doesn't overflow the viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 224; // Width of the menu (56 * 4)
    const menuHeight = 400; // Approximate max height of the menu

    let x = e.clientX;
    let y = e.clientY;

    // Adjust position if it would overflow right edge
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }

    // Adjust position if it would overflow bottom edge
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }

    setElementTypeMenuPosition({ x, y });
    setShowElementTypeMenu(true);
  };

  // Get icon for element type
  const getElementIcon = (type: string) => {
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
  const getOperatorText = (operator: string): string => {
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

  // Duplicate an element
  const duplicateElement = (elementId: string) => {
    const elementToDuplicate = formElements.find((el) => {
      return el.id === elementId;
    });
    if (!elementToDuplicate) return;

    const newElement = {
      ...elementToDuplicate,
      id: generateId(),
      title: `${elementToDuplicate.title} (Copy)`,
      order: formElements.length,
      // Don't copy conditions to avoid circular references
      conditions: undefined,
    };

    setFormElements([...formElements, newElement]);
    setChangesSaved(false);
  };

  // Get validation error message
  const getValidationErrorMessage = (element: FormElement, value: any): string | null => {
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

  return (
    <div
      className={`flex flex-col h-screen ${fontSans.variable} font-sans bg-gradient-to-b from-gray-50 to-white overflow-hidden`}
    >
      {/* Header */}
      <header className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm w-full'>
        <div className='flex items-center px-4 md:px-6 h-14 md:h-16'>
          <Button
            variant='ghost'
            size='icon'
            className='mr-2 md:mr-3 text-gray-500 hover:text-gray-700'
            onClick={() => {
              return isMobile ? setShowMobileMenu(!showMobileMenu) : null;
            }}
          >
            {isMobile ? <Menu className='h-5 w-5' /> : <ArrowLeft className='h-5 w-5' />}
          </Button>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-gray-800 text-base md:text-lg tracking-tight'>
                Form Builder
              </span>
              <span className='text-gray-400 hidden sm:inline'>/</span>
              <span className='text-gray-600 text-sm hidden sm:inline'>College Intake Form</span>
            </div>
          </div>
          <div className='ml-auto flex items-center gap-2 md:gap-3'>
            <Button
              variant={previewMode ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                return setPreviewMode(!previewMode);
              }}
              className='gap-1 md:gap-2 rounded-full px-2 md:px-4 text-xs'
            >
              {previewMode ? (
                <Edit2 className='h-3 w-3 md:h-4 md:w-4' />
              ) : (
                <Eye className='h-3 w-3 md:h-4 md:w-4' />
              )}
              <span className='hidden sm:inline'>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full text-gray-500 hover:text-gray-700 hidden md:flex'
            >
              <Settings className='h-5 w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full text-gray-500 hover:text-gray-700 hidden md:flex'
            >
              <HelpCircle className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && isMobile && (
        <div
          className='fixed inset-0 bg-black/50 z-50'
          onClick={() => {
            return setShowMobileMenu(false);
          }}
        >
          <div
            className='absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg p-4'
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            <div className='flex items-center justify-between mb-6'>
              <h2 className='font-medium text-xl'>Form Builder</h2>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  return setShowMobileMenu(false);
                }}
              >
                <X className='h-5 w-5' />
              </Button>
            </div>
            <div className='space-y-6'>
              <div>
                <h3 className='text-sm font-medium text-gray-500 mb-3'>ACTIONS</h3>
                <div className='space-y-2'>
                  <Button variant='ghost' className='w-full justify-start text-base'>
                    <Home className='h-5 w-5 mr-3' />
                    Dashboard
                  </Button>
                  <Button variant='ghost' className='w-full justify-start text-base'>
                    <Layout className='h-5 w-5 mr-3' />
                    Forms
                  </Button>
                  <Button variant='ghost' className='w-full justify-start text-base'>
                    <Settings className='h-5 w-5 mr-3' />
                    Settings
                  </Button>
                </div>
              </div>
              <div>
                <h3 className='text-sm font-medium text-gray-500 mb-3'>CURRENT FORM</h3>
                <Button
                  variant={!previewMode ? 'default' : 'outline'}
                  className='w-full justify-start text-base mb-2'
                  onClick={() => {
                    setPreviewMode(false);
                    setShowMobileMenu(false);
                  }}
                >
                  <Edit2 className='h-5 w-5 mr-3' />
                  Edit Form
                </Button>
                <Button
                  variant={previewMode ? 'default' : 'outline'}
                  className='w-full justify-start text-base'
                  onClick={() => {
                    setPreviewMode(true);
                    setShowMobileMenu(false);
                  }}
                >
                  <Eye className='h-5 w-5 mr-3' />
                  Preview Form
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <FormBuilderSidebar
          formElements={formElements}
          setFormElements={setFormElements}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          setEditingElement={setEditingElement}
          setChangesSaved={setChangesSaved}
          previewMode={previewMode}
          isMobile={isMobile}
          showMobileNav={showMobileNav}
          setShowMobileNav={setShowMobileNav}
          isDragging={isDragging}
          draggedElementId={draggedElementId}
          dragOverElementId={dragOverElementId}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleDragEnd={handleDragEnd}
          getElementIcon={getElementIcon}
          generateId={generateId}
        />

        {/* Form Canvas */}
        <div
          className={cn(
            'flex-1 overflow-y-auto p-4 md:p-8 bg-white pb-24',
            previewMode ? 'w-full' : '',
            isMobile && !previewMode ? 'pb-20' : '', // Add padding at bottom for mobile nav
          )}
          onContextMenu={!previewMode && !isMobile ? showElementMenu : undefined}
          onClick={() => {
            return isMobile && showMobileNav ? setShowMobileNav(false) : null;
          }}
        >
          {previewMode && (
            <div className='mb-6 p-4 bg-blue-50/70 text-blue-700 rounded-xl flex items-center justify-between shadow-sm'>
              <div className='flex items-center gap-2'>
                <Eye className='h-5 w-5' />
                <span className='font-medium'>
                  Preview Mode: See how your form will appear to users
                </span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return setPreviewMode(false);
                }}
                className='rounded-full'
              >
                Exit Preview
              </Button>
            </div>
          )}

          {!previewMode &&
            formElements.length > 0 &&
            !formElements.some((el) => {
              return el.type === 'Client Details';
            }) && (
              <div className='mb-6 p-4 bg-amber-50/70 text-amber-700 rounded-xl flex items-center justify-between shadow-sm'>
                <div className='flex items-center gap-2'>
                  <AlertCircle className='h-5 w-5' />
                  <span className='font-medium'>
                    Missing Client Details: Add a Client Details section to collect required client
                    information
                  </span>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    return addClientDetailsSection();
                  }}
                  className='rounded-full'
                >
                  Add Client Details
                </Button>
              </div>
            )}

          {formElements.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full'>
              <div className='rounded-full bg-gray-100 p-3 md:p-4 mb-3 md:mb-5 shadow-sm'>
                <HelpCircle className='h-5 w-5 md:h-7 md:w-7 text-gray-400' />
              </div>
              <h3 className='text-lg md:text-xl font-medium mb-2 md:mb-3 text-gray-800 text-center px-4'>
                Get started with these Form Fields
              </h3>
              <p className='text-gray-500 mb-6 md:mb-10 text-sm md:text-base text-center px-4'>
                Or right-click anywhere to add elements
              </p>

              <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-5 max-w-3xl px-2 md:px-0'>
                <Button
                  variant='outline'
                  className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
                  onClick={() => {
                    return addElement('Text Block');
                  }}
                >
                  <MessageSquare className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
                  <span className='font-normal text-xs md:text-sm'>Add Text Block</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
                  onClick={() => {
                    return addElement('Single Response');
                  }}
                >
                  <MessageSquare className='h-5 w-5 md:h-7 md:w-7 rotate-180 text-gray-500' />
                  <span className='font-normal text-xs md:text-sm'>Add Single Response</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
                  onClick={() => {
                    return addElement('Rating');
                  }}
                >
                  <Star className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
                  <span className='font-normal text-xs md:text-sm'>Add Rating</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
                  onClick={() => {
                    return addElement('Phone Number');
                  }}
                >
                  <Phone className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
                  <span className='font-normal text-xs md:text-sm'>Add Phone Number</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
                  onClick={() => {
                    return addElement('Radio Buttons');
                  }}
                >
                  <Radio className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
                  <span className='font-normal text-xs md:text-sm'>Add Radio Buttons</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
                  onClick={() => {
                    return addElement('File Upload');
                  }}
                >
                  <FileUp className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
                  <span className='font-normal text-xs md:text-sm'>Add File Upload</span>
                </Button>
                <Button
                  variant='outline'
                  className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4 sm:col-span-2 lg:col-span-1'
                  onClick={() => {
                    return addClientDetailsSection();
                  }}
                >
                  <User2 className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
                  <span className='font-normal text-xs md:text-sm'>Add Client Details</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {formElements.map((element) => {
                // Check if element should be shown based on conditions
                if (!shouldShowElement(element)) return null;

                // Get validation error if any
                const validationError =
                  previewMode && formValues[element.id]
                    ? getValidationErrorMessage(element, formValues[element.id])
                    : null;

                return (
                  <div
                    id={`form-element-${element.id}`}
                    key={element.id}
                    className={cn(
                      'border rounded-xl p-3 md:p-5 transition-all duration-200 hover:shadow-md overflow-hidden',
                      selectedElementId === element.id && !previewMode
                        ? 'border-2 border-gray-400 shadow-md'
                        : '',
                      element.conditions && element.conditions.length > 0 && !previewMode
                        ? 'border-blue-200 bg-blue-50/30'
                        : '',
                      validationError ? 'border-red-300 bg-red-50/30' : '',
                    )}
                    onClick={() => {
                      return !previewMode && selectElement(element.id);
                    }}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center gap-2 overflow-hidden'>
                        {getElementIcon(element.type)}
                        <span className='text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-[200px]'>
                          {element.title}
                        </span>
                        {element.required && <span className='text-red-500 flex-shrink-0'>*</span>}

                        {/* Conditional indicator (only in edit mode) */}
                        {element.conditions && element.conditions.length > 0 && !previewMode && (
                          <Badge
                            variant='outline'
                            className='ml-1 text-xs bg-blue-50 text-blue-600 border-blue-200 hidden sm:inline-flex'
                          >
                            Conditional
                          </Badge>
                        )}
                      </div>
                      {!previewMode && (
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            onClick={(e) => {
                              e.stopPropagation();
                              openElementEditor(element);
                            }}
                          >
                            <Edit2 className='h-4 w-4' />
                          </Button>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant='ghost' size='icon' className='h-7 w-7'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-56' align='end'>
                              <div className='grid gap-1'>
                                <Button
                                  variant='ghost'
                                  className='justify-start text-sm'
                                  onClick={() => {
                                    return duplicateElement(element.id);
                                  }}
                                >
                                  <Copy className='h-4 w-4 mr-2' />
                                  Duplicate
                                </Button>
                                <Button
                                  variant='ghost'
                                  className='justify-start text-sm'
                                  onClick={() => {
                                    console.log('add condition');
                                  }}
                                >
                                  <Eye className='h-4 w-4 mr-2' />
                                  Add Condition
                                </Button>
                                <Button
                                  variant='ghost'
                                  className='justify-start text-sm text-red-500 hover:text-red-600 hover:bg-red-50'
                                  onClick={() => {
                                    return deleteElement(element.id);
                                  }}
                                >
                                  <Trash2 className='h-4 w-4 mr-2' />
                                  Delete
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div>

                    {/* Element description */}
                    {element.description && (
                      <div className='text-xs md:text-sm text-gray-500 mb-2'>
                        {element.description}
                      </div>
                    )}

                    {/* Render different form elements based on type */}
                    {element.type === 'Text Block' && (
                      <div className='text-gray-600'>
                        This is a text block. You can add instructions or information here.
                      </div>
                    )}

                    {element.type === 'Single Response' && (
                      <Input
                        placeholder={element.placeholder || 'Enter your answer'}
                        className='mt-2'
                        value={previewMode ? (formValues[element.id] as string) || '' : ''}
                        onChange={(e) => {
                          return previewMode && handleFormValueChange(element.id, e.target.value);
                        }}
                      />
                    )}

                    {element.type === 'Long Answer' && (
                      <Textarea
                        className='w-full mt-2 min-h-[100px]'
                        placeholder={element.placeholder || 'Enter your answer'}
                        value={previewMode ? (formValues[element.id] as string) || '' : ''}
                        onChange={(e) => {
                          return previewMode && handleFormValueChange(element.id, e.target.value);
                        }}
                      />
                    )}

                    {element.type === 'Short Answer' && (
                      <Input
                        placeholder={element.placeholder || 'Enter your answer'}
                        className='mt-2'
                        value={previewMode ? (formValues[element.id] as string) || '' : ''}
                        onChange={(e) => {
                          return previewMode && handleFormValueChange(element.id, e.target.value);
                        }}
                      />
                    )}

                    {element.type === 'Phone Number' && (
                      <Input
                        placeholder={element.placeholder || 'Enter phone number'}
                        className='mt-2'
                        value={previewMode ? (formValues[element.id] as string) || '' : ''}
                        onChange={(e) => {
                          return previewMode && handleFormValueChange(element.id, e.target.value);
                        }}
                      />
                    )}

                    {element.type === 'Number' && (
                      <Input
                        type='number'
                        placeholder={element.placeholder || 'Enter a number'}
                        className='mt-2'
                        value={previewMode ? (formValues[element.id] as string) || '' : ''}
                        onChange={(e) => {
                          return previewMode && handleFormValueChange(element.id, e.target.value);
                        }}
                      />
                    )}

                    {element.type === 'Date' && (
                      <Input
                        type='date'
                        className='mt-2'
                        value={previewMode ? (formValues[element.id] as string) || '' : ''}
                        onChange={(e) => {
                          return previewMode && handleFormValueChange(element.id, e.target.value);
                        }}
                      />
                    )}

                    {element.type === 'Rating' && (
                      <div className='flex gap-2 mt-2'>
                        {[1, 2, 3, 4, 5].map((rating) => {
                          return (
                            <Button
                              key={rating}
                              variant={
                                previewMode && formValues[element.id] === rating
                                  ? 'default'
                                  : 'outline'
                              }
                              size='icon'
                              className='h-10 w-10'
                              onClick={() => {
                                return previewMode && handleFormValueChange(element.id, rating);
                              }}
                            >
                              {rating}
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    {element.type === 'Dropdown' && (
                      <select
                        className='w-full mt-2 p-2 border rounded-md'
                        value={previewMode ? (formValues[element.id] as string) || '' : ''}
                        onChange={(e) => {
                          return previewMode && handleFormValueChange(element.id, e.target.value);
                        }}
                      >
                        <option value='' disabled>
                          Select an option
                        </option>
                        {element.options?.map((option, i) => {
                          return (
                            <option key={i} value={option}>
                              {option}
                            </option>
                          );
                        })}
                      </select>
                    )}

                    {element.type === 'Radio Buttons' && (
                      <RadioGroup
                        className='mt-2 space-y-2'
                        value={previewMode ? (formValues[element.id] as string) || '' : ''}
                        onValueChange={(value) => {
                          return previewMode && handleFormValueChange(element.id, value);
                        }}
                      >
                        {element.options?.map((option, i) => {
                          return (
                            <div key={i} className='flex items-center space-x-2'>
                              <RadioGroupItem value={option} id={`radio-${element.id}-${i}`} />
                              <Label htmlFor={`radio-${element.id}-${i}`}>{option}</Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}

                    {element.type === 'Checkboxes' && (
                      <div className='mt-2 space-y-2'>
                        {element.options?.map((option, i) => {
                          return (
                            <div key={i} className='flex items-center space-x-2'>
                              <Checkbox
                                id={`checkbox-${element.id}-${i}`}
                                checked={
                                  previewMode
                                    ? (formValues[element.id] as string[])?.includes(option)
                                    : false
                                }
                                onCheckedChange={(checked) => {
                                  if (!previewMode) return;
                                  const currentValues = (formValues[element.id] as string[]) || [];
                                  if (checked) {
                                    handleFormValueChange(element.id, [...currentValues, option]);
                                  } else {
                                    handleFormValueChange(
                                      element.id,
                                      currentValues.filter((val) => {
                                        return val !== option;
                                      }),
                                    );
                                  }
                                }}
                              />
                              <Label htmlFor={`checkbox-${element.id}-${i}`}>{option}</Label>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {element.type === 'File Upload' && (
                      <div className='mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 text-center'>
                        <FileUp className='h-8 w-8 mx-auto text-gray-400 mb-2' />
                        <p className='text-sm text-gray-500'>
                          Drag and drop files here or click to browse
                        </p>
                        <Button variant='outline' className='mt-2'>
                          Browse Files
                        </Button>
                      </div>
                    )}

                    {element.type === 'Client Details' && (
                      <div className='mt-2 space-y-4 border rounded-lg p-4 bg-gray-50/50'>
                        <div className='flex items-center justify-between border-b pb-2'>
                          <span className='font-medium text-gray-700'>Client Information</span>
                          {!previewMode && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                return openElementEditor(element);
                              }}
                              className='text-xs'
                            >
                              <Settings className='h-3 w-3 mr-1' />
                              Configure Fields
                            </Button>
                          )}
                        </div>

                        <div className='grid gap-3 md:grid-cols-2'>
                          {element.clientFields?.email && (
                            <div className='space-y-1'>
                              <Label
                                htmlFor={`client-email-${element.id}`}
                                className='flex items-center'
                              >
                                Email <span className='text-red-500 ml-1'>*</span>
                                {!previewMode && (
                                  <Badge className='ml-2 text-xs bg-blue-100 text-blue-700 border-blue-200'>
                                    Required
                                  </Badge>
                                )}
                              </Label>
                              <Input
                                id={`client-email-${element.id}`}
                                type='email'
                                placeholder='client@example.com'
                                value={
                                  previewMode
                                    ? (formValues[`${element.id}-email`] as string) || ''
                                    : ''
                                }
                                onChange={(e) => {
                                  return (
                                    previewMode &&
                                    handleFormValueChange(`${element.id}-email`, e.target.value)
                                  );
                                }}
                                required
                              />
                            </div>
                          )}

                          {element.clientFields?.name && (
                            <div className='space-y-1'>
                              <Label htmlFor={`client-name-${element.id}`}>Full Name</Label>
                              <Input
                                id={`client-name-${element.id}`}
                                placeholder='John Doe'
                                value={
                                  previewMode
                                    ? (formValues[`${element.id}-name`] as string) || ''
                                    : ''
                                }
                                onChange={(e) => {
                                  return (
                                    previewMode &&
                                    handleFormValueChange(`${element.id}-name`, e.target.value)
                                  );
                                }}
                              />
                            </div>
                          )}

                          {element.clientFields?.phone && (
                            <div className='space-y-1'>
                              <Label htmlFor={`client-phone-${element.id}`}>Phone Number</Label>
                              <Input
                                id={`client-phone-${element.id}`}
                                placeholder='(123) 456-7890'
                                value={
                                  previewMode
                                    ? (formValues[`${element.id}-phone`] as string) || ''
                                    : ''
                                }
                                onChange={(e) => {
                                  return (
                                    previewMode &&
                                    handleFormValueChange(`${element.id}-phone`, e.target.value)
                                  );
                                }}
                              />
                            </div>
                          )}

                          {element.clientFields?.company && (
                            <div className='space-y-1'>
                              <Label htmlFor={`client-company-${element.id}`}>Company</Label>
                              <Input
                                id={`client-company-${element.id}`}
                                placeholder='Acme Inc.'
                                value={
                                  previewMode
                                    ? (formValues[`${element.id}-company`] as string) || ''
                                    : ''
                                }
                                onChange={(e) => {
                                  return (
                                    previewMode &&
                                    handleFormValueChange(`${element.id}-company`, e.target.value)
                                  );
                                }}
                              />
                            </div>
                          )}

                          {element.clientFields?.address && (
                            <div className='space-y-1 md:col-span-2'>
                              <Label htmlFor={`client-address-${element.id}`}>Address</Label>
                              <Textarea
                                id={`client-address-${element.id}`}
                                placeholder='123 Main St, City, State, ZIP'
                                value={
                                  previewMode
                                    ? (formValues[`${element.id}-address`] as string) || ''
                                    : ''
                                }
                                onChange={(e) => {
                                  return (
                                    previewMode &&
                                    handleFormValueChange(`${element.id}-address`, e.target.value)
                                  );
                                }}
                              />
                            </div>
                          )}

                          {element.clientFields?.custom &&
                            element.clientFields.custom.map((field, index) => {
                              return (
                                <div key={index} className='space-y-1'>
                                  <Label htmlFor={`client-custom-${element.id}-${index}`}>
                                    {field}
                                  </Label>
                                  <Input
                                    id={`client-custom-${element.id}-${index}`}
                                    placeholder={`Enter ${field.toLowerCase()}`}
                                    value={
                                      previewMode
                                        ? (formValues[`${element.id}-custom-${index}`] as string) ||
                                          ''
                                        : ''
                                    }
                                    onChange={(e) => {
                                      return (
                                        previewMode &&
                                        handleFormValueChange(
                                          `${element.id}-custom-${index}`,
                                          e.target.value,
                                        )
                                      );
                                    }}
                                  />
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Validation error message */}
                    {validationError && (
                      <div className='mt-2 text-sm text-red-500 flex items-center gap-1'>
                        <AlertCircle className='h-4 w-4' />
                        {validationError}
                      </div>
                    )}

                    {/* Conditional logic indicator (only in edit mode) */}
                    {!previewMode && element.conditions && element.conditions.length > 0 && (
                      <div className='mt-3 pt-3 border-t border-blue-200'>
                        <div className='flex items-center gap-2 text-sm text-blue-600'>
                          <Eye className='h-4 w-4' />
                          <span>This element is shown conditionally</span>
                        </div>
                        <div className='mt-1 text-xs text-gray-500'>
                          {element.showWhen === 'all' ? 'All' : 'Any'} of these conditions must be
                          met:
                        </div>
                        <div className='mt-2 space-y-2'>
                          {element.conditions.map((condition) => {
                            const sourceElement = formElements.find((el) => {
                              return el.id === condition.sourceElementId;
                            });
                            return (
                              <div
                                key={condition.id}
                                className='text-xs bg-gray-50 p-2 rounded flex items-center justify-between'
                              >
                                <span>
                                  <span className='font-medium'>
                                    {sourceElement?.title || 'Unknown element'}
                                  </span>{' '}
                                  {getOperatorText(condition.operator)}{' '}
                                  {condition.operator !== 'is_empty' &&
                                    condition.operator !== 'is_not_empty' && (
                                      <span className='font-medium'>
                                        {condition.value || '(empty)'}
                                      </span>
                                    )}
                                </span>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-6 w-6 text-gray-400 hover:text-red-500'
                                  onClick={() => {
                                    return removeCondition(element.id, condition.id);
                                  }}
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          className='mt-2 text-xs'
                          onClick={() => {
                            openElementEditor(element);
                            setShowConditionBuilder(true);
                          }}
                        >
                          <Edit2 className='h-3 w-3 mr-1' />
                          Edit Conditions
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      {isMobile && !previewMode && (
        <div className='fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around px-2 z-30 shadow-md'>
          <Button
            variant={showMobileNav && activeTab === 'elements' ? 'default' : 'ghost'}
            size='icon'
            className='flex flex-col items-center gap-1 h-auto py-1 w-16'
            onClick={() => {
              setShowMobileNav(true);
              setActiveTab('elements');
            }}
          >
            <Plus className='h-5 w-5' />
            <span className='text-xs'>Elements</span>
          </Button>
          <Button
            variant={showMobileNav && activeTab === 'myform' ? 'default' : 'ghost'}
            size='icon'
            className='flex flex-col items-center gap-1 h-auto py-1 w-16'
            onClick={() => {
              setShowMobileNav(true);
              setActiveTab('myform');
            }}
          >
            <Layout className='h-5 w-5' />
            <span className='text-xs'>Form</span>
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='flex flex-col items-center gap-1 h-auto py-1 w-16'
            onClick={() => {
              return setPreviewMode(true);
            }}
          >
            <Eye className='h-5 w-5' />
            <span className='text-xs'>Preview</span>
          </Button>
          <Button
            variant={changesSaved ? 'ghost' : 'default'}
            size='icon'
            className='flex flex-col items-center gap-1 h-auto py-1 w-16'
            onClick={saveChanges}
            disabled={changesSaved}
          >
            <Save className='h-5 w-5' />
            <span className='text-xs'>Save</span>
          </Button>
        </div>
      )}

      {/* Footer (desktop only) */}
      {!isMobile && (
        <footer
          className={cn(
            'border-t p-2 md:p-4 flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-sm w-full bg-white shadow-md',
            changesSaved ? 'bg-gray-50/90' : 'bg-white/90',
          )}
        >
          <div className='flex items-center gap-2'>
            {changesSaved ? (
              <>
                <div className='h-5 md:h-6 w-5 md:w-6 rounded-full bg-green-100 flex items-center justify-center shadow-sm'>
                  <svg
                    width='12'
                    height='12'
                    viewBox='0 0 15 15'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z'
                      fill='currentColor'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      className='text-green-600'
                    ></path>
                  </svg>
                </div>
                <span className='text-xs md:text-sm text-gray-500 hidden sm:inline'>
                  Changes saved
                </span>
              </>
            ) : (
              <span className='text-xs md:text-sm text-amber-600 font-medium'>Unsaved changes</span>
            )}
          </div>
          <div className='flex gap-2 md:gap-3'>
            {previewMode && (
              <Button
                variant='outline'
                onClick={() => {
                  return setPreviewMode(false);
                }}
                className='rounded-full text-xs px-2 md:px-4 md:text-sm'
              >
                Exit Preview
              </Button>
            )}
            <Button
              className={cn(
                'rounded-full text-xs px-2 md:px-4 md:text-sm',
                changesSaved
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-green-600 hover:bg-green-700 text-white',
              )}
              onClick={saveChanges}
              disabled={changesSaved}
            >
              <Save className='h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2' />
              <span className='hidden sm:inline'>Save Changes</span>
              <span className='sm:hidden'>Save</span>
            </Button>
          </div>
        </footer>
      )}

      {/* Element Editor Dialog - Make more mobile friendly */}
      {editingElement && (
        <Dialog
          open={!!editingElement}
          onOpenChange={(open) => {
            return !open && setEditingElement(null);
          }}
        >
          <DialogContent
            className={cn(
              'w-[95vw] max-w-[600px] rounded-xl max-h-[90vh] overflow-y-auto',
              isMobile ? 'p-4' : '',
            )}
          >
            <DialogHeader>
              <DialogTitle
                className={cn('text-xl font-medium tracking-tight', isMobile ? 'text-lg' : '')}
              >
                Edit {editingElement.type}
              </DialogTitle>
            </DialogHeader>

            <div className='grid gap-4 py-2 md:py-4'>
              <div
                className={cn('grid items-center gap-3', isMobile ? 'grid-cols-1' : 'grid-cols-4')}
              >
                <Label htmlFor='title' className={isMobile ? '' : 'text-right'}>
                  Title
                </Label>
                <Input
                  id='title'
                  value={editingElement.title}
                  onChange={(e) => {
                    return setEditingElement({ ...editingElement, title: e.target.value });
                  }}
                  className={isMobile ? 'col-span-1' : 'col-span-3'}
                />
              </div>

              <div className='grid grid-cols-4 items-start gap-4'>
                <Label htmlFor='description' className='text-right mt-2'>
                  Description
                </Label>
                <Textarea
                  id='description'
                  value={editingElement.description || ''}
                  onChange={(e) => {
                    return setEditingElement({ ...editingElement, description: e.target.value });
                  }}
                  className='col-span-3'
                  placeholder='Optional description or instructions'
                />
              </div>

              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='required' className='text-right'>
                  Required
                </Label>
                <div className='col-span-3 flex items-center space-x-2'>
                  <Switch
                    id='required'
                    checked={editingElement.required}
                    onCheckedChange={(checked) => {
                      return setEditingElement({ ...editingElement, required: checked });
                    }}
                  />
                  <Label htmlFor='required'>Make this field required</Label>
                </div>
              </div>

              {(editingElement.type === 'Single Response' ||
                editingElement.type === 'Short Answer' ||
                editingElement.type === 'Long Answer' ||
                editingElement.type === 'Phone Number' ||
                editingElement.type === 'Number') && (
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='placeholder' className='text-right'>
                    Placeholder
                  </Label>
                  <Input
                    id='placeholder'
                    value={editingElement.placeholder || ''}
                    onChange={(e) => {
                      return setEditingElement({ ...editingElement, placeholder: e.target.value });
                    }}
                    className='col-span-3'
                    placeholder='Enter placeholder text'
                  />
                </div>
              )}

              {(editingElement.type === 'Radio Buttons' ||
                editingElement.type === 'Checkboxes' ||
                editingElement.type === 'Dropdown') && (
                <div className='grid grid-cols-4 items-start gap-4'>
                  <Label className='text-right mt-2'>Options</Label>
                  <div className='col-span-3 space-y-2 max-h-[200px] overflow-y-auto pr-1'>
                    {editingElement.options?.map((option, index) => {
                      return (
                        <div key={index} className='flex items-center gap-2'>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(editingElement.options || [])];
                              newOptions[index] = e.target.value;
                              setEditingElement({ ...editingElement, options: newOptions });
                            }}
                          />
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              const newOptions = [...(editingElement.options || [])];
                              newOptions.splice(index, 1);
                              setEditingElement({ ...editingElement, options: newOptions });
                            }}
                            disabled={editingElement.options?.length === 1}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      variant='outline'
                      size='sm'
                      className='mt-2'
                      onClick={() => {
                        const newOptions = [
                          ...(editingElement.options || []),
                          `Option ${(editingElement.options?.length || 0) + 1}`,
                        ];
                        setEditingElement({ ...editingElement, options: newOptions });
                      }}
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {/* Validation Settings Button */}
              {(editingElement.type === 'Single Response' ||
                editingElement.type === 'Short Answer' ||
                editingElement.type === 'Long Answer' ||
                editingElement.type === 'Phone Number' ||
                editingElement.type === 'Number') && (
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label className='text-right'>Validation</Label>
                  <div className='col-span-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        return setShowValidationSettings(!showValidationSettings);
                      }}
                      className='flex items-center gap-2'
                    >
                      {showValidationSettings
                        ? 'Hide Validation Settings'
                        : 'Show Validation Settings'}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          showValidationSettings ? 'rotate-180' : '',
                        )}
                      />
                    </Button>
                  </div>
                </div>
              )}

              {/* Validation Settings Panel */}
              {showValidationSettings && editingElement && (
                <div className='grid grid-cols-4 items-start gap-4 pl-4 pt-2 pb-2 bg-gray-50 rounded-md border border-gray-200 max-h-[300px] overflow-y-auto'>
                  <div className='col-span-4 mb-2'>
                    <h4 className='font-medium text-sm'>Validation Rules</h4>
                    <p className='text-xs text-gray-500 mt-1'>Set rules to validate user input</p>
                  </div>

                  {(editingElement.type === 'Single Response' ||
                    editingElement.type === 'Short Answer' ||
                    editingElement.type === 'Long Answer') && (
                    <>
                      <Label htmlFor='minLength' className='text-right col-span-1'>
                        Min Length
                      </Label>
                      <Input
                        id='minLength'
                        type='number'
                        min='0'
                        value={editingElement.validation?.minLength || ''}
                        onChange={(e) => {
                          return setEditingElement({
                            ...editingElement,
                            validation: {
                              ...editingElement.validation,
                              minLength: e.target.value
                                ? Number.parseInt(e.target.value)
                                : undefined,
                            },
                          });
                        }}
                        className='col-span-3'
                        placeholder='Minimum characters'
                      />

                      <Label htmlFor='maxLength' className='text-right col-span-1'>
                        Max Length
                      </Label>
                      <Input
                        id='maxLength'
                        type='number'
                        min='0'
                        value={editingElement.validation?.maxLength || ''}
                        onChange={(e) => {
                          return setEditingElement({
                            ...editingElement,
                            validation: {
                              ...editingElement.validation,
                              maxLength: e.target.value
                                ? Number.parseInt(e.target.value)
                                : undefined,
                            },
                          });
                        }}
                        className='col-span-3'
                        placeholder='Maximum characters'
                      />
                    </>
                  )}

                  {editingElement.type === 'Number' && (
                    <>
                      <Label htmlFor='min' className='text-right col-span-1'>
                        Min Value
                      </Label>
                      <Input
                        id='min'
                        type='number'
                        value={editingElement.validation?.min || ''}
                        onChange={(e) => {
                          return setEditingElement({
                            ...editingElement,
                            validation: {
                              ...editingElement.validation,
                              min: e.target.value ? Number.parseInt(e.target.value) : undefined,
                            },
                          });
                        }}
                        className='col-span-3'
                        placeholder='Minimum value'
                      />

                      <Label htmlFor='max' className='text-right col-span-1'>
                        Max Value
                      </Label>
                      <Input
                        id='max'
                        type='number'
                        value={editingElement.validation?.max || ''}
                        onChange={(e) => {
                          return setEditingElement({
                            ...editingElement,
                            validation: {
                              ...editingElement.validation,
                              max: e.target.value ? Number.parseInt(e.target.value) : undefined,
                            },
                          });
                        }}
                        className='col-span-3'
                        placeholder='Maximum value'
                      />
                    </>
                  )}

                  {(editingElement.type === 'Single Response' ||
                    editingElement.type === 'Short Answer' ||
                    editingElement.type === 'Phone Number') && (
                    <>
                      <Label htmlFor='pattern' className='text-right col-span-1'>
                        Pattern
                      </Label>
                      <div className='col-span-3 space-y-2'>
                        <Input
                          id='pattern'
                          value={editingElement.validation?.pattern || ''}
                          onChange={(e) => {
                            return setEditingElement({
                              ...editingElement,
                              validation: {
                                ...editingElement.validation,
                                pattern: e.target.value || undefined,
                              },
                            });
                          }}
                          placeholder='Regular expression pattern'
                        />
                        <div className='text-xs text-gray-500'>
                          {editingElement.type === 'Phone Number' && (
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-xs h-6 px-2'
                              onClick={() => {
                                return setEditingElement({
                                  ...editingElement,
                                  validation: {
                                    ...editingElement.validation,
                                    pattern:
                                      '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$',
                                  },
                                });
                              }}
                            >
                              Use Phone Number Pattern
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Client Fields Settings */}
              {editingElement && editingElement.type === 'Client Details' && (
                <div className='grid gap-4 pt-2 pb-2'>
                  <div className='col-span-4 mb-2'>
                    <h4 className='font-medium text-sm'>Client Information Fields</h4>
                    <p className='text-xs text-gray-500 mt-1'>
                      Select which client information fields to include
                    </p>
                  </div>

                  <div className='space-y-3 border rounded-md p-4 bg-gray-50'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Mail className='h-4 w-4 text-blue-600' />
                        <Label htmlFor='client-email' className='font-medium'>
                          Email
                        </Label>
                        <Badge className='text-xs bg-blue-100 text-blue-700 border-blue-200'>
                          Required
                        </Badge>
                      </div>
                      <Switch id='client-email' checked={true} disabled={true} />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <User2 className='h-4 w-4 text-gray-600' />
                        <Label htmlFor='client-name'>Full Name</Label>
                      </div>
                      <Switch
                        id='client-name'
                        checked={editingElement.clientFields?.name || false}
                        onCheckedChange={(checked) => {
                          return setEditingElement({
                            ...editingElement,
                            clientFields: {
                              ...editingElement.clientFields,
                              name: checked,
                            },
                          });
                        }}
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-gray-600' />
                        <Label htmlFor='client-phone'>Phone Number</Label>
                      </div>
                      <Switch
                        id='client-phone'
                        checked={editingElement.clientFields?.phone || false}
                        onCheckedChange={(checked) => {
                          return setEditingElement({
                            ...editingElement,
                            clientFields: {
                              ...editingElement.clientFields,
                              phone: checked,
                            },
                          });
                        }}
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Building2 className='h-4 w-4 text-gray-600' />
                        <Label htmlFor='client-company'>Company</Label>
                      </div>
                      <Switch
                        id='client-company'
                        checked={editingElement.clientFields?.company || false}
                        onCheckedChange={(checked) => {
                          return setEditingElement({
                            ...editingElement,
                            clientFields: {
                              ...editingElement.clientFields,
                              company: checked,
                            },
                          });
                        }}
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-gray-600' />
                        <Label htmlFor='client-address'>Address</Label>
                      </div>
                      <Switch
                        id='client-address'
                        checked={editingElement.clientFields?.address || false}
                        onCheckedChange={(checked) => {
                          return setEditingElement({
                            ...editingElement,
                            clientFields: {
                              ...editingElement.clientFields,
                              address: checked,
                            },
                          });
                        }}
                      />
                    </div>
                  </div>

                  {/* Custom Fields */}
                  <div className='mt-4'>
                    <h4 className='font-medium text-sm mb-2'>Custom Fields</h4>
                    <div className='space-y-2'>
                      {editingElement.clientFields?.custom?.map((field, index) => {
                        return (
                          <div key={index} className='flex items-center gap-2'>
                            <Input
                              value={field}
                              onChange={(e) => {
                                const newCustomFields = [
                                  ...(editingElement.clientFields?.custom || []),
                                ];
                                newCustomFields[index] = e.target.value;
                                setEditingElement({
                                  ...editingElement,
                                  clientFields: {
                                    ...editingElement.clientFields,
                                    custom: newCustomFields,
                                  },
                                });
                              }}
                              placeholder='Field name'
                            />
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => {
                                const newCustomFields = [
                                  ...(editingElement.clientFields?.custom || []),
                                ];
                                newCustomFields.splice(index, 1);
                                setEditingElement({
                                  ...editingElement,
                                  clientFields: {
                                    ...editingElement.clientFields,
                                    custom: newCustomFields,
                                  },
                                });
                              }}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        );
                      })}
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-2'
                        onClick={() => {
                          const newCustomFields = [
                            ...(editingElement.clientFields?.custom || []),
                            `Custom Field ${
                              (editingElement.clientFields?.custom?.length || 0) + 1
                            }`,
                          ];
                          setEditingElement({
                            ...editingElement,
                            clientFields: {
                              ...editingElement.clientFields,
                              custom: newCustomFields,
                            },
                          });
                        }}
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Add Custom Field
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={cn('flex gap-2', isMobile ? 'flex-col mt-6' : 'justify-end')}>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  return setEditingElement(null);
                }}
                className={isMobile ? 'w-full' : ''}
              >
                Cancel
              </Button>
              <Button
                type='button'
                onClick={saveElementChanges}
                className={isMobile ? 'w-full' : ''}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Element Type Menu */}
      {showElementTypeMenu && (
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
      )}
    </div>
  );
}
