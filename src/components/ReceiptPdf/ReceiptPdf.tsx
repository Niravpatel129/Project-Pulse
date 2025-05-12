'use client';

import { BusinessSettings } from '@/app/[workspace]/invoicesOld/[id]/components/BusinessSettings';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

interface Client {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
}

interface ReceiptItem {
  _id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  tax: number;
  taxName: string;
}

interface Receipt {
  _id: string;
  receiptNumber: string;
  client: Client;
  items: ReceiptItem[];
  total: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  notes: string;
  currency: string;
  paymentMethod: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

interface ReceiptProps {
  receipt: Receipt;
  isReadOnly?: boolean;
}

export function ReceiptPdf({ receipt, isReadOnly = false }: ReceiptProps) {
  const { data: invoiceSettings } = useInvoiceSettings();
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('receiptTheme');
      return savedTheme ? savedTheme === 'dark' : true;
    }
    return true;
  });
  const [isHovering, setIsHovering] = useState(false);
  const [isBusinessSettingsOpen, setIsBusinessSettingsOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem('receiptTheme', newTheme ? 'dark' : 'light');
  };

  return (
    <div
      className={`${isDarkTheme ? 'bg-background' : 'bg-white'} rounded-lg border ${
        isDarkTheme ? 'border-[#232428]' : 'border-gray-200'
      } shadow-sm receipt-paper relative mx-auto`}
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
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovering ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className='absolute top-4 right-4 p-2 rounded-lg bg-[#232428] text-[#8C8C8C] hover:bg-[#2A2A2F] transition-colors'
        title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      >
        {isDarkTheme ? <FiSun size={20} /> : <FiMoon size={20} />}
      </motion.button>

      <style>{`
        @media print {
          .receipt-paper {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 1in;
            transform: none;
            box-shadow: none;
            border: none;
          }
          .theme-toggle {
            display: none;
          }
        }
      `}</style>

      {/* Header */}
      <div className='flex justify-between items-start mb-10'>
        <div>
          <div
            className={`relative p-2 rounded-lg transition-all ${
              !isReadOnly
                ? 'cursor-pointer group hover:border-2 hover:border-dashed hover:border-[#8C8C8C]'
                : ''
            }`}
            onClick={() => {
              if (!isReadOnly) {
                setIsBusinessSettingsOpen(true);
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
                <span className='text-sm text-[#8C8C8C]'></span>
              </div>
            )}
            {!isReadOnly && (
              <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                <span className='text-xs text-[#8C8C8C]'>Click to edit logo</span>
              </div>
            )}
          </div>
        </div>
        <div className='text-right'>
          <h1
            className={`text-4xl font-semibold tracking-tight ${
              isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'
            }`}
          >
            RECEIPT
          </h1>
          <div className='mt-2'>
            <div className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-800'}`}>
              {invoiceSettings?.businessName || 'Your Company Name'}
            </div>
            <div
              className={`text-sm whitespace-pre-line ${
                isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'
              }`}
            >
              {invoiceSettings?.businessAddress}
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div
        className={`flex justify-between items-start border-t border-b ${
          isDarkTheme ? 'border-[#232428]' : 'border-gray-200'
        } py-6 mb-8`}
      >
        <div>
          <div className='flex justify-between'>
            <div>
              {receipt?.client?.user?.name && (
                <>
                  <h3
                    className={`text-sm font-medium ${
                      isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'
                    }`}
                  >
                    Customer
                  </h3>
                </>
              )}
              <div className={`mt-2 text-sm ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
                <p>{receipt?.client?.user?.name}</p>
                {receipt?.client && (
                  <>
                    {receipt?.client?.address?.street && <p>{receipt?.client?.address?.street}</p>}
                    {(receipt?.client?.address?.city ||
                      receipt?.client?.address?.state ||
                      receipt?.client?.address?.zip) && (
                      <p>
                        {[
                          receipt?.client?.address?.city,
                          receipt?.client?.address?.state,
                          receipt?.client?.address?.zip,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    {receipt?.client?.address?.country && (
                      <p>{receipt?.client?.address?.country}</p>
                    )}
                    {receipt?.client?.phone && <p className='mt-1'>{receipt?.client?.phone}</p>}
                    {receipt?.client?.user?.email && <p>{receipt?.client?.user?.email}</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='text-right space-y-1 text-sm'>
          <div>
            <span className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
              Receipt Number:
            </span>{' '}
            <span className={`ml-2 ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
              {receipt.receiptNumber}
            </span>
          </div>
          <div>
            <span className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
              Date:
            </span>{' '}
            <span className={`ml-2 ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
              {new Date(receipt.date).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
              Payment Method:
            </span>{' '}
            <span className={`ml-2 ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
              {receipt.paymentMethod}
            </span>
          </div>
          <div>
            <span className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
              Status:
            </span>{' '}
            <span className={`ml-2 ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
              {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div
        className={`rounded-lg overflow-hidden border ${
          isDarkTheme ? 'border-[#232428]' : 'border-gray-200'
        } mb-8`}
      >
        <table className='w-full text-sm'>
          <thead>
            <tr className={`${isDarkTheme ? 'bg-[#232428]' : 'bg-gray-700'} text-white`}>
              <th className='py-3 px-4 text-left font-semibold'>Items</th>
              <th className='py-3 px-4 text-center font-semibold'>Quantity</th>
              <th className='py-3 px-4 text-right font-semibold'>Price</th>
              <th className='py-3 px-4 text-right font-semibold'>Tax</th>
              <th className='py-3 px-4 text-right font-semibold'>Amount</th>
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item) => {
              const itemTotal = item.price * item.quantity + item.tax;
              return (
                <tr
                  key={item._id}
                  className={`border-t ${isDarkTheme ? 'border-[#232428]' : 'border-gray-200'} ${
                    isDarkTheme ? 'bg-background' : 'bg-white'
                  }`}
                >
                  <td className={`py-3 px-4 ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
                    {item.name}
                  </td>
                  <td
                    className={`py-3 px-4 text-center ${
                      isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'
                    }`}
                  >
                    {item.quantity}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${
                      isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'
                    }`}
                  >
                    {item.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {receipt.currency}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${
                      isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'
                    }`}
                  >
                    {item.tax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {receipt.currency}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${
                      isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'
                    }`}
                  >
                    {itemTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    {receipt.currency}
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
            <div className='flex justify-between py-2 text-base'>
              <span className={`font-semibold ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-700'}`}>
                Total:
              </span>
              <span className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
                {receipt.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {receipt.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {receipt?.notes && (
        <div
          className={`mt-8 border-t ${isDarkTheme ? 'border-[#232428]' : 'border-gray-200'} pt-6`}
        >
          <h3 className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'} mb-2`}>
            Notes
          </h3>
          <div
            className={`text-sm whitespace-pre-line ${
              isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-600'
            }`}
          >
            {receipt.notes}
          </div>
        </div>
      )}

      {/* Business Settings Dialog */}
      <BusinessSettings open={isBusinessSettingsOpen} onOpenChange={setIsBusinessSettingsOpen} />
    </div>
  );
}
