import React from 'react';
import AttachmentCellEditor from './AttachmentCellEditor';
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

  // Custom cell editors
  timeEditor: TimeEditor,
  attachmentCellEditor: AttachmentCellEditor,

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

    if ((typeId === 'time' || typeId === 'date' || typeId === 'attachment') && event.value) {
      console.log(`Manual handling for ${typeId} column edit:`, event.value);

      try {
        if (gridRef.current?.api) {
          console.log('Refreshing cell after custom editor');
          gridRef.current.api.refreshCells({
            force: true,
            columns: [event.column.getId()],
            rowNodes: [event.node],
          });
        }
      } catch (error) {
        console.error('Error refreshing cell:', error);
      }
    }
  }
};
