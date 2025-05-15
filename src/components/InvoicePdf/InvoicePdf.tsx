'use client';

import { BusinessSettings } from '@/app/[workspace]/invoicesOld/[id]/components/BusinessSettings';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import Image from 'next/image';
import { useState } from 'react';

interface ClientAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

interface Client {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  phone: string;
  address: ClientAddress;
  shippingAddress: ClientAddress;
  contact: {
    firstName: string;
    lastName: string;
  };
  taxId: string;
  website: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  taxName: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  client: Client;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'unpaid' | 'open';
  dueDate: string;
  notes: string;
  currency: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  remainingBalance?: number;
  totalPaid?: number;
  payments?: Array<{
    _id: string;
    amount: number;
    date: string;
    method: string;
    memo?: string;
    status?: string;
  }>;
  businessInfo?: {
    name: string;
    address: string;
    taxId: string;
    showTaxId: boolean;
    logo: string | null;
    currency: string;
  };
}

interface InvoiceProps {
  invoice: Invoice;
  paymentUrl?: string;
  isReadOnly?: boolean;
}

export function InvoicePdf({ invoice, isReadOnly = false }: InvoiceProps) {
  const { data: invoiceSettings } = useInvoiceSettings();
  const remainingBalance = invoice.total;
  const [isHovering, setIsHovering] = useState(false);
  const [isBusinessSettingsOpen, setIsBusinessSettingsOpen] = useState(false);

  if (!invoice || !invoice?.items) {
    return null;
  }

  return (
    <div
      className='bg-background rounded-lg border border-border shadow-sm invoice-paper relative mx-auto'
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '2.5rem 2rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
      onMouseEnter={() => {
        return setIsHovering(true);
      }}
      onMouseLeave={() => {
        return setIsHovering(false);
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
          <div
            className={`relative p-2 rounded-lg transition-all ${
              !isReadOnly
                ? 'cursor-pointer group hover:border-2 hover:border-dashed hover:border-muted-foreground'
                : ''
            }`}
            onClick={() => {
              if (!isReadOnly) {
                return setIsBusinessSettingsOpen(true);
              }
            }}
          >
            {invoiceSettings?.logo ? (
              <Image
                unoptimized
                width={100}
                height={100}
                src={invoiceSettings.logo}
                alt='Company Logo'
                className='h-16 w-auto object-contain'
              />
            ) : (
              <div className='h-16 w-24 flex items-center justify-center'>
                <span className='text-sm text-muted-foreground'></span>
              </div>
            )}
            {!isReadOnly && (
              <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                <span className='text-xs text-muted-foreground'>Click to edit logo</span>
              </div>
            )}
          </div>
        </div>
        <div className='text-right'>
          <h1 className='text-4xl font-semibold tracking-tight text-foreground'>INVOICE</h1>
          <div className='mt-2'>
            <div className='font-semibold text-foreground'>
              {invoiceSettings?.businessName || 'Your Company Name'}
            </div>
            <div className='text-sm whitespace-pre-line text-muted-foreground'>
              {invoiceSettings?.businessAddress}
            </div>
            {invoiceSettings?.showTaxId && invoiceSettings?.taxId && (
              <div className='text-sm mt-1 text-muted-foreground'>{invoiceSettings.taxId}</div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className='flex justify-between items-start border-t border-b border-border py-6 mb-8'>
        <div>
          <div className='flex justify-between'>
            <div>
              {invoice?.client?.user?.name && (
                <>
                  <h3 className='text-sm font-medium text-foreground'>Bill To</h3>
                </>
              )}
              <div className='mt-2 text-sm text-muted-foreground'>
                <p>{invoice?.client?.user?.name}</p>
                {invoice?.client && (
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
                    {invoice?.client?.user?.email && <p>{invoice?.client?.user?.email}</p>}
                    {invoice?.client?.taxId && <p className='mt-1'>{invoice?.client?.taxId}</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='text-right space-y-1 text-sm'>
          <div>
            <span className='font-semibold text-foreground'>Invoice Number:</span>{' '}
            <span className='ml-2 text-muted-foreground'>{invoice.invoiceNumber}</span>
          </div>
          <div>
            <span className='font-semibold text-foreground'>Invoice Date:</span>{' '}
            <span className='ml-2 text-muted-foreground'>
              {new Date(invoice.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className='font-semibold text-foreground'>Payment Due:</span>{' '}
            <span className='ml-2 text-muted-foreground'>
              {new Date(invoice.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className=''>
            <div className='bg-muted rounded-lg px-3 py-2 inline-flex items-center font-semibold text-muted-foreground'>
              <span>Amount Due:</span>
              <span className='ml-2 text-lg text-foreground'>
                {remainingBalance?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {invoice?.currency || 'CAD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className='rounded-lg overflow-hidden border border-border mb-8'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-muted text-foreground'>
              <th className='py-3 px-4 text-left font-semibold'>Items</th>
              <th className='py-3 px-4 text-center font-semibold'>Quantity</th>
              <th className='py-3 px-4 text-right font-semibold'>Price</th>
              {invoice?.items?.some((item) => {
                return item.discount > 0;
              }) && <th className='py-3 px-4 text-right font-semibold'>Discount</th>}
              <th className='py-3 px-4 text-right font-semibold'>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice?.items?.map((item) => {
              // Calculate discounted amount first
              const subtotal = item.price * item.quantity;
              const discountAmount = (subtotal * (item.discount || 0)) / 100;
              const discountedAmount = subtotal - discountAmount;
              // Calculate tax amount based on the discounted amount
              const taxAmount = (discountedAmount * (item.tax || 0)) / 100;
              const itemTotal = discountedAmount + taxAmount;
              return (
                <tr key={item._id} className='border-t border-border bg-background'>
                  <td className='py-3 px-4 text-foreground'>{item.name}</td>
                  <td className='py-3 px-4 text-center text-muted-foreground'>{item.quantity}</td>
                  <td className='py-3 px-4 text-right text-muted-foreground'>
                    $
                    {item.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  {invoice.items.some((item) => {
                    return item.discount > 0;
                  }) && (
                    <td className='py-3 px-4 text-right text-muted-foreground'>
                      <div className='flex flex-col'>
                        <span>
                          $
                          {discountAmount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {item.discount > 0 && (
                          <span className='text-xs opacity-70'>
                            (
                            {item.discount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            %)
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  <td className='py-3 px-4 text-right text-muted-foreground'>
                    $
                    {itemTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
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
            <div className='flex justify-between py-2'>
              <span className='font-medium text-muted-foreground'>Subtotal:</span>
              <span className='font-medium text-foreground'>
                $
                {invoice.items
                  .reduce((sum, item) => {
                    return sum + item.price * item.quantity;
                  }, 0)
                  .toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
              </span>
            </div>

            {/* Show discount if any item has discount */}
            {invoice.items.some((item) => {
              return item.discount > 0;
            }) && (
              <div className='flex justify-between py-2'>
                <span className='font-medium text-muted-foreground'>Discount:</span>
                <span className='font-medium text-foreground'>
                  -$
                  {invoice.items
                    .reduce((sum, item) => {
                      const subtotal = item.price * item.quantity;
                      return sum + (subtotal * (item.discount || 0)) / 100;
                    }, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                </span>
              </div>
            )}

            {/* Show taxes itemized if any item has tax */}
            {(() => {
              // Get unique taxes
              const uniqueTaxes = Array.from(
                new Set(
                  invoice.items.map((item) => {
                    return `${item.tax}% ${item.taxName}`;
                  }),
                ),
              ).filter((tax) => {
                return !tax.startsWith('0%');
              });

              // Calculate tax amounts
              const taxAmounts = {};
              uniqueTaxes.forEach((taxString) => {
                const taxRate = parseFloat(taxString.split('%')[0]);
                const taxItems = invoice.items.filter((item) => {
                  return `${item.tax}% ${item.taxName}` === taxString;
                });
                const taxAmount = taxItems.reduce((sum, item) => {
                  const subtotal = item.price * item.quantity;
                  const discountAmount = (subtotal * (item.discount || 0)) / 100;
                  const discountedAmount = subtotal - discountAmount;
                  return sum + discountedAmount * (taxRate / 100);
                }, 0);
                taxAmounts[taxString] = taxAmount;
              });

              return uniqueTaxes.map((tax) => {
                return (
                  <div key={tax} className='flex justify-between py-2'>
                    <span className='font-medium text-muted-foreground'>{tax}:</span>
                    <span className='font-medium text-foreground'>
                      $
                      {taxAmounts[tax].toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                );
              });
            })()}

            <div className='flex justify-between py-2 text-base border-t border-border mt-2 pt-3'>
              <span className='font-semibold text-muted-foreground'>Total:</span>
              <span className='font-semibold text-foreground'>
                {invoice.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {invoice?.currency || 'CAD'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(invoice?.notes || invoiceSettings?.businessNotes) && (
        <div className='mt-8 border-t border-border pt-6'>
          <h3 className='font-semibold text-foreground mb-2'>Notes</h3>
          <div className='text-sm whitespace-pre-line text-muted-foreground'>
            {invoice.notes}
            {invoice.notes && invoiceSettings?.businessNotes && <br />}
            {invoiceSettings?.businessNotes}
          </div>
        </div>
      )}

      {/* Business Settings Dialog */}
      <BusinessSettings open={isBusinessSettingsOpen} onOpenChange={setIsBusinessSettingsOpen} />
    </div>
  );
}
