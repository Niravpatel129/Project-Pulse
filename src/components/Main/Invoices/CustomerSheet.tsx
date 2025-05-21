import { AddCustomerDialog } from '@/app/customers/components/AddCustomerDialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, MapPin, PencilIcon, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CustomerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  currency: string;
}

export function CustomerSheet({
  open,
  onOpenChange,
  customerId,
  customerName,
  currency,
}: CustomerSheetProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Customer data fetch
  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const response = await newRequest.get(`/clients/${customerId}`);
      return response.data.data;
    },
    enabled: !!customerId && open,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleEditCustomer = (updatedCustomer: any) => {
    // Transform the data from the form format to API format
    const clientData = {
      user: {
        name: updatedCustomer.name,
        email: updatedCustomer.contactEmail,
      },
      phone: updatedCustomer.contactPhone,
      address: updatedCustomer.address,
      shippingAddress: updatedCustomer.shippingAddress,
      contact: {
        firstName: updatedCustomer.contactName.split(' ')[0] || '',
        lastName: updatedCustomer.contactName.split(' ').slice(1).join(' ') || '',
      },
      industry: updatedCustomer.industry,
      type: updatedCustomer.type,
      status: updatedCustomer.status,
      website: updatedCustomer.website,
      internalNotes: updatedCustomer.internalNotes,
    };

    // Update the customer
    newRequest
      .put(`/clients/${customerId}`, clientData)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
        toast.success('Customer updated successfully');
      })
      .catch((error) => {
        toast.error(error.message || 'Failed to update customer');
      });
  };

  // Transform customer data for edit dialog
  const transformCustomerForEdit = () => {
    if (!customerData) return null;

    return {
      name: customerData.user?.name || '',
      contactName: `${customerData.contact?.firstName || ''} ${
        customerData.contact?.lastName || ''
      }`.trim(),
      contactEmail: customerData.user?.email || '',
      contactPhone: customerData.phone || '',
      industry: customerData.industry || '',
      type: customerData.type || 'Individual',
      status: customerData.status || 'Active',
      address: {
        street: customerData.address?.street || '',
        city: customerData.address?.city || '',
        state: customerData.address?.state || '',
        country: customerData.address?.country || '',
        zip: customerData.address?.zip || '',
      },
      shippingAddress: {
        street: customerData.shippingAddress?.street || '',
        city: customerData.shippingAddress?.city || '',
        state: customerData.shippingAddress?.state || '',
        country: customerData.shippingAddress?.country || '',
        zip: customerData.shippingAddress?.zip || '',
      },
      website: customerData.website || '',
      internalNotes: customerData.internalNotes || '',
    };
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className='overflow-auto'>
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
            <SheetDescription>Information about {customerName || 'customer'}</SheetDescription>
          </SheetHeader>

          <div className='mt-6 space-y-6'>
            {customerLoading ? (
              <div className='text-center py-4'>Loading customer information...</div>
            ) : customerData ? (
              <>
                <div className='border border-border rounded-lg p-4 space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
                      <User className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <h3 className='text-foreground font-medium'>{customerData.user?.name}</h3>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            return setIsEditDialogOpen(true);
                          }}
                          className='h-3 w-3'
                        >
                          <PencilIcon className='h-1 w-1' />
                        </Button>
                      </div>
                      <p className='text-muted-foreground text-sm'>Primary Contact</p>
                    </div>
                  </div>

                  <Separator className='my-4' />

                  <div className='space-y-3'>
                    <div className='flex items-start space-x-3'>
                      <Mail className='h-4 w-4 text-muted-foreground mt-0.5' />
                      <div>
                        <p className='text-sm font-medium text-foreground'>
                          {customerData.user?.email}
                        </p>
                        <p className='text-xs text-muted-foreground'>Email Address</p>
                      </div>
                    </div>

                    {customerData.phone && (
                      <div className='flex items-start space-x-3'>
                        <Phone className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-foreground'>
                            {customerData.phone}
                          </p>
                          <p className='text-xs text-muted-foreground'>Phone Number</p>
                        </div>
                      </div>
                    )}

                    {customerData.address && (
                      <div className='flex items-start space-x-3'>
                        <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                        <div>
                          <p className='text-sm font-medium text-foreground'>
                            {customerData.address.street && `${customerData.address.street}, `}
                            {customerData.address.city && `${customerData.address.city}, `}
                            {customerData.address.state && `${customerData.address.state}, `}
                            {customerData.address.country && `${customerData.address.country} `}
                            {customerData.address.zip && customerData.address.zip}
                          </p>
                          <p className='text-xs text-muted-foreground'>Billing Address</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Summary for this customer */}
                <div className='border border-border rounded-lg p-4'>
                  <h3 className='text-sm font-medium mb-4'>Invoice Summary</h3>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>Total Invoices</span>
                      <span className='text-foreground text-sm font-medium'>
                        {customerData.invoiceStats?.totalInvoices || 0}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>Outstanding</span>
                      <span className='text-foreground text-sm font-medium'>
                        {customerData.invoiceStats?.outstandingAmount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || 0}{' '}
                        {currency || 'USD'}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground text-sm'>Total Paid</span>
                      <span className='text-foreground text-sm font-medium'>
                        {customerData.invoiceStats?.paidAmount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || 0}{' '}
                        {currency || 'USD'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      return onOpenChange(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <div className='text-center py-4 text-muted-foreground'>
                No customer information available
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Customer Dialog */}
      <AddCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onEdit={handleEditCustomer}
        initialData={transformCustomerForEdit()}
      />
    </>
  );
}
