'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentTable = pathname.split('/').pop() || 'table-1';

  return (
    <BlockWrapper>
      <div className='min-h-screen p-3'>
        <h1 className='text-2xl font-medium pt-2'>Database</h1>
        <p className='text-muted-foreground text-sm pb-5'>
          Manage your database entries and tags here.
        </p>
        <ScrollArea>
          <Tabs value={currentTable} className='w-full'>
            <div className='flex items-center'>
              <TabsList className='text-foreground mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1'>
                <Link href='/database/table-1' className='flex-1'>
                  <TabsTrigger
                    value='table-1'
                    className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none w-full'
                  >
                    Table 1
                  </TabsTrigger>
                </Link>
              </TabsList>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8 ml-2 mb-2'>
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
                        <Input id='table-name' placeholder='Table name' className='flex-1' />
                      </div>
                    </div>
                    <Button className='w-full'>Create Table</Button>
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
