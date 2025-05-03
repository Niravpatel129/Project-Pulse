import { Button } from '@/components/ui/button';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { format } from 'date-fns';
import { AlertCircleIcon, BuildingIcon, CheckIcon, CreditCardIcon, MailIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InvoiceResponse {
  project: {
    _id: string;
    name: string;
    state: string;
  };
  invoice: {
    _id: string;
    invoiceNumber: string;
    status: string;
    dueDate: string;
    createdAt: string;
    selectedClient: {
      name: string;
      email: string;
    };
    subtotal: number;
    total: number;
    workspaceSettings?: {
      taxes?: any[];
      currency?: string;
      shippingMethods?: any[];
    };
  };
  workspaceSettings: {
    taxes: any[];
    currency: string;
    shippingMethods: any[];
  };
}

export default function ProjectInvoiceStatus() {
  const { project } = useProject();
  const [invoiceData, setInvoiceData] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoiceData = async () => {
    if (!project?._id) return;
    setLoading(true);
    try {
      const response = await newRequest.get(`/project-invoices/${project?._id}`);
      const data = await response.data.data;
      setInvoiceData(data);
    } catch (error) {
      console.error('Failed to fetch invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [project?._id]);

  const handleMarkAsPaid = async () => {
    if (!invoiceData?.invoice?._id) return;
    try {
      await newRequest.patch(`/project-invoices/${invoiceData.invoice._id}/mark-paid`);
      fetchInvoiceData(); // Refresh data
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
    }
  };

  const handleResendInvoice = async () => {
    if (!invoiceData?.invoice?._id) return;
    try {
      await newRequest.post(`/project-invoices/${invoiceData.invoice._id}/resend`);
      // Optionally show a success message
    } catch (error) {
      console.error('Failed to resend invoice:', error);
    }
  };

  if (loading) {
    return <div className='p-4 text-center text-gray-500'>Loading invoice data...</div>;
  }

  if (!invoiceData?.invoice) {
    return <div className='p-4 text-center text-gray-500'>No invoice found for this project.</div>;
  }

  const { invoice } = invoiceData;
  const isPaid = invoice.status === 'paid';
  const sentDate = invoice.createdAt ? format(new Date(invoice.createdAt), 'M/d/yyyy') : 'N/A';
  const dueDate = invoice.dueDate ? format(new Date(invoice.dueDate), 'M/d/yyyy') : 'N/A';
  const currency = invoiceData.workspaceSettings?.currency || 'usd';
  const currencySymbol = currency === 'cad' ? 'C$' : '$';

  return (
    <div className='space-y-6'>
      {/* Invoice Status Header */}
      <div className='pb-2'>
        <h3 className='text-xl font-medium text-gray-900'>Invoice Status</h3>
        <p className='text-sm text-gray-500 mt-1'>Sent on {sentDate}</p>
      </div>

      {/* Status Alert */}
      <div
        className={`${
          isPaid ? 'bg-green-50/70 border-green-100' : 'bg-amber-50/70 border-amber-100'
        } border p-3.5 rounded-md`}
      >
        <div className='flex items-start gap-2.5'>
          <AlertCircleIcon
            className={`h-4 w-4 ${
              isPaid ? 'text-green-500' : 'text-amber-500'
            } mt-0.5 flex-shrink-0`}
          />
          <div>
            <p className={`text-sm font-medium ${isPaid ? 'text-green-800' : 'text-amber-800'}`}>
              {isPaid ? 'Payment Received' : 'Awaiting Payment'}
            </p>
            <p
              className={`text-xs ${
                isPaid ? 'text-green-700' : 'text-amber-700'
              } mt-1 leading-relaxed`}
            >
              {isPaid
                ? `Invoice #${invoice.invoiceNumber} has been paid.`
                : `Invoice #${invoice.invoiceNumber} was sent to ${invoice.selectedClient.email}. Payment is due by ${dueDate}.`}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div>
        <h4 className='text-sm font-medium text-gray-700 mb-2.5'>Invoice Details</h4>
        <div className='space-y-1'>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Total Project Value:</span>
            <span className='font-medium text-gray-900'>
              {currencySymbol}
              {invoice.total?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Amount Due Now:</span>
            <span className='font-medium text-gray-900'>
              {currencySymbol}
              {invoice.total?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Invoice Date:</span>
            <span className='font-medium text-gray-900'>{sentDate}</span>
          </div>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Due Date:</span>
            <span className='font-medium text-gray-900'>{dueDate}</span>
          </div>
          <div className='flex justify-between py-1.5 text-sm'>
            <span className='text-gray-500'>Client Email:</span>
            <span className='font-medium text-gray-900'>{invoice.selectedClient.email}</span>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div>
        <h4 className='text-sm font-medium text-gray-700 mb-2.5'>Available Payment Options</h4>
        <div className='space-y-2'>
          <div className='flex justify-between items-center border border-gray-200 rounded-md p-3'>
            <div className='flex items-center gap-2'>
              <CreditCardIcon className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-700'>Credit Card</span>
            </div>
            <span className='text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500'>Preferred</span>
          </div>
          <div className='flex justify-between items-center border border-gray-200 rounded-md p-3'>
            <div className='flex items-center gap-2'>
              <BuildingIcon className='h-4 w-4 text-gray-400' />
              <span className='text-sm text-gray-700'>Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='space-y-2 pt-1'>
        {!isPaid && (
          <Button
            className='w-full h-9 bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-medium'
            onClick={handleMarkAsPaid}
          >
            <CheckIcon className='h-3.5 w-3.5 mr-1.5' />
            Mark as Paid
          </Button>
        )}
        <Button
          variant='outline'
          className='w-full h-9 text-sm font-medium'
          onClick={handleResendInvoice}
        >
          <MailIcon className='h-3.5 w-3.5 mr-1.5' />
          Resend Invoice
        </Button>
      </div>

      {/* Payment Checklist */}
      <div className='pt-2'>
        <h4 className='text-sm font-medium text-gray-700 mb-1.5'>Payment Checklist</h4>
        <p className='text-xs text-gray-500 mb-3'>Track payment progress</p>

        <div className='space-y-3'>
          <div className='flex items-start gap-2'>
            <div className='flex-shrink-0 pt-0.5'>
              <div className='h-4 w-4 rounded-sm bg-blue-600 flex items-center justify-center'>
                <CheckIcon className='h-2.5 w-2.5 text-white' />
              </div>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Invoice sent to client</p>
              <p className='text-xs text-gray-500 mt-0.5'>Sent on {sentDate}</p>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <div className='flex-shrink-0 pt-0.5'>
              {invoice.status === 'viewed' || isPaid ? (
                <div className='h-4 w-4 rounded-sm bg-blue-600 flex items-center justify-center'>
                  <CheckIcon className='h-2.5 w-2.5 text-white' />
                </div>
              ) : (
                <div className='h-4 w-4 rounded-sm border border-gray-300'></div>
              )}
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Client viewed invoice</p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {invoice.status === 'viewed' || isPaid
                  ? 'Invoice has been viewed'
                  : 'Waiting for client to view'}
              </p>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <div className='flex-shrink-0 pt-0.5'>
              {isPaid ? (
                <div className='h-4 w-4 rounded-sm bg-blue-600 flex items-center justify-center'>
                  <CheckIcon className='h-2.5 w-2.5 text-white' />
                </div>
              ) : (
                <div className='h-4 w-4 rounded-sm border border-gray-300'></div>
              )}
            </div>
            <div>
              <p className='text-sm font-medium text-gray-700'>Payment received</p>
              <p className='text-xs text-gray-500 mt-0.5'>
                {isPaid ? 'Payment has been received' : `Due by ${dueDate}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
