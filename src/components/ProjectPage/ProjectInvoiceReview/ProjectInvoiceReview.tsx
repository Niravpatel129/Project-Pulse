import { Column, DataTable } from '@/components/ui/data-table';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  const columns: Column<InvoiceItem>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (item) => {
        return <span className='font-medium'>{item.name}</span>;
      },
      sortable: true,
    },
    {
      key: 'description',
      header: 'Description',
      cell: (item) => {
        return item.description || '-';
      },
    },
    {
      key: 'date',
      header: 'Date',
      cell: (item) => {
        return item.date;
      },
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      cell: (item) => {
        return <span className='capitalize'>{item.type}</span>;
      },
    },
    {
      key: 'labels',
      header: 'Labels',
      cell: (item) => {
        return (
          <div className='flex flex-wrap gap-1'>
            {item.labels && item.labels.length > 0
              ? item.labels.map((label, idx) => {
                  return (
                    <span key={idx} className='px-2 py-1 bg-gray-100 text-xs rounded'>
                      {label}
                    </span>
                  );
                })
              : '-'}
          </div>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Quantity',
      cell: (item) => {
        return item.quantity;
      },
      sortable: true,
    },
    {
      key: 'price',
      header: 'Price',
      cell: (item) => {
        return `$${item.price.toFixed(2)}`;
      },
      sortable: true,
    },
    {
      key: 'total',
      header: 'Total',
      cell: (item) => {
        return `$${(item.fields?.total || item.price * item.quantity).toFixed(2)}`;
      },
      sortable: true,
    },
  ];

  return (
    <div>
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
        </div>
      </BlockWrapper>

      <BlockWrapper className='my-4'>
        {/* Invoice Items Table */}
        {loading ? (
          <div className='py-1 text-center text-gray-500'>Loading invoice data...</div>
        ) : invoiceData?.invoice?.selectedItems?.length > 0 ? (
          <div>
            <h2 className='text-xl font-medium text-gray-900 mb-4'>Invoice Items</h2>

            {/* Option 1: Using DataTable component with full features */}
            <DataTable
              data={invoiceData.invoice.selectedItems}
              columns={columns}
              keyExtractor={(item) => {
                return item.id;
              }}
              searchable
              searchKeys={['name', 'description', 'type']}
              pagination
              pageSize={10}
              emptyState={
                <div className='py-8 text-center text-gray-500'>No invoice items found</div>
              }
            />

            {/* Option 2: Using basic Table components with custom footer for totals */}
            <div className='mt-8'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={7} className='text-right font-medium'>
                      Subtotal
                    </TableHead>
                    <TableHead className='text-right'>
                      ${invoiceData.invoice.subtotal.toFixed(2)}
                    </TableHead>
                  </TableRow>
                  {invoiceData.invoice.taxAmount > 0 && (
                    <TableRow>
                      <TableHead colSpan={7} className='text-right font-medium'>
                        Tax
                      </TableHead>
                      <TableHead className='text-right'>
                        ${invoiceData.invoice.taxAmount.toFixed(2)}
                      </TableHead>
                    </TableRow>
                  )}
                  {invoiceData.invoice.shippingTotal > 0 && (
                    <TableRow>
                      <TableHead colSpan={7} className='text-right font-medium'>
                        Shipping
                      </TableHead>
                      <TableHead className='text-right'>
                        ${invoiceData.invoice.shippingTotal.toFixed(2)}
                      </TableHead>
                    </TableRow>
                  )}
                  <TableRow className='bg-gray-50'>
                    <TableHead colSpan={7} className='text-right font-medium text-gray-900'>
                      Total
                    </TableHead>
                    <TableHead className='text-right font-medium text-gray-900'>
                      ${invoiceData.invoice.total.toFixed(2)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
          </div>
        ) : (
          <div className='py-8 text-center text-gray-500'>No invoice items found</div>
        )}
      </BlockWrapper>
    </div>
  );
}
