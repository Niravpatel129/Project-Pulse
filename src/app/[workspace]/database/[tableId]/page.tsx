'use client';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDatabase } from '@/hooks/useDatabase';
import { ChevronDown, ChevronUp, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { memo, useCallback, useState } from 'react';

export default function TablePage() {
  const params = useParams();
  const tableId = params.tableId as string;
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showFilters, setShowFilters] = useState(false);

  const {
    columns,
    records,
    sortConfig,
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
  } = useDatabase();

  // Filter state
  const [filters, setFilters] = useState<Array<{ column: string; value: string }>>([]);
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');

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

  // Memoized Table Header Component
  const TableHeaderMemo = memo(
    ({
      columns,
      sortConfig,
      onSort,
      onAddColumn,
      allSelected,
      toggleSelectAll,
    }: {
      columns: any[];
      sortConfig: any;
      onSort: (id: string) => void;
      onAddColumn: () => void;
      allSelected: boolean;
      toggleSelectAll: (checked: boolean) => void;
    }) => {
      return (
        <TableHeader className='sticky top-0 z-10'>
          <TableRow className='bg-white hover:bg-white'>
            <TableHead className='w-10 border-r'>
              <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
            </TableHead>
            {columns.map((column) => {
              return (
                <TableHead key={column.id} className='border-r'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{column.name}</span>
                    {column.sortable && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-8 w-8'
                              onClick={() => {
                                return onSort(column.id);
                              }}
                            >
                              {sortConfig?.key === column.id ? (
                                sortConfig.direction === 'asc' ? (
                                  <ChevronUp className='h-4 w-4 text-primary' />
                                ) : (
                                  <ChevronDown className='h-4 w-4 text-primary' />
                                )
                              ) : (
                                <ChevronDown className='h-4 w-4 text-gray-500' />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {sortConfig?.key === column.id
                              ? `Sorted ${
                                  sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                                }`
                              : 'Sort column'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableHead>
              );
            })}
            <TableHead className='w-10'>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onAddColumn}>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add new column</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          </TableRow>
        </TableHeader>
      );
    },
  );
  TableHeaderMemo.displayName = 'TableHeaderMemo';

  // Memoized Table Cell Component
  const TableCellMemo = memo(
    ({
      record,
      column,
      editingCell,
      onEdit,
      onCellChange,
      onCellKeyDown,
      stopEditing,
      inputRef,
      newTagText,
      setNewTagText,
      handleTagInputKeyDown,
      removeTag,
      addTag,
    }: {
      record: any;
      column: any;
      editingCell: any;
      onEdit: () => void;
      onCellChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        recordId: number,
        columnId: string,
      ) => void;
      onCellKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      stopEditing: () => void;
      inputRef: React.RefObject<HTMLInputElement>;
      newTagText: Record<string, string>;
      setNewTagText: (value: Record<string, string>) => void;
      handleTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, recordId: number) => void;
      removeTag: (recordId: number, tagId: string) => void;
      addTag: (recordId: number) => void;
    }) => {
      return (
        <TableCell
          className={`border-r min-h-[40px] h-[40px] transition-colors ${
            editingCell.recordId === record.id && editingCell.columnId === column.id
              ? 'bg-blue-50'
              : ''
          }`}
          onClick={onEdit}
        >
          {column.id === 'tags' ? (
            <div className='flex flex-wrap gap-1 items-center'>
              {record.tags.map((tag) => {
                return (
                  <Badge
                    key={tag.id}
                    variant='outline'
                    className='bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200 flex items-center gap-1'
                  >
                    {tag.name}
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-4 w-4 p-0 hover:bg-amber-100'
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(record.id, tag.id);
                      }}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                );
              })}
              <div className='flex items-center'>
                <Input
                  value={newTagText[record.id] || ''}
                  onChange={(e) => {
                    setNewTagText({
                      ...newTagText,
                      [record.id]: e.target.value,
                    });
                  }}
                  onKeyDown={(e) => {
                    return handleTagInputKeyDown(e, record.id);
                  }}
                  className='h-6 w-20 min-w-20 text-xs'
                  placeholder='Add tag...'
                  onClick={(e) => {
                    return e.stopPropagation();
                  }}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 ml-1'
                        onClick={(e) => {
                          e.stopPropagation();
                          addTag(record.id);
                        }}
                      >
                        <Plus className='h-3 w-3' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add tag</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ) : (
            <div className='min-h-[28px] h-[28px] flex items-center w-full'>
              {editingCell.recordId === record.id && editingCell.columnId === column.id ? (
                <Input
                  ref={inputRef}
                  value={record[column.id] || ''}
                  onChange={(e) => {
                    return onCellChange(e, record.id, column.id);
                  }}
                  onBlur={stopEditing}
                  onKeyDown={onCellKeyDown}
                  className='h-8 m-0 p-2 w-full'
                  autoFocus
                />
              ) : column.id === 'name' ? (
                <div className='font-medium'>
                  {record.id}. {record[column.id]}
                </div>
              ) : (
                record[column.id]
              )}
            </div>
          )}
        </TableCell>
      );
    },
  );
  TableCellMemo.displayName = 'TableCellMemo';

  // Memoize handlers
  const handleSort = useCallback(
    (columnId: string) => {
      requestSort(columnId);
    },
    [requestSort],
  );

  const handleAddColumn = useCallback(() => {
    setIsAddColumnSheetOpen(true);
  }, [setIsAddColumnSheetOpen]);

  const handleDeleteSelected = useCallback(() => {
    // Implement delete functionality here
    alert('Delete selected records functionality would go here');
  }, []);

  return (
    <>
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

      {showFilters && (
        <div className='bg-blue-50 p-4 mb-4 rounded-md border border-blue-200 shadow-sm transition-all'>
          <div className='flex justify-between items-center mb-3'>
            <h3 className='text-sm font-medium text-blue-800'>Filters</h3>
            {filters.length > 0 && (
              <Button
                variant='ghost'
                size='sm'
                className='text-blue-600 hover:text-blue-800 hover:bg-blue-100 h-7 px-2'
                onClick={() => {
                  return setFilters([]);
                }}
              >
                Clear all
              </Button>
            )}
          </div>

          {filters.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-3'>
              {filters.map((filter, index) => {
                return (
                  <Badge
                    key={index}
                    variant='outline'
                    className='bg-white border-blue-200 text-blue-800 py-1 px-2 flex items-center gap-1'
                  >
                    <span className='font-medium'>{filter.column}:</span> {filter.value}
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-4 w-4 p-0 hover:bg-blue-100 ml-1'
                      onClick={() => {
                        return removeFilter(index);
                      }}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}

          <div className='flex gap-2 items-center'>
            <select
              className='h-9 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
              value={filterColumn}
              onChange={(e) => {
                return setFilterColumn(e.target.value);
              }}
            >
              <option value=''>Select column...</option>
              {columns.map((column) => {
                return (
                  <option key={column.id} value={column.name}>
                    {column.name}
                  </option>
                );
              })}
            </select>
            <Input
              placeholder='Filter value...'
              className='w-40 h-9'
              value={filterValue}
              onChange={(e) => {
                return setFilterValue(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addFilter();
              }}
            />
            <Button
              size='sm'
              onClick={addFilter}
              disabled={!filterColumn || !filterValue}
              className='h-9'
            >
              <Plus className='h-4 w-4 mr-1' /> Add Filter
            </Button>
          </div>
        </div>
      )}

      <div className='pt-1 border rounded-md shadow-sm'>
        {viewMode === 'table' ? (
          <Table>
            <TableHeaderMemo
              columns={columns}
              sortConfig={sortConfig}
              onSort={handleSort}
              onAddColumn={handleAddColumn}
              allSelected={allSelected}
              toggleSelectAll={toggleSelectAll}
            />
            <TableBody>
              {records.map((record) => {
                return (
                  <TableRow key={record.id} className='hover:bg-gray-50'>
                    <TableCell className='border-r p-0 text-center'>
                      <div className='flex h-full items-center justify-center'>
                        <Checkbox
                          checked={record.selected}
                          onCheckedChange={() => {
                            return toggleSelectRecord(record.id);
                          }}
                        />
                      </div>
                    </TableCell>
                    {columns.map((column) => {
                      return (
                        <TableCellMemo
                          key={`${record.id}-${column.id}`}
                          record={record}
                          column={column}
                          editingCell={editingCell}
                          onEdit={() => {
                            return startEditing(record.id, column.id);
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
                        />
                      );
                    })}
                    <TableCell></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
            {records.map((record) => {
              return (
                <div
                  key={record.id}
                  className='border rounded-md p-3 hover:shadow-md transition-shadow'
                >
                  <div className='flex justify-between items-center mb-2'>
                    <h3 className='font-medium'>{record.name}</h3>
                    <Checkbox
                      checked={record.selected}
                      onCheckedChange={() => {
                        return toggleSelectRecord(record.id);
                      }}
                    />
                  </div>
                  {columns
                    .filter((col) => {
                      return col.id !== 'name';
                    })
                    .map((column) => {
                      return (
                        <div key={column.id} className='flex py-1 text-sm'>
                          <span className='text-gray-500 w-1/3'>{column.name}:</span>
                          <span className='w-2/3'>
                            {column.id === 'tags' ? (
                              <div className='flex flex-wrap gap-1'>
                                {record.tags.map((tag) => {
                                  return (
                                    <Badge
                                      key={tag.id}
                                      variant='outline'
                                      className='bg-amber-50 text-amber-700'
                                    >
                                      {tag.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            ) : (
                              record[column.id] || '-'
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
                return r.selected;
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
    </>
  );
}
