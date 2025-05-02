import { DollarSign, FileText, Package } from 'lucide-react';
import { useEffect } from 'react';

interface ReviewTabProps {
  formData: any;
  errors?: any;
  setHasUnsavedChanges?: (value: boolean) => void;
}

const ReviewTab = ({ formData, setHasUnsavedChanges }: ReviewTabProps) => {
  // Helper function to format price
  const formatPrice = (price: string) => {
    if (!price) return '-';
    return price.startsWith('$') ? price : `$${price}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      return dateString;
    }
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

      default:
        return <p>{field.content || '-'}</p>;
    }
  };

  useEffect(() => {
    // Set unsaved changes to false when we reach the review tab
    if (setHasUnsavedChanges) {
      // Mark all validations as complete when reaching review stage
      setHasUnsavedChanges(false);
    }
  }, [setHasUnsavedChanges]);

  return (
    <div className='max-w-3xl mx-auto'>
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-neutral-900 mb-2'>Review Deliverable</h3>
        <p className='text-neutral-600 text-sm'>
          Review the details of your deliverable before creating it. You can go back to make changes
          if needed.
        </p>
      </div>

      <div className='space-y-6 animate-fadeIn'>
        {/* Basic Info Card */}
        <div className='bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm'>
          <div className='bg-neutral-50 px-5 py-3 border-b border-neutral-200'>
            <h3 className='font-medium text-neutral-900'>Basic Information</h3>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              {/* Name */}
              <div>
                <h4 className='text-xs uppercase tracking-wider text-neutral-500 mb-1.5'>Name</h4>
                <p className='text-neutral-900 font-medium'>{formData.name || '-'}</p>
              </div>

              {/* Price */}
              <div className='flex items-start gap-3'>
                <div className='mt-0.5 bg-neutral-100 rounded-full p-1.5'>
                  <DollarSign size={14} className='text-neutral-500' />
                </div>
                <div>
                  <h4 className='text-xs uppercase tracking-wider text-neutral-500 mb-1'>Price</h4>
                  <p className='text-neutral-900 font-medium'>{formatPrice(formData.price)}</p>
                </div>
              </div>

              {/* Type */}
              <div className='flex items-start gap-3'>
                <div className='mt-0.5 bg-neutral-100 rounded-full p-1.5'>
                  <Package size={14} className='text-neutral-500' />
                </div>
                <div>
                  <h4 className='text-xs uppercase tracking-wider text-neutral-500 mb-1'>Type</h4>
                  <p className='text-neutral-900'>{getDeliverableTypeLabel()}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {formData.description && (
              <div className='mt-5 pt-5 border-t border-neutral-200'>
                <h4 className='text-xs uppercase tracking-wider text-neutral-500 mb-2'>
                  Description
                </h4>
                <p className='text-neutral-700 whitespace-pre-wrap'>{formData.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Sections Card */}
        <div className='bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm'>
          <div className='bg-neutral-50 px-5 py-3 border-b border-neutral-200'>
            <div className='flex items-center'>
              <FileText size={16} className='text-neutral-500 mr-2' />
              <h3 className='font-medium text-neutral-900'>Content Sections</h3>
            </div>
          </div>

          {formData.customFields.length > 0 ? (
            <div className='divide-y divide-neutral-100'>
              {formData.customFields.map((field: any) => {
                return (
                  hasContent(field) && (
                    <div key={field.id} className='p-5'>
                      <h4 className='font-medium text-neutral-900 mb-2'>{field.label}</h4>
                      <div className='text-neutral-700'>{formatFieldContent(field)}</div>
                    </div>
                  )
                );
              })}
            </div>
          ) : (
            <div className='p-5 text-center'>
              <p className='text-neutral-500'>No content sections added</p>
            </div>
          )}
        </div>

        {/* Notes Card (if applicable) */}
        {formData.teamNotes && (
          <div className='bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm'>
            <div className='bg-neutral-50 px-5 py-3 border-b border-neutral-200'>
              <h3 className='font-medium text-neutral-900'>Team Notes</h3>
            </div>
            <div className='p-5'>
              <p className='text-neutral-700 whitespace-pre-wrap'>{formData.teamNotes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewTab;
