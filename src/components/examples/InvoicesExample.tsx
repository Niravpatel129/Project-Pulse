'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoices } from '@/contexts';
import { useEffect } from 'react';

export function InvoicesExample() {
  const {
    invoices,
    isLoading,
    error,
    loadInvoices,
    createInvoice,
    deleteInvoice,
    markAsPaid,
    filterInvoicesByStatus,
    clearFilters,
  } = useInvoices();

  useEffect(() => {
    // Load invoices when component mounts
    loadInvoices();
  }, [loadInvoices]);

  const handleCreateInvoice = async () => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14); // Due in 14 days

    const newInvoice = {
      invoiceNumber: `INV-${Date.now().toString().substring(7)}`,
      clientId: 'client-1',
      clientName: 'Test Client',
      issueDate: today.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
      items: [
        {
          id: `item-${Date.now()}`,
          description: 'Example service',
          quantity: 1,
          unitPrice: 99.99,
          total: 99.99,
        },
      ],
      subtotal: 99.99,
      total: 99.99,
      createdBy: 'current-user',
    };

    await createInvoice(newInvoice);
  };

  const handleFilterByStatus = async (status: string) => {
    await filterInvoicesByStatus(status);
  };

  const handleClearFilters = async () => {
    await clearFilters();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-gray-200 text-gray-800' },
      sent: { label: 'Sent', className: 'bg-blue-200 text-blue-800' },
      paid: { label: 'Paid', className: 'bg-green-200 text-green-800' },
      overdue: { label: 'Overdue', className: 'bg-red-200 text-red-800' },
      cancelled: { label: 'Cancelled', className: 'bg-yellow-200 text-yellow-800' },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-200 text-gray-800',
    };

    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  if (error) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-red-500'>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Invoices Example</CardTitle>
        <CardDescription>This component demonstrates using the InvoicesContext</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 mb-4'>
          <Button onClick={handleCreateInvoice}>Create Invoice</Button>
          <Button variant='outline' onClick={() => {return handleFilterByStatus('draft')}}>
            Show Drafts
          </Button>
          <Button variant='outline' onClick={() => {return handleFilterByStatus('sent')}}>
            Show Sent
          </Button>
          <Button variant='outline' onClick={() => {return handleFilterByStatus('paid')}}>
            Show Paid
          </Button>
          <Button variant='outline' onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Invoices ({invoices.length})</h3>
            {invoices.length === 0 ? (
              <p className='text-muted-foreground'>No invoices found</p>
            ) : (
              <ul className='space-y-2'>
                {invoices.map((invoice) => {return (
                  <li key={invoice.id} className='p-3 border rounded-md'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <h4 className='font-medium'>{invoice.invoiceNumber}</h4>
                        <p className='text-sm text-muted-foreground'>
                          Client: {invoice.clientName} | Total: ${invoice.total}
                        </p>
                        <div className='flex items-center gap-2 mt-1'>
                          {getStatusBadge(invoice.status)}
                          <span className='text-xs text-muted-foreground'>
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        {invoice.status !== 'paid' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {return markAsPaid(invoice.id)}}
                          >
                            Mark as Paid
                          </Button>
                        )}
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => {return deleteInvoice(invoice.id)}}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                )})}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
