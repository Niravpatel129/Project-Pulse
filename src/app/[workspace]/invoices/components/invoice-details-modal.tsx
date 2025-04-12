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
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { Invoice } from '../types';

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date';
}

export function InvoiceDetailsModal({ invoice, onClose }: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  return (
    <Dialog open={!!invoice} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>Invoice #{invoice.invoiceNumber}</span>
            <Badge
              variant={
                invoice.status === 'paid'
                  ? 'default'
                  : invoice.status === 'draft'
                  ? 'secondary'
                  : 'destructive'
              }
              className={cn(
                'transition-colors',
                invoice.status === 'paid' && 'bg-green-100 text-green-800',
                invoice.status === 'draft' && 'bg-gray-100 text-gray-800',
                invoice.status === 'overdue' && 'bg-red-100 text-red-800',
              )}
            >
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>Created on {formatDate(invoice.createdAt)}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Client Information */}
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>Client Information</h3>
            <div className='rounded-lg border p-4'>
              <div className='font-medium'>{invoice.client.name}</div>
              <div className='text-sm text-muted-foreground'>{invoice.client.email}</div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>Invoice Details</h3>
            <div className='rounded-lg border p-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-sm text-muted-foreground'>Issue Date</div>
                  <div className='font-medium'>{formatDate(invoice.createdAt)}</div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Due Date</div>
                  <div className='font-medium'>{formatDate(invoice.dueDate)}</div>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-sm text-muted-foreground'>Payment Terms</div>
                  <div className='font-medium'>{invoice.paymentTerms || 'N/A'}</div>
                </div>
                <div>
                  <div className='text-sm text-muted-foreground'>Delivery Method</div>
                  <div className='font-medium'>{invoice.deliveryMethod || 'N/A'}</div>
                </div>
              </div>
              <Separator />
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <div className='text-sm text-muted-foreground'>Subtotal</div>
                  <div className='font-medium'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: invoice.currency.toUpperCase(),
                    }).format(invoice.subtotal)}
                  </div>
                </div>
                <div className='flex justify-between'>
                  <div className='text-sm text-muted-foreground'>Tax</div>
                  <div className='font-medium'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: invoice.currency.toUpperCase(),
                    }).format(invoice.tax)}
                  </div>
                </div>
                <div className='flex justify-between pt-2'>
                  <div className='text-sm font-medium'>Total</div>
                  <div className='text-lg font-bold'>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: invoice.currency.toUpperCase(),
                    }).format(invoice.total)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          {invoice.items && invoice.items.length > 0 && (
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>Items</h3>
              <div className='rounded-lg border'>
                <div className='divide-y'>
                  {invoice.items.map((item) => {
                    return (
                      <div key={item._id} className='p-4'>
                        <div className='flex justify-between'>
                          <div>
                            <div className='font-medium'>{item.name}</div>
                          </div>
                          <div className='font-medium'>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: invoice.currency.toUpperCase(),
                            }).format(item.price)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>Notes</h3>
              <div className='rounded-lg border p-4'>
                <div className='text-sm text-muted-foreground'>{invoice.notes}</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
