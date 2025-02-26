import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InventoryItem } from '@/lib/mock/projectFiles';
import { BarChart, Download, Package, PackageCheck, PackageX, Printer } from 'lucide-react';
import React, { useState } from 'react';

interface InventoryUsageReport {
  item: InventoryItem;
  usageCount: number;
  projectCount: number;
  projects: string[];
}

interface InventoryReportModalProps {
  inventoryItems: InventoryItem[];
  usageReports: InventoryUsageReport[];
  onClose: () => void;
}

const InventoryReportModal: React.FC<InventoryReportModalProps> = ({
  inventoryItems,
  usageReports,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'low' | 'used'>('all');

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  const getStockStatusClass = (stock: number) => {
    if (stock <= 0) return 'text-red-500 bg-red-50';
    if (stock < 10) return 'text-amber-500 bg-amber-50';
    return 'text-green-500 bg-green-50';
  };

  const getStockIcon = (stock: number) => {
    if (stock <= 0) return <PackageX className='h-4 w-4' />;
    if (stock < 10) return <Package className='h-4 w-4' />;
    return <PackageCheck className='h-4 w-4' />;
  };

  const filteredItems = usageReports.filter((report) => {
    if (filter === 'low') return report.item.stock < 10;
    if (filter === 'used') return report.usageCount > 0;
    return true;
  });

  // Calculate summary stats
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter((item) => item.stock < 10).length;
  const outOfStockItems = inventoryItems.filter((item) => item.stock <= 0).length;
  const itemsWithUsage = usageReports.filter((report) => report.usageCount > 0).length;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <BarChart className='h-5 w-5' /> Inventory Usage Report
          </DialogTitle>
          <DialogDescription>
            Track inventory levels and usage across your projects
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Summary cards */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-blue-50 rounded-lg p-4 text-center'>
              <Package className='h-5 w-5 mx-auto mb-2 text-blue-500' />
              <div className='text-2xl font-bold text-blue-600'>{totalItems}</div>
              <div className='text-sm text-blue-700'>Total Items</div>
            </div>
            <div className='bg-amber-50 rounded-lg p-4 text-center'>
              <Package className='h-5 w-5 mx-auto mb-2 text-amber-500' />
              <div className='text-2xl font-bold text-amber-600'>{lowStockItems}</div>
              <div className='text-sm text-amber-700'>Low Stock</div>
            </div>
            <div className='bg-red-50 rounded-lg p-4 text-center'>
              <PackageX className='h-5 w-5 mx-auto mb-2 text-red-500' />
              <div className='text-2xl font-bold text-red-600'>{outOfStockItems}</div>
              <div className='text-sm text-red-700'>Out of Stock</div>
            </div>
            <div className='bg-green-50 rounded-lg p-4 text-center'>
              <Package className='h-5 w-5 mx-auto mb-2 text-green-500' />
              <div className='text-2xl font-bold text-green-600'>{itemsWithUsage}</div>
              <div className='text-sm text-green-700'>Items Used</div>
            </div>
          </div>

          {/* Filter buttons */}
          <div className='flex gap-2 pb-2'>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('all')}
            >
              All Items
            </Button>
            <Button
              variant={filter === 'low' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('low')}
            >
              Low Stock
            </Button>
            <Button
              variant={filter === 'used' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('used')}
            >
              Used Items
            </Button>
            <div className='ml-auto'>
              <Button variant='outline' size='sm' className='flex items-center gap-1'>
                <Printer className='h-4 w-4' />
                Print
              </Button>
              <Button variant='outline' size='sm' className='flex items-center gap-1 ml-2'>
                <Download className='h-4 w-4' />
                Export
              </Button>
            </div>
          </div>

          {/* Inventory table */}
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[250px]'>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((report) => (
                    <TableRow key={report.item.id}>
                      <TableCell className='font-medium'>
                        <div className='flex items-center gap-2'>
                          {report.item.imageUrl ? (
                            <img
                              src={report.item.imageUrl}
                              alt={report.item.name}
                              className='h-8 w-8 rounded-md object-cover border'
                            />
                          ) : (
                            <Package className='h-5 w-5 text-gray-400' />
                          )}
                          <span>{report.item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{report.item.sku}</TableCell>
                      <TableCell>${report.item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStockStatusClass(
                              report.item.stock,
                            )}`}
                          >
                            {getStockIcon(report.item.stock)}
                            {report.item.stock} - {getStockStatus(report.item.stock)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            report.usageCount > 0 ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        >
                          {report.usageCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            report.projectCount > 0 ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        >
                          {report.projectCount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-6 text-muted-foreground'>
                      No items match the current filter
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

export default InventoryReportModal;
