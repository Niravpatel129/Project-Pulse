'use client';

import { FilterPanel } from '@/components/database/FilterPanel';
import { PropertySheet } from '@/components/database/property-sheet';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDatabase } from '@/hooks/useDatabase';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// AG Grid imports
import {
  CheckboxEditorModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  CustomEditorModule,
  CustomFilterModule,
  DateEditorModule,
  DateFilterModule,
  ModuleRegistry,
  NumberEditorModule,
  NumberFilterModule,
  PaginationModule,
  RenderApiModule,
  RowApiModule,
  RowDragModule,
  RowSelectionModule,
  SelectEditorModule,
  TextEditorModule,
  TextFilterModule,
  UndoRedoEditModule,
  ValidationModule,
} from 'ag-grid-community';

// Import modular components created for this refactoring
import { CardView } from '@/components/database/CardView';
import { useColumnDefinitions } from '@/components/database/ColumnDefinitions';
import { handleDeleteSelected, handleRowDragEnd } from '@/components/database/RowHandlers';
import { TableGrid } from '@/components/database/TableGrid';
import { TableToolbar } from '@/components/database/TableToolbar';
import { useAgGridConfig } from '@/hooks/useAgGridConfig';

// Register the required modules
ModuleRegistry.registerModules([
  RowApiModule,
  ClientSideRowModelModule,
  ValidationModule,
  RowSelectionModule,
  TextEditorModule,
  RowDragModule,
  PaginationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  CustomFilterModule,
  ColumnApiModule,
  RenderApiModule,
  NumberEditorModule,
  SelectEditorModule,
  DateEditorModule,
  CustomEditorModule,
  UndoRedoEditModule,
  CheckboxEditorModule,
]);

export default function TablePage() {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const quickFilterRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [filters, setFilters] = useState<Array<{ column: string; value: string }>>([]);
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const {
    columns,
    records,
    isAddColumnSheetOpen,
    propertySearchQuery,
    selectedPropertyType,
    newPropertyName,
    propertyTypes,
    addNewRow,
    addNewColumn,
    saveNewColumn,
    backToPropertySelection,
    toggleSelectRecord,
    setIsAddColumnSheetOpen,
    setPropertySearchQuery,
    newPropertyIconName,
    setNewPropertyIconName,
    setNewPropertyName,
    setNewPropertyPrefix,
    getIconComponent,
    renameColumn,
    setRowOrder,
    setRecords,
    deleteColumn,
  } = useDatabase([]);

  const queryClient = useQueryClient();
  const params = useParams();

  // Add a new filter
  const addFilter = useCallback(() => {
    if (filterColumn && filterValue) {
      setFilters((prev) => {
        return [...prev, { column: filterColumn, value: filterValue }];
      });
      setFilterColumn('');
      setFilterValue('');
    }
  }, [filterColumn, filterValue]);

  // Remove a filter
  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => {
      const newFilters = [...prev];
      newFilters.splice(index, 1);
      return newFilters;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Handle column deletion
  const handleDeleteColumnCallback = useCallback(
    (columnId: string) => {
      // Show a confirmation dialog before deleting
      if (
        window.confirm(`Are you sure you want to delete this column? This action cannot be undone.`)
      ) {
        deleteColumn(columnId);
      }
    },
    [deleteColumn],
  );

  // Get AG Grid configuration from custom hook
  const { defaultColDef } = useAgGridConfig(columnWidths, handleDeleteColumnCallback);

  // Get column definitions from custom hook
  const columnDefs = useColumnDefinitions(
    columns,
    columnOrder,
    columnWidths,
    handleDeleteColumnCallback,
  );

  // Apply quick filter for search
  const onFilterTextChange = useCallback(() => {
    if (quickFilterRef.current) {
      const filterValue = quickFilterRef.current.value || '';
      if (document.querySelector('.ag-grid-react')) {
        const gridApi = (document.querySelector('.ag-grid-react') as any).__agGridReact.api;
        gridApi.setGridOption('quickFilterText', filterValue);
      }
    }
  }, []);

  // Handler for delete selected
  const handleDeleteSelectedCallback = useCallback(() => {
    // Use type assertion to access the __agGridReact property
    const gridElement = document.querySelector('.ag-grid-react');
    const gridRef = {
      current: gridElement ? (gridElement as any).__agGridReact : null,
    };

    handleDeleteSelected(gridRef, params.tableId as string, setRecords, setRowOrder, queryClient);
  }, [params.tableId, setRecords, setRowOrder, queryClient]);

  // Handle adding a new column
  const handleAddColumn = useCallback(() => {
    setIsAddColumnSheetOpen(true);
  }, [setIsAddColumnSheetOpen]);

  // Handle row drag end
  const handleRowDragEndCallback = useCallback(
    (event: any) => {
      handleRowDragEnd(event, records, params.tableId as string, setRecords, setRowOrder);
    },
    [records, params.tableId, setRecords, setRowOrder],
  );

  // Handle importing data from XLSX
  const handleImportData = useCallback(
    async (data: { columns: string[]; rows: any[] }) => {
      try {
        if (!data.columns.length || !data.rows.length) {
          toast.error('No data to import');
          return;
        }

        // First, create columns for the imported data
        const columnCreationPromises = data.columns.map(async (columnName, index) => {
          // Generate a unique ID for the column
          const columnId = `col-${uuidv4().slice(0, 8)}`;

          // Set default column type to text
          const columnType = 'text';

          // Create the column in the backend
          const response = await newRequest.post(`/tables/${params.tableId}/columns`, {
            name: columnName || `Column ${index + 1}`,
            type: columnType,
            icon: 'LuText',
            isRequired: false,
            isPrimaryKey: index === 0, // Make the first column primary
            isUnique: false,
            description: `Imported from XLSX file`,
            order: index,
          });

          return {
            id: response.data.data._id || columnId,
            name: columnName || `Column ${index + 1}`,
            type: columnType,
            icon: 'LuText',
          };
        });

        const createdColumns = await Promise.all(columnCreationPromises);

        // Now create rows with the data
        const rowCreationPromises = data.rows.map(async (row, rowIndex) => {
          // Generate values object for the row
          const values: Record<string, any> = {};

          // Map column values
          createdColumns.forEach((column, colIndex) => {
            values[column.id] = row[colIndex] !== undefined ? row[colIndex] : '';
          });

          // Create the row in the backend
          const rowResponse = await newRequest.post(`/tables/${params.tableId}/records`, {
            values,
            position: rowIndex,
          });

          return rowResponse.data;
        });

        await Promise.all(rowCreationPromises);

        // Refresh the table data
        queryClient.invalidateQueries({ queryKey: ['table', params.tableId] });
        queryClient.invalidateQueries({ queryKey: ['table-records', params.tableId] });

        toast.success('Data imported successfully');
      } catch (error) {
        console.error('Error importing data:', error);
        toast.error('Failed to import data');
      }
    },
    [params.tableId, queryClient],
  );

  return (
    <div>
      <TableToolbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filters={filters}
        quickFilterRef={quickFilterRef}
        onFilterTextChange={onFilterTextChange}
        addNewRow={addNewRow}
        handleAddColumn={handleAddColumn}
        handleDeleteSelected={handleDeleteSelectedCallback}
        handleImportData={handleImportData}
      />

      <FilterPanel
        showFilters={showFilters}
        filters={filters}
        filterColumn={filterColumn}
        filterValue={filterValue}
        columns={columns}
        setFilterColumn={setFilterColumn}
        setFilterValue={setFilterValue}
        addFilter={addFilter}
        removeFilter={removeFilter}
        clearFilters={clearFilters}
      />

      <div className='pt-1 rounded-md shadow-sm'>
        {viewMode === 'table' ? (
          <TableGrid
            records={records}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            columns={columns}
            params={params}
            setRecords={setRecords}
            handleRowDragEnd={handleRowDragEndCallback}
          />
        ) : (
          <CardView records={records} columns={columns} toggleSelectRecord={toggleSelectRecord} />
        )}
        <div className='flex items-center justify-between border-t p-2'>
          <div className='flex items-center'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 rounded-sm'
                    onClick={addNewRow}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add new row</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className='ml-2 text-sm text-gray-500'>
              {records.length} record{records.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <PropertySheet
        isOpen={isAddColumnSheetOpen}
        onOpenChange={setIsAddColumnSheetOpen}
        selectedPropertyType={selectedPropertyType}
        propertySearchQuery={propertySearchQuery}
        propertyTypes={propertyTypes}
        newPropertyName={newPropertyName}
        newPropertyIconName={newPropertyIconName}
        onBackToPropertySelection={backToPropertySelection}
        onPropertySearchChange={(value) => {
          return setPropertySearchQuery(value);
        }}
        onPropertyNameChange={(value) => {
          return setNewPropertyName(value);
        }}
        onIconSelect={(name) => {
          setNewPropertyIconName(name);
          setNewPropertyPrefix(name);
        }}
        onSaveProperty={saveNewColumn}
        onAddNewColumn={addNewColumn}
        getIconComponent={getIconComponent}
      />
    </div>
  );
}
