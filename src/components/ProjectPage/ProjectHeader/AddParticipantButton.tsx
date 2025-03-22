import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, UserCircle, UserCog, Users } from 'lucide-react';

interface AddParticipantButtonProps {
  onSelectRole: (role: string) => void;
}

export function AddParticipantButton({ onSelectRole }: AddParticipantButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          className='rounded-full h-8 w-8 border-dashed hover:border-primary hover:bg-primary/5 transition-colors'
        >
          <Plus className='h-4 w-4' />
          <span className='sr-only'>Add participant</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='w-[300px] p-2'>
        <DropdownMenuLabel className='text-center py-2 border-b mb-2'>
          Add Participant
        </DropdownMenuLabel>
        <div className='space-y-1'>
          <DropdownMenuItem
            onClick={() => {
              return onSelectRole('CLIENT');
            }}
            className='flex items-start gap-3 p-3 rounded-md hover:bg-primary/5 cursor-pointer'
          >
            <div
              className='bg-blue-50 flex size-10 items-center justify-center rounded-full border border-blue-100 flex-shrink-0'
              aria-hidden='true'
            >
              <UserCircle className='h-5 w-5 text-blue-600' />
            </div>
            <div className='overflow-hidden'>
              <div className='text-sm font-medium'>Client</div>
              <div className='text-muted-foreground text-xs line-clamp-2'>
                Can view and download files, and leave comments
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              return onSelectRole('COLLABORATOR');
            }}
            className='flex items-start gap-3 p-3 rounded-md hover:bg-primary/5 cursor-pointer'
          >
            <div
              className='bg-indigo-50 flex size-10 items-center justify-center rounded-full border border-indigo-100 flex-shrink-0'
              aria-hidden='true'
            >
              <Users className='h-5 w-5 text-indigo-600' />
            </div>
            <div className='overflow-hidden'>
              <div className='text-sm font-medium'>Collaborator</div>
              <div className='text-muted-foreground text-xs line-clamp-2'>
                Can contribute to the project with editing and commenting abilities
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              return onSelectRole('TEAM MEMBER');
            }}
            className='flex items-start gap-3 p-3 rounded-md hover:bg-primary/5 cursor-pointer'
          >
            <div
              className='bg-green-50 flex size-10 items-center justify-center rounded-full border border-green-100 flex-shrink-0'
              aria-hidden='true'
            >
              <UserCog className='h-5 w-5 text-green-600' />
            </div>
            <div className='overflow-hidden'>
              <div className='text-sm font-medium'>Team Member</div>
              <div className='text-muted-foreground text-xs line-clamp-2'>
                Full access to edit, upload, and manage project content
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
