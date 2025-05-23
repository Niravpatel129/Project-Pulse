import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Hash, MoreVertical, Printer } from 'lucide-react';
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTitle } from '../ui/sheet';
import InvoiceFromTo from './sections/InvoiceFromTo';
import InvoiceHeader from './sections/InvoiceHeader';
import InvoiceItemsRow from './sections/InvoiceItemsRow';
import InvoiceNotes from './sections/InvoiceNotes';
import InvoiceSheetFooter from './sections/InvoiceSheetFooter';
import InvoiceTotal from './sections/InvoiceTotal';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: string;
}

const SortableInvoiceItem = ({
  item,
  index,
  onUpdate,
  onDelete,
}: {
  item: InvoiceItem;
  index: number;
  onUpdate: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <InvoiceItemsRow
        item={item}
        onUpdate={onUpdate}
        isFirstRow={index === 0}
        onDelete={onDelete}
        dragHandleProps={index === 0 ? undefined : listeners}
      />
    </div>
  );
};

const InvoiceSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: uuidv4(),
      description: '',
      quantity: 1,
      price: '',
    },
  ]);

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prevItems) => {
      return prevItems.map((item) => {
        return item.id === id ? { ...item, [field]: value } : item;
      });
    });
  };

  const handleAddItem = () => {
    setItems((prevItems) => {
      return [
        ...prevItems,
        {
          id: uuidv4(),
          description: '',
          quantity: 1,
          price: '',
        },
      ];
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => {
          return item.id === active.id;
        });
        const newIndex = items.findIndex((item) => {
          return item.id === over.id;
        });

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-[800px] !max-w-[600px] fixed right-4 top-4 bottom-4 px-12 bg-background max-h-[calc(100vh-2rem)] overflow-y-auto border rounded-lg shadow-lg [&>button]:hidden font-mono scrollbar-hide'
      >
        <SheetTitle className='sr-only'>Invoice Details</SheetTitle>
        <div className='flex justify-end absolute top-4 right-4'>
          <DropdownMenu modal>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' sideOffset={5} className='z-[100]'>
              <DropdownMenuItem>
                <Printer className='mr-2 h-4 w-4' />
                Print
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Hash className='mr-2 h-4 w-4' />
                  Decimals
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Yes</DropdownMenuItem>
                  <DropdownMenuItem>No</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='mt-4'>
          <InvoiceHeader />
          <InvoiceFromTo />
          <div className='flex flex-col gap-2 mt-8'>
            {/* Labels */}
            <div className='flex items-center gap-6 h-6'>
              <div className='flex-[4] text-[11px] text-muted-foreground'>Description</div>
              <div className='w-[60px] text-center text-[11px] text-muted-foreground'>Quantity</div>
              <div className='w-[80px] text-[11px] text-muted-foreground'>Price</div>
              <div className='w-[80px] text-right text-[11px] text-muted-foreground'>Total</div>
            </div>
            {/* Items */}
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={items.map((item) => {
                  return item.id;
                })}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item, index) => {
                  return (
                    <SortableInvoiceItem
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={handleUpdateItem}
                      onDelete={(id) => {
                        setItems(
                          items.filter((item) => {
                            return item.id !== id;
                          }),
                        );
                      }}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>
            {/* Add Item Button */}
            <div
              className='mt-1 py-1 flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer hover:text-primary'
              onClick={handleAddItem}
            >
              <FiPlus /> Add Item
            </div>
          </div>
          <InvoiceTotal />
          <InvoiceNotes />
        </div>
        <InvoiceSheetFooter />
      </SheetContent>
    </Sheet>
  );
};

export default InvoiceSheet;
