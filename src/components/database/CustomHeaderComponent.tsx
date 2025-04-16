import { ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import ColumnHeaderMenu from './ColumnHeaderMenu';

// In AG Grid, header components receive props directly
const CustomHeaderComponent = (props) => {
  // Props from AG Grid header component
  const column = props.column;
  console.log('🚀 column:', column);
  const displayName = props.displayName || '';
  const deleteColumn = props.deleteColumn;
  const enableSorting = props.enableSorting !== false;
  const enableMenu = props.enableMenu !== false;

  const { api } = props;
  const [sort, setSort] = useState('');

  useEffect(() => {
    const listener = () => {
      setSort(column.getSort());
    };
    column.addEventListener('sortChanged', listener);
    return () => {
      column.removeEventListener('sortChanged', listener);
    };
  }, [column]);

  const toggleSort = () => {
    const currentSort = column.getSort();
    const newSort = currentSort === 'asc' ? 'desc' : currentSort === 'desc' ? null : 'asc';

    // This is the correct method from AG Grid documentation
    api.applyColumnState({
      state: [{ colId: column.getColId(), sort: newSort }],
      defaultState: { sort: null },
    });
  };
  return (
    <div className='flex items-center h-full px-2' onClick={toggleSort}>
      <div className='flex-1 flex items-center gap-1 cursor-pointer select-none'>
        <span className='text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap'>
          {displayName}
        </span>
        {enableSorting && sort && (
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
