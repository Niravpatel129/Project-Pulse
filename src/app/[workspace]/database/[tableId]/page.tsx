'use client';

import { DraggableRow } from '@/components/database/DraggableRow';
import { FilterPanel } from '@/components/database/FilterPanel';
import { PropertySheet } from '@/components/database/property-sheet';
import { TableCellMemo } from '@/components/database/TableCell';
import { TableHeaderMemo } from '@/components/database/TableHeader';
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
import { Table, TableBody, TableCell } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDatabase } from '@/hooks/useDatabase';
import { Column, Record as DatabaseRecord, SortConfig } from '@/types/database';
import { ChevronDown, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function TablePage() {
  const params = useParams();
  const tableId = params.tableId as string;
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const resizeStartX = useRef<number>(0);
  const initialWidth = useRef<number>(0);

  const {
    columns,
    records,
    editingCell,
    newTagText,
    allSelected,
    isAddColumnSheetOpen,
    propertySearchQuery,
    inputRef,
    selectedPropertyType,
    newPropertyName,
    propertyTypes,
    requestSort,
    addNewRow,
    addNewColumn,
    saveNewColumn,
    backToPropertySelection,
    startEditing,
    stopEditing,
    handleCellChange,
    handleCellKeyDown,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    toggleSelectAll,
    toggleSelectRecord,
    setNewTagText,
    setIsAddColumnSheetOpen,
    setPropertySearchQuery,
    newPropertyIconName,
    setNewPropertyIconName,
    setNewPropertyName,
    setNewPropertyPrefix,
    getIconComponent,
    renameColumn,
    toggleColumnVisibility,
    setPrimaryColumn,
    deleteColumn,
    updateRecordMutation,
    rowOrder,
    setRowOrder,
  } = useDatabase([]);

  // Initialize column order and widths
  useEffect(() => {
    if (columns.length > 0) {
      // Update column order with any new columns
      const newColumnOrder = [...columnOrder];
      columns.forEach((col) => {
        if (!newColumnOrder.includes(col.id)) {
          newColumnOrder.push(col.id);
        }
      });
      setColumnOrder(newColumnOrder);

      // Initialize column widths for new columns
      const newColumnWidths = { ...columnWidths };
      columns.forEach((col) => {
        if (!(col.id in newColumnWidths)) {
          newColumnWidths[col.id] = col.width || 200; // Default width
        }
      });
      setColumnWidths(newColumnWidths);
    }
  }, [columns]);

  // Initialize row order
  useEffect(() => {
    if (records.length > 0 && rowOrder.length === 0) {
      setRowOrder(
        records.map((record) => {
          return record._id;
        }),
      );
    }
  }, [records, rowOrder.length]);

  // Filter state
  const [filters, setFilters] = useState<Array<{ column: string; value: string }>>([]);
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');

  // Add state for column rename
  const [renamingColumn, setRenamingColumn] = useState<{ id: string; name: string } | null>(null);
  const [newColumnName, setNewColumnName] = useState('');

  // Add a new filter
  const addFilter = () => {
    if (filterColumn && filterValue) {
      setFilters([...filters, { column: filterColumn, value: filterValue }]);
      setFilterColumn('');
      setFilterValue('');
    }
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters([]);
  };

  // Handle column rename
  const handleRenameColumn = (columnId: string, currentName: string) => {
    setRenamingColumn({ id: columnId, name: currentName });
    setNewColumnName(currentName);
  };

  const saveColumnRename = () => {
    if (renamingColumn && newColumnName.trim()) {
      renameColumn(renamingColumn.id, newColumnName.trim());
      setRenamingColumn(null);
      setNewColumnName('');
    }
  };

  // Handle column reordering
  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const draggedColumnId = columnOrder[dragIndex];
    const newColumnOrder = [...columnOrder];
    newColumnOrder.splice(dragIndex, 1);
    newColumnOrder.splice(hoverIndex, 0, draggedColumnId);
    setColumnOrder(newColumnOrder);
  };

  // Handle row reordering
  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const draggedRowId = rowOrder[dragIndex];
    const newRowOrder = [...rowOrder];
    newRowOrder.splice(dragIndex, 1);
    newRowOrder.splice(hoverIndex, 0, draggedRowId);
    setRowOrder(newRowOrder);
  };

  // Handle column resizing
  const handleResizeStart = (e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumnId(columnId);
    resizeStartX.current = e.clientX;
    initialWidth.current = columnWidths[columnId] || 200;

    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumnId) {
        const deltaX = e.clientX - resizeStartX.current;
        const newWidth = Math.max(100, initialWidth.current + deltaX); // Minimum width of 100px
        setColumnWidths((prev) => {
          return {
            ...prev,
            [resizingColumnId]: newWidth,
          };
        });
      }
    };

    const handleMouseUp = () => {
      setResizingColumnId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle column sorting
  const handleSort = useCallback(
    (columnId: string) => {
      let direction: 'asc' | 'desc' = 'asc';

      if (sortConfig && sortConfig.key === columnId) {
        if (sortConfig.direction === 'asc') {
          direction = 'desc';
        } else {
          direction = 'asc';
        }
      }

      setSortConfig({ key: columnId, direction });

      // Sort the records
      const sortedRecords = [...records].sort((a, b) => {
        if (a[columnId] < b[columnId]) {
          return direction === 'asc' ? -1 : 1;
        }
        if (a[columnId] > b[columnId]) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

      // Update row order based on sorted records
      setRowOrder(
        sortedRecords.map((record) => {
          return record._id;
        }),
      );
    },
    [records, sortConfig],
  );

  // Make the entire column clickable for sorting
  const handleColumnClick = (columnId: string) => {
    if (
      columns.find((col) => {
        return col.id === columnId;
      })?.sortable
    ) {
      handleSort(columnId);
    }
  };

  const handleAddColumn = useCallback(() => {
    setIsAddColumnSheetOpen(true);
  }, [setIsAddColumnSheetOpen]);

  const handleDeleteSelected = useCallback(() => {
    // Implement delete functionality here
    alert('Delete selected records functionality would go here');
  }, []);

  // Get ordered records
  const getOrderedRecords = () => {
    if (rowOrder.length === 0) return records;
    return rowOrder
      .map((id) => {
        return records.find((record) => {
          return record._id === id;
        });
      })
      .filter(Boolean) as DatabaseRecord[];
  };

  // Get ordered columns
  const getOrderedColumns = () => {
    console.log('🚀 columns:', columns);
    console.log('🚀 columnOrder:', columnOrder);

    // If no columns, return empty array
    if (!columns || columns.length === 0) {
      console.log('No columns found');
      return [];
    }

    // If columnOrder is empty, return columns sorted by their order property
    if (columnOrder.length === 0) {
      const sortedColumns = [...columns]
        .sort((a, b) => {
          return (a.order || 0) - (b.order || 0);
        })
        .filter((col) => {
          return !col.hidden;
        });
      console.log('🚀 sortedColumns:', sortedColumns);
      return sortedColumns;
    }

    // Otherwise, return columns in the specified order, filtering out hidden ones
    // and ensuring we have a valid column for each ID
    console.log('Mapping columnOrder to columns...');
    const orderedColumns = columnOrder
      .map((id) => {
        console.log(`Looking for column with ID: ${id}`);
        const column = columns.find((col) => {
          console.log(`Comparing ${col.id} with ${id}`);
          return col.id === id;
        });
        if (!column) {
          console.warn(`Column with ID ${id} not found`);
          return null;
        }
        console.log(`Found column:`, column);
        return column;
      })
      .filter((col): col is Column => {
        console.log('Filtering column:', col);
        return col !== null && !col.hidden;
      });

    console.log('🚀 orderedColumns:', orderedColumns);
    return orderedColumns;
  };

  return (
    <DndProvider backend={HTML5Backend}>
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
                <Plus className='mr-2 h-4 w-4' />
                Add New Row
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteSelected}>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input placeholder='Search...' className='pl-8 h-9' />
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
          <Table>
            <TableHeaderMemo
              columns={getOrderedColumns()}
              sortConfig={sortConfig}
              onSort={handleSort}
              onAddColumn={handleAddColumn}
              allSelected={allSelected}
              toggleSelectAll={toggleSelectAll}
              onRenameColumn={handleRenameColumn}
              onToggleVisibility={toggleColumnVisibility}
              onSetPrimary={setPrimaryColumn}
              onDeleteColumn={deleteColumn}
              renamingColumn={renamingColumn}
              newColumnName={newColumnName}
              setNewColumnName={setNewColumnName}
              saveColumnRename={saveColumnRename}
              columnWidths={columnWidths}
              handleResizeStart={handleResizeStart}
              moveColumn={moveColumn}
            />
            <TableBody>
              {getOrderedRecords().map((record, index) => {
                return (
                  <DraggableRow
                    key={`row-${record._id}`}
                    record={record}
                    index={index}
                    moveRow={moveRow}
                  >
                    <TableCell className='border-r p-0 text-center '>
                      <div className='flex h-full items-center justify-center'>
                        <Checkbox
                          checked={record.values.selected}
                          onCheckedChange={() => {
                            return toggleSelectRecord(record._id);
                          }}
                        />
                      </div>
                    </TableCell>
                    {getOrderedColumns()
                      .filter((column) => {
                        return !column.hidden;
                      })
                      .map((column) => {
                        return (
                          <TableCellMemo
                            key={`cell-${record._id}-${column.id}`}
                            record={record}
                            column={column}
                            editingCell={editingCell}
                            onEdit={() => {
                              return startEditing(record._id, column.id);
                            }}
                            onCellChange={handleCellChange}
                            onCellKeyDown={handleCellKeyDown}
                            stopEditing={stopEditing}
                            inputRef={inputRef}
                            newTagText={newTagText}
                            setNewTagText={setNewTagText}
                            handleTagInputKeyDown={handleTagInputKeyDown}
                            removeTag={removeTag}
                            addTag={addTag}
                            columnWidths={columnWidths}
                            handleColumnClick={handleColumnClick}
                            isUpdating={
                              updateRecordMutation.isPending &&
                              editingCell.recordId === record._id &&
                              editingCell.columnId === column.id
                            }
                          />
                        );
                      })}
                    <TableCell></TableCell>
                  </DraggableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
            {getOrderedRecords().map((record) => {
              return (
                <div
                  key={`card-${record._id}`}
                  className='border rounded-md p-3 hover:shadow-md transition-shadow'
                >
                  <div className='flex justify-between items-center mb-2'>
                    <h3 className='font-medium'>{record.values.name}</h3>
                    <Checkbox
                      checked={record.values.selected}
                      onCheckedChange={() => {
                        return toggleSelectRecord(record._id);
                      }}
                    />
                  </div>
                  {getOrderedColumns()
                    .filter((col) => {
                      return col.id !== 'name' && !col.hidden;
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
          <div className='text-sm text-gray-500'>
            {
              records.filter((r) => {
                return r.values.selected;
              }).length
            }{' '}
            selected
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
    </DndProvider>
  );
}
