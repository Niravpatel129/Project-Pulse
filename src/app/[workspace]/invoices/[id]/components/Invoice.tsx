'use client';

import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';

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
  description: string;
  quantity: number;
  price: number;
  total: number;
  discount: number;
  tax: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientId: string;
  client?: Client | null;
  status: 'paid' | 'draft' | 'sent' | 'overdue' | 'cancelled';
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
}

interface InvoiceProps {
  invoice: Invoice;
}

export function Invoice({ invoice }: InvoiceProps) {
  const { data: invoiceSettings } = useInvoiceSettings();

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
        <div></div>
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
                    {invoice.client.address.street && <p>{invoice.client.address.street}</p>}
                    {(invoice.client.address.city ||
                      invoice.client.address.state ||
                      invoice.client.address.zip) && (
                      <p>
                        {[
                          invoice.client.address.city,
                          invoice.client.address.state,
                          invoice.client.address.zip,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    {invoice.client.address.country && <p>{invoice.client.address.country}</p>}
                    {invoice.client.phone && <p className='mt-1'>{invoice.client.phone}</p>}
                    {invoice.client.email && <p>{invoice.client.email}</p>}
                    {invoice.client.taxId && <p className='mt-1'>Tax ID: {invoice.client.taxId}</p>}
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
          <div className='bg-gray-100 rounded px-2 py-1 mt-2 inline-block font-semibold text-gray-700'>
            Amount Due (CAD): <span className='text-black'>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
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
                  <td className='py-3 px-4 text-right'>${item.total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className='flex flex-col items-end'>
        <div className='w-full max-w-md'>
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
          {invoice.paymentDate && (
            <div className='flex justify-between py-2 text-sm text-gray-500 border-b border-gray-200'>
              <span>Payment on {new Date(invoice.paymentDate).toLocaleDateString()}:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          )}
          <div className='flex justify-between py-4 text-lg font-bold'>
            <span>Amount Due (CAD):</span>
            <span>${(invoice.status === 'paid' ? 0 : invoice.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {invoice.notes && (
        <div className='mt-8 pt-8 border-t border-gray-200'>
          <h3 className='font-semibold text-gray-900 mb-2'>Notes</h3>
          <p className='text-gray-600 text-sm'>{invoice.notes}</p>
        </div>
      )}

      {/* Terms Section */}
      {invoice.terms && (
        <div className='mt-4'>
          <h3 className='font-semibold text-gray-900 mb-2'>Terms</h3>
          <p className='text-gray-600 text-sm'>{invoice.terms}</p>
        </div>
      )}
    </div>
  );
}
