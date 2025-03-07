import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format } from 'date-fns';
import { FileText, MoreVertical, Package, PlusCircle, Receipt } from 'lucide-react';
import { useState } from 'react';
import { SendEmailDialog } from '../FileComponents';
import { CustomElementModal } from './CustomElementModal';
import { FileElementDetailsDialog } from './FileElementDetailsDialog';
import { FileElementModal } from './FileElementModal';
import { Module } from './types';

type ElementType = 'file' | 'invoice' | 'custom';

interface BaseElement {
  type: ElementType;
  name: string;
  description?: string;
}

interface FileElement extends BaseElement {
  type: 'file';
  files: Array<{
    name: string;
    type: 'document' | 'image' | 'other';
    size: number;
    comment?: string;
    uploadedAt: string;
    url: string;
  }>;
}

interface InvoiceElement extends BaseElement {
  type: 'invoice';
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: string;
}

interface CustomElement extends BaseElement {
  type: 'custom';
  fields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'file';
    required: boolean;
    options?: string[];
  }>;
}

type Element = FileElement | InvoiceElement | CustomElement;

interface ModuleDetailsDialogProps {
  selectedModule: Module | null;
  onClose: () => void;
}

const isFileElement = (element: Element): element is FileElement => {
  return element.type === 'file';
};

export function ModuleDetailsDialog({ selectedModule, onClose }: ModuleDetailsDialogProps) {
  const [selectedElementType, setSelectedElementType] = useState<ElementType | null>(null);
  const [selectedFileElement, setSelectedFileElement] = useState<FileElement | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [requestApproval, setRequestApproval] = useState(false);

  const handleAddElement = (newElement: Element) => {
    setElements((prev) => {
      return [...prev, newElement];
    });
    setSelectedElementType(null);
  };

  const handleSendEmail = () => {
    // In a real app, this would send an API request to send the email
    setShowSendEmailDialog(false);
    setEmailSubject('');
    setEmailMessage('');
    setRequestApproval(false);
  };

  if (!selectedModule) return null;

  return (
    <>
      <DialogContent className='max-w-4xl h-[80vh] [&>button]:hidden'>
        <VisuallyHidden>
          <DialogTitle>Module Details: {selectedModule.name}</DialogTitle>
        </VisuallyHidden>
        <div className='flex flex-col md:flex-row h-full overflow-hidden'>
          {/* Left side - module details */}
          <div className='w-full overflow-y-auto'>
            <div className='flex justify-between items-start mb-4'>
              <h2 className='text-2xl'>{selectedModule.name}</h2>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-56 p-0' align='end'>
                  <div className='p-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start'
                      onClick={() => {
                        setEmailSubject(`Module shared: ${selectedModule.name}`);
                        setEmailMessage(
                          `I'm sharing the following module with you: ${selectedModule.name}`,
                        );
                        setShowSendEmailDialog(true);
                      }}
                    >
                      Send to Client
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      className='w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50'
                    >
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {selectedModule.description && (
              <div className='mb-4'>
                <h4 className='text-sm font-medium mb-1'>Description</h4>
                <p className='text-sm text-gray-600'>{selectedModule.description}</p>
              </div>
            )}

            <div className='mb-4'>
              <h4 className='text-sm font-medium mb-1'>Status</h4>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  selectedModule.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : selectedModule.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : selectedModule.status === 'archived'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {selectedModule.status}
              </span>
            </div>

            <div className='mb-4'>
              <h4 className='text-sm font-medium mb-1'>Created By</h4>
              <div className='flex items-center space-x-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarFallback>{selectedModule.createdBy.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className='text-sm font-medium'>{selectedModule.createdBy.name}</p>
                  <p className='text-xs text-gray-500'>{selectedModule.createdBy.email}</p>
                </div>
              </div>
            </div>

            <div className='mb-4'>
              <h4 className='text-sm font-medium mb-1'>Created At</h4>
              <p className='text-sm text-gray-600'>
                {format(new Date(selectedModule.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>

            {selectedModule.assignedTo.length > 0 && (
              <div className='mb-4'>
                <h4 className='text-sm font-medium mb-1'>Assigned To</h4>
                <div className='flex flex-wrap gap-2'>
                  {selectedModule.assignedTo.map((userId) => {
                    return (
                      <span
                        key={userId}
                        className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
                      >
                        {userId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Module Elements Table */}
            <div className='mt-6 p-1'>
              <div className='flex justify-between items-center mb-4'>
                <h4 className='text-sm font-medium'>Module Elements</h4>
                <div className='flex items-center gap-2'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' size='sm' className='flex items-center gap-2'>
                        <PlusCircle className='h-4 w-4' />
                        Add Element
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-56 p-0' align='end'>
                      <div className='p-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='w-full justify-start'
                          onClick={() => {
                            return setSelectedElementType('file');
                          }}
                        >
                          <FileText className='h-4 w-4 mr-2' />
                          File Element
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[50px]'></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elements.length > 0 ? (
                    elements.map((element, index) => {
                      return (
                        <TableRow
                          key={index}
                          className='cursor-pointer hover:bg-gray-50'
                          onClick={() => {
                            if (isFileElement(element)) {
                              setSelectedFileElement(element);
                            }
                          }}
                        >
                          <TableCell>
                            {element.type === 'file' && (
                              <FileText className='h-4 w-4 text-gray-500' />
                            )}
                            {element.type === 'invoice' && (
                              <Receipt className='h-4 w-4 text-gray-500' />
                            )}
                            {element.type === 'custom' && (
                              <Package className='h-4 w-4 text-gray-500' />
                            )}
                          </TableCell>
                          <TableCell className='font-medium'>{element.name}</TableCell>
                          <TableCell>
                            {isFileElement(element) && (
                              <div className='flex items-center gap-2'>
                                <span className='text-sm text-gray-500'>
                                  {element.files.length}{' '}
                                  {element.files.length === 1 ? 'file' : 'files'}
                                </span>
                                <div className='flex -space-x-2'>
                                  {element.files.slice(0, 3).map((file, fileIndex) => {
                                    return (
                                      <div
                                        key={fileIndex}
                                        className='inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 border border-white'
                                      >
                                        {file.type === 'image' ? (
                                          <img
                                            src={file.url}
                                            alt={file.name}
                                            className='h-full w-full rounded-full object-cover'
                                          />
                                        ) : (
                                          <FileText className='h-3 w-3 text-gray-500' />
                                        )}
                                      </div>
                                    );
                                  })}
                                  {element.files.length > 3 && (
                                    <div className='inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 border border-white'>
                                      <span className='text-xs text-gray-500'>
                                        +{element.files.length - 3}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className='text-sm text-gray-500'>
                            {isFileElement(element) &&
                              (() => {
                                try {
                                  const date = new Date(element.files[0]?.uploadedAt || new Date());
                                  if (isNaN(date.getTime())) {
                                    return 'Invalid date';
                                  }
                                  return format(date, 'MMM d, h:mm a');
                                } catch (error) {
                                  return 'Invalid date';
                                }
                              })()}
                          </TableCell>
                          <TableCell>
                            <Button variant='ghost' size='icon'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className='h-24 text-center'>
                        <div className='flex flex-col items-center justify-center text-sm text-gray-500 mt-4'>
                          <PlusCircle className='h-8 w-8 mb-2 text-gray-400' />
                          <p>No elements added yet</p>
                          <p className='mt-1'>Use the button above to add your first element</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>

      <FileElementModal
        isOpen={selectedElementType === 'file'}
        moduleId={selectedModule?._id}
        onClose={() => {
          setSelectedElementType(null);
        }}
        onAdd={(element) => {
          handleAddElement(element);
          setSelectedElementType(null);
        }}
      />

      <CustomElementModal
        isOpen={selectedElementType === 'custom'}
        onClose={() => {
          setSelectedElementType(null);
        }}
        onAdd={(element) => {
          handleAddElement(element);
          setSelectedElementType(null);
        }}
      />

      <Dialog open={showSendEmailDialog} onOpenChange={setShowSendEmailDialog}>
        <SendEmailDialog
          selectedFile={null} // We don't need this for modules
          emailSubject={emailSubject}
          setEmailSubject={setEmailSubject}
          emailMessage={emailMessage}
          setEmailMessage={setEmailMessage}
          requestApproval={requestApproval}
          setRequestApproval={setRequestApproval}
          handleSendEmail={handleSendEmail}
          onClose={() => {
            return setShowSendEmailDialog(false);
          }}
        />
      </Dialog>

      {selectedFileElement && (
        <FileElementDetailsDialog
          element={selectedFileElement}
          isOpen={true}
          onClose={() => {
            return setSelectedFileElement(null);
          }}
        />
      )}
    </>
  );
}
