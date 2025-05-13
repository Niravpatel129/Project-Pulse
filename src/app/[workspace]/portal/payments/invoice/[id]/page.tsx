'use client';

import type { Payment } from '@/types/invoice';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Download, Mail, Monitor, Moon, Printer, Share2, Smartphone, Sun } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InvoicePage() {
  const { id } = useParams();
  const [isMobileView, setIsMobileView] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const { data: invoice } = useQuery<Payment>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await newRequest.get(`/payments/${id}`);
      return res.data.data;
    },
  });

  if (!invoice) {
    return <div className='text-gray-900 dark:text-gray-100'>Loading...</div>;
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

  const handleDownload = () => {
    // Implement PDF download logic
    console.log('Downloading invoice...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    try {
      await newRequest.post(`/payments/${id}/send`, { email });
      setShowEmailModal(false);
      setEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
      {/* Sticky Banner */}
      <div className='sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <h1 className='text-lg font-semibold text-indigo-600 dark:text-indigo-400'>
                Invoice {invoiceData.invoiceNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'completed'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    : status === 'pending'
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <button
                onClick={toggleTheme}
                className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button
                onClick={() => {
                  return setIsMobileView(!isMobileView);
                }}
                className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
                title={isMobileView ? 'Desktop View' : 'Mobile View'}
              >
                {isMobileView ? <Monitor size={20} /> : <Smartphone size={20} />}
              </button>
              <button
                onClick={handleDownload}
                className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
                title='Download'
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => {
                  return setShowEmailModal(true);
                }}
                className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
                title='Send via Email'
              >
                <Mail size={20} />
              </button>
              <button
                onClick={handlePrint}
                className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
                title='Print'
              >
                <Printer size={20} />
              </button>
              <button
                className='p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
                title='Share'
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto p-6 ${isMobileView ? 'max-w-md' : ''}`}>
        <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700'>
          {/* Header */}
          <div className='flex justify-between items-start mb-8'>
            <div>
              <p className='text-gray-600 dark:text-gray-300'>
                Due Date: {format(new Date(invoiceData.dueDate), 'PPP')}
              </p>
            </div>
          </div>

          {/* Client Information */}
          <div className={`grid ${isMobileView ? 'grid-cols-1' : 'grid-cols-2'} gap-8 mb-8`}>
            <div>
              <h2 className='text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400'>
                Bill To:
              </h2>
              <p className='font-medium text-gray-900 dark:text-white'>
                {invoiceData.client.user.name}
              </p>
              <p className='text-gray-600 dark:text-gray-300'>
                {invoiceData.client.address.street}
              </p>
              <p className='text-gray-600 dark:text-gray-300'>
                {invoiceData.client.address.city}, {invoiceData.client.address.state}
              </p>
              <p className='text-gray-600 dark:text-gray-300'>
                {invoiceData.client.address.country}
              </p>
              <p className='mt-2 text-gray-600 dark:text-gray-300'>
                Tax ID: {invoiceData.client.taxId}
              </p>
            </div>
            <div>
              <h2 className='text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400'>
                Payment Details:
              </h2>
              <p className='text-gray-600 dark:text-gray-300'>Payment #{paymentNumber}</p>
              <p className='text-gray-600 dark:text-gray-300'>
                Amount: {amount.toFixed(2)} {invoiceData.currency}
              </p>
              <p className='text-gray-600 dark:text-gray-300'>
                Method: {method.charAt(0).toUpperCase() + method.slice(1)}
              </p>
              <p className='text-gray-600 dark:text-gray-300'>
                Date: {format(new Date(date), 'PPP')}
              </p>
              <p className='text-gray-600 dark:text-gray-300'>
                Remaining Balance: {remainingBalance.toFixed(2)} {invoiceData.currency}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className='mb-8 overflow-x-auto'>
            <h2 className='text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400'>
              Items
            </h2>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-gray-200 dark:border-gray-700'>
                  <th className='text-left py-2 text-gray-900 dark:text-white'>Item</th>
                  <th className='text-right py-2 text-gray-900 dark:text-white'>Quantity</th>
                  <th className='text-right py-2 text-gray-900 dark:text-white'>Price</th>
                  <th className='text-right py-2 text-gray-900 dark:text-white'>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item) => {
                  return (
                    <tr key={item._id} className='border-b border-gray-200 dark:border-gray-700'>
                      <td className='py-2'>
                        <div>
                          <p className='font-medium text-gray-900 dark:text-white'>{item.name}</p>
                          {item.description && (
                            <p className='text-sm text-gray-600 dark:text-gray-300'>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className='text-right py-2 text-gray-600 dark:text-gray-300'>
                        {item.quantity}
                      </td>
                      <td className='text-right py-2 text-gray-600 dark:text-gray-300'>
                        {item.price.toFixed(2)} {invoiceData.currency}
                      </td>
                      <td className='text-right py-2 text-gray-600 dark:text-gray-300'>
                        {(item.quantity * item.price).toFixed(2)} {invoiceData.currency}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className='flex justify-end'>
            <div className='w-64'>
              <div className='flex justify-between py-2 text-gray-600 dark:text-gray-300'>
                <span>Subtotal:</span>
                <span>
                  {invoiceData.subtotal.toFixed(2)} {invoiceData.currency}
                </span>
              </div>
              <div className='flex justify-between py-2 text-gray-600 dark:text-gray-300'>
                <span>Tax ({invoiceData.taxRate}%):</span>
                <span>
                  {invoiceData.taxAmount.toFixed(2)} {invoiceData.currency}
                </span>
              </div>
              <div className='flex justify-between py-2 font-bold border-t border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400'>
                <span>Total:</span>
                <span>
                  {invoiceData.total.toFixed(2)} {invoiceData.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700'>
            <h3 className='text-lg font-semibold mb-4 text-indigo-600 dark:text-indigo-400'>
              Send Invoice via Email
            </h3>
            <input
              type='email'
              value={email}
              onChange={(e) => {
                return setEmail(e.target.value);
              }}
              placeholder="Enter recipient's email"
              className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent'
            />
            <div className='flex justify-end space-x-4'>
              <button
                onClick={() => {
                  return setShowEmailModal(false);
                }}
                className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
