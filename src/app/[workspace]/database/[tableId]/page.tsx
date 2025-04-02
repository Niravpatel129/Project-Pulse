'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IconSelector } from '@/components/ui/icon-selector';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDatabase } from '@/hooks/useDatabase';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Save, Search, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { memo, useCallback } from 'react';

export default function TablePage() {
  const params = useParams();
  const tableId = params.tableId as string;

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
        <TableHeader>
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
                            <ChevronUp className='h-4 w-4 text-gray-500' />
                          ) : (
                            <ChevronDown className='h-4 w-4 text-gray-500' />
                          )
                        ) : (
                          <ChevronDown className='h-4 w-4 text-gray-500' />
                        )}
                      </Button>
                    )}
                  </div>
                </TableHead>
              );
            })}
            <TableHead className='w-10'>
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onAddColumn}>
                <Plus className='h-4 w-4' />
              </Button>
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
        <TableCell className='border-r min-h-[40px] h-[40px]' onClick={onEdit}>
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
                <>
                  {record.id}. {record[column.id]}
                </>
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

  return (
    <>
      <div className='pt-1'>
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
        <div className='flex items-center border-t p-2'>
          <Button variant='ghost' size='icon' className='h-6 w-6 rounded-sm' onClick={addNewRow}>
            <Plus className='h-4 w-4' />
          </Button>
          <div className='ml-2 text-sm text-gray-500'>
            {records.length} record{records.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <Sheet open={isAddColumnSheetOpen} onOpenChange={setIsAddColumnSheetOpen}>
        <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
          <SheetHeader>
            <SheetTitle>
              <div className='flex items-center gap-2'>
                {selectedPropertyType ? (
                  <>
                    <div className='cursor-pointer' onClick={backToPropertySelection}>
                      <ArrowLeft className='text-muted-foreground hover:text-black' size={20} />
                    </div>
                    {selectedPropertyType.name}
                  </>
                ) : (
                  'New property'
                )}
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className='py-4'>
            {selectedPropertyType ? (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Property Type</label>
                  <Button
                    variant='outline'
                    className='w-full justify-start h-12 px-4'
                    onClick={backToPropertySelection}
                  >
                    <div className='flex items-center'>
                      <div>{selectedPropertyType.name}</div>
                    </div>
                  </Button>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='property-name' className='text-sm font-medium'>
                    Property Name
                  </label>
                  <div className='flex gap-1 relative'>
                    <div className='absolute right-1 top-1/2 -translate-y-1/2'>
                      <IconSelector
                        onSelect={(name) => {
                          setNewPropertyIconName(name);
                          setNewPropertyPrefix(name);
                        }}
                        selectedIcon={getIconComponent(newPropertyIconName)}
                      />
                    </div>
                    <Input
                      className='h-12 pr-10'
                      id='property-name'
                      value={newPropertyName}
                      onChange={(e) => {
                        return setNewPropertyName(e.target.value);
                      }}
                      placeholder='Enter property name'
                    />
                  </div>
                </div>

                <Button className='w-full mt-4' onClick={saveNewColumn}>
                  <Save className='mr-2 h-4 w-4' />
                  Save Property
                </Button>
              </div>
            ) : (
              <>
                <div className='relative mb-4'>
                  <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search property types...'
                    className='pl-8'
                    value={propertySearchQuery}
                    onChange={(e) => {
                      return setPropertySearchQuery(e.target.value);
                    }}
                  />
                </div>
                <div className='grid grid-cols-1 gap-0'>
                  {propertyTypes.map((type) => {
                    return (
                      <Button
                        key={type.id}
                        variant='ghost'
                        className='justify-start h-8 px-1'
                        onClick={() => {
                          setNewPropertyIconName(type.iconName);
                          return addNewColumn(type);
                        }}
                      >
                        <div>{React.createElement(getIconComponent(type.iconName))}</div>
                        <div className='flex items-center'>
                          <div>{type.name}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
