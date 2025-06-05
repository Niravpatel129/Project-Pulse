import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy,
  ExternalLink,
  Info,
  Link2,
  Mail,
  Minus,
  MoreVertical,
  Paperclip,
  Printer,
  Sparkles,
} from 'lucide-react';

interface InboxHeaderProps {
  subject: string;
}

export default function InboxHeader({ subject }: InboxHeaderProps) {
  return (
    <div className='flex justify-between items-center mb-4'>
      <h2 className='text-xl font-bold text-[#121212] dark:text-white'>{subject}</h2>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='h-8 w-8'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-64'>
          <DropdownMenuItem>
            <Mail className='mr-2 h-4 w-4' />
            Mark as unread
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Printer className='mr-2 h-4 w-4' />
            Print
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Link to conversation</DropdownMenuLabel>
          <DropdownMenuItem>
            <Copy className='mr-2 h-4 w-4' />
            Copy conversation ID
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link2 className='mr-2 h-4 w-4' />
            Copy conversation URL
            <Info className='ml-auto h-4 w-4 opacity-60' />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <Sparkles className='mr-2 h-4 w-4 opacity-60' />
            Summarize
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Info className='mr-2 h-4 w-4' />
            View conversation details
            <span className='ml-auto text-xs text-muted-foreground'>⇧I</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Paperclip className='mr-2 h-4 w-4' />
            View attachments
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ExternalLink className='mr-2 h-4 w-4' />
            View in external window
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Minus className='mr-2 h-4 w-4' />
            Close conversation
            <Info className='ml-auto h-4 w-4 opacity-60' />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
