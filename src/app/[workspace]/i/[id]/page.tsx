'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Invoice {
  _id: string;
  workspace: string;
  invoiceNumber: string;
  createdBy: string;
  invoiceTitle: string;
  attachments: any[];
  from: string;
  to: string;
  issueDate: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
    _id: string;
  }>;
  totals: {
    subtotal: number;
    taxAmount: number;
    vatAmount: number;
    discount: number;
    total: number;
    _id: string;
  };
  internalNote: string;
  logo: string;
  settings: {
    salesTax: {
      enabled: boolean;
      rate: number;
    };
    vat: {
      enabled: boolean;
      rate: number;
    };
    discount: {
      enabled: boolean;
      amount: number;
    };
    currency: string;
    dateFormat: string;
    decimals: string;
    _id: string;
  };
  status: string;
  paymentMethod: string;
  statusHistory: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const InvoicePage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const params = useParams();
  const invoiceId = params.id as string;

  const {
    data: invoice,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await newRequest.get<{ data: { invoice: Invoice } }>(
        `/invoices2/${invoiceId}`,
      );
      return response.data.data.invoice;
    },
    enabled: !!invoiceId,
  });
  console.log('🚀 invoice:', invoice);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPayment(true);
    }, 1000);

    return () => {
      return clearTimeout(timer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className='dotted-bg min-h-screen w-full flex items-center justify-center'>
        <div className='text-center'>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='dotted-bg min-h-screen w-full flex items-center justify-center'>
        <div className='text-center text-red-500'>Error loading invoice</div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className='dotted-bg min-h-screen w-full'>
      <div className='flex flex-col w-full max-w-full py-6 mx-auto' style={{ maxWidth: '750px' }}>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center space-x-2'>
            <Avatar className='size-5'>
              <AvatarImage src={invoice.logo} />
              <AvatarFallback>m</AvatarFallback>
            </Avatar>
            <span className='truncate text-sm'>{invoice.to}</span>
          </div>
          <Badge
            variant='outline'
            className='px-2 py-0.5 rounded-full cursor-default font-mono text-[11px] text-[#00C969] bg-[#DDF1E4] dark:text-[#00C969] dark:bg-[#00C969]/10'
          >
            <span className='line-clamp-1 truncate inline-block'>{invoice.status}</span>
          </Badge>
        </div>

        <div className='pb-24 md:pb-0'>
          <Card className='shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]'>
            <CardContent className='p-4 sm:p-6 md:p-8'>
              <AnimatePresence mode='wait'>
                {!showPayment ? (
                  <motion.div
                    key='invoice'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className='flex justify-between'>
                      <div className='mb-2'>
                        <h2 className='text-[21px] font-medium font-mono mb-1 w-fit min-w-[100px]'>
                          {invoice.invoiceTitle}
                        </h2>
                        <div className='flex flex-col gap-0.5'>
                          <div className='flex space-x-1 items-center'>
                            <div className='flex items-center flex-shrink-0 space-x-1'>
                              <span className='truncate font-mono text-[11px] text-[#878787]'>
                                Invoice No:
                              </span>
                              <span className='text-[11px] font-mono flex-shrink-0'>
                                {invoice.invoiceNumber}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className='flex space-x-1 items-center'>
                              <div className='flex items-center flex-shrink-0 space-x-1'>
                                <span className='truncate font-mono text-[11px] text-[#878787]'>
                                  Issue Date:
                                </span>
                                <span className='text-[11px] font-mono flex-shrink-0'>
                                  {new Date(invoice.issueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className='flex space-x-1 items-center'>
                              <div className='flex items-center flex-shrink-0 space-x-1'>
                                <span className='truncate font-mono text-[11px] text-[#878787]'>
                                  Due Date:
                                </span>
                                <span className='text-[11px] font-mono flex-shrink-0'>
                                  {new Date(invoice.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <img src={invoice.logo} alt={invoice.to} className='h-20 object-contain' />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 mb-4'>
                      <div>
                        <p className='text-[11px] text-[#878787] font-mono mb-2 block'>From</p>
                        <div className='font-mono leading-4'>
                          <p>
                            <span className='text-[11px]'>{invoice.from}</span>
                          </p>
                        </div>
                      </div>
                      <div className='mt-4 md:mt-0'>
                        <p className='text-[11px] text-[#878787] font-mono mb-2 block'>To</p>
                        <div className='font-mono leading-4'>
                          <p>
                            <span className='text-[11px]'>{invoice.to}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='mt-5 font-mono'>
                      <div className='grid grid-cols-[1.5fr_15%_15%_15%] gap-4 items-end relative group mb-2 w-full pb-1 border-b border-border'>
                        <div className='text-[11px] text-[#878787]'>Description</div>
                        <div className='text-[11px] text-[#878787]'>Quantity</div>
                        <div className='text-[11px] text-[#878787]'>Price</div>
                        <div className='text-[11px] text-[#878787] text-right'>Total</div>
                      </div>
                      {invoice.items.map((item) => {
                        return (
                          <div
                            key={item._id}
                            className='grid grid-cols-[1.5fr_15%_15%_15%] gap-4 items-start relative group mb-1 w-full py-1'
                          >
                            <div className='self-start'>
                              <div className='font-mono leading-4'>
                                <p>
                                  <span className='text-[11px]'>{item.description}</span>
                                </p>
                              </div>
                            </div>
                            <div className='text-[11px] self-start'>{item.quantity}</div>
                            <div className='text-[11px] self-start'>
                              {invoice.settings.currency}${item.price.toFixed(2)}
                            </div>
                            <div className='text-[11px] text-right self-start'>
                              {invoice.settings.currency}${item.total.toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className='mt-10 md:mt-12 flex justify-end mb-6 md:mb-8'>
                      <div className='w-[320px] flex flex-col'>
                        <div className='flex justify-between items-center py-1'>
                          <span className='text-[11px] text-[#878787] font-mono'>Subtotal</span>
                          <span className='text-right font-mono text-[11px] text-[#878787]'>
                            {invoice.settings.currency}${invoice.totals.subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className='flex justify-between items-center py-1'>
                          <span className='text-[11px] text-[#878787] font-mono'>Discount</span>
                          <span className='text-right font-mono text-[11px] text-[#878787]'>
                            {invoice.settings.currency}${invoice.totals.discount.toFixed(2)}
                          </span>
                        </div>
                        {invoice.settings.vat.enabled && (
                          <div className='flex justify-between items-center py-1'>
                            <span className='text-[11px] text-[#878787] font-mono'>
                              VAT ({invoice.settings.vat.rate}%)
                            </span>
                            <span className='text-right font-mono text-[11px] text-[#878787]'>
                              {invoice.settings.currency}${invoice.totals.vatAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {invoice.settings.salesTax.enabled && (
                          <div className='flex justify-between items-center py-1'>
                            <span className='text-[11px] text-[#878787] font-mono'>
                              Sales Tax ({invoice.settings.salesTax.rate}%)
                            </span>
                            <span className='text-right font-mono text-[11px] text-[#878787]'>
                              {invoice.settings.currency}${invoice.totals.taxAmount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className='flex justify-between items-center py-4 mt-2 border-t border-border'>
                          <span className='text-[11px] text-[#878787] font-mono'>Total</span>
                          <span className='text-right font-mono text-[21px]'>
                            {invoice.settings.currency}${invoice.totals.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key='payment'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='flex flex-col items-center justify-center py-12'
                  >
                    <div className='text-center mb-8'>
                      <h2 className='text-2xl font-mono mb-4'>Payment Details</h2>
                      <p className='text-[11px] text-[#878787] mb-6'>Total Amount Due</p>
                      <div className='text-4xl font-mono mb-8'>
                        {invoice.settings.currency}${invoice.totals.total.toFixed(2)}
                      </div>
                    </div>
                    <div className='w-full max-w-md space-y-4'>
                      <div className='p-4 border rounded-lg'>
                        <p className='text-[11px] text-[#878787] mb-2'>Payment Method</p>
                        <p className='font-mono'>{invoice.paymentMethod}</p>
                      </div>
                      <div className='p-4 border rounded-lg'>
                        <p className='text-[11px] text-[#878787] mb-2'>Payment Status</p>
                        <p className='font-mono text-[#00C969]'>{invoice.status}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
