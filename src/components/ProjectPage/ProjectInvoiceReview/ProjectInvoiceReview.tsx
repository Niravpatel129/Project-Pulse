import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { CalendarIcon, Clock3Icon, FileCheckIcon, Package2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  date: string;
  type: string;
  labels: string[];
  quantity: number;
  isApiData: boolean;
  fields?: {
    unitPrice: number;
    quantity: number;
    total: number;
    linkedItems?: any[];
  };
  attachments?: { type: string; url: string; title: string }[];
  createdAt: string;
  _id?: string;
}

interface InvoiceData {
  invoice: {
    selectedItems: InvoiceItem[];
    subtotal: number;
    taxAmount: number;
    shippingTotal: number;
    total: number;
    currency: string;
  };
}

export default function ProjectInvoiceReview() {
  const { project } = useProject();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  console.log('🚀 invoiceData:', invoiceData);

  const fetchProjectInvoice = async () => {
    if (!project?._id) return;
    setLoading(true);
    try {
      const response = await newRequest.get(`/project-invoices/${project?._id}`);
      const data = await response.data.data;
      setInvoiceData(data);
    } catch (error) {
      console.error('Failed to fetch invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectInvoice();
  }, [project?._id]);

  return (
    <BlockWrapper className='py-6'>
      <div className='space-y-8'>
        {/* Header: Project title and date */}
        <div className='flex justify-between items-start'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-medium text-gray-900'>Project Review</h1>
            <p className='text-sm text-gray-500'>Website redesign and branding</p>
          </div>
          <div className='flex items-center text-sm text-gray-500'>
            <CalendarIcon className='mr-2 h-4 w-4' />
            <span>April 25 - May 15, 2025</span>
          </div>
        </div>

        {/* Project metrics */}
        <div className='grid grid-cols-3 gap-12'>
          {/* Status */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-full bg-gray-50'>
              <Package2Icon className='h-4 w-4 text-gray-500' />
            </div>
            <div>
              <p className='text-xs text-gray-500 mb-1'>Project Status</p>
              <p className='text-sm font-medium text-gray-900'>Invoice Sent</p>
            </div>
          </div>

          {/* Time */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-full bg-gray-50'>
              <Clock3Icon className='h-4 w-4 text-gray-500' />
            </div>
            <div>
              <p className='text-xs text-gray-500 mb-1'>Time Tracked</p>
              <p className='text-sm font-medium text-gray-900'>32 hours</p>
            </div>
          </div>

          {/* Deliverables */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-9 h-9 rounded-full bg-gray-50'>
              <FileCheckIcon className='h-4 w-4 text-gray-500' />
            </div>
            <div>
              <p className='text-xs text-gray-500 mb-1'>Deliverables</p>
              <p className='text-sm font-medium text-gray-900'>5 completed</p>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        {loading ? (
          <div className='py-8 text-center text-gray-500'>Loading invoice data...</div>
        ) : invoiceData?.invoice?.selectedItems?.length > 0 ? (
          <div className='mt-8'>
            <h2 className='text-xl font-medium text-gray-900 mb-4'>Invoice Items</h2>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Name
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Description
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Date
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Type
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Labels
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Quantity
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Price
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {invoiceData.invoice.selectedItems.map((item) => {
                    return (
                      <tr key={item.id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {item.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {item.description || '-'}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {item.date}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize'>
                          {item.type}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          <div className='flex flex-wrap gap-1'>
                            {item.labels && item.labels.length > 0
                              ? item.labels.map((label, idx) => {
                                  return (
                                    <span
                                      key={idx}
                                      className='px-2 py-1 bg-gray-100 text-xs rounded'
                                    >
                                      {label}
                                    </span>
                                  );
                                })
                              : '-'}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {item.quantity}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          ${item.price.toFixed(2)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          ${(item.fields?.total || item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className='bg-gray-50'>
                  <tr>
                    <td colSpan={7} className='px-6 py-4 text-right font-medium text-gray-500'>
                      Subtotal
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      ${invoiceData.invoice.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  {invoiceData.invoice.taxAmount > 0 && (
                    <tr>
                      <td colSpan={7} className='px-6 py-4 text-right font-medium text-gray-500'>
                        Tax
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        ${invoiceData.invoice.taxAmount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {invoiceData.invoice.shippingTotal > 0 && (
                    <tr>
                      <td colSpan={7} className='px-6 py-4 text-right font-medium text-gray-500'>
                        Shipping
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        ${invoiceData.invoice.shippingTotal.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={7} className='px-6 py-4 text-right font-medium text-gray-900'>
                      Total
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      ${invoiceData.invoice.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <div className='py-8 text-center text-gray-500'>No invoice items found</div>
        )}
      </div>
    </BlockWrapper>
  );
}
