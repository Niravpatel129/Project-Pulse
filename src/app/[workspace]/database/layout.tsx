'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { useDatabase } from '@/hooks/useDatabase';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { handleCreateTable, tables = [] } = useDatabase([]);
  const currentTable = pathname.split('/').pop() || tables[0]?._id || 'table-1';
  const [tableName, setTableName] = useState('');
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [renamingTable, setRenamingTable] = useState<{ id: string; name: string } | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const queryClient = useQueryClient();

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const response = await newRequest.delete(`/tables/${tableId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted successfully');
      // If we deleted the current table, redirect to the first available table
      if (tables.length > 0) {
        router.push(`/database/${tables[0]._id}`);
      }
    },
    onError: (error) => {
      console.error('Failed to delete table:', error);
      toast.error('Failed to delete table');
    },
  });

  // Handle table delete
  const handleDeleteTable = useCallback(
    async (tableId: string) => {
      try {
        await deleteTableMutation.mutateAsync(tableId);
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    },
    [deleteTableMutation],
  );

  // Handle table rename
  const handleRenameTable = useCallback((tableId: string, currentName: string) => {
    setRenamingTable({ id: tableId, name: currentName });
    setNewTableName(currentName);
  }, []);

  const saveTableRename = useCallback(async () => {
    if (renamingTable && newTableName.trim()) {
      try {
        await newRequest.patch(`/tables/${renamingTable.id}`, {
          name: newTableName.trim(),
        });
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        setRenamingTable(null);
        setNewTableName('');
        toast.success('Table renamed successfully');
      } catch (error) {
        console.error('Failed to rename table:', error);
        toast.error('Failed to rename table');
      }
    }
  }, [renamingTable, newTableName, queryClient]);

  // Redirect to first table if no table is selected
  useEffect(() => {
    if (
      tables.length > 0 &&
      !tables.some((table) => {
        return table._id === currentTable;
      })
    ) {
      router.push(`/database/${tables[0]._id}`);
    }
  }, [tables, currentTable]);

  return (
    <BlockWrapper>
      <div className='min-h-screen p-3'>
        <h1 className='text-2xl font-medium pt-2'>Database</h1>
        <p className='text-muted-foreground text-sm pb-5'>
          Manage your database entries and tags here.
        </p>
        <ScrollArea className=''>
          <Tabs value={currentTable} className='w-full p-2'>
            <div className='flex items-center'>
              <TabsList className='text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1'>
                {tables.map((table) => {
                  return (
                    <div key={table._id} className='flex-1 relative group'>
                      <div className='flex items-center'>
                        <Link href={`/database/${table._id}`} className='flex-1'>
                          <TabsTrigger
                            value={table._id}
                            className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none w-full pr-8'
                          >
                            {renamingTable?.id === table._id ? (
                              <Input
                                value={newTableName}
                                onChange={(e) => {
                                  return setNewTableName(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveTableRename();
                                  } else if (e.key === 'Escape') {
                                    setNewTableName('');
                                    setRenamingTable(null);
                                  }
                                }}
                                onBlur={() => {
                                  if (newTableName.trim()) {
                                    saveTableRename();
                                  } else {
                                    setNewTableName('');
                                    setRenamingTable(null);
                                  }
                                }}
                                className='h-7 w-32 border-none focus-visible:ring-0 focus-visible:ring-none focus:outline-none focus:shadow-none shadow-none'
                                autoFocus
                              />
                            ) : (
                              <span>{table.name}</span>
                            )}
                          </TabsTrigger>
                        </Link>
                        <div className='absolute right-1 top-1/2 -translate-y-1/2 z-10'>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-6 w-6 rounded-full hover:bg-gray-200'
                                onClick={(e) => {
                                  return e.stopPropagation();
                                }}
                              >
                                <ChevronDown className='h-3 w-3 text-[#5f6368]' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-64 p-2 shadow-lg rounded-lg' align='end'>
                              <div className='space-y-1'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='w-full justify-start text-[#3c4043]'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameTable(table._id, table.name);
                                  }}
                                >
                                  <Pencil className='mr-2 h-4 w-4' />
                                  <span>Rename</span>
                                </Button>

                                <div className='h-px bg-[#e0e0e0] my-1' />
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='w-full justify-start text-[#d93025] hover:text-[#d93025] hover:bg-red-50'
                                  onClick={() => {
                                    // Implement delete functionality
                                    handleDeleteTable(table._id);
                                  }}
                                >
                                  <Trash2 className='mr-2 h-4 w-4' />
                                  <span>Delete</span>
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TabsList>
              <Popover open={isCreatingTable} onOpenChange={setIsCreatingTable}>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 ml-2 mb-2'
                    onClick={() => {
                      return setIsCreatingTable(true);
                    }}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80' align='start'>
                  <div className='grid gap-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium leading-none'>New Table</h4>
                      <p className='text-sm text-muted-foreground'>
                        Create a new table in your database.
                      </p>
                    </div>
                    <div className='grid gap-2'>
                      <div className='flex items-center gap-2'>
                        <Input
                          id='table-name'
                          placeholder='Table name'
                          className='flex-1'
                          maxLength={20}
                          value={tableName}
                          onChange={(e) => {
                            return setTableName(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      className='w-full'
                      onClick={() => {
                        setIsCreatingTable(false);
                        handleCreateTable(tableName);
                        toast.success('Table created successfully');
                        // delay for 1 second
                        setTimeout(() => {
                          setTableName('');
                        }, 1000);
                      }}
                    >
                      Create Table
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <ScrollBar orientation='horizontal' />
          </Tabs>
        </ScrollArea>
        {children}
      </div>
    </BlockWrapper>
  );
}
