import { DataTable } from '@/components/ui/data-table';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CalendarIcon, Clock3Icon, FileCheckIcon, Package2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import TaskDetailDialog from '../ProjectKanban/TaskDetailDialog';
import NewDeliverableDialog from '../ProjectModules/NewDeliverableDialog/NewDeliverableDialog';

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  date: string;
  type: string;
  itemType: string;
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
    createdAt: string;
  };
}

interface ProjectStats {
  timeTracked: number; // hours
  deliverableCount: number;
  status: string;
}

export default function ProjectInvoiceReview() {
  const { project } = useProject();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const [previewTask, setPreviewTask] = useState<any | null>(null);

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

  // Fetch deliverables count separately if not available in stats
  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables', project?._id],
    queryFn: async () => {
      try {
        const response = await newRequest.get(`/deliverables/project/${project?._id}`);
        return response.data.data || [];
      } catch (error) {
        console.error('Failed to fetch deliverables:', error);
        return [];
      }
    },
    enabled: !!project?._id,
  });

  useEffect(() => {
    fetchProjectInvoice();
  }, [project?._id]);

  const handleViewDeliverable = (itemId: string) => {
    setPreviewItemId(itemId);
  };

  const handleClosePreview = () => {
    setPreviewItemId(null);
  };

  const handleViewTask = (item: InvoiceItem) => {
    // Convert invoice item to task format for TaskDetailDialog
    const task = {
      id: item.id,
      title: item.name,
      description: item.description,
      columnId: 'status1', // Default column
      labels: item.labels || [],
      priority: 'medium',
      storyPoints: undefined,
      attachments: item.attachments,
      comments: [],
      timeEntries: [],
      createdAt: item.createdAt || new Date().toISOString(),
    };

    setPreviewTask(task);
  };

  const handleCloseTaskPreview = () => {
    setPreviewTask(null);
  };

  const handleRowClick = (item: InvoiceItem) => {
    if (item.itemType === 'task') {
      handleViewTask(item);
    } else if (item._id) {
      handleViewDeliverable(item._id);
    }
  };

  // Format project date range
  const formatDateRange = () => {
    if (project?.startDate && invoiceData?.invoice?.createdAt) {
      const startDate = new Date(project.startDate);
      const targetDate = new Date(invoiceData?.invoice?.createdAt);
      return `${format(startDate, 'MMMM d')} - ${format(targetDate, 'MMMM d, yyyy')}`;
    }
    return 'Date range not set';
  };

  // Mock columns for TaskDetailDialog
  const kanbanColumns = [
    { id: 'status1', title: 'To Do', color: '#e2e8f0', order: 0 },
    { id: 'status2', title: 'In Progress', color: '#93c5fd', order: 1 },
    { id: 'status3', title: 'Done', color: '#86efac', order: 2 },
  ];

  const columns: ColumnDef<InvoiceItem>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        return <span className='font-medium'>{row.getValue('name')}</span>;
      },
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        return row.getValue('description') || '-';
      },
    },
    {
      id: 'itemType',
      accessorKey: 'itemType',
      header: 'Type of Item',
      cell: ({ row }) => {
        return row.getValue('itemType') === 'task' ? (
          <span className='px-2 py-1 bg-red-100 text-red-800 text-xs rounded'>Task</span>
        ) : (
          <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded'>Deliverable</span>
        );
      },
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        return row.getValue('date');
      },
    },
    {
      id: 'labels',
      accessorKey: 'labels',
      header: 'Labels',
      cell: ({ row }) => {
        const labels = row.getValue('labels') as string[];
        return (
          <div className='flex flex-wrap gap-1'>
            {labels && labels.length > 0
              ? labels.map((label, idx) => {
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
      id: 'price',
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.getValue('price') as number;
        const quantity = row.original.quantity;
        return `$${price.toFixed(2)} x ${quantity}`;
      },
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
            </div>
            <div className='flex items-center text-sm text-gray-500'>
              <CalendarIcon className='mr-2 h-4 w-4' />
              <span>{formatDateRange()}</span>
            </div>
          </div>

          {/* Project metrics */}
          <div className='grid grid-cols-3 gap-12'>
            {/* Status */}
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-9 h-9 rounded-full bg-amber-50'>
                <Package2Icon className='h-4 w-4 text-amber-500' />
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Project Status</p>
                <p className='text-sm font-medium text-gray-900 capitalize'>
                  {project?.state.replace('-', ' ')}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-9 h-9 rounded-full bg-green-50'>
                <Clock3Icon className='h-4 w-4 text-green-500' />
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Tasks</p>
                <p className='text-sm font-medium text-gray-900'>{deliverables.length}</p>
              </div>
            </div>

            {/* Deliverables */}
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-9 h-9 rounded-full bg-blue-50'>
                <FileCheckIcon className='h-4 w-4 text-blue-500' />
              </div>
              <div>
                <p className='text-xs text-gray-500 mb-1'>Deliverables</p>
                <p className='text-sm font-medium text-gray-900'>{deliverables.length}</p>
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
            <DataTable<InvoiceItem>
              data={invoiceData.invoice.selectedItems}
              columns={columns}
              visibleColumns={Object.fromEntries(
                columns.map((col) => {
                  return [col.header as string, true];
                }),
              )}
              columnOrder={columns.map((col) => {
                return col.id as string;
              })}
              onColumnOrderChange={() => {}}
              emptyState={{
                title: 'No Invoice Items',
                description: 'No invoice items found',
                buttonText: 'Add Item',
                onButtonClick: () => {},
              }}
              onSelectItem={handleRowClick}
            />
          </div>
        ) : (
          <div className='py-8 text-center text-gray-500'>No invoice items found</div>
        )}
      </BlockWrapper>

      {/* Deliverable Preview Dialog */}
      {previewItemId && (
        <NewDeliverableDialog
          isOpen={!!previewItemId}
          onClose={handleClosePreview}
          deliverableId={previewItemId}
          previewMode={true}
        />
      )}

      {/* Task Preview Dialog */}
      {previewTask && (
        <TaskDetailDialog
          task={previewTask}
          open={!!previewTask}
          onOpenChange={handleCloseTaskPreview}
          onTaskUpdate={() => {}} // No-op function since we're in preview mode
          columns={kanbanColumns}
          previewMode={true}
        />
      )}
    </div>
  );
}
