'use client';

import { FilterPanel } from '@/components/database/FilterPanel';
import { PropertySheet } from '@/components/database/property-sheet';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDatabase } from '@/hooks/useDatabase';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

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
