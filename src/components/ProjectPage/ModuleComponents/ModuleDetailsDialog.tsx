import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DialogContent, DialogTitle } from '@/components/ui/dialog';
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
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format } from 'date-fns';
import { FileText, Package, Receipt } from 'lucide-react';
import { useState } from 'react';
import { CustomElementModal } from './CustomElementModal';
import { FileElementModal } from './FileElementModal';
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

interface ModuleDetailsDialogProps {
  selectedModule: Module | null;
  onClose: () => void;
}

export function ModuleDetailsDialog({ selectedModule, onClose }: ModuleDetailsDialogProps) {
  const [selectedElementType, setSelectedElementType] = useState<ElementType | null>(null);
  const [elements, setElements] = useState<Element[]>([]);

  const handleAddElement = (newElement: Element) => {
    setElements((prev) => {
      return [...prev, newElement];
    });
    setSelectedElementType(null);
  };

  if (!selectedModule) return null;

  return (
    <DialogContent className='max-w-4xl h-[80vh]'>
      <VisuallyHidden>
        <DialogTitle>Module Details: {selectedModule.name}</DialogTitle>
      </VisuallyHidden>
      <div className='flex flex-col md:flex-row h-full overflow-hidden'>
        {/* Left side - module details */}
        <div className='w-full overflow-y-auto'>
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
          <div className='mt-6 p-1'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='text-sm font-medium'>Module Elements</h4>
              <div className='flex items-center gap-2'>
                <Select
                  value={selectedElementType || ''}
                  onValueChange={(value) => {
                    return setSelectedElementType(value as ElementType);
                  }}
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Add Element' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='file'>File Element</SelectItem>
                    <SelectItem value='custom'>Custom Element</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                {elements.map((element, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        {element.type === 'file' && <FileText className='h-4 w-4 text-gray-500' />}
                        {element.type === 'invoice' && (
                          <Receipt className='h-4 w-4 text-gray-500' />
                        )}
                        {element.type === 'custom' && <Package className='h-4 w-4 text-gray-500' />}
                      </TableCell>
                      <TableCell>{element.name}</TableCell>
                      <TableCell className='capitalize'>{element.type}</TableCell>
                      <TableCell>
                        <Badge variant='secondary'>{element.status}</Badge>
                      </TableCell>
                      <TableCell>Just now</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <FileElementModal
        isOpen={selectedElementType === 'file'}
        onClose={() => {
          return setSelectedElementType(null);
        }}
        onAdd={handleAddElement}
      />

      <CustomElementModal
        isOpen={selectedElementType === 'custom'}
        onClose={() => {
          return setSelectedElementType(null);
        }}
        onAdd={handleAddElement}
      />
    </DialogContent>
  );
}
