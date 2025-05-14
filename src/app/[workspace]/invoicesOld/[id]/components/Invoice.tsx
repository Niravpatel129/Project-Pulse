'use client';

import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface ClientAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface Client {
  name: string;
  email: string;
  phone: string;
  address: ClientAddress;
  shippingAddress: ClientAddress;
  taxId: string;
  website: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total?: number;
  discount: number;
  tax: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  client?: Client | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'unpaid' | 'open';
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  dueDate: string;
  issueDate: string;
  createdAt: string;
  updatedAt: string;
  notes: string;
  terms: string;
  paymentMethod: string;
  paymentDate: string | null;
  currency: string;
  createdBy: string;
  requireDeposit: boolean;
  depositPercentage: number;
  teamNotes: string;
  payments?: Array<{
    _id: string;
    amount: number;
    date: string;
    method: string;
    memo?: string;
    status?: string;
  }>;
  remainingBalance?: number;
}

interface InvoiceProps {
  invoice: Invoice;
  paymentUrl?: string;
}

export function Invoice({ invoice, paymentUrl }: InvoiceProps) {
  const { data: invoiceSettings } = useInvoiceSettings();
  const params = useParams();
  const remainingBalance = invoice.remainingBalance ?? invoice.total;
  const totalPaid = invoice.total - remainingBalance;

  return (
    <div
      className='bg-white rounded-lg border border-gray-200 shadow-sm invoice-paper'
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '2.5rem 2rem',
        transform: 'scale(0.8)',
        transformOrigin: 'top center',
        margin: '-2rem auto',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
      <style>{`
        @media print {
          .invoice-paper {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 1in;
            transform: none;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
      {/* Header */}
      <div className='flex justify-between items-start mb-10'>
        <div>
          {invoiceSettings?.logo && (
            <Image
              unoptimized
              width={100}
              height={100}
              src={invoiceSettings.logo}
              alt='Company Logo'
              className='h-16 w-auto object-contain'
            />
          )}
        </div>
        <div className='text-right'>
          <h1 className='text-4xl font-semibold tracking-tight text-gray-900'>INVOICE</h1>
          <div className='mt-2'>
            <div className='font-semibold text-gray-800'>
              {invoiceSettings?.businessName || 'Your Company Name'}
            </div>
            <div className='text-gray-500 text-sm whitespace-pre-line'>
              {invoiceSettings?.businessAddress}
            </div>
            {invoiceSettings?.showTaxId && invoiceSettings?.taxId && (
              <div className='text-gray-500 text-sm mt-1'>Tax ID: {invoiceSettings.taxId}</div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className='flex justify-between items-start border-t border-b border-gray-200 py-6 mb-8'>
        <div>
          <div className='flex justify-between'>
            <div>
              <h3 className='text-sm font-medium text-gray-900'>Bill To</h3>
              <div className='mt-2 text-sm text-gray-500'>
                <p>{invoice.clientName}</p>
                {invoice.client && (
                  <>
                    {invoice?.client?.address?.street && <p>{invoice?.client?.address?.street}</p>}
                    {(invoice?.client?.address?.city ||
                      invoice?.client?.address?.state ||
                      invoice?.client?.address?.zip) && (
                      <p>
                        {[
                          invoice?.client?.address?.city,
                          invoice?.client?.address?.state,
                          invoice?.client?.address?.zip,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    {invoice?.client?.address?.country && (
                      <p>{invoice?.client?.address?.country}</p>
                    )}
                    {invoice?.client?.phone && <p className='mt-1'>{invoice?.client?.phone}</p>}
                    {invoice?.client?.email && <p>{invoice?.client?.email}</p>}
                    {invoice?.client?.taxId && (
                      <p className='mt-1'>Tax ID: {invoice?.client?.taxId}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='text-right space-y-1 text-sm'>
          <div>
            <span className='font-semibold text-gray-900'>Invoice Number:</span>{' '}
            <span className='ml-2'>{invoice.invoiceNumber}</span>
          </div>
          <div>
            <span className='font-semibold text-gray-900'>Invoice Date:</span>{' '}
            <span className='ml-2'>{new Date(invoice.issueDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className='font-semibold text-gray-900'>Payment Due:</span>{' '}
            <span className='ml-2'>{new Date(invoice.dueDate).toLocaleDateString()}</span>
          </div>
          <div className=''>
            <div className='bg-gray-100 rounded-lg px-3 py-2 inline-flex items-center font-semibold text-gray-700'>
              <span>Amount Due ({invoiceSettings?.currency || 'CAD'}):</span>
              <span className='ml-2 text-black text-lg'>${remainingBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className='mb-8 space-y-4'>
        {invoice.requireDeposit && (
          <div className='p-4 bg-blue-50 rounded-lg border border-blue-100'>
            <h3 className='font-semibold text-blue-900 mb-2 flex items-center'>
              <span className='mr-2'>💰</span>
              Deposit Information
            </h3>
            <div className='text-sm text-blue-800 space-y-2'>
              <p>A {invoice.depositPercentage}% deposit is required for this invoice.</p>
              <div className='flex justify-between items-center pt-2 border-t border-blue-200'>
                <span className='font-medium'>Deposit Amount:</span>
                <span className='font-bold'>
                  ${(invoice.total * (invoice.depositPercentage / 100)).toFixed(2)}
                </span>
              </div>
              {/* <div className='flex justify-between items-center'>
                <span className='font-medium'>Remaining Balance:</span>
                <span className='font-bold'>
                  ${(invoice.total * (1 - invoice.depositPercentage / 100)).toFixed(2)}
                </span>
              </div> */}
            </div>
          </div>
        )}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className='p-4 bg-gray-50 rounded-lg'>
            <h3 className='font-semibold text-gray-900 mb-2'>Payment Status</h3>
            <div className='space-y-2'>
              {invoice.payments.map((payment) => {
                return (
                  <div key={payment._id} className='flex justify-between items-center text-sm'>
                    <div>
                      <span className='font-medium'>
                        {new Date(payment.date).toLocaleDateString()}
                      </span>
                      <span className='text-gray-500 ml-2'>via {payment.method}</span>
                      {payment.memo && <span className='text-gray-500 ml-2'>- {payment.memo}</span>}
                    </div>
                    <div className='font-medium'>${payment.amount.toFixed(2)}</div>
                  </div>
                );
              })}
              <div className='pt-2 border-t border-gray-200 flex justify-between items-center font-medium'>
                <span>Total Paid:</span>
                <span>${totalPaid.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className='rounded-lg overflow-hidden border border-gray-200 mb-8'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-gray-700 text-white'>
              <th className='py-3 px-4 text-left font-semibold'>Items</th>
              <th className='py-3 px-4 text-center font-semibold'>Quantity</th>
              <th className='py-3 px-4 text-right font-semibold'>Price</th>
              <th className='py-3 px-4 text-right font-semibold'>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => {
              return (
                <tr key={item.id} className='border-t border-gray-200 bg-white'>
                  <td className='py-3 px-4'>{item.name}</td>
                  <td className='py-3 px-4 text-center'>{item.quantity}</td>
                  <td className='py-3 px-4 text-right'>${item.price.toFixed(2)}</td>
                  <td className='py-3 px-4 text-right'>${item.total?.toFixed(2) || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className='flex flex-col items-end'>
        <div className='w-full max-w-md'>
          <div className='space-y-2 text-sm'>
            <div className='flex justify-between py-2 text-base'>
              <span className='font-semibold text-gray-700'>Subtotal:</span>
              <span className='font-semibold text-gray-900'>${invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className='flex justify-between py-2 text-sm text-gray-500'>
                <span>Discount:</span>
                <span>-${invoice.discount.toFixed(2)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className='flex justify-between py-2 text-sm text-gray-500'>
                <span>Tax:</span>
                <span>${invoice.tax.toFixed(2)}</span>
              </div>
            )}
            {totalPaid > 0 && (
              <div className='flex justify-between py-2 text-sm text-gray-500 border-b border-gray-200'>
                <span>Total Paid:</span>
                <span>${totalPaid.toFixed(2)}</span>
              </div>
            )}
            <div className='flex justify-between py-4 text-lg font-bold'>
              <span>Amount Due ({invoiceSettings?.currency || 'CAD'}):</span>
              <span>${remainingBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(invoice.notes || invoiceSettings?.businessNotes) && (
        <div className='mt-8 border-t border-gray-200 pt-6'>
          <h3 className='font-semibold text-gray-900 mb-2'>Notes</h3>
          <div className='text-sm text-gray-600 whitespace-pre-line'>
            {invoice.notes}
            {invoice.notes && invoiceSettings?.businessNotes && <br />}
            {invoiceSettings?.businessNotes}
          </div>
        </div>
      )}
    </div>
  );
}
