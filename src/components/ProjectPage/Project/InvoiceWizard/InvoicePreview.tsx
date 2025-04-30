import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Client, InvoiceItem } from './types';

interface InvoicePreviewProps {
  selectedItems: InvoiceItem[];
  calculateSubtotal: () => number;
  calculateTotal: () => number;
  selectedClient: Client | null;
  setActiveTab: (tab: string) => void;
}

const InvoicePreview = ({
  selectedItems,
  calculateSubtotal,
  calculateTotal,
  selectedClient,
  setActiveTab,
}: InvoicePreviewProps) => {
  return (
    <div className='w-full md:w-[400px] p-4 flex flex-col overflow-y-auto'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='font-semibold'>Invoice Preview</h2>
        <Button variant='outline' className='gap-1'>
          <PlusCircle size={16} />
          <span className='hidden sm:inline'>Add Custom Item</span>
        </Button>
      </div>

      <div className='flex flex-col items-center justify-center py-10 border-b'>
        {selectedClient ? (
          <div className='w-full flex items-center gap-3 p-3 border rounded-lg'>
            <Avatar className='h-12 w-12'>
              <AvatarImage src={selectedClient.avatar || '/placeholder.svg'} />
              <AvatarFallback>{selectedClient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-medium'>{selectedClient.name}</h3>
              <p className='text-sm text-muted-foreground'>{selectedClient.company}</p>
              <p className='text-sm text-muted-foreground'>{selectedClient.email}</p>
            </div>
          </div>
        ) : (
          <>
            <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2'>
              <svg
                viewBox='0 0 24 24'
                width='24'
                height='24'
                strokeWidth='2'
                stroke='currentColor'
                fill='none'
              >
                <circle cx='12' cy='8' r='4' />
                <path d='M20 21a8 8 0 10-16 0' />
              </svg>
            </div>
            <p className='text-gray-500'>No client selected</p>
            <Button
              variant='link'
              className='mt-1'
              onClick={() => {
                return setActiveTab('client');
              }}
            >
              Select Client
            </Button>
          </>
        )}
      </div>

      <div className='mt-4'>
        <div className='flex justify-between font-medium border-b pb-2'>
          <span>Item</span>
          <div className='flex gap-8'>
            <span>Quantity</span>
            <span>Price</span>
            <span>Total</span>
          </div>
        </div>

        {selectedItems.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>No items added to invoice</div>
        ) : (
          <div className='space-y-2 mt-2'>
            {selectedItems.map((item) => {
              return (
                <div key={item.id} className='flex justify-between items-start py-2 border-b'>
                  <div className='max-w-[180px]'>
                    <div className='font-medium'>{item.name}</div>
                    {item.labels && item.labels.length > 0 && (
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {item.labels.map((label, index) => {
                          return (
                            <Badge
                              key={`${item.id}-preview-${index}`}
                              variant='outline'
                              className='text-xs px-1 py-0'
                            >
                              {label}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    {/* Show a brief summary of dynamic fields */}
                    {item.fields &&
                      Object.keys(item.fields).filter((key) => {
                        return (
                          !['unitPrice', 'quantity', 'total'].includes(key) &&
                          key in item.fields! &&
                          item.fields![key] !== null &&
                          item.fields![key] !== undefined
                        );
                      }).length > 0 && (
                        <div className='text-xs text-gray-500 mt-1 truncate'>
                          {Object.entries(item.fields)
                            .filter(([key]) => {
                              return !['unitPrice', 'quantity', 'total'].includes(key);
                            })
                            .slice(0, 2)
                            .map(([key, value]) => {
                              let displayValue = '';
                              if (typeof value === 'object' && value !== null) {
                                if (Array.isArray(value)) {
                                  displayValue = value.length > 0 ? `${value.length} items` : '';
                                } else {
                                  displayValue =
                                    Object.keys(value).length > 0
                                      ? `${Object.keys(value).length} details`
                                      : '';
                                }
                              } else if (value !== null && value !== undefined) {
                                displayValue =
                                  String(value).length > 15
                                    ? String(value).substring(0, 15) + '...'
                                    : String(value);
                              }
                              return displayValue
                                ? `${key.replace(/([A-Z])/g, ' $1').trim()}: ${displayValue}`
                                : '';
                            })
                            .filter((text) => {
                              return text;
                            })
                            .join(', ')}
                          {item.fields &&
                          Object.keys(item.fields).filter((key) => {
                            return (
                              !['unitPrice', 'quantity', 'total'].includes(key) &&
                              key in item.fields! &&
                              item.fields![key] !== null &&
                              item.fields![key] !== undefined
                            );
                          }).length > 2
                            ? '...'
                            : ''}
                        </div>
                      )}
                  </div>
                  <div className='flex gap-8 text-sm'>
                    <span>{item.fields?.quantity || item.quantity || 1}</span>
                    <span>${(item.fields?.unitPrice || item.price).toFixed(2)}</span>
                    <span>
                      $
                      {(
                        (item.fields?.quantity || item.quantity || 1) *
                        (item.fields?.unitPrice || item.price)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className='mt-auto space-y-2'>
        <div className='flex justify-between'>
          <span>Subtotal</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className='flex justify-between font-semibold'>
          <span>Total</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
      <div className='pb-24'></div>
    </div>
  );
};

export default InvoicePreview;
