import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Grid2X2, MoreHorizontal, Plus, Table2, Trash2, Upload } from 'lucide-react';
import { RefObject, useState } from 'react';
import { toast } from 'sonner';
import { TableSettingsDialog } from './TableSettingsDialog';

interface TableToolbarProps {
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: Array<{ column: string; value: string }>;
  quickFilterRef: RefObject<HTMLInputElement>;
  onFilterTextChange: () => void;
  addNewRow: () => void;
  handleAddColumn: () => void;
  handleDeleteSelected: () => void;
  handleImportData: (data: { columns: string[]; rows: any[]; sheetName?: string }) => void;
  tableId?: string;
  currentTableData?: any;
  onColumnsReordered?: (newOrder: string[]) => void;
  onColumnRenamed?: (columnId: string, newName: string) => void;
}

export function TableToolbar({
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  filters,
  quickFilterRef,
  onFilterTextChange,
  addNewRow,
  handleAddColumn,
  handleDeleteSelected,
  handleImportData,
  tableId,
  currentTableData,
  onColumnsReordered,
  onColumnRenamed,
}: TableToolbarProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleOpenImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  const handleImport = (data: { columns: string[]; rows: any[] }) => {
    if (handleImportData) {
      handleImportData(data);
      toast.success(`Imported ${data.columns.length} columns and ${data.rows.length} rows`);
    } else {
      toast.error('Import handler not configured');
    }
    setIsImportDialogOpen(false);
  };

  return (
    <div className='sticky top-0 z-10 flex flex-col gap-2 border-b bg-background p-2'>
      <div className='flex items-center justify-between'>
        <Tabs
          defaultValue='table'
          value={viewMode}
          onValueChange={(value) => {
            return setViewMode(value as 'table' | 'card');
          }}
          className='w-full'
        >
          <div className='flex items-center justify-between'>
            <TabsList>
              <TabsTrigger value='table'>
                <Table2 className='mr-2 h-4 w-4' />
                Table
              </TabsTrigger>
              <TabsTrigger value='card'>
                <Grid2X2 className='mr-2 h-4 w-4' />
                Cards
              </TabsTrigger>
            </TabsList>
            <div className='flex items-center gap-2'>
              <Input
                ref={quickFilterRef}
                placeholder='Search...'
                className='h-8 w-[150px] lg:w-[250px]'
                onChange={onFilterTextChange}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showFilters ? 'default' : 'outline'}
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => {
                        return setShowFilters(!showFilters);
                      }}
                    >
                      <span className='sr-only'>Filter</span>
                      {filters.length > 0 ? (
                        <span className='flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-background'>
                          {filters.length}
                        </span>
                      ) : (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='15'
                          height='15'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          className='lucide lucide-filter'
                        >
                          <polygon points='22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3'></polygon>
                        </svg>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filter</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className='h-4 w-4' />
                      <span className='sr-only'>Delete selected</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete selected</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => {
                        // Create a file input
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.xlsx,.xls,.csv';
                        input.click();

                        // Handle file selection
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Mock implementation - in real app you'd read the file
                            handleImportData({
                              columns: ['Column 1', 'Column 2'],
                              rows: [['Data 1', 'Data 2']],
                              sheetName: file.name,
                            });
                          }
                        };
                      }}
                    >
                      <Upload className='h-4 w-4' />
                      <span className='sr-only'>Import data</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Import data</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8'
                      onClick={handleAddColumn}
                    >
                      <MoreHorizontal className='h-4 w-4' />
                      <span className='sr-only'>Add column</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add column</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='default' size='icon' className='h-8 w-8' onClick={addNewRow}>
                      <Plus className='h-4 w-4' />
                      <span className='sr-only'>Add row</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add row</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Table Settings */}
              {tableId && currentTableData && (
                <TableSettingsDialog
                  tableId={tableId}
                  currentTableData={currentTableData}
                  onColumnsReordered={onColumnsReordered}
                  onColumnRenamed={onColumnRenamed}
                />
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
