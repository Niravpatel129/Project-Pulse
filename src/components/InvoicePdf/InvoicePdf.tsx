'use client';

import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';

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
}

interface InvoiceProps {
  invoice: Invoice;
  paymentUrl?: string;
}

export function InvoicePdf({ invoice }: InvoiceProps) {
  const { data: invoiceSettings } = useInvoiceSettings();
  const params = useParams();
  const remainingBalance = invoice.total;
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div
      className={`${isDarkTheme ? 'bg-background' : 'bg-white'} rounded-lg border ${
        isDarkTheme ? 'border-[#232428]' : 'border-gray-200'
      } shadow-sm invoice-paper relative`}
      style={{
        width: '8.5in',
        minHeight: '11in',
        padding: '2.5rem 2rem',
        transform: 'scale(0.8)',
        transformOrigin: 'top center',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }}
    >
      <motion.button
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
          .invoice-paper {
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
          <h1
            className={`text-4xl font-semibold tracking-tight ${
              isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'
            }`}
          >
            INVOICE
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
            {invoiceSettings?.showTaxId && invoiceSettings?.taxId && (
              <div className={`text-sm mt-1 ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
                Tax ID: {invoiceSettings.taxId}
              </div>
            )}
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
              <h3
                className={`text-sm font-medium ${
                  isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'
                }`}
              >
                Bill To
              </h3>
              <div className={`mt-2 text-sm ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
                <p>{invoice.client.user.name}</p>
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
                    {invoice.client.user.email && <p>{invoice.client.user.email}</p>}
                    {invoice.client.taxId && <p className='mt-1'>Tax ID: {invoice.client.taxId}</p>}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='text-right space-y-1 text-sm'>
          <div>
            <span className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
              Invoice Number:
            </span>{' '}
            <span className={`ml-2 ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
              {invoice.invoiceNumber}
            </span>
          </div>
          <div>
            <span className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
              Invoice Date:
            </span>{' '}
            <span className={`ml-2 ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
              {new Date(invoice.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className={`font-semibold ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
              Payment Due:
            </span>{' '}
            <span className={`ml-2 ${isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'}`}>
              {new Date(invoice.dueDate).toLocaleDateString()}
            </span>
          </div>
          <div className='flex items-center gap-3 mt-3'>
            <div
              className={`${
                isDarkTheme ? 'bg-[#141414]' : 'bg-gray-100'
              } rounded-lg px-3 py-2 inline-flex items-center font-semibold ${
                isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-700'
              }`}
            >
              <span>Amount Due ({invoiceSettings?.currency || 'CAD'}):</span>
              <span className={`ml-2 text-lg ${isDarkTheme ? 'text-[#fafafa]' : 'text-gray-900'}`}>
                ${remainingBalance.toFixed(2)}
              </span>
            </div>
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
              <th className='py-3 px-4 text-right font-semibold'>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => {
              const itemTotal = item.price * item.quantity - item.discount + item.tax;
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
                    ${item.price.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${
                      isDarkTheme ? 'text-[#8C8C8C]' : 'text-gray-500'
                    }`}
                  >
                    ${itemTotal.toFixed(2)}
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
                ${invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {(invoice.notes || invoiceSettings?.businessNotes) && (
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
            {invoice.notes}
            {invoice.notes && invoiceSettings?.businessNotes && <br />}
            {invoiceSettings?.businessNotes}
          </div>
        </div>
      )}
    </div>
  );
}
