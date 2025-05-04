import { agGridTheme } from '@/hooks/useAgGridConfig';
import { handleCellValueChange } from '@/utils/cellValueHandlers';
import { newRequest } from '@/utils/newRequest';
import { ColDef } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { getValueFormatter } from './CellRenderers';
import { gridComponents, handleCellEditingStopped } from './GridComponents';

interface TableGridProps {
  records: any[];
  columnDefs: ColDef[];
  defaultColDef: any;
  columns: any[];
  params: any;
  setRecords: (fn: (prevRecords: any[]) => any[]) => void;
  handleRowDragEnd: (event: any) => void;
}

// Convert to forwardRef to expose the grid API
export const TableGrid = forwardRef(function TableGrid(
  {
    records,
    columnDefs,
    defaultColDef,
    columns,
    params,
    setRecords,
    handleRowDragEnd,
  }: TableGridProps,
  ref,
) {
  const gridRef = useRef<AgGridReact>(null);
  const [componentUpdated, setComponentUpdated] = useState(false);

  // Expose the grid API to the parent component
  useImperativeHandle(ref, () => {
    return {
      api: gridRef.current?.api,
      // AG Grid has renamed columnApi to columnModel in newer versions
      // Using any type to avoid TypeScript errors
      columnApi: (gridRef.current as any)?.columnApi,
      current: {
        api: gridRef.current?.api,
        columnApi: (gridRef.current as any)?.columnApi,
      },
    };
  });

  // Enhance column definitions to use value formatters properly
  const enhancedColumnDefs = React.useMemo(() => {
    return columnDefs.map((colDef) => {
      if (colDef.valueFormatter && typeof colDef.valueFormatter === 'string') {
        return {
          ...colDef,
          valueFormatter: getValueFormatter(colDef.valueFormatter as string),
        };
      }
      return colDef;
    });
  }, [columnDefs]);

  // Cell value change handler
  const onCellValueChanged = useCallback(
    (cellParams: any) => {
      console.log('Cell value changed event triggered with params:', cellParams);
      handleCellValueChange(cellParams, columns, params.tableId, setRecords, gridRef);
    },
    [columns, params.tableId, setRecords],
  );

  // Custom event handler for cell editing
  const onCellEditingStopped = useCallback(
    (event: any) => {
      handleCellEditingStopped(event, columns, params, setRecords, gridRef, newRequest);
    },
    [columns, params, setRecords],
  );

  // Track when components are available
  useEffect(() => {
    // Signal that components are ready to be used
    setComponentUpdated(true);

    // Register custom components when grid is initialized
    if (gridRef.current?.api) {
      console.log('Registering custom editor components');
      // Force a refresh to apply components
      gridRef.current.api.refreshCells({ force: true });
    }
  }, []);

  // Ensure grid refreshes when components are updated
  useEffect(() => {
    if (componentUpdated && gridRef.current?.api) {
      // Refresh cells to apply new renderers
      gridRef.current.api.refreshCells({ force: true });
      setComponentUpdated(false);
    }
  }, [componentUpdated]);

  return (
    <div className='' style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <AgGridReact
        className='ag-grid-react'
        ref={gridRef}
        rowData={records}
        columnDefs={enhancedColumnDefs}
        defaultColDef={defaultColDef}
        rowSelection='multiple'
        onCellValueChanged={onCellValueChanged}
        components={gridComponents}
        animateRows={true}
        suppressDragLeaveHidesColumns={true}
        getRowId={(params) => {
          return params.data._id;
        }}
        enableCellTextSelection={true}
        suppressScrollOnNewData={true}
        singleClickEdit={false}
        stopEditingWhenCellsLoseFocus={true}
        suppressMovableColumns={false}
        undoRedoCellEditing={true}
        debug={true} // Enable AG Grid debugging
        onCellEditingStarted={(event) => {
          console.log('Cell editing started:', event);
        }}
        onCellEditingStopped={onCellEditingStopped}
        pagination={true}
        paginationPageSize={25}
        domLayout='normal'
        rowDragManaged={true}
        onRowDragEnd={handleRowDragEnd}
        suppressMoveWhenRowDragging={false}
        theme={agGridTheme}
        undoRedoCellEditingLimit={20}
      />
    </div>
  );
});
