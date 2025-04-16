import { ArrowDown, ArrowUp } from 'lucide-react';
import { useCallback } from 'react';
import ColumnHeaderMenu from './ColumnHeaderMenu';

// In AG Grid, header components receive props directly
const CustomHeaderComponent = (props) => {
  // Props from AG Grid header component
  const column = props.column;
  const displayName = props.displayName || '';
  const deleteColumn = props.deleteColumn;
  const enableSorting = props.enableSorting !== false;
  const enableMenu = props.enableMenu !== false;

  const isSortable = column.getColDef().sortable !== false && enableSorting;
  const sort = column.getSort();

  const onSortClicked = useCallback(() => {
    if (!isSortable) return;

    const nextSort = sort === 'asc' ? 'desc' : sort === 'desc' ? null : 'asc';
    column.setSort(nextSort);
  }, [column, sort, isSortable]);

  return (
    <div className='flex items-center h-full px-2'>
      <div
        className='flex-1 flex items-center gap-1 cursor-pointer select-none'
        onClick={isSortable ? onSortClicked : undefined}
      >
        <span className='text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap'>
          {displayName}
        </span>
        {isSortable && sort && (
          <span className='text-blue-600'>
            {sort === 'asc' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />}
          </span>
        )}
      </div>

      {enableMenu && <ColumnHeaderMenu column={column} deleteColumn={deleteColumn} />}
    </div>
  );
};

export default CustomHeaderComponent;
