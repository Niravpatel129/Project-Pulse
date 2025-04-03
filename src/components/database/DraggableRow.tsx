import { Record } from '@/types/database';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TableRow } from '../ui/table';

interface DraggableRowProps {
  record: Record;
  index: number;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

export function DraggableRow({ record, index, moveRow, children }: DraggableRowProps) {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'ROW',
    item: { index },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });

  const [, drop] = useDrop({
    accept: 'ROW',
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <TableRow ref={ref} className={`${isDragging ? 'opacity-50' : 'opacity-100'} border-b`}>
      {children}
    </TableRow>
  );
}
