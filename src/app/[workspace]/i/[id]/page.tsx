'use client';
import { StripePaymentForm } from '@/components/StripePaymentForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useStripeInvoice2Payment } from '@/hooks/useStripeInvoice2Payment';
import { newRequest } from '@/utils/newRequest';
import { Elements } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
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
  customer: {
    id: string;
    name: string;
    email: string;
  };
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
  depositPercentage: number;
  requireDeposit: boolean;
  paymentIntentId: string;
  paidAt: string;
}

const formatDate = (date: string, format: string) => {
  if (!date) {
    return '';
  }

  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  if (!format) {
    return '';
  }

  return format.replace('DD', day).replace('MM', month).replace('YYYY', year.toString());
};

const formatCurrency = (amount: number, currency: string, decimals: string) => {
  const formattedAmount = decimals === 'yes' ? amount.toFixed(2) : Math.round(amount).toString();
  return `${currency}${formattedAmount}`;
};

const InvoicePage = () => {
  const [showPayment, setShowPayment] = useState(false);
  const params = useParams();
  const invoiceId = params.id as string;

  // Force light mode
  useEffect(() => {
    // Remove dark mode class
    document.documentElement.classList.remove('dark');
    // Force light color scheme
    document.documentElement.style.colorScheme = 'light';
    // Additional light mode enforcement
    document.body.classList.remove('dark');
    document.body.style.colorScheme = 'light';
    // Set meta theme-color to light
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#ffffff');
    }
    // Force background color
    document.body.style.backgroundColor = '#ffffff';
    document.documentElement.style.backgroundColor = '#ffffff';
  }, []);

  // Add script to prevent dark mode flash
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function() {
        try {
          const darkMode = localStorage.getItem('theme') === 'dark';
          if (!darkMode) {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
          }
        } catch (e) {}
      })();
    `;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

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

      const invoice = response.data.data.invoice;

      handleSelectPayment(invoice?.totals.total || 0, 'full');

      return invoice;
    },
    enabled: !!invoiceId,
  });

  const {
    stripePromise,
    clientSecret,
    paymentAmount,
    paymentStatus,
    isLoading: isPaymentLoading,
    handleSelectPayment,
    handleBackToSelection,
    setIsLoading,
  } = useStripeInvoice2Payment({
    invoiceId,
    currency: invoice?.settings?.currency || 'USD',
  });

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (invoice?.status !== 'paid') {
  //       setShowPayment(true);
  //     }
  //   }, 2000);

  //   return () => {
  //     return clearTimeout(timer);
  //   };
  // }, [invoice?.status]);

  if (isLoading) {
    return (
      <div className='dotted-bg min-h-screen w-full flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D1D1F]'></div>
          <span className='text-sm text-[#878787] font-mono'>Loading invoice...</span>
        </div>
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
    <div className='dotted-bg min-h-screen w-full bg-white'>
      <div className='flex flex-col w-full max-w-full py-6 mx-auto' style={{ maxWidth: '750px' }}>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center space-x-2'>
            <span className='truncate text-sm text-gray-900'>
              {invoice.customer?.name || invoice.to}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge
              variant='outline'
              className='px-2 py-0.5 rounded-full cursor-default font-mono text-[11px] text-[#00C969] bg-[#DDF1E4]'
            >
              <span className='line-clamp-1 truncate inline-block capitalize'>
                {invoice.status}
              </span>
            </Badge>
          </div>
        </div>

        <div className='pb-24 md:pb-0'>
          <Card className='shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] bg-white'>
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
                        <h2 className='text-[21px] font-medium font-mono mb-1 w-fit min-w-[100px] text-gray-900'>
                          {invoice.invoiceTitle}
                        </h2>
                        <div className='flex flex-col gap-0.5'>
                          <div className='flex space-x-1 items-center'>
                            <div className='flex items-center flex-shrink-0 space-x-1'>
                              <span className='truncate font-mono text-[11px] text-[#878787]'>
                                Invoice No:
                              </span>
                              <span className='text-[11px] font-mono flex-shrink-0 text-gray-900'>
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
                                <span className='text-[11px] font-mono flex-shrink-0 text-gray-900'>
                                  {formatDate(invoice?.issueDate, invoice?.settings?.dateFormat)}
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
                                <span className='text-[11px] font-mono flex-shrink-0 text-gray-900'>
                                  {formatDate(invoice?.dueDate, invoice?.settings?.dateFormat)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {invoice.logo && (
                        <Image
                          src={invoice.logo}
                          alt={invoice.to}
                          className='h-20 object-contain'
                          width={100}
                          height={100}
                        />
                      )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 mb-4'>
                      <div>
                        <p className='text-[11px] text-[#878787] font-mono mb-2 block'>From</p>
                        <div className='font-mono leading-4'>
                          <p>
                            <span className='text-[11px] text-gray-900'>{invoice.from}</span>
                          </p>
                        </div>
                      </div>
                      <div className='mt-4 md:mt-0'>
                        <p className='text-[11px] text-[#878787] font-mono mb-2 block'>To</p>
                        <div className='font-mono leading-4'>
                          <p>
                            <span className='text-[11px] text-gray-900'>{invoice.to}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='mt-5 font-mono'>
                      <div className='grid grid-cols-[1.5fr_15%_15%_15%] gap-4 items-end relative group mb-2 w-full pb-1 border-b border-gray-200'>
                        <div className='text-[11px] text-[#878787]'>Description</div>
                        <div className='text-[11px] text-[#878787]'>Quantity</div>
                        <div className='text-[11px] text-[#878787]'>Price</div>
                        <div className='text-[11px] text-[#878787] text-right'>Total</div>
                      </div>
                      {invoice?.items?.map((item) => {
                        return (
                          <div
                            key={item._id}
                            className='grid grid-cols-[1.5fr_15%_15%_15%] gap-4 items-start relative group mb-1 w-full py-1'
                          >
                            <div className='self-start'>
                              <div className='font-mono leading-4'>
                                <p>
                                  <span className='text-[11px] text-gray-900'>
                                    {item.description}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className='text-[11px] self-start text-gray-900'>
                              {item.quantity}
                            </div>
                            <div className='text-[11px] self-start text-gray-900'>
                              {formatCurrency(
                                item.price,
                                invoice.settings.currency,
                                invoice.settings.decimals,
                              )}
                            </div>
                            <div className='text-[11px] text-right self-start text-gray-900'>
                              {formatCurrency(
                                item.total,
                                invoice.settings.currency,
                                invoice.settings.decimals,
                              )}
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
                            {invoice?.totals?.subtotal !== undefined &&
                              formatCurrency(
                                invoice.totals.subtotal,
                                invoice.settings.currency,
                                invoice.settings.decimals,
                              )}
                          </span>
                        </div>
                        {invoice?.settings?.discount?.enabled && invoice?.totals?.discount > 0 && (
                          <div className='flex justify-between items-center py-1'>
                            <span className='text-[11px] text-[#878787] font-mono'>Discount</span>
                            <span className='text-right font-mono text-[11px] text-[#878787]'>
                              {formatCurrency(
                                invoice.totals.discount,
                                invoice.settings.currency,
                                invoice.settings.decimals,
                              )}
                            </span>
                          </div>
                        )}
                        {invoice?.settings?.salesTax?.enabled && invoice?.totals?.taxAmount > 0 && (
                          <div className='flex justify-between items-center py-1'>
                            <span className='text-[11px] text-[#878787] font-mono'>
                              Sales Tax ({invoice.settings.salesTax.rate}%)
                            </span>
                            <span className='text-right font-mono text-[11px] text-[#878787]'>
                              {formatCurrency(
                                invoice.totals.taxAmount,
                                invoice.settings.currency,
                                invoice.settings.decimals,
                              )}
                            </span>
                          </div>
                        )}
                        {invoice?.settings?.vat?.enabled && invoice?.totals?.vatAmount > 0 && (
                          <div className='flex justify-between items-center py-1'>
                            <span className='text-[11px] text-[#878787] font-mono'>
                              VAT ({invoice.settings.vat.rate}%)
                            </span>
                            <span className='text-right font-mono text-[11px] text-[#878787]'>
                              {formatCurrency(
                                invoice.totals.vatAmount,
                                invoice.settings.currency,
                                invoice.settings.decimals,
                              )}
                            </span>
                          </div>
                        )}
                        <div className='flex justify-between items-center py-4 mt-2 border-t border-gray-200'>
                          <span className='text-[11px] text-[#878787] font-mono'>Total</span>
                          <span className='text-right font-mono text-[21px] text-gray-900'>
                            {invoice?.totals?.total !== undefined &&
                              formatCurrency(
                                invoice.totals.total,
                                invoice.settings.currency,
                                invoice.settings.decimals,
                              )}
                          </span>
                        </div>
                        {invoice.status === 'Paid' && (
                          <button
                            onClick={() => {
                              return setShowPayment(true);
                            }}
                            className='mt-4 w-full py-2 px-4 bg-[#1D1D1F] text-white rounded-lg hover:bg-[#1D1D1F]/90 transition-colors font-mono text-sm'
                          >
                            Proceed to Payment
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key='payment'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='flex flex-col items-center justify-center py-12 min-h-[600px] bg-white'
                  >
                    <div className='text-center mb-8'>
                      <h2 className='text-2xl font-mono mb-4 text-gray-900'>Payment Details</h2>
                      {invoice.requireDeposit && (
                        <div className='mb-4'>
                          <p className='text-[11px] text-[#878787] mb-2'>Required Deposit</p>
                          <div className='text-2xl font-mono mb-2 text-gray-900'>
                            {formatCurrency(
                              (invoice.totals.total * invoice.depositPercentage) / 100,
                              invoice.settings.currency,
                              invoice.settings.decimals,
                            )}
                          </div>
                          <p className='text-[11px] text-[#878787]'>
                            {invoice.depositPercentage}% of total
                          </p>
                        </div>
                      )}
                      <p className='text-[11px] text-[#878787] mb-6'>Total Amount Due</p>
                      <div className='text-4xl font-mono mb-8 text-gray-900'>
                        {formatCurrency(
                          invoice.totals.total,
                          invoice.settings.currency,
                          invoice.settings.decimals,
                        )}
                      </div>
                      <button
                        onClick={() => {
                          return setShowPayment(false);
                        }}
                        className='mb-8 text-[#1D1D1F] hover:text-[#1D1D1F]/80 transition-colors font-mono text-sm flex items-center gap-2 mx-auto'
                      >
                        <svg
                          stroke='currentColor'
                          fill='currentColor'
                          strokeWidth='0'
                          viewBox='0 0 24 24'
                          height='1em'
                          width='1em'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path fill='none' d='M0 0h24v24H0z'></path>
                          <path d='M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z'></path>
                        </svg>
                        Back to Invoice
                      </button>
                    </div>
                    <div className='w-full max-w-md space-y-4'>
                      {clientSecret && stripePromise && (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret,
                            appearance: {
                              theme: 'flat',
                              variables: {
                                colorPrimary: '#1D1D1F',
                                colorBackground: '#FFFFFF',
                                colorText: '#1D1D1F',
                                colorDanger: '#FF3B30',
                                fontFamily:
                                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                spacingUnit: '4px',
                                borderRadius: '12px',
                              },
                              rules: {
                                '.Tab': {
                                  border: '1px solid #E4E4E7',
                                  borderRadius: '8px',
                                },
                                '.Tab:hover': {
                                  color: 'var(--colorText)',
                                },
                                '.Tab--selected': {
                                  borderColor: '#1D1D1F',
                                  backgroundColor: 'rgba(29, 29, 31, 0.1)',
                                },
                                '.TabIcon': {
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                },
                                '.TabLabel': {
                                  fontWeight: '500',
                                },
                                '.Input': {
                                  border: '1px solid #E4E4E7',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  backgroundColor: '#FFFFFF',
                                },
                                '.Input:focus': {
                                  borderColor: '#1D1D1F',
                                  boxShadow: '0 0 0 1px #1D1D1F',
                                },
                                '.Input--invalid': {
                                  borderColor: '#FF3B30',
                                },
                                '.Input--invalid:focus': {
                                  boxShadow: '0 0 0 1px #FF3B30',
                                },
                                '.AccordionItem': {
                                  border: '1px solid #E4E4E7',
                                  borderRadius: '12px',
                                  marginBottom: '8px',
                                  backgroundColor: '#FFFFFF',
                                },
                                '.AccordionItemButton': {
                                  padding: '16px',
                                  fontWeight: '500',
                                  color: '#1D1D1F',
                                },
                                '.AccordionItemButton:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                },
                                '.AccordionItemButton:focus': {
                                  boxShadow: 'none',
                                  outline: 'none',
                                },
                                '.AccordionItemContent': {
                                  padding: '16px',
                                  borderTop: '1px solid #E4E4E7',
                                },
                              },
                            },
                          }}
                        >
                          <StripePaymentForm
                            clientSecret={clientSecret}
                            invoice={invoice}
                            onBack={handleBackToSelection}
                            setIsLoading={setIsLoading}
                          />
                        </Elements>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
        <div
          className='fixed inset-x-0 -bottom-1 flex justify-center'
          style={{ opacity: 1, filter: 'blur(0px)', transform: 'translateY(-24px)' }}
        >
          <div className='backdrop-filter backdrop-blur-lg bg-[#F6F6F3]/80 rounded-full pl-2 pr-4 py-3 h-10 flex items-center justify-center border-[0.5px] border-gray-200'>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={async () => {
                      try {
                        const response = await newRequest.get(`/invoices2/${invoiceId}/download`, {
                          responseType: 'blob',
                        });

                        // Create a blob from the PDF data
                        const pdfBlob = new Blob([response.data], {
                          type: 'application/pdf',
                        });

                        // Create a URL for the blob
                        const url = window.URL.createObjectURL(pdfBlob);

                        // Open PDF in new window
                        const printWindow = window.open(url, '_blank');

                        // Wait for the PDF to load then print
                        if (printWindow) {
                          printWindow.onload = () => {
                            printWindow.print();
                          };
                        }

                        // Clean up the URL object after printing
                        setTimeout(() => {
                          window.URL.revokeObjectURL(url);
                        }, 1000);
                      } catch (error) {
                        console.error('Error printing PDF:', error);
                      }
                    }}
                    className='inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-[#f2efee] hover:text-accent-foreground rounded-full size-8'
                  >
                    <svg
                      stroke='currentColor'
                      fill='currentColor'
                      strokeWidth='0'
                      viewBox='0 0 24 24'
                      className='size-[18px]'
                      height='1em'
                      width='1em'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path fill='none' d='M0 0h24v24H0z'></path>
                      <path d='M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zm-1-4-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5 5-5z'></path>
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download Invoice</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={async () => {
                      try {
                        const response = await newRequest.get(`/invoices2/${invoiceId}/download`, {
                          responseType: 'blob',
                        });

                        // Create a blob from the PDF data
                        const pdfBlob = new Blob([response.data], {
                          type: 'application/pdf',
                        });

                        // Create a URL for the blob
                        const url = window.URL.createObjectURL(pdfBlob);

                        // Open PDF in new window
                        const printWindow = window.open(url, '_blank');

                        // Wait for the PDF to load then print
                        if (printWindow) {
                          printWindow.onload = () => {
                            printWindow.print();
                          };
                        }

                        // Clean up the URL object after printing
                        setTimeout(() => {
                          window.URL.revokeObjectURL(url);
                        }, 1000);
                      } catch (error) {
                        console.error('Error printing PDF:', error);
                      }
                    }}
                    className='inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 hover:bg-[#f2efee] hover:text-accent-foreground rounded-full size-8'
                  >
                    <svg
                      stroke='currentColor'
                      fill='currentColor'
                      strokeWidth='0'
                      viewBox='0 0 24 24'
                      height='1em'
                      width='1em'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path fill='none' d='M0 0h24v24H0z'></path>
                      <path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'></path>
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print Invoice</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
