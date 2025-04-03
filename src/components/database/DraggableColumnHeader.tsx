import { TableHead } from '@/components/ui/table';
import { Column } from '@/types/database';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

interface DraggableColumnHeaderProps {
  column: Column;
  index: number;
  children: React.ReactNode;
  columnWidths: Record<string, number>;
  handleResizeStart: (e: React.MouseEvent, columnId: string) => void;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
}

export const DraggableColumnHeader = ({
  column,
  index,
  children,
  columnWidths,
  handleResizeStart,
  moveColumn,
}: DraggableColumnHeaderProps) => {
  const ref = useRef<HTMLTableCellElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'COLUMN',
    item: { index },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  });

  const [, drop] = useDrop({
    accept: 'COLUMN',
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <TableHead
      ref={ref}
      key={column.id}
      className='border-r relative'
      style={{
        opacity: isDragging ? 0.5 : 1,
        width: columnWidths[column.id] || 200,
        maxWidth: columnWidths[column.id] || 200,
      }}
    >
      {children}
      <div
        className='absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-300'
        onMouseDown={(e) => {
          return handleResizeStart(e, column.id);
        }}
      />
    </TableHead>
  );
};
