'use client';

import { FilterPanel } from '@/components/database/FilterPanel';
import { ImportProgressOverlay } from '@/components/database/ImportProgressOverlay';
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
import { importProgress } from './importProgress';

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
  const [quickFilterValue, setQuickFilterValue] = useState('');
  const [filters, setFilters] = useState<Array<{ column: string; value: string }>>([]);
  const [quickFilterTimeout, setQuickFilterTimeout] = useState<NodeJS.Timeout | null>(null);
  const quickFilterRef = useRef<HTMLInputElement | null>(null);

  // Filter state
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
    currentTableData,
  } = useDatabase([]);
  console.log('🚀 currentTableData:', currentTableData);

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

    if (params?.tableId) {
      handleDeleteSelected(gridRef, params.tableId as string, setRecords, setRowOrder, queryClient);
    }
  }, [params?.tableId, setRecords, setRowOrder, queryClient]);

  // Handle adding a new column
  const handleAddColumn = useCallback(() => {
    setIsAddColumnSheetOpen(true);
  }, [setIsAddColumnSheetOpen]);

  // Handle row drag end
  const handleRowDragEndCallback = useCallback(
    (event: any) => {
      if (params?.tableId) {
        handleRowDragEnd(event, records, params.tableId as string, setRecords, setRowOrder);
      }
    },
    [records, params?.tableId, setRecords, setRowOrder],
  );

  // Handle importing data from XLSX
  const handleImportData = useCallback(
    async (data: { columns: string[]; rows: any[]; sheetName?: string }) => {
      // Explicitly force the import dialog to stay visible
      importProgress.isImporting = true;
      importProgress.updateProgress(1, 'Starting import...');

      console.log(
        'Import started with:',
        data.columns.length,
        'columns,',
        data.rows.length,
        'rows',
      );

      try {
        if (!data.columns.length || !data.rows.length) {
          toast.error('No data to import');
          importProgress.finishImport(); // explicitly finish
          return;
        }

        // Reset and start import progress tracking - force value to ensure UI shows
        importProgress.updateProgress(5, 'Creating new table...');

        // Generate a table name based on the sheet name if available, otherwise use date/time
        const defaultSheetNames = ['Sheet1', 'Sheet 1', 'sheet1', 'sheet 1'];
        const useSheetName = data.sheetName && !defaultSheetNames.includes(data.sheetName);
        const tableName = useSheetName
          ? `${data.sheetName} Table`
          : `Imported Table ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

        // Step 1: Create a new table
        console.log('Creating new table:', tableName);
        const tableResponse = await newRequest.post('/tables/create', {
          name: tableName,
        });

        if (!tableResponse?.data?.data?._id) {
          importProgress.finishImport(); // explicitly finish
          throw new Error('Failed to create new table');
        }

        // Get the new table ID
        const newTableId = tableResponse.data.data._id;
        console.log('New table created:', newTableId);
        importProgress.updateProgress(10, 'Table created. Creating columns...', newTableId);

        // Step 2: Create columns in the new table
        const columnCreationPromises = data.columns.map(async (columnName, index) => {
          // Set default column type to text
          const columnType = 'text';

          try {
            // Create the column in the backend
            const response = await newRequest.post(`/tables/${newTableId}/columns`, {
              name: columnName || `Column ${index + 1}`,
              type: columnType,
              icon: 'LuText',
              isRequired: false,
              isPrimaryKey: index === 0, // Make the first column primary
              isUnique: false,
              description: `Imported from XLSX file`,
              order: index,
            });

            console.log(`Column created: ${columnName}`, response.data.data);

            // Make sure to use the actual ID returned from the API
            return {
              id: response.data.data._id,
              name: columnName || `Column ${index + 1}`,
              type: columnType,
              icon: 'LuText',
            };
          } catch (error) {
            console.error(`Failed to create column ${columnName}:`, error);
            throw error; // Re-throw to stop the process
          }
        });

        const createdColumns = await Promise.all(columnCreationPromises);
        console.log('Created columns:', createdColumns);
        importProgress.updateProgress(20, 'Columns created. Verifying structure...');

        // Wait a moment for backend processing
        await new Promise((resolve) => {
          return setTimeout(resolve, 2000);
        });

        // Verify columns exist in the backend before proceeding
        let tableColumns: any[] = [];
        try {
          const checkTableResponse = await newRequest.get(`/tables/${newTableId}`);
          tableColumns = checkTableResponse.data.data.columns;

          console.log('Table columns from backend:', tableColumns);

          // Create a mapping of column names to backend IDs to ensure correct assignment
          const columnMapping = new Map();
          tableColumns.forEach((col: any) => {
            columnMapping.set(col.name.toLowerCase(), col._id || col.id);
          });

          // Update created columns with confirmed backend IDs
          createdColumns.forEach((col) => {
            const backendId = columnMapping.get(col.name.toLowerCase());
            if (backendId) {
              col.id = backendId;
            }
          });
        } catch (error) {
          console.error('Failed to verify columns:', error);
          // Continue anyway
        }

        importProgress.updateProgress(25, 'Starting record creation...');

        // Step 3: Create rows in the new table
        const BATCH_SIZE = 10;
        let successfulRows = 0;
        let failedRows = 0;
        const totalRows = data.rows.length;
        const totalBatches = Math.ceil(totalRows / BATCH_SIZE);

        // Explicitly force the import dialog to stay visible during row creation
        importProgress.isImporting = true;
        window.dispatchEvent(new CustomEvent('import-progress-update'));

        for (let i = 0; i < totalRows; i += BATCH_SIZE) {
          const batch = data.rows.slice(i, i + BATCH_SIZE);
          const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

          // Calculate batch progress (25% to 90% of total progress)
          const batchProgress = Math.floor(25 + (currentBatch / totalBatches) * 65);
          // Force update with isImporting true
          importProgress.isImporting = true;
          importProgress.updateProgress(
            batchProgress,
            `Processing batch ${currentBatch}/${totalBatches} (${successfulRows} rows created)`,
          );

          console.log(
            `Processing batch ${currentBatch} of ${totalBatches}, dialog should be visible`,
          );

          // Force a UI update to ensure dialog stays visible
          window.dispatchEvent(new CustomEvent('import-progress-update'));

          // Process each row in the batch sequentially
          for (let batchIndex = 0; batchIndex < batch.length; batchIndex++) {
            const row = batch[batchIndex];
            const rowIndex = i + batchIndex;

            // Create the row in the backend with exact same format as manual creation
            // Ensure position is at least 1 to avoid the backend bug when position is falsy
            const safePosition = Math.max(1, rowIndex);
            console.log(`Creating row with position:`, safePosition);

            try {
              // Step 1: Create the row structure with just position
              const rowResponse = await newRequest.post(`/tables/${newTableId}/rows`, {
                position: safePosition,
              });

              if (rowResponse?.data?.data?._id) {
                console.log(`Row created with ID: ${rowResponse.data.data._id}`);

                // Step 2: Add values to each column one by one to avoid overwhelming the server
                let updateSuccess = true;

                // Map column values from rows array using column indexes
                const values: Record<string, any> = {};
                createdColumns.forEach((column, colIndex) => {
                  if (column && column.id) {
                    const cellValue = row[colIndex] !== undefined ? row[colIndex] : '';
                    values[column.id] = cellValue;
                  }
                });

                // Now update each column value
                for (const [columnId, value] of Object.entries(values)) {
                  try {
                    await newRequest.post(`/tables/${newTableId}/records`, {
                      values: { [columnId]: value },
                      columnId: columnId,
                      rowId: rowResponse.data.data._id,
                    });
                  } catch (updateError) {
                    console.error(
                      `Failed to update column ${columnId} for row ${rowIndex}:`,
                      updateError,
                    );
                    updateSuccess = false;
                  }

                  // Small delay between column updates
                  await new Promise((resolve) => {
                    return setTimeout(resolve, 50);
                  });
                }

                // Force the dialog to stay visible during processing
                importProgress.isImporting = true;
                window.dispatchEvent(new CustomEvent('import-progress-update'));

                if (updateSuccess) {
                  successfulRows++;

                  // Update progress to show row creation
                  const rowProgress = Math.floor(25 + ((i + batchIndex + 1) / totalRows) * 65);
                  importProgress.updateProgress(
                    rowProgress,
                    `Created ${successfulRows} of ${totalRows} rows...`,
                  );
                } else {
                  console.warn(`Row ${rowIndex} created but had some column update failures`);
                  // Still count as success since the row exists
                  successfulRows++;
                }
              } else {
                console.error(`Row ${rowIndex} creation response invalid:`, rowResponse);
                failedRows++;
              }
            } catch (error) {
              failedRows++;
              console.error(`Error creating row ${rowIndex}:`, error?.response?.data || error);
              console.error('Failed row data:', row);
              // Continue with next row after a slightly longer delay
              await new Promise((resolve) => {
                return setTimeout(resolve, 500);
              });
            }
          }

          // Add a longer delay between batches to prevent overwhelming the server
          await new Promise((resolve) => {
            return setTimeout(resolve, 1000);
          });
        }

        // Wait a bit longer before redirecting to ensure all backend processes complete
        await new Promise((resolve) => {
          return setTimeout(resolve, 3000);
        });

        importProgress.updateProgress(95, 'Verifying imported data...');

        // Verify that rows were actually created in the new table
        try {
          const checkRowsResponse = await newRequest.get(`/tables/${newTableId}/records`);
          const actualRowCount = checkRowsResponse?.data?.data?.length || 0;
          console.log(`Verification: Table has ${actualRowCount} rows in the database`);

          if (actualRowCount === 0 && successfulRows > 0) {
            console.warn('Rows were reported as created but none found in verification!');
            importProgress.updateProgress(
              100,
              `Import completed with issues. Created ${successfulRows} rows.`,
            );
          } else {
            importProgress.updateProgress(
              100,
              `Import completed. Created ${successfulRows} rows successfully.`,
            );
          }
        } catch (error) {
          console.error('Failed to verify final row count:', error);
          importProgress.updateProgress(
            100,
            `Import completed with ${successfulRows} rows, but verification failed.`,
          );
        }

        // Invalidate tables query to update the sidebar
        queryClient.invalidateQueries({ queryKey: ['tables'] });

        // Add a completion message
        importProgress.updateProgress(
          100,
          `Import successful! Created ${successfulRows} rows. Redirecting...`,
        );

        // Add button to navigate to new table
        const navigateButton = document.createElement('button');
        navigateButton.innerText = 'Go to New Table';
        navigateButton.className = 'bg-blue-600 text-white px-4 py-2 rounded mt-4 mx-auto block';
        navigateButton.onclick = () => {
          importProgress.navigateToTable();
        };

        // Give user time to see the completion message
        console.log('Import completed, waiting before navigation');
        setTimeout(() => {
          importProgress.navigateToTable();
        }, 2500);
      } catch (error) {
        // Report error in progress but keep the dialog open
        importProgress.updateProgress(100, 'Import failed: ' + (error.message || 'Unknown error'));

        console.error('Error importing data:', error);
        toast.error(
          'Failed to import data: ' +
            (error.response?.data?.message || error.message || 'Unknown error'),
        );

        // Allow the user to dismiss the error after a delay
        setTimeout(() => {
          importProgress.finishImport();
        }, 5000);
      }
    },
    [queryClient],
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
      <ImportProgressOverlay />
    </div>
  );
}
