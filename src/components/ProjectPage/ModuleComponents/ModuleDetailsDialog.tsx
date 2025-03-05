import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Package,
  Plus,
  Receipt,
  Send,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Module } from './types';

type ElementType = 'file' | 'invoice' | 'custom';

interface BaseElement {
  type: ElementType;
  name: string;
  description?: string;
  status: string;
}

interface FileElement extends BaseElement {
  type: 'file';
  files: Array<{
    name: string;
    type: 'document' | 'image' | '3d';
    size: number;
    comment?: string;
    uploadedAt: string;
  }>;
}

interface InvoiceElement extends BaseElement {
  type: 'invoice';
  clientName: string;
  clientEmail: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
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

interface AddElementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (element: Element) => void;
}

function AddElementModal({ isOpen, onClose, onAdd }: AddElementModalProps) {
  const [selectedType, setSelectedType] = useState<ElementType | null>(null);
  const [formData, setFormData] = useState<Partial<Element>>({
    name: '',
    description: '',
    status: 'draft',
  });
  const [fileComment, setFileComment] = useState<string>('');
  const [commentingFileIndex, setCommentingFileIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    onAdd(formData as Element);
    setFormData({
      name: '',
      description: '',
      status: 'draft',
    });
    setSelectedType(null);
    onClose();
  };

  const renderTypeSelection = () => {
    return (
      <div className='grid grid-cols-3 gap-4'>
        <Button
          variant='outline'
          className='h-24 flex flex-col items-center justify-center gap-2'
          onClick={() => {
            return setSelectedType('file');
          }}
        >
          <FileText className='h-6 w-6' />
          <span>File</span>
        </Button>
        <Button
          variant='outline'
          className='h-24 flex flex-col items-center justify-center gap-2'
          onClick={() => {
            return setSelectedType('invoice');
          }}
        >
          <Receipt className='h-6 w-6' />
          <span>Invoice</span>
        </Button>
        <Button
          variant='outline'
          className='h-24 flex flex-col items-center justify-center gap-2'
          onClick={() => {
            return setSelectedType('custom');
          }}
        >
          <Plus className='h-6 w-6' />
          <span>Custom</span>
        </Button>
      </div>
    );
  };

  const renderTypeSpecificFields = () => {
    if (!selectedType) return null;

    return (
      <div className='space-y-4'>
        {selectedType === 'file' && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Upload Files</Label>
              <div className='border-2 border-dashed rounded-lg p-4 text-center min-h-[150px] flex items-center justify-center'>
                <input
                  type='file'
                  multiple
                  className='hidden'
                  id='file-upload'
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const newFiles = files.map((file) => {
                      return {
                        name: file.name,
                        type: file.type.startsWith('image/')
                          ? 'image'
                          : file.type.includes('pdf') || file.type.includes('doc')
                          ? 'document'
                          : '3d',
                        size: file.size,
                        uploadedAt: new Date().toISOString(),
                      };
                    });

                    setFormData((prev: any) => {
                      return {
                        ...prev,
                        files: [...((prev as FileElement).files || []), ...newFiles],
                        type: 'file',
                      };
                    });
                  }}
                />
                <label
                  htmlFor='file-upload'
                  className='cursor-pointer flex flex-col items-center gap-2'
                >
                  <FileText className='h-8 w-8 text-gray-400' />
                  <span className='text-sm text-gray-500'>
                    Drag and drop files here, or click to select files
                  </span>
                </label>
              </div>
            </div>

            {(formData as FileElement).files?.length > 0 && (
              <div className='space-y-2'>
                <Label>Uploaded Files</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className=''></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(formData as FileElement).files.map((file, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell className='font-medium'>{file.name}</TableCell>
                          <TableCell>
                            <Badge variant='secondary' className='capitalize'>
                              {file.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                          <TableCell>
                            {format(new Date(file.uploadedAt), 'MMM d, h:mm a')}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => {
                                  const newFiles = [...(formData as FileElement).files];
                                  newFiles.splice(index, 1);
                                  setFormData((prev) => {
                                    return {
                                      ...prev,
                                      files: newFiles,
                                    };
                                  });
                                }}
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {selectedType === 'invoice' && (
          <>
            <div className='space-y-2'>
              <Label>Client Name</Label>
              <Input
                value={(formData as InvoiceElement).clientName || ''}
                onChange={(e) => {
                  return setFormData((prev) => {
                    return {
                      ...prev,
                      clientName: e.target.value,
                      type: 'invoice',
                    };
                  });
                }}
                placeholder='Enter client name'
              />
            </div>
            <div className='space-y-2'>
              <Label>Client Email</Label>
              <Input
                type='email'
                value={(formData as InvoiceElement).clientEmail || ''}
                onChange={(e) => {
                  return setFormData((prev) => {
                    return {
                      ...prev,
                      clientEmail: e.target.value,
                      type: 'invoice',
                    };
                  });
                }}
                placeholder='Enter client email'
              />
            </div>
            <div className='space-y-2'>
              <Label>Due Date</Label>
              <Input
                type='date'
                value={(formData as InvoiceElement).dueDate || ''}
                onChange={(e) => {
                  return setFormData((prev) => {
                    return {
                      ...prev,
                      dueDate: e.target.value,
                      type: 'invoice',
                    };
                  });
                }}
              />
            </div>
          </>
        )}

        {selectedType === 'custom' && (
          <div className='space-y-2'>
            <Label>Fields</Label>
            <div className='space-y-2'>
              {(formData as CustomElement).fields?.map((field, index) => {
                return (
                  <div key={index} className='flex gap-2'>
                    <Input
                      value={field.name}
                      onChange={(e) => {
                        const newFields = [...(formData as CustomElement).fields];
                        newFields[index] = { ...field, name: e.target.value };
                        setFormData((prev) => {
                          return { ...prev, fields: newFields };
                        });
                      }}
                      placeholder='Field name'
                    />
                    <Select
                      value={field.type}
                      onValueChange={(value) => {
                        const newFields = [...(formData as CustomElement).fields];
                        newFields[index] = { ...field, type: value as any };
                        setFormData((prev) => {
                          return { ...prev, fields: newFields };
                        });
                      }}
                    >
                      <SelectTrigger className='w-[120px]'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='text'>Text</SelectItem>
                        <SelectItem value='number'>Number</SelectItem>
                        <SelectItem value='date'>Date</SelectItem>
                        <SelectItem value='select'>Select</SelectItem>
                        <SelectItem value='file'>File</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        const newFields = [...(formData as CustomElement).fields];
                        newFields.splice(index, 1);
                        setFormData((prev) => {
                          return { ...prev, fields: newFields };
                        });
                      }}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                );
              })}
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setFormData((prev) => {
                    return {
                      ...prev,
                      fields: [
                        ...((prev as CustomElement).fields || []),
                        { name: '', type: 'text', required: false },
                      ],
                      type: 'custom',
                    };
                  });
                }}
              >
                Add Field
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle className='sr-only'>Add New Element</DialogTitle>
      </DialogHeader>
      <DialogContent
        className='max-w-3xl'
        onPointerDownOutside={(e) => {
          if (commentingFileIndex !== null) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className='sr-only'>Add New Element</DialogTitle>
          <DialogDescription className='sr-only'>
            Add a new element to this module
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {!selectedType ? (
            renderTypeSelection()
          ) : (
            <>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    return setSelectedType(null);
                  }}
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                </Button>
                <span className='text-sm text-gray-500'>
                  {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Element
                </span>
              </div>
              {renderTypeSpecificFields()}
            </>
          )}
          <DialogFooter>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            {selectedType && <Button type='submit'>Add Element</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ModuleDetailsDialogProps {
  selectedModule: Module | null;
  commentText: string;
  setCommentText: (value: string) => void;
  handleAddComment: () => void;
  onClose: () => void;
}

export function ModuleDetailsDialog({
  selectedModule,
  commentText,
  setCommentText,
  handleAddComment,
  onClose,
}: ModuleDetailsDialogProps) {
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [elements, setElements] = useState([
    // ... existing elements ...
  ]);

  const handleAddElement = (newElement: {
    type: 'file' | 'invoice' | 'custom';
    name: string;
    status: string;
  }) => {
    setElements((prev) => {
      return [
        ...prev,
        {
          ...newElement,
          id: Date.now().toString(),
          lastUpdated: 'Just now',
        },
      ];
    });
  };

  if (!selectedModule) return null;

  return (
    <DialogContent className='max-w-4xl h-[80vh]'>
      <div className='flex flex-col md:flex-row h-full overflow-hidden'>
        {/* Left side - module details */}
        <div className='w-full md:w-2/3 pr-0 md:pr-4 overflow-y-auto'>
          <h2 className='text-2xl mb-4'>{selectedModule.name}</h2>
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
          <div className='mt-6'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='text-sm font-medium'>Module Elements</h4>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return setShowAddElementModal(true);
                }}
                className='flex items-center gap-2'
              >
                <Plus className='h-4 w-4' />
                Add Element
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[50px]'></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Forms */}
                <TableRow>
                  <TableCell>
                    <FileText className='h-4 w-4 text-gray-500' />
                  </TableCell>
                  <TableCell>Project Requirements Form</TableCell>
                  <TableCell>Form</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>Draft</Badge>
                  </TableCell>
                  <TableCell>2 days ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <FileText className='h-4 w-4 text-gray-500' />
                  </TableCell>
                  <TableCell>Client Feedback Survey</TableCell>
                  <TableCell>Form</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>Completed</Badge>
                  </TableCell>
                  <TableCell>1 week ago</TableCell>
                </TableRow>

                {/* Invoices */}
                <TableRow>
                  <TableCell>
                    <Receipt className='h-4 w-4 text-gray-500' />
                  </TableCell>
                  <TableCell>INV-2024-001</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>Paid</Badge>
                  </TableCell>
                  <TableCell>3 days ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Receipt className='h-4 w-4 text-gray-500' />
                  </TableCell>
                  <TableCell>INV-2024-002</TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>Pending</Badge>
                  </TableCell>
                  <TableCell>1 day ago</TableCell>
                </TableRow>

                {/* Products */}
                <TableRow>
                  <TableCell>
                    <Package className='h-4 w-4 text-gray-500' />
                  </TableCell>
                  <TableCell>Premium Package</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>Active</Badge>
                  </TableCell>
                  <TableCell>2 weeks ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Package className='h-4 w-4 text-gray-500' />
                  </TableCell>
                  <TableCell>Basic Package</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>Active</Badge>
                  </TableCell>
                  <TableCell>2 weeks ago</TableCell>
                </TableRow>

                {/* Design Files */}
                <TableRow>
                  <TableCell>
                    <ImageIcon className='h-4 w-4 text-gray-500' />
                  </TableCell>
                  <TableCell>UI Mockups</TableCell>
                  <TableCell>Design</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>In Review</Badge>
                  </TableCell>
                  <TableCell>5 days ago</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <ImageIcon className='h-4 w-4 text-gray-500' />
                  </TableCell>
                  <TableCell>Brand Assets</TableCell>
                  <TableCell>Design</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>Final</Badge>
                  </TableCell>
                  <TableCell>1 week ago</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right side - comments */}
        <div className='w-full md:w-1/3 mt-4 md:mt-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col h-full p-1'>
          <h4 className='text-sm font-medium mb-2'>Comments</h4>

          <div className='flex-grow overflow-y-auto mb-4 space-y-4'>
            <p className='text-sm text-gray-500'>No comments yet</p>
          </div>

          <div className='border-t pt-4'>
            <Textarea
              placeholder='Add a comment...'
              value={commentText}
              onChange={(e) => {
                return setCommentText(e.target.value);
              }}
              className='resize-none'
              rows={3}
            />
            <div className='flex justify-end mt-2'>
              <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                <Send className='mr-2 h-4 w-4' />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddElementModal
        isOpen={showAddElementModal}
        onClose={() => {
          return setShowAddElementModal(false);
        }}
        onAdd={handleAddElement}
      />
    </DialogContent>
  );
}
