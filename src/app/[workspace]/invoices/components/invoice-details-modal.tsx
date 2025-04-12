import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { X } from 'lucide-react';
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
      <DialogContent className='sm:max-w-[600px] p-0 h-[90vh] flex flex-col'>
        <DialogHeader className='px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='text-base font-medium tracking-tight'>
                Invoice #{invoice.invoiceNumber}
              </DialogTitle>
              <DialogDescription className='mt-1 text-xs text-muted-foreground'>
                Created on {formatDate(invoice.createdAt)}
              </DialogDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className={cn(
                  'px-2.5 py-1 text-xs font-medium tracking-wide',
                  invoice.status === 'paid' && 'bg-green-50 text-green-700 border-green-200',
                  invoice.status === 'draft' && 'bg-gray-50 text-gray-700 border-gray-200',
                  invoice.status === 'overdue' && 'bg-red-50 text-red-700 border-red-200',
                )}
              >
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 rounded-full hover:bg-muted absolute right-0 top-0'
                onClick={onClose}
              >
                <X className='h-4 w-4' />
                <span className='sr-only'>Close</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto px-6 py-4'>
          <div className='space-y-6'>
            {/* Client Information */}
            <div className='space-y-2'>
              <h3 className='text-xs font-medium text-muted-foreground'>Client Information</h3>
              <div className='rounded-lg border bg-card p-3'>
                <div className='text-sm font-medium tracking-tight'>{invoice.client.name}</div>
                <div className='mt-1 text-xs text-muted-foreground'>{invoice.client.email}</div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className='space-y-2'>
              <h3 className='text-xs font-medium text-muted-foreground'>Invoice Details</h3>
              <div className='rounded-lg border bg-card p-3 space-y-3'>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-0.5'>
                    <div className='text-xs text-muted-foreground'>Issue Date</div>
                    <div className='text-sm font-medium tracking-tight'>
                      {formatDate(invoice.createdAt)}
                    </div>
                  </div>
                  <div className='space-y-0.5'>
                    <div className='text-xs text-muted-foreground'>Due Date</div>
                    <div className='text-sm font-medium tracking-tight'>
                      {formatDate(invoice.dueDate)}
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-0.5'>
                    <div className='text-xs text-muted-foreground'>Payment Terms</div>
                    <div className='text-sm font-medium tracking-tight'>
                      {invoice.paymentTerms || 'N/A'}
                    </div>
                  </div>
                  <div className='space-y-0.5'>
                    <div className='text-xs text-muted-foreground'>Delivery Method</div>
                    <div className='text-sm font-medium tracking-tight'>
                      {invoice.deliveryMethod || 'N/A'}
                    </div>
                  </div>
                </div>
                <Separator className='my-1' />
                <div className='space-y-1.5'>
                  <div className='flex justify-between'>
                    <div className='text-xs text-muted-foreground'>Subtotal</div>
                    <div className='text-sm font-medium tracking-tight'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: invoice.currency.toUpperCase(),
                      }).format(invoice.subtotal)}
                    </div>
                  </div>
                  <div className='flex justify-between'>
                    <div className='text-xs text-muted-foreground'>Tax</div>
                    <div className='text-sm font-medium tracking-tight'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: invoice.currency.toUpperCase(),
                      }).format(invoice.tax)}
                    </div>
                  </div>
                  <div className='flex justify-between pt-1'>
                    <div className='text-xs font-medium'>Total</div>
                    <div className='text-base font-semibold tracking-tight'>
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
                <h3 className='text-xs font-medium text-muted-foreground'>Items</h3>
                <div className='rounded-lg border bg-card divide-y'>
                  {invoice.items.map((item) => {
                    return (
                      <div key={item._id} className='p-3'>
                        <div className='flex justify-between items-center'>
                          <div className='text-sm font-medium tracking-tight'>{item.name}</div>
                          <div className='text-sm font-medium tracking-tight'>
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
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className='space-y-2'>
                <h3 className='text-xs font-medium text-muted-foreground'>Notes</h3>
                <div className='rounded-lg border bg-card p-3'>
                  <div className='text-xs text-muted-foreground leading-relaxed'>
                    {invoice.notes}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
