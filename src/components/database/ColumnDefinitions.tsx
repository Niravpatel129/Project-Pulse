import { ColDef } from 'ag-grid-community';
import { useMemo } from 'react';
import CustomHeaderComponent from './CustomHeaderComponent';

export const useColumnDefinitions = (
  columns: any[],
  columnOrder: string[],
  columnWidths: Record<string, number>,
  handleDeleteColumn: (columnId: string) => void,
) => {
  // Get column type ID from column definition
  const getColumnTypeId = (column: any): string => {
    if (typeof column.type === 'string') {
      return column.type;
    } else if (column.type && typeof column.type === 'object') {
      return (column.type as any).id || '';
    }
    return '';
  };

  // Create column definitions for AG Grid
  return useMemo<ColDef[]>(() => {
    if (!columns || columns.length === 0) return [];

    // Debug column structures
    console.log('Column definitions:', columns);

    // Create a checkbox column for selection
    const selectColumn: ColDef = {
      headerName: '',
      field: 'selected',
      width: 20,
      minWidth: 49,
      maxWidth: 49,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      pinned: 'left',
      filter: false,
      resizable: false,
      sortable: false,
      editable: false,
    };

    // Map column definitions to AG Grid format
    const columnDefs: ColDef[] = columns
      .filter((col) => {
        return !col.hidden;
      })
      .sort((a, b) => {
        // Use columnOrder if available, otherwise sort by order property
        if (columnOrder.length > 0) {
          const aIndex = columnOrder.indexOf(a.id);
          const bIndex = columnOrder.indexOf(b.id);
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
        }
        return (a.order || 0) - (b.order || 0);
      })
      .map((column) => {
        // Convert width from our format to AG Grid format
        const width = columnWidths[column.id] || 200;

        // Set up column definition based on column type
        let cellRenderer;
        let valueFormatter;
        let cellEditor;
        let editable = true;
        let cellEditorParams = {};
        let cellRendererParams = {};
        let cellEditorPopup = false;

        // Get type ID
        const columnTypeId = getColumnTypeId(column);

        // Handle column type-specific rendering
        if (column.id === 'tags') {
          cellRenderer = 'tagsCellRenderer';
        } else {
          // Assign proper renderers and editors based on type
          switch (columnTypeId) {
            case 'single_line':
              cellEditor = 'agTextCellEditor';
              break;
            case 'long_text':
              cellEditor = 'agLargeTextCellEditor';
              break;
            case 'attachment':
              cellRenderer = 'fileCellRenderer';
              cellEditor = 'attachmentCellEditor';
              editable = true;
              cellEditorPopup = true;
              break;
            case 'image':
              cellRenderer = 'imageCellRenderer';
              editable = false;
              break;
            case 'checkbox':
              cellEditor = 'agCheckboxCellEditor';
              cellRenderer = 'checkboxCellRenderer';
              break;
            case 'multi_select':
              cellRenderer = 'tagsCellRenderer';
              break;
            case 'single_select':
              cellEditor = 'agSelectCellEditor';
              cellRenderer = 'singleSelectCellRenderer';
              // Set up the dropdown options from the column definition
              if (column.options && column.options.selectOptions) {
                cellEditorParams = {
                  values: column.options.selectOptions.map((option) => {
                    return option.name;
                  }),
                };
              }
              break;
            case 'phone':
              cellEditor = 'agTextCellEditor';
              cellRenderer = 'phoneCellRenderer';
              // Add phoneFormat to cellRendererParams if available
              if (column.options && (column.options as any).phoneFormat) {
                cellRendererParams = {
                  phoneFormat: (column.options as any).phoneFormat,
                };
              }
              break;
            case 'user':
              cellEditor = 'agSelectCellEditor';
              break;
            case 'date':
              cellEditor = 'agDateCellEditor';
              valueFormatter = 'dateFormatter';
              // Pass column options to params
              cellRendererParams = {
                ...(cellRendererParams || {}),
                options: column.options,
              };
              break;
            case 'time':
              cellEditor = 'timeEditor';
              valueFormatter = 'timeFormatter';
              editable = true;
              // Pass column options to params
              cellRendererParams = {
                ...(cellRendererParams || {}),
                options: column.options,
              };
              break;
            case 'number':
              cellEditor = 'agTextCellEditor';
              valueFormatter = 'numberFormatter';
              // Pass column options to params
              cellRendererParams = {
                ...(cellRendererParams || {}),
                options: column.options,
              };
              break;
            case 'currency':
              cellEditor = 'agTextCellEditor';
              valueFormatter = 'currencyFormatter';
              // Pass column options to params
              cellRendererParams = {
                ...(cellRendererParams || {}),
                options: column.options,
              };
              break;
            case 'percent':
              cellEditor = 'agTextCellEditor';
              valueFormatter = 'percentFormatter';
              // Pass column options to params
              cellRendererParams = {
                ...(cellRendererParams || {}),
                options: column.options,
              };
              break;
            case 'rating':
              cellRenderer = 'ratingCellRenderer';
              break;
            case 'url':
              cellRenderer = 'linkCellRenderer';
              break;
            case 'created_time':
            case 'last_modified':
              valueFormatter = 'dateFormatter';
              editable = false;
              break;
          }
        }

        // Add extra logging for time and date columns
        if (columnTypeId === 'time') {
          console.log('Setting up time column:', column.name, 'with id:', column.id);
        } else if (columnTypeId === 'date') {
          console.log('Setting up date column:', column.name, 'with id:', column.id);
        }

        return {
          headerName: column.name,
          sortable: true,
          field: `values.${column.id}`,
          filter: true,
          width,
          editable,
          cellRenderer,
          cellEditor,
          cellEditorParams,
          cellRendererParams,
          valueFormatter,
          resizable: true,
          cellEditorPopup,
          // For time columns, ensure we explicitly set these properties
          ...(columnTypeId === 'time'
            ? {
                editable: true, // Explicitly mark as editable
                valueParser: (params) => {
                  // Parse time values when entered
                  console.log('Time value parser called with:', params.newValue);
                  return params.newValue; // Return as-is, let onCellValueChanged handle conversion
                },
              }
            : {}),
          // For date columns, ensure we explicitly set these properties
          ...(columnTypeId === 'date'
            ? {
                editable: true, // Explicitly mark as editable
                valueParser: (params) => {
                  // Parse date values when entered
                  console.log('Date value parser called with:', params.newValue);
                  return params.newValue; // Return as-is, let onCellValueChanged handle conversion
                },
              }
            : {}),
          // Add custom header component
          headerComponent: CustomHeaderComponent,
          headerComponentParams: {
            displayName: column.name,
            deleteColumn: handleDeleteColumn,
            enableMenu: true,
            enableSorting: column.sortable !== false,
            // Pass phone format options if needed - use type assertion to avoid TS errors
            ...(columnTypeId === 'phone' && column.options
              ? { phoneFormat: (column.options as any).phoneFormat || 'international' }
              : {}),
          },
        };
      });

    // Add selection column at the beginning
    return [selectColumn, ...columnDefs];
  }, [columns, columnOrder, columnWidths, handleDeleteColumn]);
};
