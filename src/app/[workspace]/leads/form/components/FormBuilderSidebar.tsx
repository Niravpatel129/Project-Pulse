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
  Plus,
  Radio,
  Trash2,
  Upload,
  User2,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { useFormBuilder } from '../context/FormBuilderContext';
import { AutomationDialog } from './AutomationDialog';

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

// Define the automation types
type AutomationType = 'send_email' | 'create_project' | 'assign_project_manager';

// Define the automation interface
interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  enabled: boolean;
  config?: Record<string, any>;
}

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
    automations,
    addAutomation,
    deleteAutomation,
    toggleAutomation,
    editAutomation,
  } = useFormBuilder();

  // Add state for automation dialog
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);
  const [currentAutomation, setCurrentAutomation] = useState<Automation | undefined>(undefined);

  // Function to handle adding new automation
  const handleAddAutomation = (type?: AutomationType) => {
    if (type) {
      setCurrentAutomation({
        id: generateId(),
        name: getDefaultNameForType(type),
        type,
        enabled: true,
        config: getDefaultConfigForType(type),
      });
    } else {
      setCurrentAutomation(undefined);
    }
    setAutomationDialogOpen(true);
  };

  // Get default name based on automation type
  const getDefaultNameForType = (type: AutomationType): string => {
    switch (type) {
      case 'create_project':
        return 'Create Project Automatically';
      case 'assign_project_manager':
        return 'Assign Project Manager';
      case 'send_email':
        return 'Send Welcome Email';
      default:
        return 'New Automation';
    }
  };

  // Get default config based on automation type
  const getDefaultConfigForType = (type: AutomationType): Record<string, any> => {
    switch (type) {
      case 'create_project':
        return {
          projectNameTemplate: 'Form Submission - {{submission_date}}',
          description: 'Project created from form submission by {{client_name}}',
        };
      case 'assign_project_manager':
        return {
          assigneeType: 'auto',
          notifyAssignee: true,
        };
      case 'send_email':
        return {
          subject: 'Welcome to our project!',
          body: 'Dear {{client_name}},\n\nThank you for submitting your request. We have created a new project: {{project_name}}.\n\nYou can view your project status at any time using this link: {{project_link}}\n\nBest regards,\nYour Project Team',
          ccTeam: false,
        };
      default:
        return {};
    }
  };

  // Function to handle editing automation
  const handleEditAutomation = (automation: Automation) => {
    setCurrentAutomation(automation);
    setAutomationDialogOpen(true);
  };

  // Function to save automation
  const handleSaveAutomation = (automation: Automation) => {
    if (currentAutomation) {
      editAutomation(automation);
    } else {
      addAutomation(automation);
    }
  };

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

  // Function to get automation icon based on type
  const getAutomationIcon = (type: AutomationType) => {
    switch (type) {
      case 'send_email':
        return <MessageSquare className='h-4 w-4' />;
      case 'create_project':
        return <Plus className='h-4 w-4' />;
      case 'assign_project_manager':
        return <User2 className='h-4 w-4' />;
      default:
        return <Zap className='h-4 w-4' />;
    }
  };

  // Function to get display name for automation type
  const getAutomationDisplayName = (type: AutomationType) => {
    switch (type) {
      case 'send_email':
        return 'Send Email';
      case 'create_project':
        return 'Create Project';
      case 'assign_project_manager':
        return 'Assign Project Manager';
      default:
        return 'Automation';
    }
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
            <TabsTrigger value='automations' className='flex-1'>
              Automations
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

        <TabsContent value='automations' className='flex-1 overflow-auto p-4 mt-0'>
          <div className='bg-gray-50 p-4 rounded-md mb-4'>
            <h3 className='font-medium text-sm mb-1'>Project Onboarding Automations</h3>
            <p className='text-xs text-gray-500'>
              Configure the automation flow that happens when a form is submitted
            </p>
          </div>

          {automations.length === 0 ? (
            <div className='text-center p-8'>
              <div className='rounded-full bg-purple-100 p-3 inline-flex mb-3'>
                <Zap className='h-6 w-6 text-purple-600' />
              </div>
              <h3 className='text-lg font-medium mb-2'>No project automations yet</h3>
              <p className='text-gray-500 mb-4'>
                Automations help you save time by automating project onboarding tasks
              </p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button className='gap-2'>
                    <Plus className='h-4 w-4' />
                    Add project automation
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-64 p-1' side='top' align='center'>
                  <div className='space-y-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start h-10'
                      onClick={() => {
                        return handleAddAutomation('create_project');
                      }}
                    >
                      <div className='h-7 w-7 rounded-full bg-purple-50 flex items-center justify-center mr-2'>
                        <Plus className='h-4 w-4 text-purple-600' />
                      </div>
                      Create Project
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start h-10'
                      onClick={() => {
                        return handleAddAutomation('assign_project_manager');
                      }}
                    >
                      <div className='h-7 w-7 rounded-full bg-green-50 flex items-center justify-center mr-2'>
                        <User2 className='h-4 w-4 text-green-600' />
                      </div>
                      Assign Project Manager
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start h-10'
                      onClick={() => {
                        return handleAddAutomation('send_email');
                      }}
                    >
                      <div className='h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center mr-2'>
                        <MessageSquare className='h-4 w-4 text-blue-600' />
                      </div>
                      Send Welcome Email
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center gap-2 px-3 py-2'>
                <div className='w-2 h-2 rounded-full bg-gray-400'></div>
                <span className='text-sm text-gray-500'>Form Submission</span>
              </div>

              {automations.map((automation, index) => {
                return (
                  <div key={automation.id} className='relative'>
                    <div className='absolute left-[7px] top-0 w-[2px] h-full bg-gray-200'></div>

                    <div
                      className={cn(
                        'ml-6 border rounded-lg relative overflow-hidden transition-all duration-200 group',
                        automation.enabled
                          ? automation.type === 'send_email'
                            ? 'border-blue-200 shadow-sm'
                            : automation.type === 'create_project'
                            ? 'border-purple-200 shadow-sm'
                            : 'border-green-200 shadow-sm'
                          : 'border-gray-200 bg-gray-50/80',
                      )}
                    >
                      {/* Status indicator bar */}
                      <div
                        className={cn(
                          'h-1 w-full',
                          automation.enabled
                            ? automation.type === 'send_email'
                              ? 'bg-blue-400'
                              : automation.type === 'create_project'
                              ? 'bg-purple-400'
                              : 'bg-green-400'
                            : 'bg-gray-200',
                        )}
                      />

                      <div className='p-3.5'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={cn(
                              'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                              automation.enabled
                                ? automation.type === 'send_email'
                                  ? 'bg-blue-50 text-blue-600'
                                  : automation.type === 'create_project'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-green-50 text-green-600'
                                : 'bg-gray-100 text-gray-500',
                            )}
                          >
                            {getAutomationIcon(automation.type)}
                          </div>

                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between mb-1'>
                              <span className='font-medium truncate block'>{automation.name}</span>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6 rounded-full -mr-1'
                                  >
                                    <MoreHorizontal className='h-3.5 w-3.5 text-gray-500' />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-40 p-1' side='right'>
                                  <div className='space-y-0.5'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='w-full justify-start text-xs h-7'
                                      onClick={() => {
                                        return handleEditAutomation(automation);
                                      }}
                                    >
                                      <Edit2 className='h-3 w-3 mr-2' />
                                      Edit
                                    </Button>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='w-full justify-start text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50'
                                      onClick={() => {
                                        return deleteAutomation(automation.id);
                                      }}
                                    >
                                      <Trash2 className='h-3 w-3 mr-2' />
                                      Delete
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className='flex items-center text-xs text-gray-500'>
                              <span className='mr-2'>
                                {getAutomationDisplayName(automation.type)}
                              </span>
                              <button
                                type='button'
                                className={cn(
                                  'flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-colors',
                                  automation.enabled
                                    ? 'bg-emerald-50 hover:bg-emerald-100'
                                    : 'bg-gray-100 hover:bg-gray-200',
                                )}
                                onClick={() => {
                                  return toggleAutomation(automation.id);
                                }}
                                aria-label={
                                  automation.enabled ? 'Disable automation' : 'Enable automation'
                                }
                              >
                                <div
                                  className={cn(
                                    'w-2 h-2 rounded-full transition-colors',
                                    automation.enabled ? 'bg-emerald-500' : 'bg-gray-400',
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-[10px] font-medium',
                                    automation.enabled ? 'text-emerald-600' : 'text-gray-500',
                                  )}
                                >
                                  {automation.enabled ? 'Active' : 'Disabled'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className='relative'>
                <div className='absolute left-[7px] top-0 w-[2px] h-[20px] bg-gray-200'></div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='ml-6 w-[calc(100%-24px)] h-12 gap-2 border-dashed border-gray-300 rounded-lg'
                    >
                      <Plus className='h-4 w-4' />
                      Add automation step
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-64 p-1' side='top' align='center'>
                    <div className='space-y-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start h-10'
                        onClick={() => {
                          return handleAddAutomation('create_project');
                        }}
                      >
                        <div className='h-7 w-7 rounded-full bg-purple-50 flex items-center justify-center mr-2'>
                          <Plus className='h-4 w-4 text-purple-600' />
                        </div>
                        Create Project
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start h-10'
                        onClick={() => {
                          return handleAddAutomation('assign_project_manager');
                        }}
                      >
                        <div className='h-7 w-7 rounded-full bg-green-50 flex items-center justify-center mr-2'>
                          <User2 className='h-4 w-4 text-green-600' />
                        </div>
                        Assign Project Manager
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='w-full justify-start h-10'
                        onClick={() => {
                          return handleAddAutomation('send_email');
                        }}
                      >
                        <div className='h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center mr-2'>
                          <MessageSquare className='h-4 w-4 text-blue-600' />
                        </div>
                        Send Welcome Email
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className='flex items-center gap-2 px-3 py-2'>
                <div className='w-2 h-2 rounded-full bg-gray-400'></div>
                <span className='text-sm text-gray-500'>Complete</span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Automation Dialog */}
      <AutomationDialog
        open={automationDialogOpen}
        onOpenChange={setAutomationDialogOpen}
        automation={currentAutomation}
        onSave={handleSaveAutomation}
        generateId={generateId}
        formElements={formElements}
      />
    </div>
  );
}
