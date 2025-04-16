import { getValueFormatter } from '@/components/database/CellRenderers';
import { ColDef, themeQuartz } from 'ag-grid-community';
import { useMemo } from 'react';

// Create a theme configuration for AG Grid
export const agGridTheme = themeQuartz.withParams({
  browserColorScheme: 'light',
  fontFamily: {
    googleFont: 'IBM Plex Sans',
  },
  headerFontSize: 14,
});

export const useAgGridConfig = (
  columnWidths: Record<string, number>,
  handleDeleteColumn: (columnId: string) => void,
) => {
  // Default column definitions
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: true,
      filter: true,
      editable: true, // Set everything editable by default
    };
  }, []);

  // Create the select column for row selection
  const createSelectColumn = (): ColDef => {
    return {
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
  };

  // Process column definitions to use value formatters properly
  const enhanceColumnDefs = (columnDefs: ColDef[]) => {
    return columnDefs.map((colDef) => {
      if (colDef.valueFormatter && typeof colDef.valueFormatter === 'string') {
        return {
          ...colDef,
          valueFormatter: getValueFormatter(colDef.valueFormatter),
        };
      }
      return colDef;
    });
  };

  // Create column definition for a specific column type
  const createColumnDef = (column: any, columnTypeId: string): Partial<ColDef> => {
    let cellRenderer;
    let valueFormatter;
    let cellEditor;
    let editable = true;
    let cellEditorParams = {};
    let cellRendererParams = {};
    let cellEditorPopup = false;

    // Handle column type-specific rendering
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
            values: column.options.selectOptions.map((option: any) => {
              return option.name;
            }),
          };
        }
        break;
      case 'phone':
        cellEditor = 'agTextCellEditor';
        cellRenderer = 'phoneCellRenderer';
        // Add phoneFormat to cellRendererParams if available
        if (column.options && column.options.phoneFormat) {
          cellRendererParams = {
            phoneFormat: column.options.phoneFormat,
          };
        }
        break;
      case 'user':
        cellEditor = 'agSelectCellEditor';
        break;
      case 'date':
        cellEditor = 'agDateCellEditor';
        valueFormatter = 'dateFormatter';
        break;
      case 'time':
        cellEditor = 'timeEditor';
        valueFormatter = 'timeFormatter';
        editable = true;
        break;
      case 'number':
        cellEditor = 'agTextCellEditor';
        valueFormatter = 'numberFormatter';
        break;
      case 'currency':
        cellEditor = 'agTextCellEditor';
        valueFormatter = 'currencyFormatter';
        break;
      case 'percent':
        cellEditor = 'agTextCellEditor';
        valueFormatter = 'percentFormatter';
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
      default:
        if (column.id === 'tags') {
          cellRenderer = 'tagsCellRenderer';
        }
    }

    // Additional special configuration for time and date fields
    const specialConfig =
      columnTypeId === 'time'
        ? {
            cellEditorPopup: false,
            editable: true,
            valueParser: (params: any) => {
              console.log('Time value parser called with:', params.newValue);
              return params.newValue;
            },
          }
        : columnTypeId === 'date'
        ? {
            cellEditorPopup: false,
            editable: true,
            valueParser: (params: any) => {
              console.log('Date value parser called with:', params.newValue);
              return params.newValue;
            },
          }
        : {};

    // Return the compiled column definition
    return {
      cellRenderer,
      valueFormatter,
      cellEditor,
      editable,
      cellEditorParams,
      cellRendererParams,
      cellEditorPopup,
      ...specialConfig,
    };
  };

  return {
    defaultColDef,
    createSelectColumn,
    enhanceColumnDefs,
    createColumnDef,
  };
};
