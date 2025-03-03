import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InventoryItem } from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import { Box, Calendar, CheckSquare, Package, Tag } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface InventoryItemModalProps {
  item: InventoryItem;
  onClose: () => void;
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ item, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' /> Inventory Item
          </DialogTitle>
          <DialogDescription>Viewing details for {item.name}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Product header with image */}
          <div className='flex flex-col sm:flex-row gap-4'>
            {item.imageUrl && (
              <div className='w-full sm:w-1/3'>
                <div className='border rounded-md overflow-hidden'>
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={300}
                    height={300}
                    className='w-full h-auto object-cover'
                  />
                </div>
              </div>
            )}
            <div className={`w-full ${item.imageUrl ? 'sm:w-2/3' : ''}`}>
              <h2 className='text-xl font-semibold'>{item.name}</h2>
              <div className='flex items-center gap-2 mt-1'>
                <Tag className='h-4 w-4 text-gray-500' />
                <span className='text-sm text-gray-600'>{item.sku}</span>
              </div>
              <div className='flex flex-wrap gap-2 mt-2'>
                <span className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full'>
                  Stock: {item.stock}
                </span>
                <span className='px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full'>
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <p className='mt-2 text-sm text-gray-600'>{item.description}</p>
            </div>
          </div>

          {/* Item details */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium border-b pb-2'>Item Details</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Box className='h-4 w-4 text-gray-500' />
                  <span className='text-sm font-medium'>Category</span>
                </div>
                <p className='text-sm ml-6'>{item.category}</p>
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-gray-500' />
                  <span className='text-sm font-medium'>Date Added</span>
                </div>
                <p className='text-sm ml-6'>{format(new Date(item.dateAdded), 'MMM d, yyyy')}</p>
              </div>
              {item.lastUpdated && (
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4 text-gray-500' />
                    <span className='text-sm font-medium'>Last Updated</span>
                  </div>
                  <p className='text-sm ml-6'>
                    {format(new Date(item.lastUpdated), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {/* Attributes */}
            {item.attributes && Object.keys(item.attributes).length > 0 && (
              <div className='space-y-2'>
                <h3 className='text-sm font-medium border-b pb-2'>Attributes</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                  {Object.entries(item.attributes).map(([key, value]) => (
                    <div key={key} className='flex items-start'>
                      <CheckSquare className='h-4 w-4 text-gray-500 mt-0.5 mr-2' />
                      <div>
                        <span className='text-sm font-medium capitalize'>{key}</span>
                        <p className='text-sm text-gray-600'>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryItemModal;
