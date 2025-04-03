import { TableRow } from '@/components/ui/table';
import { Record as DatabaseRecord } from '@/types/database';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface DraggableRowProps {
  record: DatabaseRecord;
  index: number;
  children: React.ReactNode;
  moveRow: (dragIndex: number, hoverIndex: number) => void;
}

export const DraggableRow = ({ record, index, children, moveRow }: DraggableRowProps) => {
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
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <TableRow
      ref={ref}
      key={record.id}
      className={`hover:bg-gray-50 ${isDragging ? 'opacity-50' : ''}`}
    >
      {children}
    </TableRow>
  );
};
