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
import { Column, SortConfig } from '@/types/database';
import { ChevronDown, Filter, Plus, Search, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function TablePage() {
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
    setRecords,
  } = useDatabase([]);

  // Initialize column order and widths
  useEffect(() => {
    if (columns.length > 0) {
      // Update column order with any new columns
      const newColumnOrder = [...columnOrder];
      const newColumnWidths = { ...columnWidths };

      columns.forEach((col) => {
        if (!newColumnOrder.includes(col.id)) {
          newColumnOrder.push(col.id);
        }
        if (!(col.id in newColumnWidths)) {
          newColumnWidths[col.id] = col.width || 200; // Default width
        }
      });

      setColumnOrder(newColumnOrder);
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

  // Handle column rename
  const handleRenameColumn = useCallback((columnId: string, currentName: string) => {
    setRenamingColumn({ id: columnId, name: currentName });
    setNewColumnName(currentName);
  }, []);

  const saveColumnRename = useCallback(async () => {
    if (renamingColumn && newColumnName.trim()) {
      try {
        await renameColumn(renamingColumn.id, newColumnName.trim());
        setRenamingColumn(null);
        setNewColumnName('');
      } catch (error) {
        console.error('Failed to rename column:', error);
      }
    }
  }, [renamingColumn, newColumnName, renameColumn]);

  // Handle column reordering
  const moveColumn = useCallback((dragIndex: number, hoverIndex: number) => {
    setColumnOrder((prev) => {
      const draggedColumnId = prev[dragIndex];
      const newColumnOrder = [...prev];
      newColumnOrder.splice(dragIndex, 1);
      newColumnOrder.splice(hoverIndex, 0, draggedColumnId);
      return newColumnOrder;
    });
  }, []);

  // Handle row reordering
  const moveRow = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragRecord = records[dragIndex];
      const newRecords = [...records];
      newRecords.splice(dragIndex, 1);
      newRecords.splice(hoverIndex, 0, dragRecord);

      // Update positions to maintain order
      const updatedRecords = newRecords.map((record, index) => {
        return {
          ...record,
          position: index + 1,
        };
      });

      setRecords(updatedRecords);
      // Update rowOrder to match the new order
      setRowOrder(
        updatedRecords.map((record) => {
          return record._id;
        }),
      );
    },
    [records, setRowOrder, setRecords],
  );

  // Handle column resizing
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, columnId: string) => {
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
    },
    [columnWidths, resizingColumnId],
  );

  // Handle column sorting
  const handleSort = useCallback(
    (columnId: string) => {
      let direction: 'asc' | 'desc' = 'asc';

      if (sortConfig && sortConfig.key === columnId) {
        direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
      }

      setSortConfig({ key: columnId, direction });

      // Sort the records
      const sortedRecords = [...records].sort((a, b) => {
        const aValue = a.values[columnId] || '';
        const bValue = b.values[columnId] || '';

        if (aValue < bValue) {
          return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });

      // Update positions based on sorted order
      const updatedRecords = sortedRecords.map((record, index) => {
        return {
          ...record,
          position: index + 1,
        };
      });

      // Update records with new positions
      setRecords(updatedRecords);
    },
    [records, sortConfig, setRecords],
  );

  // Make the entire column clickable for sorting
  const handleColumnClick = useCallback(
    (columnId: string) => {
      const column = columns.find((col) => {
        return col.id === columnId;
      });
      if (column?.sortable) {
        handleSort(columnId);
      }
    },
    [columns, handleSort],
  );

  const handleAddColumn = useCallback(() => {
    setIsAddColumnSheetOpen(true);
  }, [setIsAddColumnSheetOpen]);

  const handleDeleteSelected = useCallback(() => {
    // Implement delete functionality here
    alert('Delete selected records functionality would go here');
  }, []);

  // Get ordered records
  const orderedRecords = useMemo(() => {
    // Use rowOrder to maintain the order of records
    return rowOrder
      .map((id) => {
        return records.find((r) => {
          return r._id === id;
        });
      })
      .filter(Boolean);
  }, [rowOrder, records]);

  // Get ordered columns
  const orderedColumns = useMemo(() => {
    // If no columns, return empty array
    if (!columns || columns.length === 0) {
      return [];
    }

    // If columnOrder is empty, return columns sorted by their order property
    if (columnOrder.length === 0) {
      return [...columns]
        .sort((a, b) => {
          return (a.order || 0) - (b.order || 0);
        })
        .filter((col) => {
          return !col.hidden;
        });
    }

    // Otherwise, return columns in the specified order, filtering out hidden ones
    return columnOrder
      .map((id) => {
        return columns.find((col) => {
          return col.id === id;
        });
      })
      .filter((col): col is Column => {
        return col !== null && !col?.hidden;
      });
  }, [columns, columnOrder]);

  // Count selected records
  const selectedCount = useMemo(() => {
    return records.filter((r) => {
      return r.values?.selected || false;
    }).length;
  }, [records]);

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
              columns={orderedColumns}
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
              setRenamingColumn={setRenamingColumn}
              columnWidths={columnWidths}
              handleResizeStart={handleResizeStart}
              moveColumn={moveColumn}
            />
            <TableBody>
              {orderedRecords.map((record, index) => {
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
                          checked={record.values?.selected}
                          onCheckedChange={() => {
                            return toggleSelectRecord(record._id);
                          }}
                        />
                      </div>
                    </TableCell>
                    {orderedColumns.map((column) => {
                      if (!column) return;

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
            {orderedRecords.map((record) => {
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
                  {orderedColumns
                    .filter((col) => {
                      return col.id !== 'name';
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
          <div className='text-sm text-gray-500'>{selectedCount} selected</div>
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
