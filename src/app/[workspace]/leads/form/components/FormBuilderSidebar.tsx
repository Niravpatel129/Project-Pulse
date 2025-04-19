'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  ArrowDownUp,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Copy,
  Edit2,
  Grip,
  MessageSquare,
  MoreHorizontal,
  Radio,
  Trash2,
  Upload,
  User2,
  X,
} from 'lucide-react';
import { useFormBuilder } from '../context/FormBuilderContext';

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
  getElementIcon: (type: string) => React.ReactNode;
};

export default function FormBuilderSidebar({ getElementIcon }: FormBuilderSidebarProps) {
  const {
    formElements,
    setFormElements,
    activeTab,
    setActiveTab,
    selectedElementId,
    setSelectedElementId,
    setEditingElement,
    setChangesSaved,
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
    addElement,
    addClientDetailsSection,
    selectElement,
    deleteElement,
    duplicateElement,
    generateId,
  } = useFormBuilder();

  const openElementEditor = (element: any) => {
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

  return (
    <div className='h-full flex flex-col'>
      <div className='p-2 flex items-center justify-between'>
        <h2 className='font-semibold text-lg flex-1 px-2'>Form Builder</h2>
        {isMobile && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              return setShowMobileNav(false);
            }}
            className='md:hidden'
          >
            <X className='h-5 w-5' />
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-1 flex flex-col'>
        <div className='px-4 py-2 border-b'>
          <TabsList className='w-full'>
            <TabsTrigger value='elements' className='flex-1'>
              Elements
            </TabsTrigger>
            <TabsTrigger value='myform' className='flex-1'>
              My Form
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='elements' className='flex-1 overflow-auto p-4 space-y-4 mt-0'>
          <div>
            <h3 className='font-medium text-sm mb-2 text-gray-700'>Basic Fields</h3>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Short Answer');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  {getElementIcon('Short Answer')}
                </div>
                <span className='text-xs'>Short Answer</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Long Answer');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  {getElementIcon('Long Answer')}
                </div>
                <span className='text-xs'>Long Answer</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Number');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  {getElementIcon('Number')}
                </div>
                <span className='text-xs'>Number</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Email');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  {getElementIcon('Email')}
                </div>
                <span className='text-xs'>Email</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Phone Number');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  {getElementIcon('Phone Number')}
                </div>
                <span className='text-xs'>Phone</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('URL');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  {getElementIcon('URL')}
                </div>
                <span className='text-xs'>URL</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className='font-medium text-sm mb-2 text-gray-700'>Choice Fields</h3>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Radio Buttons');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  <Radio className='h-4 w-4' />
                </div>
                <span className='text-xs'>Radio Buttons</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Checkboxes');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  <CheckSquare className='h-4 w-4' />
                </div>
                <span className='text-xs'>Checkboxes</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Dropdown');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  <ChevronDown className='h-4 w-4' />
                </div>
                <span className='text-xs'>Dropdown</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Rating');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  {getElementIcon('Rating')}
                </div>
                <span className='text-xs'>Rating</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className='font-medium text-sm mb-2 text-gray-700'>Advanced Fields</h3>
            <div className='grid grid-cols-2 gap-2'>
              <Button
                disabled={formElements.some((element) => {
                  return element.type === 'Client Details';
                })}
                data-tooltip-id='my-tooltip'
                data-tooltip-content='This section is required for lead capture'
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addClientDetailsSection();
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  <User2 className='h-4 w-4' />
                </div>
                <span className='text-xs'>
                  Client Details <span className='text-red-500'>*</span>
                </span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('Date');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  <Calendar className='h-4 w-4' />
                </div>
                <span className='text-xs'>Date</span>
              </Button>
              <Button
                variant='outline'
                className='h-auto p-2 flex flex-col items-center justify-center gap-1 hover:border-blue-400'
                onClick={() => {
                  return addElement('File Upload');
                }}
              >
                <div className='w-6 h-6 flex items-center justify-center'>
                  <Upload className='h-4 w-4' />
                </div>
                <span className='text-xs'>File Upload</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='myform' className='flex-1 overflow-auto px-3 mt-0'>
          {formElements.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full p-4 text-center'>
              <MessageSquare className='h-12 w-12 text-gray-300 mb-2' />
              <h3 className='font-medium text-gray-700 mb-1'>Your form is empty</h3>
              <p className='text-gray-500 text-sm mb-3'>
                Add elements from the Elements tab to get started
              </p>
              <Button
                variant='default'
                size='sm'
                onClick={() => {
                  return setActiveTab('elements');
                }}
              >
                Add Elements
              </Button>
            </div>
          ) : (
            <div className='py-3 space-y-2'>
              {formElements.map((element, index) => {
                const icon = getElementIcon(element.type);
                return (
                  <div
                    key={element.id}
                    className={cn(
                      'border rounded-md cursor-pointer transition-all',
                      selectedElementId === element.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-gray-200 hover:border-gray-300',
                      isDragging && draggedElementId === element.id ? 'opacity-50' : '',
                      isDragging &&
                        dragOverElementId === element.id &&
                        draggedElementId !== element.id
                        ? 'border-blue-300 bg-blue-50/30'
                        : '',
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
                    <div className='p-2.5 flex items-start gap-2'>
                      <div className='flex-shrink-0 mt-0.5 cursor-grab'>
                        <Grip className='h-4 w-4 text-gray-400' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-1.5 mb-0.5'>
                          <div className='w-4 h-4 flex-shrink-0'>{icon}</div>
                          <span className='font-medium text-sm text-gray-700 truncate'>
                            {element.title}
                          </span>
                        </div>
                        <div className='flex items-center gap-1.5'>
                          <span className='text-xs text-gray-500'>{element.type}</span>
                          {element.required && (
                            <Badge
                              variant='outline'
                              className='px-1 py-0 h-4 text-[10px] border-red-200 text-red-600 rounded'
                            >
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center'>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6 rounded-full'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openElementEditor(element);
                                }}
                              >
                                <Edit2 className='h-3 w-3 text-gray-500' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Element</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 rounded-full'
                              onClick={(e) => {
                                return e.stopPropagation();
                              }}
                            >
                              <MoreHorizontal className='h-3 w-3 text-gray-500' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-40 p-1' side='right'>
                            <div className='space-y-0.5'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start text-xs h-7'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openElementEditor(element);
                                }}
                              >
                                <Edit2 className='h-3 w-3 mr-2' />
                                Edit
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start text-xs h-7'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateElement(element.id);
                                }}
                              >
                                <Copy className='h-3 w-3 mr-2' />
                                Duplicate
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start text-xs h-7'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElementUp(index);
                                }}
                                disabled={index === 0}
                              >
                                <ArrowDownUp className='h-3 w-3 mr-2' />
                                Move Up
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start text-xs h-7'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElementDown(index);
                                }}
                                disabled={index === formElements.length - 1}
                              >
                                <ArrowDownUp className='h-3 w-3 mr-2' />
                                Move Down
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='w-full justify-start text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteElement(element.id);
                                }}
                              >
                                <Trash2 className='h-3 w-3 mr-2' />
                                Delete
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {element.conditions && element.conditions.length > 0 && (
                      <Collapsible className='mt-1 border-t'>
                        <CollapsibleTrigger className='flex items-center justify-between w-full p-2 hover:bg-gray-50'>
                          <div className='flex items-center gap-1 text-xs text-gray-600'>
                            <CheckCircle className='h-3 w-3' />
                            <span>
                              Show when{' '}
                              {element.showWhen === 'all'
                                ? 'all conditions match'
                                : 'any condition matches'}
                            </span>
                          </div>
                          <ChevronDown className='h-3 w-3' />
                        </CollapsibleTrigger>
                        <CollapsibleContent className='px-2 pb-2'>
                          <div className='text-xs space-y-1'>
                            {element.conditions.map((condition) => {
                              const sourceElement = formElements.find((el) => {
                                return el.id === condition.sourceElementId;
                              });
                              return (
                                <div
                                  key={condition.id}
                                  className='flex items-center justify-between p-1 border rounded bg-gray-50'
                                >
                                  <span className='truncate'>
                                    {sourceElement?.title || 'Unknown Element'}{' '}
                                    {condition.operator.replace(/_/g, ' ')} {condition.value}
                                  </span>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-5 w-5 rounded-full'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      return deleteElement(element.id);
                                    }}
                                  >
                                    <X className='h-3 w-3' />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
