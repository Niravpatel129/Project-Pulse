import FileUploadManagerModal from '@/components/ProjectPage/FileComponents/FileUploadManagerModal';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import InvoicePreviewActions from './InvoicePreviewActions';

interface InvoicePreview2Props {
  selectedInvoice?: any;
  setSelectedInvoice: (invoice: any) => void;
  setEditingInvoice: (invoice: any) => void;
  onMarkAsPaid?: (invoiceId: string, paymentDate: Date) => void;
  onCancel?: (invoiceId: string) => void;
  onDelete?: (invoiceId: string) => void;
}

function formatCurrency(amount: number, currency: string = 'CAD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusBadgeStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'overdue':
      return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400';
    case 'draft':
      return 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400';
    case 'paid':
      return 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400';
    default:
      return 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-400';
  }
}

const InvoicePreview2: React.FC<InvoicePreview2Props> = ({
  selectedInvoice,
  setSelectedInvoice,
  setEditingInvoice,
  onMarkAsPaid,
  onCancel,
  onDelete,
}) => {
  console.log('🚀 selectedInvoice:', selectedInvoice);
  const [activityOpen, setActivityOpen] = useState(true);
  const [noteOpen, setNoteOpen] = useState(!!selectedInvoice?.internalNote);
  const [internalNote, setInternalNote] = useState(selectedInvoice?.internalNote || '');
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setInternalNote(selectedInvoice?.internalNote || '');
    setNoteOpen(!!selectedInvoice?.internalNote || !!selectedInvoice?.attachments?.length);
    setAttachments(selectedInvoice?.attachments || []);
  }, [selectedInvoice]);

  const updateInternalNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      const response = await newRequest.patch(`/invoices2/${selectedInvoice._id}/internal-note`, {
        a: note,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalNote(e.target.value);
  };

  const handleNoteBlur = () => {
    if (internalNote !== selectedInvoice?.internalNote) {
      updateInternalNoteMutation.mutate(internalNote);
    }
  };

  const handleAddFileToProject = async (file: any) => {
    try {
      await newRequest.post(`/invoices2/${selectedInvoice._id}/attachments`, {
        fileId: file._id,
      });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsFileManagerOpen(false);
      setNoteOpen(true);
    } catch (error) {
      console.error('Error adding attachment:', error);
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    try {
      await newRequest.delete(`/invoices2/${selectedInvoice._id}/attachments/${fileId}`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  if (!selectedInvoice) {
    return (
      <div className='h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm'>
        Select an invoice to preview
      </div>
    );
  }

  return (
    <div className='h-full lg:p-4 lg:pl-0 relative p-0'>
      <button
        onClick={() => {
          return setSelectedInvoice(null);
        }}
        className='absolute top-5 right-5 p-2  transition-colors duration-150 text-gray-400'
      >
        <XIcon className='w-4 h-4' />
      </button>
      <div className='bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-800 h-full flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 pb-3'>
          <div className='flex items-center gap-3'>
            <span className='text-[14px] font-medium text-gray-900 dark:text-gray-100'>
              {selectedInvoice.customer?.name}
              <span
                className={`ml-2 ${getStatusBadgeStyle(
                  selectedInvoice.status,
                )} px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide`}
              >
                {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
              </span>
            </span>
          </div>
        </div>

        {/* Amount */}
        <div className='px-6 pt-1 pb-5'>
          <div
            className={`text-3xl font-mono font-light text-gray-900 dark:text-gray-100 tracking-tight ${
              selectedInvoice.status === 'cancelled' ? 'line-through' : ''
            }`}
          >
            {formatCurrency(
              selectedInvoice.totals?.total || 0,
              selectedInvoice.settings?.currency || 'CAD',
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex gap-2 px-6 pb-6'>
          {selectedInvoice.status === 'open' || selectedInvoice.status === 'draft' ? (
            <button
              onClick={() => {
                return setEditingInvoice(selectedInvoice);
              }}
              className='flex-1 py-2 rounded-md bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors duration-150'
            >
              <span className='inline-flex items-center justify-center gap-1.5'>Edit</span>
            </button>
          ) : (
            // Status Message
            <div className='flex-1 py-2'>
              <div className='text-base font-medium'>
                {selectedInvoice.status === 'cancelled'
                  ? 'Canceled'
                  : selectedInvoice.status.charAt(0).toUpperCase() +
                    selectedInvoice.status.slice(1)}{' '}
                on {formatDate(selectedInvoice.statusChangedAt)}
              </div>
              <div className='text-xs text-gray-500 dark:text-gray-400'>
                {selectedInvoice.statusHistory?.[0]?.reason ||
                  `Marked as ${selectedInvoice.status}`}
              </div>
            </div>
          )}
          <InvoicePreviewActions
            invoice={selectedInvoice}
            onMarkAsPaid={onMarkAsPaid || (() => {})}
            onCancel={onCancel || (() => {})}
            onDelete={onDelete || (() => {})}
          />
        </div>

        {/* Details */}
        <div className='px-6 pb-4'>
          <div className='grid grid-cols-2 gap-y-2 text-xs text-gray-500 dark:text-gray-400'>
            <div>Due date</div>
            <div className='text-right text-gray-900 dark:text-gray-100 font-medium'>
              {formatDate(selectedInvoice.dueDate)}
            </div>
            <div>Issue date</div>
            <div className='text-right text-gray-900 dark:text-gray-100 font-medium'>
              {formatDate(selectedInvoice.issueDate)}
            </div>
            <div>Invoice no.</div>
            <div className='text-right text-gray-900 dark:text-gray-100 font-medium'>
              {selectedInvoice.invoiceNumber}
            </div>
          </div>
        </div>

        {/* Invoice link */}
        <div className='px-6 pb-4'>
          <div className='text-xs text-gray-500 dark:text-gray-400 mb-1.5'>Invoice link</div>
          <div className='flex items-center gap-1.5'>
            <input
              className='flex-1 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 truncate focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-700 transition-shadow'
              value={`https://${window.location.host}/i/${selectedInvoice._id}`}
              readOnly
            />
            <button
              className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 transition-colors duration-150'
              title='Copy'
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/i/${selectedInvoice._id}`);
                setCopyFeedback(true);
                setTimeout(() => {
                  return setCopyFeedback(false);
                }, 1500);
              }}
            >
              {copyFeedback ? (
                <svg
                  width='14'
                  height='14'
                  fill='none'
                  viewBox='0 0 24 24'
                  className='text-green-500'
                >
                  <path
                    d='M20 6L9 17L4 12'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              ) : (
                <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                  <rect
                    x='9'
                    y='9'
                    width='13'
                    height='13'
                    rx='2'
                    stroke='currentColor'
                    strokeWidth='1.5'
                  />
                  <rect
                    x='3'
                    y='3'
                    width='13'
                    height='13'
                    rx='2'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.5'
                  />
                </svg>
              )}
            </button>
            <button
              className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 transition-colors duration-150'
              title='Open'
              onClick={() => {
                window.open(`${window.location.origin}/i/${selectedInvoice._id}`, '_blank');
              }}
            >
              <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                <path
                  d='M14 3h7v7m0-7L10 14'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
            <button
              className='p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 transition-colors duration-150'
              title='Download'
              onClick={async () => {
                try {
                  const response = await newRequest.get(
                    `/invoices2/${selectedInvoice._id}/download`,
                    {
                      responseType: 'blob',
                    },
                  );

                  // Create a blob from the PDF data
                  const pdfBlob = new Blob([response.data], {
                    type: 'application/pdf',
                  });

                  // Create a URL for the blob
                  const url = window.URL.createObjectURL(pdfBlob);

                  // Create a temporary link element
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Invoice-${selectedInvoice.invoiceNumber}.pdf`;

                  // Append to body, click, and remove
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  // Clean up the URL object
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Error downloading PDF:', error);
                }
              }}
            >
              <svg width='14' height='14' fill='none' viewBox='0 0 24 24'>
                <path
                  d='M12 3v14m0 0l-4-4m4 4l4-4'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <rect x='4' y='19' width='16' height='2' rx='1' fill='currentColor' />
              </svg>
            </button>
          </div>
        </div>

        {/* Activity */}
        <div className='px-6 pt-2'>
          <button
            className='w-full flex items-center justify-between text-xs font-medium text-gray-900 dark:text-gray-100 py-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150'
            onClick={() => {
              return setActivityOpen(!activityOpen);
            }}
          >
            Activity
            <svg
              className={`w-3.5 h-3.5 ml-2 transition-transform duration-200 ${
                activityOpen ? '' : 'rotate-180'
              }`}
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                d='M19 9l-7 7-7-7'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          {activityOpen && (
            <div className='pl-2 pb-2 text-xs text-gray-500 dark:text-gray-400 space-y-3'>
              <div className='flex items-center gap-2'>
                <div className='w-3 flex justify-center'>
                  <span className='h-1.5 w-1.5 rounded-full bg-gray-400'></span>
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between'>
                    <span>Created</span>
                    <span className='text-gray-900 dark:text-gray-100'>
                      {formatDate(selectedInvoice.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {selectedInvoice.status === 'paid' && (
                <div className='flex items-center gap-2'>
                  <div className='w-3 flex justify-center'>
                    <span className='h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse'></span>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span>Paid</span>
                      <span className='text-gray-900 dark:text-gray-100'>
                        {formatDate(selectedInvoice.paidAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {selectedInvoice.status === 'cancelled' && (
                <div className='flex items-center gap-2'>
                  <div className='w-3 flex justify-center'>
                    <span className='h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse'></span>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span>Cancelled</span>
                      <span>{formatDate(selectedInvoice.statusChangedAt)}</span>
                    </div>
                  </div>
                </div>
              )}
              {selectedInvoice.status === 'open' && (
                <>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 flex justify-center'>
                      {selectedInvoice.statusHistory?.some((history) => {
                        return history.status === 'seen';
                      }) ? (
                        <span className='h-1.5 w-1.5 rounded-full bg-blue-400'></span>
                      ) : (
                        <span className='h-1.5 w-1.5 rounded-full border border-gray-300 dark:border-gray-600'></span>
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <span
                          className={
                            selectedInvoice.statusHistory?.some((history) => {
                              return history.status === 'seen';
                            })
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-500'
                          }
                        >
                          Seen
                        </span>
                        <span
                          className={
                            selectedInvoice.statusHistory?.some((history) => {
                              return history.status === 'seen';
                            })
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-500'
                          }
                        >
                          {selectedInvoice.statusHistory?.some((history) => {
                            return history.status === 'seen';
                          })
                            ? formatDate(
                                selectedInvoice.statusHistory.find((history) => {
                                  return history.status === 'seen';
                                })?.changedAt,
                              )
                            : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 flex justify-center'>
                      {selectedInvoice.status === 'paid' ? (
                        <span className='h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse'></span>
                      ) : (
                        <span className='h-1.5 w-1.5 rounded-full border border-gray-300 dark:border-gray-600'></span>
                      )}
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between'>
                        <span
                          className={
                            selectedInvoice.status === 'paid'
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-500'
                          }
                        >
                          Paid
                        </span>
                        <span
                          className={
                            selectedInvoice.status === 'paid'
                              ? 'text-gray-900 dark:text-gray-100'
                              : 'text-gray-400 dark:text-gray-500'
                          }
                        >
                          {selectedInvoice.status === 'paid'
                            ? formatDate(selectedInvoice.paidAt)
                            : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Internal note */}
        <div className='px-6 pb-6'>
          <button
            className='w-full flex items-center justify-between text-xs font-medium text-gray-900 dark:text-gray-100 py-2 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-150'
            onClick={() => {
              return setNoteOpen(!noteOpen);
            }}
          >
            Notes & Attachments
            <svg
              className={`w-3.5 h-3.5 ml-2 transition-transform duration-200 ${
                noteOpen ? '' : 'rotate-180'
              }`}
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                d='M19 9l-7 7-7-7'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          {noteOpen && (
            <div className='mt-2 space-y-3'>
              {/* Notes Section */}
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                  <svg
                    width='14'
                    height='14'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' />
                  </svg>
                  <span>Notes</span>
                </div>
                <textarea
                  className='w-full bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 min-h-[40px] focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-700 transition-shadow resize-none'
                  placeholder='Add a note...'
                  value={internalNote}
                  onChange={handleNoteChange}
                  onBlur={handleNoteBlur}
                />
              </div>

              {/* Attachments Section */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d='M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48' />
                    </svg>
                    <span>Attachments</span>
                  </div>
                  <button
                    className='text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                    onClick={() => {
                      return setIsFileManagerOpen(true);
                    }}
                  >
                    Manage Files
                  </button>
                </div>
                <div className='flex flex-col gap-2'>
                  {attachments.length > 0 ? (
                    attachments.map((file) => {
                      return (
                        <div
                          key={file._id}
                          className='flex items-center gap-2 p-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md'
                        >
                          <div className='p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded'>
                            <svg
                              width='16'
                              height='16'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                            >
                              <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                              <polyline points='14 2 14 8 20 8' />
                              <line x1='16' y1='13' x2='8' y2='13' />
                              <line x1='16' y1='17' x2='8' y2='17' />
                              <polyline points='10 9 9 9 8 9' />
                            </svg>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='text-xs font-medium text-gray-900 dark:text-gray-100 truncate'>
                              {file.originalName}
                            </div>
                            <div className='text-[10px] text-gray-500 dark:text-gray-400'>
                              Added {formatDate(file.createdAt)}
                            </div>
                          </div>
                          <div className='flex items-center gap-1'>
                            <button
                              className='p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-gray-500 transition-colors duration-150'
                              onClick={() => {
                                return window.open(file.downloadURL, '_blank');
                              }}
                            >
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                              >
                                <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
                                <polyline points='15 3 21 3 21 9' />
                                <line x1='10' y1='14' x2='21' y2='3' />
                              </svg>
                            </button>
                            <button
                              className='p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-gray-500 transition-colors duration-150'
                              onClick={() => {
                                return handleDeleteAttachment(file._id);
                              }}
                            >
                              <svg
                                width='14'
                                height='14'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                              >
                                <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className='py-2 text-sm text-gray-500 dark:text-gray-400'>
                      No attachments yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <FileUploadManagerModal
        isOpen={isFileManagerOpen}
        onClose={() => {
          return setIsFileManagerOpen(false);
        }}
        handleAddFileToProject={handleAddFileToProject}
        initialFiles={attachments}
        onDeleteFile={handleDeleteAttachment}
      />
    </div>
  );
};

export default InvoicePreview2;
