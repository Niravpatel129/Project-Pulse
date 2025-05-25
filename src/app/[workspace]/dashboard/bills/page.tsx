'use client';

import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import InvoicePreview2 from './InvoicePreview2';

function formatCurrency(amount: number, currency: string = 'CAD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusBadge(status: string) {
  if (status === 'Overdue')
    return (
      <span className='bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide'>
        Overdue
      </span>
    );
  if (status === 'Draft')
    return (
      <span className='bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide'>
        Draft
      </span>
    );
  return (
    <span className='bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide'>
      Unpaid
    </span>
  );
}

function getCustomerAvatar(name: string) {
  const initial = name?.[0]?.toUpperCase() || 'A';
  return (
    <span className='inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-600 font-medium mr-2 text-xs'>
      {initial}
    </span>
  );
}

const Bills = () => {
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await newRequest.get('/invoices2');
      return response.data;
    },
  });

  const invoiceList = invoices?.data?.invoices || [];

  // Calculate Open invoices (status: 'unpaid' or 'open')
  const openInvoices = invoiceList.filter((inv: any) => {
    return inv.status?.toLowerCase() === 'unpaid' || inv.status?.toLowerCase() === 'open';
  });
  const openAmount = openInvoices.reduce((sum: number, inv: any) => {
    return sum + (inv.totals?.total || 0);
  }, 0);
  const openCurrency = openInvoices[0]?.settings?.currency || 'CAD';

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    if (!search) return invoiceList;
    return invoiceList.filter((inv: any) => {
      return (
        inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        inv.customer?.name?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [invoiceList, search]);

  if (error) return <div>Error loading invoices</div>;

  return (
    <div className='flex h-full bg-white'>
      <div className='flex-1 py-4 pl-4 overflow-hidden'>
        {/* Invoice Table */}
        <div className='overflow-x-auto rounded-lg border border-slate-100 shadow-sm'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr className='divide-x divide-slate-100 bg-slate-50/50'>
                <th className='px-6 py-4 text-left text-slate-600 font-medium tracking-wide'>
                  Invoice
                </th>
                <th className='px-6 py-4 text-left text-slate-600 font-medium tracking-wide'>
                  Status
                </th>
                <th className='px-6 py-4 text-left text-slate-600 font-medium tracking-wide'>
                  Due Date
                </th>
                <th className='px-6 py-4 text-left text-slate-600 font-medium tracking-wide'>
                  Customer
                </th>
                <th className='px-6 py-4 text-left text-slate-600 font-medium tracking-wide'>
                  Amount
                </th>
                <th className='px-6 py-4 text-left text-slate-600 font-medium tracking-wide'>
                  Issue Date
                </th>
                <th className='px-6 py-4 text-left text-slate-600 font-medium tracking-wide'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {filteredInvoices.map((invoice: any) => {
                return (
                  <tr
                    key={invoice._id}
                    className={`divide-x divide-slate-100 cursor-pointer transition-colors duration-150 hover:bg-slate-50/50 ${
                      selectedInvoice?._id === invoice._id ? 'bg-slate-50' : ''
                    }`}
                    onClick={() => {
                      return setSelectedInvoice(invoice);
                    }}
                  >
                    <td className='px-6 py-4'>
                      <div className='flex flex-col gap-1'>
                        <span className='font-medium text-slate-900'>{invoice.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>{getStatusBadge(invoice.status)}</td>
                    <td className='px-6 py-4 text-slate-600'>
                      {invoice.dueDate ? (
                        <>
                          {formatDate(invoice.dueDate)}
                          <div className='text-slate-400 ml-0 text-xs'>
                            {invoice.dueDate > new Date().toISOString()
                              ? 'in 1 month'
                              : 'overdue ' +
                                formatDate(invoice.dueDate) +
                                ' ' +
                                formatDate(new Date().toISOString())}
                          </div>
                        </>
                      ) : (
                        '--'
                      )}
                    </td>
                    <td className='px-6 py-4 text-slate-600 flex items-center'>
                      <span>{invoice.customer?.name}</span>
                    </td>
                    <td className='px-6 py-4 font-medium text-slate-900'>
                      {formatCurrency(
                        invoice.totals?.total || 0,
                        invoice.settings?.currency || 'CAD',
                      )}
                    </td>
                    <td className='px-6 py-4 text-slate-600'>
                      {invoice.issueDate ? formatDate(invoice.issueDate) : '--'}
                    </td>
                    <td className='px-6 py-4'>
                      <button className='p-1.5 rounded-full hover:bg-slate-100 transition-colors duration-150'>
                        <svg
                          width='16'
                          height='16'
                          fill='none'
                          viewBox='0 0 24 24'
                          className='text-slate-400'
                        >
                          <circle cx='12' cy='5' r='1.5' fill='currentColor' />
                          <circle cx='12' cy='12' r='1.5' fill='currentColor' />
                          <circle cx='12' cy='19' r='1.5' fill='currentColor' />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {selectedInvoice && (
        <InvoicePreview2
          selectedInvoice={selectedInvoice}
          setSelectedInvoice={setSelectedInvoice}
        />
      )}
    </div>
  );
};

export default Bills;
