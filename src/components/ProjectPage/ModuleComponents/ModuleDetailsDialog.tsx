import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format } from 'date-fns';
import {
  Clock,
  Eye,
  EyeOff,
  FileText,
  GitBranch,
  HelpCircle,
  Mail,
  MoreVertical,
  Package,
  PlusCircle,
  Receipt,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SendEmailDialog } from '../FileComponents';
import { CustomElementModal } from './CustomElementModal';
import { FileElementDetailsDialog } from './FileElementDetailsDialog';
import { FileElementModal } from './FileElementModal';
import { Module } from './types';

type ElementType = 'file' | 'invoice' | 'custom';

type Element = any;

interface ModuleDetailsDialogProps {
  selectedModule: Module | null;
  onClose: () => void;
}

const isFileElement = (element) => {
  return element.elementType === 'file';
};

export function ModuleDetailsDialog({ selectedModule, onClose }: ModuleDetailsDialogProps) {
  const [selectedElementType, setSelectedElementType] = useState<ElementType | null>(null);
  const [selectedFileElement, setSelectedFileElement] = useState<any | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [requestApproval, setRequestApproval] = useState(false);
  const [isLoadingElements, setIsLoadingElements] = useState(false);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [selectedVersionElement, setSelectedVersionElement] = useState<Element | null>(null);
  const [clientShares, setClientShares] = useState<
    {
      id: string;
      status: 'awaiting_approval' | 'seen' | 'not_seen';
      sentAt: Date;
      recipientEmail: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchElements = async () => {
      if (!selectedModule?._id) return;

      setIsLoadingElements(true);
      try {
        const response = await newRequest.get(`/elements/modules/${selectedModule._id}`);
        setElements(response.data.data);
      } catch (error) {
        console.error('Error fetching module elements:', error);
      } finally {
        setIsLoadingElements(false);
      }
    };

    const fetchApprovals = async () => {
      if (!selectedModule?._id) return;

      setIsLoadingApprovals(true);
      try {
        const response = await newRequest.get(`/module-emails/${selectedModule._id}/approvals`);
        setClientShares(
          response.data.emails.map((share) => {
            return {
              id: share._id,
              status: share.status,
              sentAt: new Date(share.sentAt),
              recipientEmail: share.recipientEmail,
            };
          }),
        );
      } catch (error) {
        console.error('Error fetching module approvals:', error);
      } finally {
        setIsLoadingApprovals(false);
      }
    };

    fetchElements();
    fetchApprovals();
  }, [selectedModule?._id]);

  const handleAddElement = (newElement: Element) => {
    console.log('🚀 newElement:', newElement);
    // Add version information to new elements
    const elementWithVersion = {
      ...newElement,
      version: 1,
      versionHistory: [
        {
          version: 1,
          changedAt: new Date().toISOString(),
          changedBy: {
            name: 'Current User', // In a real app, get from auth context
            email: 'user@example.com',
          },
          changeDescription: 'Initial version',
        },
      ],
    };

    setElements((prev) => {
      return [...prev, elementWithVersion];
    });
    setSelectedElementType(null);
  };

  const handleSendEmail = async () => {
    try {
      // Make API call to send email
      const response = await newRequest.post('/module-emails/send-approval-email', {
        moduleId: selectedModule._id,
        subject: emailSubject,
        message: emailMessage,
        requestApproval: requestApproval,
      });

      // Add new client shares to the list with data from response
      if (response.data.emailRecords && response.data.emailRecords.length > 0) {
        const newShares = response.data.emailRecords.map((record) => {
          return {
            id: record._id,
            status: record.requestApproval ? 'awaiting_approval' : 'not_seen',
            sentAt: new Date(record.sentAt),
            recipientEmail: record.recipientEmail,
          };
        });

        setClientShares((prev) => {
          return [...prev, ...newShares];
        });
      }

      // Reset form state
      setShowSendEmailDialog(false);
      setEmailSubject('');
      setEmailMessage('');
      setRequestApproval(false);
    } catch (error) {
      console.error('Error sending email:', error);
      // Here you could add toast notification for error
    }
  };

  const handleViewVersionHistory = (element: Element) => {
    setSelectedVersionElement(element);
  };

  if (!selectedModule) return null;

  return (
    <>
      <DialogContent className='max-w-6xl h-[90vh] [&>button]:hidden'>
        <VisuallyHidden>
          <DialogTitle>{selectedModule.name}</DialogTitle>
        </VisuallyHidden>
        <div className='flex flex-col h-full overflow-hidden'>
          {/* Header with module name and actions */}
          <div className='flex justify-between items-start mb-6 pb-4 border-b'>
            <h2 className='text-2xl font-semibold'>{selectedModule.name}</h2>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-2'
                onClick={() => {
                  setEmailSubject(`Module shared: ${selectedModule.name}`);
                  setEmailMessage(
                    `I'm sharing the following module with you: ${selectedModule.name}`,
                  );
                  setShowSendEmailDialog(true);
                }}
              >
                <Mail className='h-4 w-4' />
                Send to Client
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-56' align='end'>
                  <DropdownMenuItem className='text-red-600 focus:text-red-600 focus:bg-red-50'>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main content area with two columns */}
          <div className='flex flex-1 gap-6 overflow-hidden'>
            {/* Left column - Module details and client shares */}
            <div className='w-1/3 flex flex-col overflow-y-auto'>
              {/* Module details section */}
              <div className='mb-6'>
                {selectedModule.description && (
                  <div className='mb-4'>
                    <h4 className='text-sm font-medium mb-1 text-gray-700'>Description</h4>
                    <p className='text-sm text-gray-600 rounded-md'>{selectedModule.description}</p>
                  </div>
                )}

                <div className='mb-4'>
                  <h4 className='text-sm font-medium mb-1 text-gray-700'>Status</h4>
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
                  <h4 className='text-sm font-medium mb-1 text-gray-700'>Created By</h4>
                  <div className='flex items-center space-x-2 rounded-md'>
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
                  <h4 className='text-sm font-medium mb-1 text-gray-700'>Created At</h4>
                  <p className='text-sm text-gray-600 rounded-md'>
                    {format(new Date(selectedModule.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>

                {selectedModule.assignedTo.length > 0 && (
                  <div className='mb-4'>
                    <h4 className='text-sm font-medium mb-1 text-gray-700'>Assigned To</h4>
                    <div className='flex flex-wrap gap-2 rounded-md'>
                      {selectedModule.assignedTo.map((userId) => {
                        return (
                          <span
                            key={userId}
                            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border text-gray-800'
                          >
                            {userId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Client shares section */}
              <div className='mb-6'>
                <div className='flex justify-between items-center mb-3'>
                  <h3 className='text-lg font-medium'>Approvals</h3>
                  <Badge variant='outline' className='font-normal'>
                    {clientShares.length} {clientShares.length === 1 ? 'share' : 'shares'}
                  </Badge>
                </div>

                {isLoadingApprovals ? (
                  <div className='flex flex-col items-center justify-center p-8 border rounded-md bg-gray-50'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-4'></div>
                    <p className='text-sm text-gray-500'>Loading approvals...</p>
                  </div>
                ) : clientShares.length > 0 ? (
                  <div className='space-y-2 max-h-[300px] overflow-y-auto pr-1'>
                    {clientShares.map((share) => {
                      return (
                        <div
                          key={share.id}
                          className='flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors gap-2'
                        >
                          <div className='flex flex-col gap-1'>
                            <div className='flex items-center gap-2'>
                              <Mail className='h-4 w-4 text-gray-500 flex-shrink-0' />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className='text-sm font-medium cursor-help truncate max-w-[150px] sm:max-w-[200px]'>
                                    {share.recipientEmail.split('@')[0]}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{share.recipientEmail}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <span className='text-xs text-gray-500 pl-6'>
                              {format(share.sentAt, 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <Badge
                            variant={
                              share.status === 'awaiting_approval'
                                ? 'outline'
                                : share.status === 'seen'
                                ? 'secondary'
                                : 'default'
                            }
                            className='flex items-center gap-1 self-start sm:self-center mt-2 sm:mt-0 whitespace-nowrap'
                          >
                            {share.status === 'awaiting_approval' && <Clock className='h-3 w-3' />}
                            {share.status === 'seen' && <Eye className='h-3 w-3' />}
                            {share.status === 'not_seen' && <EyeOff className='h-3 w-3' />}
                            {share.status === 'awaiting_approval'
                              ? 'Awaiting Approval'
                              : share.status === 'seen'
                              ? 'Seen'
                              : 'Not Seen'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center p-8 border rounded-md bg-gray-50 text-center'>
                    <div className='bg-white p-3 rounded-full border mb-4'>
                      <Mail className='h-8 w-8 text-gray-400' />
                    </div>
                    <h4 className='text-sm font-medium text-gray-900 mb-1'>No approvals yet</h4>
                    <p className='text-sm text-gray-500 mb-4'>
                      Share this module with clients to request approvals and track their responses
                    </p>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex items-center gap-2'
                      onClick={() => {
                        setEmailSubject(`Module shared: ${selectedModule.name}`);
                        setEmailMessage(
                          `I'm sharing the following module with you: ${selectedModule.name}`,
                        );
                        setShowSendEmailDialog(true);
                      }}
                    >
                      <Mail className='h-4 w-4' />
                      Send to Client
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Module elements */}
            <div className='w-2/3 flex flex-col overflow-hidden border-l pl-6'>
              <div className='flex justify-between items-center mb-4'>
                <div className='flex items-center gap-1'>
                  <h3 className='text-lg font-medium'>Elements</h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-5 w-5 rounded-full'>
                        <HelpCircle className='h-4 w-4' />
                        <span className='sr-only'>What are elements?</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-xs'>
                      <p>
                        Elements are individual components within a module, such as files,
                        documents, or other resources that make up the project deliverable.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className='flex items-center gap-2'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='outline' size='sm' className='flex items-center gap-2'>
                        <PlusCircle className='h-4 w-4' />
                        Add Element
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-56' align='end'>
                      <DropdownMenuItem
                        onClick={() => {
                          return setSelectedElementType('file');
                        }}
                      >
                        <FileText className='h-4 w-4 mr-2' />
                        File Element
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className='flex-1 overflow-y-auto pr-1'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className='w-10'></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingElements ? (
                      <TableRow>
                        <TableCell colSpan={5} className='h-24 text-center'>
                          <div className='flex flex-col items-center justify-center text-sm text-gray-500 mt-4'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2'></div>
                            <p>Loading elements...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : elements.length > 0 ? (
                      elements.map((element, index) => {
                        console.log('🚀 element 123:', element);
                        return (
                          <TableRow
                            key={index}
                            className='cursor-pointer hover:bg-gray-50'
                            onClick={(e) => {
                              if (isFileElement(element)) {
                                setSelectedFileElement(element);
                              }
                            }}
                          >
                            <TableCell className=''>
                              <div className='flex items-center gap-2'>
                                {element.elementType === 'file' ? (
                                  <FileText className='h-4 w-4 text-gray-500' />
                                ) : element.elementType === 'invoice' ? (
                                  <Receipt className='h-4 w-4 text-gray-500' />
                                ) : (
                                  <Package className='h-4 w-4 text-gray-500' />
                                )}

                                {element.name || 'Untitled'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isFileElement(element) && (
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm text-gray-500'>
                                    {element.files.length}{' '}
                                    {element.files.length === 1 ? 'file' : 'files'}
                                  </span>
                                  <div className='flex -space-x-2'>
                                    {element?.files?.length > 3 && (
                                      <div className='inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 border border-white'>
                                        <span className='text-xs text-gray-500'>
                                          +{element?.files?.length - 3}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-1'>
                                <GitBranch className='h-3 w-3 text-gray-500' />
                                <span className='text-sm text-gray-600'>
                                  v{element.version || 1}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className='text-sm text-gray-500'>
                              {isFileElement(element) &&
                                (() => {
                                  try {
                                    const date = new Date(
                                      element.uploadedAt || element.createdAt || new Date(),
                                    );
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
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent row click event from firing
                                    }}
                                  >
                                    <MoreVertical className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='w-56' align='end'>
                                  <DropdownMenuItem
                                    className='text-red-600 focus:text-red-600 focus:bg-red-50'
                                    onClick={async (e) => {
                                      try {
                                        e.stopPropagation(); // Prevent row click event from firing

                                        if (!element._id) {
                                          throw new Error('Element ID is missing');
                                        }

                                        await newRequest.delete(`/elements/${element._id}`);
                                        setElements((prev) => {
                                          return prev.filter((e) => {
                                            return e._id !== element._id;
                                          });
                                        });
                                      } catch (error) {
                                        console.error('Error deleting element:', error);
                                      }
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
