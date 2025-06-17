'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns,
  ListFilter,
  Plus,
  Search,
  Tag,
} from 'lucide-react';
import * as React from 'react';

interface Attribute {
  id: string;
  definitionName: string;
  description: string;
  addedBy: string;
  updated: string;
  entries: number;
}

const attributesData: Attribute[] = [
  {
    id: '1',
    definitionName: 'Fit',
    description: 'Describes the fit of a garment, typically pant s...',
    addedBy: 'Shopify',
    updated: 'May 7 at 1:55 pm',
    entries: 1,
  },
  {
    id: '2',
    definitionName: 'Clothing features',
    description: 'Describes unique properties of apparel, such ...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:21 pm',
    entries: 2,
  },
  {
    id: '3',
    definitionName: 'Age group',
    description: 'Defines the target age range for a product, su...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:21 pm',
    entries: 3,
  },
  {
    id: '4',
    definitionName: 'Fabric',
    description: 'Identifies the type of fabric used in a product, ...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:21 pm',
    entries: 1,
  },
  {
    id: '5',
    definitionName: 'Target gender',
    description: 'Identifies the intended gender for a product, s...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:21 pm',
    entries: 1,
  },
  {
    id: '6',
    definitionName: 'Top length type',
    description: 'Defines the length of tops or shirts, like crop t...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:21 pm',
    entries: 1,
  },
  {
    id: '7',
    definitionName: 'Sleeve length type',
    description: 'Specifies the style of sleeves on clothing item...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:21 pm',
    entries: 1,
  },
  {
    id: '8',
    definitionName: 'Size',
    description: 'Used to specify the size of a product, such as ...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:20 pm',
    entries: 6,
  },
  {
    id: '9',
    definitionName: 'Neckline',
    description: 'Used to describe the neck shape of a garment...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:20 pm',
    entries: 3,
  },
  {
    id: '10',
    definitionName: 'Color',
    description: 'Defines the primary color or pattern, such as b...',
    addedBy: 'Shopify',
    updated: 'Apr 11 at 4:20 pm',
    entries: 8,
  },
];

export default function NewTable() {
  const [activeTab, setActiveTab] = React.useState<string>('Standard product attributes');
  const tabs = ['Custom', 'Standard product attributes', 'All'];

  return (
    <Card className='w-full'>
      <CardHeader className='p-4 border-b'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>
            {tabs.map((tab) => {
              return (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'secondary' : 'ghost'}
                  size='sm'
                  onClick={() => {
                    return setActiveTab(tab);
                  }}
                  className={`px-3 py-1.5 h-auto ${
                    activeTab === tab ? 'font-semibold' : 'text-muted-foreground'
                  }`}
                >
                  {tab}
                </Button>
              );
            })}
            <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground'>
              <Plus className='h-4 w-4' />
              <span className='sr-only'>Add</span>
            </Button>
          </div>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground'>
              <Search className='h-4 w-4' />
              <span className='sr-only'>Search</span>
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground'>
              <ListFilter className='h-4 w-4' />
              <span className='sr-only'>Filter</span>
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground'>
              <Columns className='h-4 w-4' />
              <span className='sr-only'>Columns</span>
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground'>
              <ArrowUpDown className='h-4 w-4' />
              <span className='sr-only'>Sort</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[250px] text-muted-foreground font-medium'>
                Definition name
              </TableHead>
              <TableHead className='text-muted-foreground font-medium'>Description</TableHead>
              <TableHead className='w-[120px] text-muted-foreground font-medium'>
                Added by
              </TableHead>
              <TableHead className='w-[180px] text-muted-foreground font-medium'>
                <div className='flex items-center gap-1'>
                  Updated
                  <ArrowUpDown className='h-3 w-3 text-muted-foreground' />
                </div>
              </TableHead>
              <TableHead className='w-[100px] text-right text-muted-foreground font-medium'>
                Entries
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributesData.map((attribute) => {
              return (
                <TableRow key={attribute.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Tag className='h-4 w-4 text-muted-foreground' />
                      <span className='font-medium'>{attribute.definitionName}</span>
                    </div>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>{attribute.description}</TableCell>
                  <TableCell className='text-muted-foreground'>{attribute.addedBy}</TableCell>
                  <TableCell className='text-muted-foreground'>{attribute.updated}</TableCell>
                  <TableCell className='text-right text-muted-foreground'>
                    {attribute.entries}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className='p-4 border-t flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='icon' className='h-8 w-8'>
            <ChevronLeft className='h-4 w-4' />
            <span className='sr-only'>Previous page</span>
          </Button>
          <Button variant='outline' size='icon' className='h-8 w-8'>
            <ChevronRight className='h-4 w-4' />
            <span className='sr-only'>Next page</span>
          </Button>
        </div>
        <span className='text-sm text-muted-foreground'>1-10 of {attributesData.length}</span>
      </CardFooter>
    </Card>
  );
}
