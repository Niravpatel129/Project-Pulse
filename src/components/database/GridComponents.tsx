import React from 'react';
import {
  fileCellRenderer,
  imageCellRenderer,
  linkCellRenderer,
  phoneCellRenderer,
  ratingCellRenderer,
  tagsCellRenderer,
  timeCellRenderer,
} from './CellRenderers';
import TimeEditor from './TimeEditor';

// Export all components needed for AG Grid
export const gridComponents = {
  // Custom cell renderers
  tagsCellRenderer,
  linkCellRenderer,
  imageCellRenderer,
  fileCellRenderer,
  ratingCellRenderer,
  phoneCellRenderer,
  timeCellRenderer,
  timeEditor: TimeEditor,

  // Single select renderer
  singleSelectCellRenderer: (params: any) => {
    if (!params.value) return '-';
    // Handle both object format and string format
    return typeof params.value === 'object' ? params.value.name : params.value;
  },
};

// Custom cell editing handlers
export const handleCellEditingStopped = (
  event: any,
  columns: any[],
  params: any,
  setRecords: (fn: (prevRecords: any[]) => any[]) => void,
  gridRef: React.RefObject<any>,
  newRequest: any,
) => {
  console.log('Cell editing stopped:', event);

  // If it's a time or date column and has a value, manually update
  const columnId = event.column.getId().replace('values.', '');
  const column = columns.find((col) => {
    return col.id === columnId;
  });

  if (column) {
    let typeId = '';
    if (typeof column.type === 'string') {
      typeId = column.type;
    } else if (column.type && typeof column.type === 'object') {
      typeId = (column.type as any).id || '';
    }

    if ((typeId === 'time' || typeId === 'date') && event.value) {
      console.log(`Manual handling for ${typeId} column edit:`, event.value);

      try {
        let processedValue;

        if (typeId === 'time') {
          // Process time value (HH:MM)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (timeRegex.test(event.value)) {
            // Create a date object for today with the specified time
            const [hours, minutes] = event.value.split(':').map(Number);
            const dateWithTime = new Date();
            dateWithTime.setHours(hours, minutes, 0, 0);

            processedValue = dateWithTime.toISOString();
          } else {
            console.error('Invalid time format:', event.value);
            return;
          }
        } else if (typeId === 'date') {
          // Process date value - could be in several formats
          let dateObj;

          if (event.value instanceof Date) {
            dateObj = event.value;
          } else if (typeof event.value === 'string') {
            // Try to parse the date string
            dateObj = new Date(event.value);

            if (isNaN(dateObj.getTime())) {
              // If parsing failed, try to handle common formats
              const parts = event.value.split(/[\/\-\.]/);
              if (parts.length === 3) {
                // Try common date formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
                if (parts[0].length === 4) {
                  // YYYY-MM-DD
                  dateObj = new Date(
                    parseInt(parts[0]),
                    parseInt(parts[1]) - 1,
                    parseInt(parts[2]),
                  );
                } else if (parseInt(parts[0]) > 12 && parseInt(parts[0]) <= 31) {
                  // DD/MM/YYYY
                  dateObj = new Date(
                    parseInt(parts[2]),
                    parseInt(parts[1]) - 1,
                    parseInt(parts[0]),
                  );
                } else {
                  // MM/DD/YYYY
                  dateObj = new Date(
                    parseInt(parts[2]),
                    parseInt(parts[0]) - 1,
                    parseInt(parts[1]),
                  );
                }
              }
            }
          }

          if (dateObj && !isNaN(dateObj.getTime())) {
            processedValue = dateObj.toISOString();
          } else {
            console.error('Invalid date format:', event.value);
            return;
          }
        }

        console.log(`Manually processing ${typeId} value to:`, processedValue);

        if (!processedValue) {
          console.error(`Failed to process ${typeId} value:`, event.value);
          return;
        }

        // Update the records state
        setRecords((prevRecords) => {
          return prevRecords.map((record) => {
            if (record._id === event.node.id) {
              const updatedValues = { ...record.values };
              updatedValues[columnId] = processedValue;
              console.log(
                `Manually updating record: ${record._id} with ${typeId} value:`,
                processedValue,
              );
              return {
                ...record,
                values: updatedValues,
              };
            }
            return record;
          });
        });

        // Make the API call directly
        console.log(`Making manual API call for ${typeId} value`);
        newRequest
          .post(`/tables/${params.tableId}/records`, {
            values: {
              [columnId]: processedValue,
            },
            columnId: columnId,
            rowId: event.node.id,
          })
          .then((response: any) => {
            console.log(`Manual ${typeId} update API response:`, response);

            // Refresh the cell
            if (gridRef.current && gridRef.current.api) {
              setTimeout(() => {
                gridRef.current!.api.refreshCells({
                  force: true,
                  columns: [event.column.getId()],
                  rowNodes: [event.node],
                });
              }, 0);
            }
          })
          .catch((error: any) => {
            console.error(`Failed to update ${typeId} value:`, error);
          });
      } catch (error) {
        console.error(`Error manually processing ${typeId} value:`, error);
      }
    }
  }
};
