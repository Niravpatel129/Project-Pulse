import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Column } from '@/types/database';
import { Plus, X } from 'lucide-react';

interface FilterPanelProps {
  showFilters: boolean;
  filters: Array<{ column: string; value: string }>;
  filterColumn: string;
  filterValue: string;
  columns: Column[];
  setFilterColumn: (value: string) => void;
  setFilterValue: (value: string) => void;
  addFilter: () => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;
}

export const FilterPanel = ({
  showFilters,
  filters,
  filterColumn,
  filterValue,
  columns,
  setFilterColumn,
  setFilterValue,
  addFilter,
  removeFilter,
  clearFilters,
}: FilterPanelProps) => {
  if (!showFilters) return null;

  return (
    <div className='bg-blue-50 p-4 mb-4 rounded-md border border-blue-200 shadow-sm transition-all'>
      <div className='flex justify-between items-center mb-3'>
        <h3 className='text-sm font-medium text-blue-800'>Filters</h3>
        {filters.length > 0 && (
          <Button
            variant='ghost'
            size='sm'
            className='text-blue-600 hover:text-blue-800 hover:bg-blue-100 h-7 px-2'
            onClick={clearFilters}
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
  );
};
