'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { useDatabase } from '@/hooks/useDatabase';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { handleCreateTable, tables = [] } = useDatabase();
  const currentTable = pathname.split('/').pop() || tables[0]?._id || 'table-1';
  const [tableName, setTableName] = useState('');
  const [isCreatingTable, setIsCreatingTable] = useState(false);

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
                    <Link key={table._id} href={`/database/${table._id}`} className='flex-1'>
                      <TabsTrigger
                        value={table._id}
                        className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none w-full'
                      >
                        {table.name}
                      </TabsTrigger>
                    </Link>
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
