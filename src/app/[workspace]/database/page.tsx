'use client';

import type React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import {
  BoxIcon,
  ChartLine,
  ChevronDown,
  ChevronUp,
  HouseIcon,
  PanelsTopLeftIcon,
  Plus,
  SettingsIcon,
  UsersRoundIcon,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Column = {
  id: string;
  name: string;
  sortable: boolean;
};

type Tag = {
  id: string;
  name: string;
};

type Record = {
  id: number;
  [key: string]: any;
  selected: boolean;
};

export default function DataTable() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', name: 'Name', sortable: true },
    { id: 'leads', name: 'Leads', sortable: true },
    { id: 'tags', name: 'Tags', sortable: true },
  ]);

  const [records, setRecords] = useState<Record[]>([
    {
      id: 1,
      name: 'Database Entry',
      leads: '',
      tags: [{ id: '1', name: 'sfs' }],
      selected: false,
    },
  ]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  );
  const [editingCell, setEditingCell] = useState<{
    recordId: number | null;
    columnId: string | null;
  }>({
    recordId: null,
    columnId: null,
  });
  const [newTagText, setNewTagText] = useState<{ [key: number]: string }>({});
  const [allSelected, setAllSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell.recordId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedRecords = () => {
    if (!sortConfig) return records;

    return [...records].sort((a, b) => {
      if (sortConfig.key === 'tags') {
        // Sort by first tag name or empty string if no tags
        const aValue = a.tags.length > 0 ? a.tags[0].name : '';
        const bValue = b.tags.length > 0 ? b.tags[0].name : '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      } else {
        // Sort by other column values
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
  };

  // Add new row
  const addNewRow = () => {
    const newId =
      records.length > 0
        ? Math.max(
            ...records.map((r) => {
              return r.id;
            }),
          ) + 1
        : 1;
    const newRecord: Record = {
      id: newId,
      selected: false,
    };

    // Initialize all column values
    columns.forEach((col) => {
      if (col.id === 'tags') {
        newRecord[col.id] = [];
      } else {
        newRecord[col.id] = '';
      }
    });

    setRecords([...records, newRecord]);
  };

  // Add new column
  const addNewColumn = () => {
    const newId = `column${columns.length + 1}`;
    setColumns([...columns, { id: newId, name: `Column ${columns.length + 1}`, sortable: true }]);

    // Add the new column to all existing records
    setRecords(
      records.map((record) => {
        return {
          ...record,
          [newId]: '',
        };
      }),
    );
  };

  // Handle cell editing
  const startEditing = (recordId: number, columnId: string) => {
    if (columnId !== 'tags') {
      setEditingCell({ recordId, columnId });
    }
  };

  const stopEditing = () => {
    setEditingCell({ recordId: null, columnId: null });
  };

  const handleCellChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    recordId: number,
    columnId: string,
  ) => {
    setRecords(
      records.map((record) => {
        return record.id === recordId ? { ...record, [columnId]: e.target.value } : record;
      }),
    );
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      stopEditing();
    }
  };

  // Handle tag management
  const addTag = (recordId: number) => {
    if (newTagText[recordId] && newTagText[recordId].trim() !== '') {
      setRecords(
        records.map((record) => {
          if (record.id === recordId) {
            const newTagId = `tag-${Date.now()}`;
            return {
              ...record,
              tags: [...record.tags, { id: newTagId, name: newTagText[recordId].trim() }],
            };
          }
          return record;
        }),
      );
      setNewTagText({ ...newTagText, [recordId]: '' });
    }
  };

  const removeTag = (recordId: number, tagId: string) => {
    setRecords(
      records.map((record) => {
        if (record.id === recordId) {
          return {
            ...record,
            tags: record.tags.filter((tag) => {
              return tag.id !== tagId;
            }),
          };
        }
        return record;
      }),
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent, recordId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(recordId);
    }
  };

  // Handle selection
  const toggleSelectAll = () => {
    const newSelected = !allSelected;
    setAllSelected(newSelected);
    setRecords(
      records.map((record) => {
        return { ...record, selected: newSelected };
      }),
    );
  };

  const toggleSelectRecord = (recordId: number) => {
    const updatedRecords = records.map((record) => {
      return record.id === recordId ? { ...record, selected: !record.selected } : record;
    });
    setRecords(updatedRecords);

    // Update allSelected state based on whether all records are selected
    setAllSelected(
      updatedRecords.every((r) => {
        return r.selected;
      }),
    );
  };

  return (
    <BlockWrapper className='min-h-screen'>
      <h1 className='text-2xl font-medium pt-2'>Database</h1>
      <p className='text-muted-foreground text-sm pb-5'>
        Manage your database entries and tags here.
      </p>
      <Tabs defaultValue='tab-1'>
        <ScrollArea>
          <TabsList className='text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1'>
            <TabsTrigger
              value='tab-1'
              className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
            >
              <HouseIcon className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='tab-2'
              className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
            >
              <PanelsTopLeftIcon
                className='-ms-0.5 me-1.5 opacity-60'
                size={16}
                aria-hidden='true'
              />
              Projects
              <Badge className='bg-primary/15 ms-1.5 min-w-5 px-1' variant='secondary'>
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value='tab-3'
              className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
            >
              <BoxIcon className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
              Packages
              <Badge className='ms-1.5'>New</Badge>
            </TabsTrigger>
            <TabsTrigger
              value='tab-4'
              className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
            >
              <UsersRoundIcon className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
              Team
            </TabsTrigger>
            <TabsTrigger
              value='tab-5'
              className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
            >
              <ChartLine className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
              Insights
            </TabsTrigger>
            <TabsTrigger
              value='tab-6'
              className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
            >
              <SettingsIcon className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
              Settings
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>
        <TabsContent value='tab-1'>
          <p className='text-muted-foreground pt-1 text-center text-xs'>Content for Tab 1</p>
        </TabsContent>
        <TabsContent value='tab-2'>
          <p className='text-muted-foreground pt-1 text-center text-xs'>Content for Tab 2</p>
        </TabsContent>
        <TabsContent value='tab-3'>
          <p className='text-muted-foreground pt-1 text-center text-xs'>Content for Tab 3</p>
        </TabsContent>
        <TabsContent value='tab-4'>
          <p className='text-muted-foreground pt-1 text-center text-xs'>Content for Tab 4</p>
        </TabsContent>
        <TabsContent value='tab-5'>
          <p className='text-muted-foreground pt-1 text-center text-xs'>Content for Tab 5</p>
        </TabsContent>
        <TabsContent value='tab-6'>
          <p className='text-muted-foreground pt-1 text-center text-xs'>Content for Tab 6</p>
        </TabsContent>
      </Tabs>
      <Table>
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
                          return requestSort(column.id);
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
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={addNewColumn}>
                <Plus className='h-4 w-4' />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getSortedRecords().map((record) => {
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
                    <TableCell
                      key={`${record.id}-${column.id}`}
                      className='border-r'
                      onClick={() => {
                        return startEditing(record.id, column.id);
                      }}
                    >
                      {column.id === 'tags' ? (
                        <div className='flex flex-wrap gap-1 items-center'>
                          {record.tags.map((tag: Tag) => {
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
                                return setNewTagText({
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
                      ) : editingCell.recordId === record.id &&
                        editingCell.columnId === column.id ? (
                        <Input
                          ref={inputRef}
                          value={record[column.id] || ''}
                          onChange={(e) => {
                            return handleCellChange(e, record.id, column.id);
                          }}
                          onBlur={stopEditing}
                          onKeyDown={handleCellKeyDown}
                          className='h-8'
                          autoFocus
                        />
                      ) : column.id === 'name' ? (
                        <>
                          {record.id}. {record[column.id]}
                        </>
                      ) : (
                        record[column.id]
                      )}
                    </TableCell>
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
    </BlockWrapper>
  );
}
