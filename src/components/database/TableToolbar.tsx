import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ChevronDown,
  ColumnsIcon,
  FileSpreadsheet,
  Filter,
  RowsIcon,
  Search,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { TableSettingsDialog } from './TableSettingsDialog';
import { XlsxImportDialog } from './XlsxImportDialog';

interface TableToolbarProps {
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filters: Array<{ column: string; value: string }>;
  quickFilterRef: React.RefObject<HTMLInputElement | null>;
  onFilterTextChange: () => void;
  addNewRow: () => void;
  handleAddColumn: () => void;
  handleDeleteSelected: () => void;
  handleImportData?: (data: { columns: string[]; rows: any[]; sheetName?: string }) => void;
  tableId: string;
  currentTableData: any;
  setColumnOrder: (order: string[]) => void;
  renameColumn: (columnId: string, newName: string) => void;
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
  setColumnOrder,
  renameColumn,
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
              <RowsIcon className='mr-2 h-4 w-4' />
              Add New Row
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddColumn}>
              <ColumnsIcon className='mr-2 h-4 w-4' />
              Add New Column
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenImportDialog}>
              <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
              Import from XLSX file
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteSelected}>
              <Trash2 className='mr-2 h-4 w-4 text-destructive' />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Table Settings Dialog */}
        <TableSettingsDialog
          tableId={tableId as string}
          currentTableData={currentTableData}
          onColumnsReordered={setColumnOrder}
          onColumnRenamed={renameColumn}
        />
        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search...'
            className='pl-8 h-9'
            ref={quickFilterRef}
            onChange={onFilterTextChange}
          />
        </div>
      </div>

      {/* XLSX Import Dialog */}
      <XlsxImportDialog
        isOpen={isImportDialogOpen}
        onClose={handleCloseImportDialog}
        onImport={handleImport}
      />
    </div>
  );
}
