import { DollarSign, FileText, Maximize2, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDeliverableForm } from '../DeliverableFormContext';
import PreviewModal from './DeliverableContent/components/PreviewModal';
import SharedDisplayItemDetails from './DeliverableContent/components/SharedDisplayItemDetails';
import {
  formatFileSize,
  getFileIcon,
  getFileTypeLabel,
  isImageFile,
} from './DeliverableContent/utils/file-utils';

const ReviewTab = ({ previewMode = false }: { previewMode?: boolean }) => {
  const { formData, setHasUnsavedChanges } = useDeliverableForm();
  const [previewAttachment, setPreviewAttachment] = useState<any>(null);

  // Helper function to format price
  const formatPrice = (price: string) => {
    if (!price) return '-';
    return price.startsWith('$') ? price : `$${price}`;
  };

  // Get the deliverable type label
  const getDeliverableTypeLabel = () => {
    switch (formData.deliverableType) {
      case 'digital':
        return 'Digital Product';
      case 'service':
        return 'Custom Service';
      case 'physical':
        return 'Physical Product';
      case 'package':
        return 'Package';
      case 'other':
        return formData.customDeliverableType || 'Other';
      default:
        return '-';
    }
  };

  // Check if a field has content
  const hasContent = (field: any) => {
    if (!field) return false;

    switch (field.type) {
      case 'shortText':
      case 'longText':
      case 'specification':
        return !!field.content;
      case 'bulletList':
      case 'numberList':
        return Array.isArray(field.items) && field.items.length > 0;
      case 'link':
        return !!field.url;
      case 'attachment':
        return Array.isArray(field.attachments) && field.attachments.length > 0;
      case 'databaseItem':
        return !!field.selectedItem;
      default:
        return false;
    }
  };

  // Format field content for display
  const formatFieldContent = (field: any) => {
    switch (field.type) {
      case 'shortText':
      case 'longText':
        return <p className='whitespace-pre-wrap'>{field.content}</p>;

      case 'bulletList':
        return (
          <ul className='list-disc pl-5 space-y-1'>
            {field.items?.map((item: string, i: number) => {
              return <li key={i}>{item}</li>;
            })}
          </ul>
        );

      case 'numberList':
        return (
          <ol className='list-decimal pl-5 space-y-1'>
            {field.items?.map((item: string, i: number) => {
              return <li key={i}>{item}</li>;
            })}
          </ol>
        );

      case 'link':
        return (
          <div>
            <a
              href={field.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline flex items-center'
            >
              {field.text || field.url}
            </a>
          </div>
        );

      case 'specification':
        return (
          <div className='flex items-start space-x-2 text-amber-700 bg-amber-50 p-3 rounded-md'>
            <div className='text-sm'>{field.content}</div>
          </div>
        );

      case 'attachment':
        return (
          <div className='space-y-3'>
            {field.attachments && field.attachments.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {field.attachments.map((attachment: any, i: number) => {
                  return (
                    <div
                      key={i}
                      className='group relative rounded-lg shadow-sm border border-neutral-200 overflow-hidden transition-all hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 duration-200'
                    >
                      {/* Preview area */}
                      <div
                        className='relative bg-neutral-50 h-32 flex items-center justify-center cursor-pointer'
                        onClick={() => {
                          return setPreviewAttachment(attachment);
                        }}
                      >
                        {isImageFile(attachment.name) ? (
                          <div className='relative w-full h-full overflow-hidden'>
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className='h-full w-full object-cover'
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100'>
                              <Maximize2 className='text-white drop-shadow-md' size={22} />
                            </div>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center justify-center h-full w-full group-hover:scale-105 transition-transform'>
                            <div className='mb-2 transform group-hover:scale-110 transition-transform'>
                              {getFileIcon(attachment.name)}
                            </div>
                            <div className='text-xs font-medium bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-full'>
                              {getFileTypeLabel(attachment.name)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File info area */}
                      <div className='px-3 py-2.5 bg-white border-t border-neutral-100'>
                        <div className='text-sm font-medium text-neutral-800 truncate pb-0.5 group-hover:text-blue-600 transition-colors'>
                          {attachment.name}
                        </div>
                        <div className='text-xs text-neutral-500 flex items-center'>
                          <span className='inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5'></span>
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-neutral-500 text-sm italic'>No attachments</div>
            )}
          </div>
        );

      case 'databaseItem':
        return (
          <div>
            {field.selectedItem ? (
              <div
                className={`w-full ${
                  field.alignment === 'center'
                    ? 'flex justify-center'
                    : field.alignment === 'right'
                    ? 'flex justify-end'
                    : ''
                }`}
              >
                <div className='bg-neutral-50 border border-neutral-200 rounded-md px-4 py-3'>
                  <SharedDisplayItemDetails
                    item={field.selectedItem}
                    useFieldVisibility={true}
                    visibleColumns={field.visibleColumns}
                  />
                </div>
              </div>
            ) : (
              <div className='text-neutral-500 text-sm italic'>No item selected</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    // Set unsaved changes to false when we reach the review tab
    if (setHasUnsavedChanges && !previewMode) {
      // Mark all validations as complete when reaching review stage
      setHasUnsavedChanges(false);
    }
  }, [setHasUnsavedChanges, previewMode]);

  return (
    <div className='max-w-4xl mx-auto flex flex-col space-y-6'>
      {/* Preview modal for attachments */}
      {previewAttachment && (
        <PreviewModal
          isOpen={!!previewAttachment}
          onClose={() => {
            return setPreviewAttachment(null);
          }}
          attachment={previewAttachment}
        />
      )}

      {/* Basic details summary */}
      <section className='border border-neutral-200 rounded-lg overflow-hidden'>
        <header className='bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex items-center'>
          <FileText className='mr-3 text-neutral-500' size={18} />
          <h3 className='font-medium text-neutral-800'>Basic Details</h3>
        </header>

        <div className='p-5 space-y-5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <h4 className='text-sm text-neutral-500'>Deliverable Name</h4>
              <p className='font-medium'>{formData.name || '-'}</p>
            </div>
            <div className='space-y-1'>
              <h4 className='text-sm text-neutral-500'>Deliverable Type</h4>
              <p className='font-medium'>{getDeliverableTypeLabel()}</p>
            </div>
            <div className='space-y-1'>
              <h4 className='text-sm text-neutral-500'>Price</h4>
              <p className='font-medium flex items-center'>
                <DollarSign className='text-green-600 mr-1 h-4 w-4' />
                {formatPrice(formData.price) || '-'}
              </p>
            </div>
          </div>
          {formData.description && (
            <div className='space-y-1 border-t border-neutral-100 pt-4 mt-4'>
              <h4 className='text-sm text-neutral-500'>Description</h4>
              <p className='text-neutral-700 whitespace-pre-wrap'>{formData.description}</p>
            </div>
          )}
        </div>
      </section>

      {/* Content fields summary */}
      {formData.customFields && formData.customFields.length > 0 && (
        <section className='border border-neutral-200 rounded-lg overflow-hidden'>
          <header className='bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex items-center'>
            <Package className='mr-3 text-neutral-500' size={18} />
            <h3 className='font-medium text-neutral-800'>Deliverable Content</h3>
          </header>

          <div className='p-5'>
            <div className='space-y-8'>
              {formData.customFields.map((field: any, index: number) => {
                return (
                  <div
                    key={index}
                    className='pb-5 border-b border-neutral-100 last:border-b-0 last:pb-0'
                  >
                    <h4 className='text-md font-medium text-neutral-800 mb-2'>
                      {field.label || `Field ${index + 1}`}
                    </h4>
                    <div className='text-neutral-700'>{formatFieldContent(field)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Team notes */}
      {!previewMode && (
        <section className='border border-neutral-200 rounded-lg overflow-hidden'>
          <header className='bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex items-center'>
            <FileText className='mr-3 text-neutral-500' size={18} />
            <h3 className='font-medium text-neutral-800'>Team Notes</h3>
          </header>

          <div className='p-5'>
            {formData.teamNotes ? (
              <div className='whitespace-pre-wrap'>{formData.teamNotes}</div>
            ) : (
              <p className='text-neutral-500 italic'>No team notes added</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default ReviewTab;
