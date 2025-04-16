'use client';

import { FilterPanel } from '@/components/database/FilterPanel';
import { PropertySheet } from '@/components/database/property-sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDatabase } from '@/hooks/useDatabase';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import {
  ColumnApiModule,
  NumberEditorModule,
  RenderApiModule,
  RowApiModule,
  SelectEditorModule,
  themeQuartz,
} from 'ag-grid-community';
import { ChevronDown, ColumnsIcon, Filter, Plus, RowsIcon, Search, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// AG Grid imports
import CustomHeaderComponent from '@/components/database/CustomHeaderComponent';
import {
  ClientSideRowModelModule,
  ColDef,
  CustomFilterModule,
  DateFilterModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  RowDragModule,
  RowSelectionModule,
  TextEditorModule,
  TextFilterModule,
  ValidationModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

// Import cell renderers from modularized component
import {
  fileCellRenderer,
  getValueFormatter,
  imageCellRenderer,
  linkCellRenderer,
  phoneCellRenderer,
  ratingCellRenderer,
  tagsCellRenderer,
} from '@/components/database/CellRenderers';

const myTheme = themeQuartz.withParams({
  browserColorScheme: 'light',
  fontFamily: {
    googleFont: 'IBM Plex Sans',
  },
  headerFontSize: 14,
});

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
]);

export default function TablePage() {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const gridRef = useRef<AgGridReact>(null);
  const quickFilterRef = useRef<HTMLInputElement>(null);
  const [componentUpdated, setComponentUpdated] = useState(false);

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

  // Filter state
  const [filters, setFilters] = useState<Array<{ column: string; value: string }>>([]);
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');

  // Add state for column rename
  const [renamingColumn, setRenamingColumn] = useState<{ id: string; name: string } | null>(null);
  const [newColumnName, setNewColumnName] = useState('');

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

  const handleDeleteSelected = useCallback(() => {
    // Get selected rows from AG Grid
    const selectedNodes = gridRef.current?.api.getSelectedNodes();
    if (!selectedNodes || selectedNodes.length === 0) {
      toast.error('No records selected');
      return;
    }

    const selectedRecordIds = selectedNodes.map((node) => {
      return node.data._id;
    });

    // Delete each selected record
    Promise.all(
      selectedRecordIds.map((recordId) => {
        return newRequest.delete(`/tables/${params.tableId}/rows/${recordId}`);
      }),
    )
      .then(() => {
        // AG Grid will automatically update when the rowData changes
        setRecords((prevRecords) => {
          return prevRecords.filter((record) => {
            return !selectedRecordIds.includes(record._id);
          });
        });

        // Update row order
        setRowOrder((prevOrder) => {
          return prevOrder.filter((id) => {
            return !selectedRecordIds.includes(id);
          });
        });

        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['table-records', params.tableId] });
        toast.success('Selected records deleted successfully');
      })
      .catch((error) => {
        console.error('Failed to delete records:', error);
        toast.error('Failed to delete records');
      });
  }, [gridRef, params.tableId, setRecords, setRowOrder, queryClient]);

  // Handle adding a new column
  const handleAddColumn = useCallback(() => {
    setIsAddColumnSheetOpen(true);
  }, [setIsAddColumnSheetOpen]);

  // Apply quick filter for search
  const onFilterTextChange = useCallback(() => {
    if (gridRef.current && quickFilterRef.current) {
      // Use the correct API method for filtering
      const filterValue = quickFilterRef.current.value || '';
      gridRef.current.api.setGridOption('quickFilterText', filterValue);
    }
  }, []);

  // Handle row drag end
  const onRowDragEnd = useCallback(
    (event: any) => {
      const { node, overIndex } = event;
      const draggedId = node.data._id;
      const newRecords = [...records];

      // Find the record being dragged
      const draggedRecordIndex = newRecords.findIndex((r) => {
        return r._id === draggedId;
      });
      if (draggedRecordIndex === -1) return;

      const draggedRecord = newRecords[draggedRecordIndex];

      // Remove the record from its current position
      newRecords.splice(draggedRecordIndex, 1);

      // Insert it at the new position
      newRecords.splice(overIndex, 0, draggedRecord);

      // Update positions
      const updatedRecords = newRecords.map((record, index) => {
        return {
          ...record,
          position: index + 1,
        };
      });

      // Update local state
      setRecords(updatedRecords);

      // Update row order
      setRowOrder(
        updatedRecords.map((record) => {
          return record._id;
        }),
      );

      // Save the new order to the backend
      // Debounce this operation in a real application
      updatedRecords.forEach((record) => {
        newRequest
          .patch(`/tables/${params.tableId}/rows/${record._id}`, {
            position: record.position,
          })
          .catch((error) => {
            console.error('Failed to update row position:', error);
          });
      });
    },
    [records, params.tableId, setRecords, setRowOrder],
  );

  // Handle column deletion
  const handleDeleteColumn = useCallback(
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

  // Get AG Grid column definitions from our custom columns
  const columnDefs = useMemo<ColDef[]>(() => {
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

    // Map our column definitions to AG Grid format
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

        // Handle column type-specific rendering
        if (column.id === 'tags') {
          cellRenderer = 'tagsCellRenderer';
        } else {
          // Check if column type is an object or a string
          let typeId = '';

          if (typeof column.type === 'string') {
            typeId = column.type;
          } else if (column.type && typeof column.type === 'object') {
            // Use type assertion for the id property access
            typeId = (column.type as any).id || '';
          }

          // Log the column type for debugging
          console.log(`Column ${column.name} has type:`, column.type, 'typeId:', typeId);

          // Assign proper renderers and editors based on type
          switch (typeId) {
            case 'single_line':
              cellEditor = 'agTextCellEditor';
              break;
            case 'long_text':
              cellEditor = 'agLargeTextCellEditor';
              break;
            case 'attachment':
              cellRenderer = 'fileCellRenderer';
              editable = false;
              break;
            case 'image':
              cellRenderer = 'imageCellRenderer';
              editable = false;
              break;
            case 'checkbox':
              cellEditor = 'agCheckboxCellEditor';
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
              // For user dropdowns, you might need similar options handling
              break;
            case 'date':
              cellEditor = 'agDateCellEditor';
              valueFormatter = 'dateFormatter';
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
          }
        }

        // Get the typeId for header params
        let columnTypeId = '';
        if (typeof column.type === 'string') {
          columnTypeId = column.type;
        } else if (column.type && typeof column.type === 'object') {
          columnTypeId = (column.type as any).id || '';
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
          cellEditorParams, // Include the cell editor params
          cellRendererParams, // Add this line to pass cell renderer params
          valueFormatter,
          resizable: true,
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

  // Handle cell value change with AG Grid's built-in editing
  const onCellValueChanged = useCallback(
    (cellParams) => {
      console.log('Cell value changed:', cellParams);
      const { data, colDef, newValue, oldValue } = cellParams;
      const columnId = colDef.field.replace('values.', '');

      // Get tableId from component params
      const tableId = params.tableId;

      // Find the column definition to get its type
      const column = columns.find((col) => {
        return col.id === columnId;
      });
      let processedValue = newValue;

      console.log('Column being edited:', column);
      console.log('Original value type:', typeof newValue, 'Value:', newValue);
      console.log('Old value:', oldValue);

      // Process value based on column type
      if (column) {
        // Handle both string type and object type columns
        let typeId = '';
        if (typeof column.type === 'string') {
          typeId = column.type;
        } else if (column.type && typeof column.type === 'object') {
          typeId = (column.type as any).id || '';
        }

        console.log('Column type detected:', typeId);

        if (['number', 'currency', 'percent', 'rating'].includes(typeId)) {
          // Ensure numeric values are properly converted
          if (newValue === '' || newValue === null || newValue === undefined) {
            processedValue = null;
          } else {
            // For numeric fields, ensure we're storing a number
            const numValue = Number(newValue);
            if (!isNaN(numValue)) {
              processedValue = numValue;
              console.log('Converted to number:', processedValue);

              // Update the actual cell in the grid with the numeric value
              setTimeout(() => {
                if (gridRef.current && gridRef.current.api) {
                  const node = gridRef.current.api.getRowNode(data._id);
                  if (node) {
                    // Update the node data directly
                    const valuePath = `values.${columnId}`;
                    node.setDataValue(valuePath, numValue);
                  }
                }
              }, 0);
            } else {
              console.error('Invalid number format:', newValue);
              toast.error('Invalid number format');
              return; // Don't proceed with invalid number
            }
          }
        }
      }

      console.log('Processed value:', processedValue, 'Type:', typeof processedValue);

      // Update the local records state first to prevent UI from reverting
      setRecords((prevRecords) => {
        return prevRecords.map((record) => {
          if (record._id === data._id) {
            const updatedValues = { ...record.values };
            updatedValues[columnId] = processedValue;
            return {
              ...record,
              values: updatedValues,
            };
          }
          return record;
        });
      });

      newRequest
        .post(`/tables/${tableId}/records`, {
          values: {
            [columnId]: processedValue,
          },
          columnId: columnId,
          rowId: data._id,
        })
        .then((response) => {
          console.log('API response:', response);
        })
        .catch((error) => {
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
        });
    },
    [queryClient, params.tableId, columns, setRecords, gridRef],
  );

  // Default column definitions
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: true,
      filter: true,
    };
  }, []);

  // Card view implementation
  const renderCardView = () => {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
        {records.length === 0
          ? // Skeleton loading for card view
            Array.from({ length: 6 }).map((_, index) => {
              return (
                <div key={`skeleton-card-${index}`} className='border rounded-md p-3'>
                  <div className='flex justify-between items-center mb-2'>
                    <div className='h-5 w-32 bg-gray-200 rounded'></div>
                    <div className='h-4 w-4 bg-gray-200 rounded'></div>
                  </div>
                  {Array.from({ length: 3 }).map((_, fieldIndex) => {
                    return (
                      <div
                        key={`skeleton-field-${index}-${fieldIndex}`}
                        className='flex py-1 text-sm'
                      >
                        <div className='h-4 w-1/3 mr-2 bg-gray-200 rounded'></div>
                        <div className='h-4 w-2/3 bg-gray-200 rounded'></div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          : // Actual card data
            records
              .sort((a, b) => {
                // Sort by position or createdAt
                if (a.position !== undefined && b.position !== undefined) {
                  return a.position - b.position;
                }
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              })
              .map((record) => {
                return (
                  <div
                    key={`card-${record._id}`}
                    className='border rounded-md p-3 hover:shadow-md transition-shadow'
                  >
                    <div className='flex justify-between items-center mb-2'>
                      <h3 className='font-medium'>{record.values.name}</h3>
                      <Checkbox
                        checked={record.values?.selected}
                        onCheckedChange={() => {
                          return toggleSelectRecord(record._id);
                        }}
                      />
                    </div>
                    {columns
                      .filter((col) => {
                        return !col.hidden && col.id !== 'name';
                      })
                      .sort((a, b) => {
                        return (a.order || 0) - (b.order || 0);
                      })
                      .map((column) => {
                        return (
                          <div
                            key={`card-field-${record._id}-${column.id}`}
                            className='flex py-1 text-sm'
                          >
                            <span className='text-gray-500 w-1/3'>{column.name}:</span>
                            <span className='w-2/3'>
                              {column.id === 'tags' ? (
                                <div className='flex flex-wrap gap-1'>
                                  {record.values.tags?.map((tag) => {
                                    return (
                                      <Badge
                                        key={`tag-${tag.id}`}
                                        variant='outline'
                                        className='bg-amber-50 text-amber-700'
                                      >
                                        {tag.name}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              ) : (
                                record.values[column.id] || '-'
                              )}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
      </div>
    );
  };

  const components = useMemo(() => {
    return {
      // Existing renderers
      tagsCellRenderer,
      linkCellRenderer,
      imageCellRenderer,
      fileCellRenderer,
      ratingCellRenderer,
      phoneCellRenderer,
      // Add single select renderer
      singleSelectCellRenderer: (params) => {
        if (!params.value) return '-';
        // Handle both object format and string format
        return typeof params.value === 'object' ? params.value.name : params.value;
      },
    };
  }, []);

  // Track when components are available
  useEffect(() => {
    // Signal that components are ready to be used
    setComponentUpdated(true);
  }, [components]);

  // Ensure grid refreshes when components are updated
  useEffect(() => {
    if (componentUpdated && gridRef.current?.api) {
      // Refresh cells to apply new renderers
      gridRef.current.api.refreshCells({ force: true });
      setComponentUpdated(false);
    }
  }, [componentUpdated, gridRef]);

  // Update columnDefs to use value formatters properly
  const enhancedColumnDefs = useMemo(() => {
    return columnDefs.map((colDef) => {
      if (colDef.valueFormatter && typeof colDef.valueFormatter === 'string') {
        return {
          ...colDef,
          valueFormatter: getValueFormatter(colDef.valueFormatter),
        };
      }
      return colDef;
    });
  }, [columnDefs]);

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex items-center gap-2'>
          <Tabs
            value={viewMode}
            onValueChange={(value) => {
              return setViewMode(value as 'table' | 'card');
            }}
          >
            <TabsList>
              <TabsTrigger value='table'>Table View</TabsTrigger>
              <TabsTrigger value='card'>Card View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className='flex items-center gap-2'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => {
                    return setShowFilters(!showFilters);
                  }}
                  className={showFilters ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                >
                  <Filter className='h-4 w-4 mr-2' />
                  Filters {filters.length > 0 && `(${filters.length})`}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle filters</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                Actions
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={addNewRow}>
                <RowsIcon className='mr-2 h-4 w-4' />
                Add New Row
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddColumn}>
                <ColumnsIcon className='mr-2 h-4 w-4' />
                Add New Column
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteSelected}>
                <Trash2 className='mr-2 h-4 w-4 text-destructive' />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search...'
              className='pl-8 h-9'
              ref={quickFilterRef}
              onChange={onFilterTextChange}
            />
          </div>
        </div>
      </div>

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
          <div className='' style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
            <AgGridReact
              ref={gridRef}
              rowData={records}
              columnDefs={enhancedColumnDefs}
              defaultColDef={defaultColDef}
              rowSelection='multiple'
              onCellValueChanged={onCellValueChanged}
              components={components}
              animateRows={true}
              suppressDragLeaveHidesColumns={true}
              getRowId={(params) => {
                return params.data._id;
              }}
              enableCellTextSelection={true}
              suppressScrollOnNewData={true}
              singleClickEdit={true}
              pagination={true}
              paginationPageSize={25}
              domLayout='autoHeight'
              rowDragManaged={true}
              onRowDragEnd={onRowDragEnd}
              suppressMoveWhenRowDragging={false}
              theme={myTheme}
              stopEditingWhenCellsLoseFocus={true}
            />
          </div>
        ) : (
          renderCardView()
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
