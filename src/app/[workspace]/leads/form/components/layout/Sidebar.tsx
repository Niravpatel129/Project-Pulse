'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ArrowDownUp,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Download,
  Grip,
  List,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Radio,
  Upload,
  User2,
  X,
} from 'lucide-react';
import { FC, ReactElement } from 'react';
import { ElementType, FormElement } from '../../types/formTypes';

interface SidebarProps {
  previewMode: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile: boolean;
  showMobileNav: boolean;
  setShowMobileNav: (show: boolean) => void;
  formElements: FormElement[];
  selectedElementId: string | null;
  addElement: (type: ElementType) => void;
  addClientDetailsSection: () => void;
  selectElement: (id: string) => void;
  moveElementUp: (index: number) => void;
  moveElementDown: (index: number) => void;
  openElementEditor: (element: FormElement) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  handleDragStart: (e: React.DragEvent, elementId: string) => void;
  handleDragOver: (e: React.DragEvent, elementId: string) => void;
  handleDrop: (e: React.DragEvent, elementId: string) => void;
  handleDragEnd: () => void;
  dragOverElementId: string | null;
  draggedElementId: string | null;
  isDragging: boolean;
  getElementIcon: (type: string) => ReactElement;
}

export const Sidebar: FC<SidebarProps> = ({
  previewMode,
  activeTab,
  setActiveTab,
  isMobile,
  showMobileNav,
  setShowMobileNav,
  formElements,
  selectedElementId,
  addElement,
  addClientDetailsSection,
  selectElement,
  moveElementUp,
  moveElementDown,
  openElementEditor,
  deleteElement,
  duplicateElement,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  dragOverElementId,
  draggedElementId,
  isDragging,
  getElementIcon,
}) => {
  if (previewMode) return null;

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

        {/* Elements Tab Content */}
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

        {/* My Form Tab Content */}
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

                        {element.conditions && element.conditions.length > 0 && (
                          <Badge
                            variant='outline'
                            className='ml-1 text-xs bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0'
                          >
                            Conditional
                          </Badge>
                        )}

                        {element.validation && (
                          <Badge
                            variant='outline'
                            className='ml-1 text-xs bg-green-50 text-green-600 border-green-200 flex-shrink-0'
                          >
                            Validated
                          </Badge>
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
                        <div className='relative group'>
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
                          <div className='absolute right-0 mt-1 w-36 bg-white shadow-md rounded-md border border-gray-200 py-1 hidden group-hover:block z-10'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-full justify-start gap-2 px-3'
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateElement(element.id);
                              }}
                            >
                              <span>Duplicate</span>
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-full justify-start gap-2 px-3'
                              onClick={(e) => {
                                e.stopPropagation();
                                openElementEditor(element);
                              }}
                            >
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='w-full justify-start gap-2 px-3 text-red-500 hover:text-red-600 hover:bg-red-50'
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                            >
                              <span>Delete</span>
                            </Button>
                          </div>
                        </div>
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
};
