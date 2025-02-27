import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ProjectFile, Template } from '@/lib/mock/projectFiles';
import { CheckCircle, Clock, FolderClock, Timer } from 'lucide-react';
import React, { useState } from 'react';

interface ProductionTrackingModalProps {
  onClose: () => void;
  files: ProjectFile[];
  templates: Template[];
  onUpdateStatus: (productionItemId: string, status: string) => void;
}

const ProductionTrackingModal: React.FC<ProductionTrackingModalProps> = ({
  onClose,
  files,
  templates,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'all' | 'awaiting_approval' | 'active' | 'paid'>('all');

  // Filter template items with production info
  const productionItems = files.filter((file) => {
    return (
      file.type === 'custom_template_item' &&
      file.templateValues?.some((value) => value.inventoryItemId)
    );
  });

  const getStatusBadge = (item: ProjectFile) => {
    const status = item.status || 'awaiting_approval';

    switch (status) {
      case 'draft':
      case 'awaiting_approval':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1'
          >
            <Clock className='h-3 w-3' />
            Pending
          </Badge>
        );
      case 'active':
      case 'sent':
      case 'viewed':
        return (
          <Badge
            variant='outline'
            className='bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1'
          >
            <Timer className='h-3 w-3' />
            In Progress
          </Badge>
        );
      case 'signed':
      case 'paid':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-200 flex items-center gap-1'
          >
            <CheckCircle className='h-3 w-3' />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant='outline' className='bg-gray-50 text-gray-700 border-gray-200'>
            {(status as string).charAt(0).toUpperCase() + (status as string).slice(1)}
          </Badge>
        );
    }
  };

  const filteredItems = productionItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'awaiting_approval')
      return item.status === 'draft' || item.status === 'awaiting_approval';
    if (filter === 'active')
      return item.status === 'active' || item.status === 'sent' || item.status === 'viewed';
    if (filter === 'paid') return item.status === 'paid' || item.status === 'signed';
    return true;
  });

  const getTemplateName = (templateId?: string) => {
    if (!templateId) return 'Unknown Template';
    const template = templates.find((t) => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FolderClock className='h-5 w-5' /> Production Tracking
          </DialogTitle>
          <DialogDescription>
            Track and manage production status of template items
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div className='flex gap-2'>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilter('all')}
              >
                All Items
              </Button>
              <Button
                variant={filter === 'awaiting_approval' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilter('awaiting_approval')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'active' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilter('active')}
              >
                In Progress
              </Button>
              <Button
                variant={filter === 'paid' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setFilter('paid')}
              >
                Completed
              </Button>
            </div>
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[250px]'>Item Name</TableHead>
                  <TableHead>Template Type</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium'>{item.name}</TableCell>
                      <TableCell>{getTemplateName(item.templateId)}</TableCell>
                      <TableCell>{new Date(item.dateUploaded).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell className='text-right'>
                        <Select
                          defaultValue={item.status || 'awaiting_approval'}
                          onValueChange={(value) => onUpdateStatus(item.id, value)}
                        >
                          <SelectTrigger className='w-[130px] h-8'>
                            <SelectValue placeholder='Change status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='awaiting_approval'>Pending</SelectItem>
                            <SelectItem value='active'>In Progress</SelectItem>
                            <SelectItem value='paid'>Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-6 text-muted-foreground'>
                      No production items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductionTrackingModal;
