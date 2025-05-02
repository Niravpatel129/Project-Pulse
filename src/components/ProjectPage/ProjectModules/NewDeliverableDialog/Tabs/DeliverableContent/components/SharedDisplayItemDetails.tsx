import { SharedDisplayItemDetailsProps } from '../types';

// Component to display item details with visible columns that can be shared between components
const SharedDisplayItemDetails = ({
  item,
  useFieldVisibility = false,
  tableColumns = [],
  visibleColumns = {},
}: SharedDisplayItemDetailsProps) => {
  // Helper function to find a good display value for an item
  const findDisplayValue = (item: any) => {
    // Try to find a string field other than id or position
    const stringFields = Object.entries(item)
      .filter(([key, value]) => {
        return typeof value === 'string' && key !== 'id' && key !== 'position';
      })
      .map(([_, value]) => {
        return value;
      });

    return stringFields[0] || `Item ${item.id}`;
  };

  // Get all fields except system fields
  const displayFields = Object.entries(item).filter(([key, value]) =>
    // Skip system/internal fields
    {
      return !['id', 'position', '_id', '__v'].includes(key) && typeof value !== 'object';
    },
  );

  // Find the main/primary field to display prominently
  const primaryValue = item.name || findDisplayValue(item);

  // Get the remaining fields to potentially display
  const secondaryFields = displayFields.filter(([key, value]) => {
    return value !== primaryValue && key !== 'name';
  });

  // When displaying a field in the form, we might need to use different visibility settings
  // Get these from the parent component (DeliverableContentTab) context
  const getEffectiveVisibleColumns = () => {
    if (useFieldVisibility) {
      // For field display, use the field's saved settings
      const fieldVisibleColumns = item.visibleColumns || visibleColumns;
      return fieldVisibleColumns;
    }
    // For dialog display, use the current state
    return visibleColumns;
  };

  const effectiveVisibleColumns = getEffectiveVisibleColumns();

  return (
    <>
      <div className='font-medium text-neutral-800 truncate'>
        {primaryValue || `Item ${item.id}`}
      </div>
      {secondaryFields.length > 0 && (
        <div className='mt-1 flex flex-wrap gap-x-4 gap-y-1'>
          {secondaryFields.map(([key, value]) => {
            // Find column definition to get proper name
            const column = tableColumns.find((col: any) => {
              return col.id === key;
            });
            const displayName = column?.name || key;

            // Check if this column should be visible
            if (column && effectiveVisibleColumns[column.id] === false) {
              return null;
            }

            return (
              <div key={key} className='text-xs text-neutral-500 truncate flex items-center'>
                <span className='w-2 h-2 bg-neutral-200 rounded-full mr-1.5 flex-shrink-0'></span>
                <span className='font-medium text-neutral-600'>{displayName}:</span>
                <span className='ml-1'>{String(value)}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default SharedDisplayItemDetails;
