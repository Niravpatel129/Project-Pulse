import { toast } from 'sonner';
import { newRequest } from './newRequest';

// Process cell value based on column type
export const processCellValue = (
  column: any,
  columnId: string,
  newValue: any,
  oldValue: any,
): {
  processedValue: any;
  isValid: boolean;
  errorMessage?: string;
} => {
  // Get the column type
  let typeId = '';
  if (typeof column.type === 'string') {
    typeId = column.type;
  } else if (column.type && typeof column.type === 'object') {
    typeId = (column.type as any).id || '';
  }

  console.log('Column type detected:', typeId);
  console.log('Original value type:', typeof newValue, 'Value:', newValue);
  console.log('Old value:', oldValue);

  let processedValue = newValue;
  let isValid = true;
  let errorMessage;

  // Process value based on column type
  if (['number', 'currency', 'percent', 'rating'].includes(typeId)) {
    // For numeric fields
    if (newValue === '' || newValue === null || newValue === undefined) {
      processedValue = null;
    } else {
      // For numeric fields, ensure we're storing a number
      const numValue = Number(newValue);
      if (!isNaN(numValue)) {
        processedValue = numValue;
        console.log('Converted to number:', processedValue);
      } else {
        console.error('Invalid number format:', newValue);
        isValid = false;
        errorMessage = 'Invalid number format';
      }
    }
  } else if (typeId === 'time') {
    // For time type
    if (newValue === '' || newValue === null || newValue === undefined) {
      processedValue = null;
      console.log('Time value is empty, setting to null');
    } else {
      try {
        console.log('Processing time value:', newValue, 'Type:', typeof newValue);

        // Check if it's already a valid time format (e.g. "14:30")
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (timeRegex.test(newValue)) {
          // Create a date object for today with the specified time
          const [hours, minutes] = newValue.split(':').map(Number);
          const dateWithTime = new Date();
          dateWithTime.setHours(hours, minutes, 0, 0);

          // Store the time as an ISO string
          processedValue = dateWithTime.toISOString();
          console.log('Valid time - Processed to date value:', processedValue);
        } else {
          console.error('Invalid time format:', newValue);
          isValid = false;
          errorMessage = 'Invalid time format. Please use HH:MM format.';
        }
      } catch (error) {
        console.error('Invalid time format or processing error:', newValue, error);
        isValid = false;
        errorMessage = 'Invalid time format';
      }
    }
  } else if (typeId === 'date') {
    // For date type
    if (newValue === '' || newValue === null || newValue === undefined) {
      processedValue = null;
      console.log('Date value is empty, setting to null');
    } else {
      try {
        console.log('Processing date value:', newValue, 'Type:', typeof newValue);

        let dateObj;

        if (newValue instanceof Date) {
          dateObj = newValue;
        } else if (typeof newValue === 'string') {
          // Try to parse the date string
          dateObj = new Date(newValue);

          if (isNaN(dateObj.getTime())) {
            // If parsing failed, try to handle common formats
            const parts = newValue.split(/[\/\-\.]/);
            if (parts.length === 3) {
              // Try common date formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
              if (parts[0].length === 4) {
                // YYYY-MM-DD
                dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              } else if (parseInt(parts[0]) > 12 && parseInt(parts[0]) <= 31) {
                // DD/MM/YYYY
                dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              } else {
                // MM/DD/YYYY
                dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
              }
            }
          }
        }

        if (dateObj && !isNaN(dateObj.getTime())) {
          processedValue = dateObj.toISOString();
          console.log('Valid date - Processed to ISO string:', processedValue);
        } else {
          console.error('Invalid date format:', newValue);
          isValid = false;
          errorMessage = 'Invalid date format. Please use a valid date format (e.g. YYYY-MM-DD).';
        }
      } catch (error) {
        console.error('Invalid date format or processing error:', newValue, error);
        isValid = false;
        errorMessage = 'Invalid date format';
      }
    }
  }

  return { processedValue, isValid, errorMessage };
};

// Handle cell value change
export const handleCellValueChange = async (
  cellParams: any,
  columns: any[],
  tableId: string,
  setRecords: (fn: (prevRecords: any[]) => any[]) => void,
  gridRef: any,
) => {
  const { data, colDef, newValue, oldValue } = cellParams;

  // Skip if no data or no new value for non-zero values
  if (!data || (newValue === undefined && newValue !== 0)) {
    console.log('Cell value change skipped - no data or no value');
    return;
  }

  const columnId = colDef.field.replace('values.', '');

  // Find the column definition to get its type
  const column = columns.find((col) => {
    return col.id === columnId;
  });

  if (!column) {
    console.log('Cell value change skipped - column not found:', columnId);
    return;
  }

  // Process the cell value
  const { processedValue, isValid, errorMessage } = processCellValue(
    column,
    columnId,
    newValue,
    oldValue,
  );

  if (!isValid) {
    toast.error(errorMessage || 'Invalid value');
    return;
  }

  console.log(
    'Final processed value ready for API:',
    processedValue,
    'Type:',
    typeof processedValue,
  );

  // Update the local records state first to prevent UI from reverting
  setRecords((prevRecords) => {
    return prevRecords.map((record) => {
      if (record._id === data._id) {
        const updatedValues = { ...record.values };
        updatedValues[columnId] = processedValue;
        console.log('Updating local record:', record._id, 'with value:', processedValue);
        return {
          ...record,
          values: updatedValues,
        };
      }
      return record;
    });
  });

  console.log(
    'Sending API request with value:',
    processedValue,
    'for column:',
    columnId,
    'rowId:',
    data._id,
  );

  try {
    // Make the actual API call
    const response = await newRequest.post(`/tables/${tableId}/records`, {
      values: {
        [columnId]: processedValue,
      },
      columnId: columnId,
      rowId: data._id,
    });

    console.log('API response for value update:', response);

    // Ensure the grid shows the correct formatted value
    setTimeout(() => {
      if (gridRef.current && gridRef.current.api) {
        console.log('Refreshing cell after successful API call');
        gridRef.current.api.refreshCells({
          force: true,
          columns: [colDef.field],
          rowNodes: [gridRef.current.api.getRowNode(data._id)!],
        });
      }
    }, 0);
  } catch (error) {
    console.error('Failed to update cell value:', error);
    toast.error('Failed to update cell value');

    // Revert the change in case of API failure
    setRecords((prevRecords) => {
      return prevRecords.map((record) => {
        if (record._id === data._id) {
          const revertedValues = { ...record.values };
          revertedValues[columnId] = oldValue;
          return {
            ...record,
            values: revertedValues,
          };
        }
        return record;
      });
    });
  }
};
