'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import type { Payment } from '@/types/invoice';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Download, Mail, Monitor, Moon, Printer, Share2, Smartphone, Sun } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function InvoiceSkeleton() {
  return (
    <div className='w-full min-h-screen bg-white dark:bg-[#141414]'>
      {/* Sticky Banner Skeleton */}
      <div className='sticky top-0 z-50 bg-white/80 dark:bg-[#181818] border-b border-gray-200 dark:border-[#232428] shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-6 w-20' />
            </div>
            <div className='flex items-center space-x-2'>
              {[...Array(6)].map((_, i) => {
                return <Skeleton key={i} className='h-9 w-9 rounded-md' />;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className='max-w-7xl mx-auto p-6'>
        <div className='bg-white dark:bg-[#181818] rounded-lg shadow-lg p-8 border border-gray-200 dark:border-[#232428]'>
          {/* Header with Business Info Skeleton */}
          <div className='flex justify-between items-start mb-8'>
            <div className='space-y-4'>
              <Skeleton className='h-16 w-32' />
              <div className='space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-64' />
                <Skeleton className='h-4 w-40' />
              </div>
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-4 w-32' />
            </div>
          </div>

          {/* Client Information Skeleton */}
          <div className='grid grid-cols-2 gap-8 mb-8'>
            <div className='space-y-4'>
              <Skeleton className='h-6 w-24' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-4 w-48' />
                <Skeleton className='h-4 w-36' />
                <Skeleton className='h-4 w-32' />
              </div>
            </div>
            <div className='space-y-4'>
              <Skeleton className='h-6 w-32' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-4 w-48' />
                <Skeleton className='h-4 w-36' />
                <Skeleton className='h-4 w-32' />
              </div>
            </div>
          </div>

          {/* Items Table Skeleton */}
          <div className='mb-8'>
            <Skeleton className='h-6 w-20 mb-4' />
            <div className='space-y-4'>
              {[...Array(3)].map((_, i) => {
                return (
                  <div key={i} className='grid grid-cols-5 gap-4'>
                    <Skeleton className='h-12 col-span-2' />
                    <Skeleton className='h-12' />
                    <Skeleton className='h-12' />
                    <Skeleton className='h-12' />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals Skeleton */}
          <div className='flex justify-end'>
            <div className='w-64 space-y-2'>
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-8 w-full' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  const { id } = useParams();
  const [isMobileView, setIsMobileView] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('light');
  const { data: invoiceSettings } = useInvoiceSettings();

  useEffect(() => {
    // Set initial theme to light
    setLocalTheme('light');
  }, []);

  const { data: invoice } = useQuery<Payment>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await newRequest.get(`/payments/${id}`);
      return res.data.data;
    },
  });

  if (!invoice) {
    return <InvoiceSkeleton />;
  }

  const {
    amount,
    date,
    method,
    paymentNumber,
    remainingBalance,
    status,
    invoice: invoiceData,
  } = invoice;

  const handleDownload = async () => {
    try {
      const response = await newRequest.get(`/payments/${id}/download`, {
        responseType: 'blob',
      });

      // Create a blob from the PDF Stream
      const file = new Blob([response.data], { type: 'application/pdf' });

      // Create a URL for the blob
      const fileURL = window.URL.createObjectURL(file);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `Invoice-${invoiceData.invoiceNumber}.pdf`;

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    const subject = `Invoice ${invoiceData.invoiceNumber} from ${
      invoiceSettings?.businessName || 'Your Company'
    }`;
    const body = `Please find attached the invoice ${
      invoiceData.invoiceNumber
    }.\n\nAmount: ${amount.toFixed(2)} ${invoiceData.currency}\nDue Date: ${format(
      new Date(invoiceData.dueDate),
      'PPP',
    )}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body,
    )}`;
    window.open(mailtoLink);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Invoice ${invoiceData.invoiceNumber}`,
          text: `Invoice ${invoiceData.invoiceNumber} from ${
            invoiceSettings?.businessName || 'Your Company'
          }`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareUrl = window.location.href;
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(console.error);
    }
  };

  const toggleTheme = () => {
    setLocalTheme(localTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`w-full min-h-screen ${localTheme === 'light' ? 'bg-white' : 'bg-[#141414]'}`}>
      {/* Sticky Banner */}
      <div
        className={`sticky top-0 z-50 ${
          localTheme === 'light' ? 'bg-white/80' : 'bg-[#181818]'
        } border-b ${
          localTheme === 'light' ? 'border-gray-200' : 'border-[#232428]'
        } shadow-sm print:hidden`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <h1
                className={`font-semibold ${
                  localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                } ${isMobileView ? 'text-base' : 'text-lg'}`}
              >
                Invoice {invoiceData.invoiceNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'completed'
                    ? localTheme === 'light'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-green-500/10 text-green-500'
                    : status === 'pending'
                    ? localTheme === 'light'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-yellow-500/10 text-yellow-500'
                    : localTheme === 'light'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-red-500/10 text-red-500'
                } ${isMobileView ? 'text-xs' : 'text-sm'}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                onClick={toggleTheme}
                variant='ghost'
                size='icon'
                className='text-muted-foreground hover:text-foreground'
                title={localTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {localTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
              <Button
                onClick={() => {
                  return setIsMobileView(!isMobileView);
                }}
                variant='ghost'
                size='icon'
                className='text-muted-foreground hover:text-foreground'
                title={isMobileView ? 'Desktop View' : 'Mobile View'}
              >
                {isMobileView ? <Monitor size={20} /> : <Smartphone size={20} />}
              </Button>
              <Button
                onClick={handleDownload}
                variant='ghost'
                size='icon'
                className='text-muted-foreground hover:text-foreground'
                title='Download'
              >
                <Download size={20} />
              </Button>
              <Button
                onClick={() => {
                  return setShowEmailModal(true);
                }}
                variant='ghost'
                size='icon'
                className='text-muted-foreground hover:text-foreground'
                title='Send via Email'
              >
                <Mail size={20} />
              </Button>
              <Button
                onClick={handlePrint}
                variant='ghost'
                size='icon'
                className='text-muted-foreground hover:text-foreground'
                title='Print'
              >
                <Printer size={20} />
              </Button>
              <Button
                onClick={handleShare}
                variant='ghost'
                size='icon'
                className='text-muted-foreground hover:text-foreground'
                title='Share'
              >
                <Share2 size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`max-w-7xl mx-auto p-6 ${
          isMobileView ? 'max-w-md' : ''
        } print:p-0 print:max-w-none`}
      >
        <div
          className={`${
            localTheme === 'light' ? 'bg-white' : 'bg-[#181818]'
          } rounded-lg shadow-lg p-8 border ${
            localTheme === 'light' ? 'border-gray-200' : 'border-[#232428]'
          } print:shadow-none print:border-none print:p-4`}
        >
          {/* Header with Business Info */}
          <div className='flex justify-between items-start mb-8 print:mb-4'>
            <div>
              {invoiceSettings?.logo && (
                <div className='mb-4 print:mb-2'>
                  <Image
                    unoptimized
                    width={100}
                    height={100}
                    src={invoiceSettings.logo}
                    alt='Company Logo'
                    className={`object-contain ${isMobileView ? 'h-12' : 'h-16'} print:h-12`}
                  />
                </div>
              )}
              <div
                className={`${
                  localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                } print:text-sm`}
              >
                <p
                  className={`font-semibold ${
                    localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                  } ${isMobileView ? 'text-base' : 'text-lg'}`}
                >
                  {invoiceSettings?.businessName || 'Your Company Name'}
                </p>
                <p className={`whitespace-pre-line ${isMobileView ? 'text-sm' : 'text-base'}`}>
                  {invoiceSettings?.businessAddress}
                </p>
                {invoiceSettings?.showTaxId && invoiceSettings?.taxId && (
                  <p className={`mt-1 ${isMobileView ? 'text-sm' : 'text-base'}`}>
                    Tax ID: {invoiceSettings.taxId}
                  </p>
                )}
              </div>
            </div>
            <div className={`text-right ${isMobileView ? 'text-sm' : 'text-base'}`}>
              <p className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'}`}>
                Due Date: {format(new Date(invoiceData.dueDate), 'PPP')}
              </p>
              <p className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'}`}>
                Invoice Date: {format(new Date(invoiceData.createdAt), 'PPP')}
              </p>
            </div>
          </div>

          {/* Client Information */}
          <div
            className={`grid ${
              isMobileView ? 'grid-cols-1' : 'grid-cols-2'
            } gap-8 mb-8 print:gap-4 print:mb-4`}
          >
            <div>
              <h2
                className={`font-semibold mb-2 ${
                  localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                } ${isMobileView ? 'text-base' : 'text-lg'}`}
              >
                Bill To:
              </h2>
              <p
                className={`font-medium ${
                  localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                } ${isMobileView ? 'text-sm' : 'text-base'}`}
              >
                {invoiceData.client.user.name}
              </p>
              <p
                className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                {invoiceData.client.address.street}
              </p>
              <p
                className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                {invoiceData.client.address.city}, {invoiceData.client.address.state}
              </p>
              <p
                className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                {invoiceData.client.address.country}
              </p>
              <p
                className={`mt-2 ${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                Tax ID: {invoiceData.client.taxId}
              </p>
              {invoiceData.client.user.email && (
                <p
                  className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                    isMobileView ? 'text-sm' : 'text-base'
                  }`}
                >
                  {invoiceData.client.user.email}
                </p>
              )}
              {invoiceData.client.phone && (
                <p
                  className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                    isMobileView ? 'text-sm' : 'text-base'
                  }`}
                >
                  {invoiceData.client.phone}
                </p>
              )}
            </div>
            <div>
              <h2
                className={`font-semibold mb-2 ${
                  localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                } ${isMobileView ? 'text-base' : 'text-lg'}`}
              >
                Payment Details:
              </h2>
              <p
                className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                Payment #{paymentNumber}
              </p>
              <p
                className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                Amount: {amount.toFixed(2)} {invoiceData.currency}
              </p>
              <p
                className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                Method: {method.charAt(0).toUpperCase() + method.slice(1)}
              </p>
              <p
                className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                Date: {format(new Date(date), 'PPP')}
              </p>
              <p
                className={`${localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'} ${
                  isMobileView ? 'text-sm' : 'text-base'
                }`}
              >
                Remaining Balance: {remainingBalance.toFixed(2)} {invoiceData.currency}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className='mb-8 overflow-x-auto print:mb-4'>
            <h2
              className={`font-semibold mb-4 ${
                localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
              } ${isMobileView ? 'text-base' : 'text-lg'} print:mb-2 print:text-base`}
            >
              Items
            </h2>
            <table className='w-full print:text-sm'>
              <thead>
                <tr
                  className={`border-b ${
                    localTheme === 'light' ? 'border-gray-200' : 'border-[#232428]'
                  }`}
                >
                  <th
                    className={`text-left py-2 ${
                      localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                    } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1`}
                  >
                    Item
                  </th>
                  <th
                    className={`text-right py-2 ${
                      localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                    } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1`}
                  >
                    Quantity
                  </th>
                  <th
                    className={`text-right py-2 ${
                      localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                    } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1`}
                  >
                    Price
                  </th>
                  <th
                    className={`text-right py-2 ${
                      localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                    } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1`}
                  >
                    Tax
                  </th>
                  <th
                    className={`text-right py-2 ${
                      localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                    } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1`}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item) => {
                  const itemTotal = item.price * item.quantity - item.discount + item.tax;
                  return (
                    <tr
                      key={item._id}
                      className={`border-b ${
                        localTheme === 'light' ? 'border-gray-200' : 'border-[#232428]'
                      }`}
                    >
                      <td className='py-2 print:py-1'>
                        <div>
                          <p
                            className={`font-medium ${
                              localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                            } ${isMobileView ? 'text-sm' : 'text-base'} print:text-sm`}
                          >
                            {item.name}
                          </p>
                          {item.description && (
                            <p
                              className={`text-sm ${
                                localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                              } ${isMobileView ? 'text-xs' : 'text-sm'} print:text-xs`}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td
                        className={`text-right py-2 ${
                          localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                        } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1 print:text-sm`}
                      >
                        {item.quantity}
                      </td>
                      <td
                        className={`text-right py-2 ${
                          localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                        } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1 print:text-sm`}
                      >
                        {item.price.toFixed(2)} {invoiceData.currency}
                      </td>
                      <td
                        className={`text-right py-2 ${
                          localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                        } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1 print:text-sm`}
                      >
                        {item.tax.toFixed(2)} {invoiceData.currency}
                      </td>
                      <td
                        className={`text-right py-2 ${
                          localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                        } ${isMobileView ? 'text-sm' : 'text-base'} print:py-1 print:text-sm`}
                      >
                        {itemTotal.toFixed(2)} {invoiceData.currency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className='flex justify-end'>
            <div className={`w-64 ${isMobileView ? 'text-sm' : 'text-base'} print:text-sm`}>
              <div
                className={`flex justify-between py-2 ${
                  localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                } print:py-1`}
              >
                <span>Subtotal:</span>
                <span>
                  {invoiceData.subtotal.toFixed(2)} {invoiceData.currency}
                </span>
              </div>
              {invoiceData.discount > 0 && (
                <div
                  className={`flex justify-between py-2 ${
                    localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                  } print:py-1`}
                >
                  <span>Discount:</span>
                  <span>
                    {invoiceData.discount.toFixed(2)} {invoiceData.currency}
                  </span>
                </div>
              )}
              <div
                className={`flex justify-between py-2 ${
                  localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                } print:py-1`}
              >
                <span>Tax ({invoiceData.taxRate}%):</span>
                <span>
                  {invoiceData.taxAmount.toFixed(2)} {invoiceData.currency}
                </span>
              </div>
              <div
                className={`flex justify-between py-2 font-bold border-t ${
                  localTheme === 'light' ? 'border-gray-200' : 'border-[#232428]'
                } ${localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'} print:py-1`}
              >
                <span>Total:</span>
                <span>
                  {invoiceData.total.toFixed(2)} {invoiceData.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(invoiceData.notes || invoiceSettings?.businessNotes) && (
            <div
              className={`mt-8 border-t ${
                localTheme === 'light' ? 'border-gray-200' : 'border-[#232428]'
              } pt-6 print:mt-4 print:pt-2`}
            >
              <h3
                className={`font-semibold ${
                  localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
                } mb-2 ${isMobileView ? 'text-base' : 'text-lg'} print:text-base print:mb-1`}
              >
                Notes
              </h3>
              <div
                className={`whitespace-pre-line ${
                  localTheme === 'light' ? 'text-gray-600' : 'text-[#8b8b8b]'
                } ${isMobileView ? 'text-sm' : 'text-base'} print:text-sm`}
              >
                {invoiceData.notes}
                {invoiceData.notes && invoiceSettings?.businessNotes && <br />}
                {invoiceSettings?.businessNotes}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div
            className={`${
              localTheme === 'light' ? 'bg-white' : 'bg-[#181818]'
            } rounded-lg p-6 w-full max-w-md border ${
              localTheme === 'light' ? 'border-gray-200' : 'border-[#232428]'
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
              }`}
            >
              Send Invoice via Email
            </h3>
            <input
              type='email'
              value={email}
              onChange={(e) => {
                return setEmail(e.target.value);
              }}
              placeholder="Enter recipient's email"
              className={`w-full p-2 ${
                localTheme === 'light' ? 'bg-white' : 'bg-[#232323]'
              } border ${
                localTheme === 'light' ? 'border-gray-300' : 'border-[#313131]'
              } rounded-lg mb-4 ${
                localTheme === 'light' ? 'text-gray-900' : 'text-[#fafafa]'
              } placeholder:${
                localTheme === 'light' ? 'text-gray-500' : 'text-[#8b8b8b]'
              } focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#8b8b8b] focus:border-transparent`}
            />
            <div className='flex justify-end space-x-4'>
              <Button
                onClick={() => {
                  return setShowEmailModal(false);
                }}
                variant='ghost'
                className='text-muted-foreground hover:text-foreground'
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                variant='default'
                className='bg-primary hover:bg-primary/90'
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
