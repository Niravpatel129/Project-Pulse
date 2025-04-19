'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  ArrowDownUp,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Copy,
  Download,
  Edit2,
  Grip,
  List,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Radio,
  Trash2,
  Upload,
  User2,
  X,
} from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

// Import needed types
type Condition = {
  id: string;
  sourceElementId: string;
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
  value: string;
};

type FormElement = {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  section?: string;
  options?: string[];
  placeholder?: string;
  defaultValue?: string;
  conditions?: Condition[];
  showWhen: 'all' | 'any';
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

type FormBuilderSidebarProps = {
  formElements: FormElement[];
  setFormElements: Dispatch<SetStateAction<FormElement[]>>;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  selectedElementId: string | null;
  setSelectedElementId: Dispatch<SetStateAction<string | null>>;
  setEditingElement: Dispatch<SetStateAction<FormElement | null>>;
  setChangesSaved: Dispatch<SetStateAction<boolean>>;
  previewMode: boolean;
  isMobile: boolean;
  showMobileNav: boolean;
  setShowMobileNav: Dispatch<SetStateAction<boolean>>;
  isDragging: boolean;
  draggedElementId: string | null;
  dragOverElementId: string | null;
  handleDragStart: (e: React.DragEvent, elementId: string) => void;
  handleDragOver: (e: React.DragEvent, elementId: string) => void;
  handleDrop: (e: React.DragEvent, targetElementId: string) => void;
  handleDragEnd: () => void;
  getElementIcon: (type: string) => React.ReactNode;
  generateId: () => string;
};

export default function FormBuilderSidebar({
  formElements,
  setFormElements,
  activeTab,
  setActiveTab,
  selectedElementId,
  setSelectedElementId,
  setEditingElement,
  setChangesSaved,
  previewMode,
  isMobile,
  showMobileNav,
  setShowMobileNav,
  isDragging,
  draggedElementId,
  dragOverElementId,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  getElementIcon,
  generateId,
}: FormBuilderSidebarProps) {
  // Functions needed for the sidebar
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

  const selectElement = (id: string) => {
    setSelectedElementId(id);
    // Scroll to the element in the form canvas
    const element = document.getElementById(`form-element-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const openElementEditor = (element: FormElement) => {
    setEditingElement({ ...element });
  };

  const moveElementUp = (index: number) => {
    if (index === 0) return;

    const newElements = [...formElements];
    const temp = newElements[index];
    newElements[index] = newElements[index - 1];
    newElements[index - 1] = temp;

    // Update order property
    newElements.forEach((element, idx) => {
      element.order = idx;
    });

    setFormElements(newElements);
    setChangesSaved(false);
  };

  const moveElementDown = (index: number) => {
    if (index === formElements.length - 1) return;

    const newElements = [...formElements];
    const temp = newElements[index];
    newElements[index] = newElements[index + 1];
    newElements[index + 1] = temp;

    // Update order property
    newElements.forEach((element, idx) => {
      element.order = idx;
    });

    setFormElements(newElements);
    setChangesSaved(false);
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

  return (
    <div
      className={cn(
        'w-full md:w-80 border-r bg-white overflow-y-auto shadow-sm',
        previewMode ? 'hidden' : '',
        !previewMode && isMobile && !showMobileNav ? 'hidden' : '',
        !previewMode && isMobile && showMobileNav ? 'fixed inset-0 z-40' : '',
      )}
    >
      {isMobile && (
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='font-medium'>Form Editor</h2>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              return setShowMobileNav(false);
            }}
          >
            <X className='h-5 w-5' />
          </Button>
        </div>
      )}
      <Tabs
        defaultValue='elements'
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full'
      >
        <TabsList className='w-auto grid grid-cols-2 p-1 bg-gray-100/70 mx-2 my-3 rounded-full h-11'>
          <TabsTrigger
            value='elements'
            className='rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm'
          >
            Elements
          </TabsTrigger>
          <TabsTrigger
            value='myform'
            className='rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm'
          >
            My Form
          </TabsTrigger>
        </TabsList>
        <TabsContent value='elements' className='p-0'>
          <div className='p-4'>
            <Input placeholder='Search input types' className='bg-gray-50' />
          </div>

          <Collapsible defaultOpen>
            <CollapsibleTrigger className='flex w-full items-center justify-between p-4 hover:bg-gray-50'>
              <span className='font-medium text-sm'>Recent</span>
              <ChevronDown className='h-4 w-4' />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className='space-y-1 px-1'>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Text Block');
                  }}
                >
                  <MessageSquare className='h-4 w-4' />
                  <span>Text Block</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Single Response');
                  }}
                >
                  <MessageSquare className='h-4 w-4 rotate-180' />
                  <span>Single Response</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Dropdown');
                  }}
                >
                  <CheckSquare className='h-4 w-4' />
                  <span>Dropdown</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8 flex items-center'
                  onClick={() => {
                    return addElement('Long Answer');
                  }}
                >
                  <List className='h-4 w-4' />
                  <span>Long Answer</span>
                  <div className='ml-auto'>
                    <MoreHorizontal className='h-4 w-4' />
                  </div>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Phone Number');
                  }}
                >
                  <Phone className='h-4 w-4' />
                  <span>Phone Number</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addClientDetailsSection();
                  }}
                >
                  <User2 className='h-4 w-4' />
                  <span>Client Details</span>
                  <Badge className='ml-auto text-xs bg-blue-100 text-blue-700 border-blue-200'>
                    Required
                  </Badge>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen>
            <CollapsibleTrigger className='flex w-full items-center justify-between p-4 hover:bg-gray-50'>
              <span className='font-medium text-sm'>Basic Fields</span>
              <ChevronDown className='h-4 w-4' />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className='space-y-1 px-1'>
                <Button variant='ghost' className='w-full justify-start gap-3 pl-8'>
                  <ArrowLeft className='h-4 w-4' />
                  <span>Next Page</span>
                </Button>
                <Button variant='ghost' className='w-full justify-start gap-3 pl-8'>
                  <Download className='h-4 w-4' />
                  <span>File Download</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('File Upload');
                  }}
                >
                  <Upload className='h-4 w-4' />
                  <span>File Upload</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Text Block');
                  }}
                >
                  <MessageSquare className='h-4 w-4' />
                  <span>Text Block</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Number');
                  }}
                >
                  <ArrowDownUp className='h-4 w-4' />
                  <span>Number</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Single Response');
                  }}
                >
                  <MessageSquare className='h-4 w-4 rotate-180' />
                  <span>Single Response</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Radio Buttons');
                  }}
                >
                  <Radio className='h-4 w-4' />
                  <span>Radio Buttons</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Checkboxes');
                  }}
                >
                  <CheckCircle className='h-4 w-4' />
                  <span>Checkboxes</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Dropdown');
                  }}
                >
                  <CheckSquare className='h-4 w-4' />
                  <span>Dropdown</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addElement('Date');
                  }}
                >
                  <Calendar className='h-4 w-4' />
                  <span>Date</span>
                </Button>
                <Button
                  variant='ghost'
                  className='w-full justify-start gap-3 pl-8'
                  onClick={() => {
                    return addClientDetailsSection();
                  }}
                >
                  <User2 className='h-4 w-4' />
                  <span>Client Details</span>
                  <Badge className='ml-auto text-xs bg-blue-100 text-blue-700 border-blue-200'>
                    Required
                  </Badge>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
        <TabsContent value='myform' className='p-0'>
          {formElements.length === 0 ? (
            <div className='p-8 text-center text-gray-500'>
              <p>Your form is empty</p>
              <p className='mt-2 text-sm'>Add elements from the Elements tab</p>
            </div>
          ) : (
            <div className='p-2 max-w-full'>
              <div className='bg-gray-50 p-3 rounded-md mb-4'>
                <h3 className='font-medium text-sm mb-1'>Form Structure</h3>
                <p className='text-xs text-gray-500'>Drag and drop to reorder elements</p>
              </div>

              <div className='space-y-1'>
                {formElements.map((element, index) => {
                  return (
                    <div
                      key={element.id}
                      className={cn(
                        'flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer group transition-all',
                        selectedElementId === element.id ? 'bg-gray-100' : '',
                        dragOverElementId === element.id
                          ? 'border border-dashed border-blue-400 bg-blue-50'
                          : '',
                        isDragging && draggedElementId === element.id ? 'opacity-50' : '',
                      )}
                      onClick={() => {
                        return selectElement(element.id);
                      }}
                      draggable
                      onDragStart={(e) => {
                        return handleDragStart(e, element.id);
                      }}
                      onDragOver={(e) => {
                        return handleDragOver(e, element.id);
                      }}
                      onDrop={(e) => {
                        return handleDrop(e, element.id);
                      }}
                      onDragEnd={handleDragEnd}
                    >
                      <div className='flex items-center gap-2 flex-1 min-w-0'>
                        <Grip className='h-4 w-4 text-gray-400 cursor-grab flex-shrink-0' />
                        <div className='flex-shrink-0'>{getElementIcon(element.type)}</div>
                        <span className='text-sm font-medium truncate max-w-[120px]'>
                          {element.title}
                        </span>
                        {element.required && (
                          <span className='text-red-500 text-xs flex-shrink-0'>*</span>
                        )}

                        {/* Conditional indicator */}
                        {element.conditions && element.conditions.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant='outline'
                                  className='ml-1 text-xs bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0'
                                >
                                  Conditional
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='text-xs'>This element is shown conditionally</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {/* Validation indicator */}
                        {element.validation && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant='outline'
                                  className='ml-1 text-xs bg-green-50 text-green-600 border-green-200 flex-shrink-0'
                                >
                                  Validated
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className='text-xs'>This element has validation rules</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={(e) => {
                            e.stopPropagation();
                            moveElementUp(index);
                          }}
                          disabled={index === 0}
                        >
                          <ArrowLeft className='h-4 w-4 rotate-90' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={(e) => {
                            e.stopPropagation();
                            moveElementDown(index);
                          }}
                          disabled={index === formElements.length - 1}
                        >
                          <ArrowLeft className='h-4 w-4 -rotate-90' />
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-48 p-1'>
                            <div className='space-y-1'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start gap-2'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateElement(element.id);
                                }}
                              >
                                <Copy className='h-4 w-4' />
                                <span>Duplicate</span>
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start gap-2'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openElementEditor(element);
                                }}
                              >
                                <Edit2 className='h-4 w-4' />
                                <span>Edit</span>
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(element.id);
                                }}
                              >
                                <Trash2 className='h-4 w-4' />
                                <span>Delete</span>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className='mt-4 p-4 border border-dashed border-gray-300 rounded-xl text-center hover:bg-gray-50 transition-all'>
                <Button
                  variant='ghost'
                  className='text-sm text-gray-500'
                  onClick={() => {
                    return setActiveTab('elements');
                  }}
                >
                  + Add more elements
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
