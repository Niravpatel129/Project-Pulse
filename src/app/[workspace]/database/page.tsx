'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { useDatabase } from '@/hooks/useDatabase';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BoxIcon,
  Calendar,
  ChartLine,
  CheckSquare,
  CheckSquare2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Hash,
  Heart,
  HouseIcon,
  Link,
  Mail,
  MapPin,
  PanelsTopLeftIcon,
  Phone,
  Plus,
  Save,
  SearchIcon,
  SettingsIcon,
  Star,
  Tag,
  Type,
  UsersRoundIcon,
  X,
} from 'lucide-react';

const iconMap = {
  AlertCircle: AlertCircle,
  Bell: Bell,
  Calendar: Calendar,
  Clock: Clock,
  FileText: FileText,
  Heart: Heart,
  Mail: Mail,
  MapPin: MapPin,
  Star: Star,
  Tag: Tag,
  Box: BoxIcon,
  Users: UsersRoundIcon,
  Type: Type,
  Hash: Hash,
  CheckSquare: CheckSquare,
  CheckSquare2: CheckSquare2,
  Link: Link,
  Phone: Phone,
};

const propertyTypeColors = {
  text: 'text-blue-500',
  number: 'text-green-500',
  date: 'text-purple-500',
  checkbox: 'text-yellow-500',
  select: 'text-red-500',
  multiselect: 'text-indigo-500',
  url: 'text-teal-500',
  email: 'text-pink-500',
  phone: 'text-orange-500',
  file: 'text-gray-500',
};

const propertyTypeIcons = {
  text: 'Aa',
  number: '123',
  date: '📅',
  checkbox: '✓',
  select: '▼',
  multiselect: '⊠',
  url: '🔗',
  email: '✉️',
  phone: '📞',
  file: '📎',
};

export default function DataTable() {
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
    newPropertyPrefix,
    isIconPickerOpen,
    propertyTypes,
    iconOptions,
    requestSort,
    addNewRow,
    addNewColumn,
    saveNewColumn,
    backToPropertySelection,
    selectIcon,
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
    setNewPropertyName,
    setNewPropertyPrefix,
    setIsIconPickerOpen,
  } = useDatabase();

  const renderPropertyTypeIcon = (type: string) => {
    const Icon = iconMap[type as keyof typeof iconMap];
    return Icon ? (
      <Icon className={propertyTypeColors[type as keyof typeof propertyTypeColors]} size={16} />
    ) : null;
  };

  const renderIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap];
    return Icon ? <Icon size={16} /> : null;
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
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => {
                  return setIsAddColumnSheetOpen(true);
                }}
              >
                <Plus className='h-4 w-4' />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
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
                    <TableCell
                      key={`${record.id}-${column.id}`}
                      className='border-r min-h-[40px] h-[40px]'
                      onClick={() => {
                        return startEditing(record.id, column.id);
                      }}
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
                      ) : (
                        <div className='min-h-[28px] h-[28px] flex items-center w-full'>
                          {editingCell.recordId === record.id &&
                          editingCell.columnId === column.id ? (
                            <Input
                              ref={inputRef}
                              value={record[column.id] || ''}
                              onChange={(e) => {
                                return handleCellChange(e, record.id, column.id);
                              }}
                              onBlur={stopEditing}
                              onKeyDown={handleCellKeyDown}
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

      <Sheet open={isAddColumnSheetOpen} onOpenChange={setIsAddColumnSheetOpen}>
        <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
          <SheetHeader>
            <SheetTitle>{selectedPropertyType ? 'Configure property' : 'New property'}</SheetTitle>
          </SheetHeader>
          <div className='py-4'>
            {selectedPropertyType ? (
              <div className='space-y-4'>
                <Button
                  variant='outline'
                  className='flex items-center gap-2 mb-4'
                  onClick={backToPropertySelection}
                >
                  <ArrowLeft className='h-4 w-4' />
                  Back to property types
                </Button>

                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Property Type</label>
                  <Button
                    variant='outline'
                    className='w-full justify-start h-12 px-4'
                    onClick={backToPropertySelection}
                  >
                    <div className='flex items-center'>
                      <div className='mr-3 flex h-8 w-8 items-center justify-center rounded-md border'>
                        {renderPropertyTypeIcon(selectedPropertyType.id)}
                      </div>
                      <div>{selectedPropertyType.name}</div>
                    </div>
                  </Button>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='property-name' className='text-sm font-medium'>
                    Property Name
                  </label>
                  <Input
                    id='property-name'
                    value={newPropertyName}
                    onChange={(e) => {
                      return setNewPropertyName(e.target.value);
                    }}
                    placeholder='Enter property name'
                  />
                </div>

                <div className='space-y-2'>
                  <label htmlFor='property-prefix' className='text-sm font-medium'>
                    Icon Prefix
                  </label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='property-prefix'
                      value={newPropertyPrefix}
                      onChange={(e) => {
                        return setNewPropertyPrefix(e.target.value);
                      }}
                      placeholder='Select an icon'
                      className='flex-1'
                    />
                    <Popover open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='h-10 w-10 p-0 flex items-center justify-center'
                        >
                          {newPropertyPrefix ? (
                            <Tag size={16} />
                          ) : (
                            <Plus size={16} className='text-muted-foreground' />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-64 p-2'>
                        <div className='space-y-2'>
                          <h4 className='font-medium text-sm'>Select an icon</h4>
                          <div className='grid grid-cols-4 gap-2'>
                            {iconOptions.map((option, index) => {
                              return (
                                <Button
                                  key={index}
                                  variant='outline'
                                  className='h-10 w-full p-0 flex items-center justify-center'
                                  onClick={() => {
                                    return selectIcon(option.icon);
                                  }}
                                >
                                  {renderIcon(option.icon)}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
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
                  <SearchIcon className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search property types...'
                    className='pl-8'
                    value={propertySearchQuery}
                    onChange={(e) => {
                      return setPropertySearchQuery(e.target.value);
                    }}
                  />
                </div>
                <div className='grid grid-cols-1 gap-2'>
                  {propertyTypes.map((type) => {
                    return (
                      <Button
                        key={type.id}
                        variant='outline'
                        className='justify-start h-12 px-4'
                        onClick={() => {
                          return addNewColumn(type);
                        }}
                      >
                        <div className='flex items-center'>
                          <div className='mr-3 flex h-8 w-8 items-center justify-center rounded-md border'>
                            {renderPropertyTypeIcon(type.id)}
                          </div>
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
    </BlockWrapper>
  );
}
