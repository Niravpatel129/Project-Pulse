import { Hash, MoreVertical, Printer } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

const InvoiceSheetMenu = () => {
  return (
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
  );
};

export default InvoiceSheetMenu;
