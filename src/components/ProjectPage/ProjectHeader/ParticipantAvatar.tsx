import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Collaborator, Participant, Team } from './types';

interface ParticipantAvatarProps {
  participant?: Participant;
  collaborator?: Collaborator;
  team?: Team;
  onRemove: (id: string) => void;
  getRoleBadge: (role: string) => React.ReactNode;
}

export function ParticipantAvatar({
  participant,
  collaborator,
  team,
  onRemove,
  getRoleBadge,
}: ParticipantAvatarProps) {
  const data = participant || collaborator || team;
  if (!data) return null;

  const isTeam = !!team;
  const isCollaborator = !!collaborator;
  const avatarClass = isTeam
    ? 'border-2 border-green-200 hover:border-green-300 bg-green-100'
    : isCollaborator
    ? 'border-2 border-indigo-200 hover:border-indigo-300 bg-indigo-100'
    : 'border-2 border-transparent hover:border-gray-300 bg-gray-200';

  const fallbackClass = isTeam
    ? 'bg-green-100 text-green-800'
    : isCollaborator
    ? 'bg-indigo-100 text-indigo-800'
    : 'bg-gray-200 text-gray-800';

  const name = isTeam ? team.name || team.email?.split('@')[0] || 'Team' : data.name;
  const email = isTeam ? team.email : data.email;
  const role = isTeam ? 'Team' : participant?.role || collaborator?.role || '';
  const id = isTeam ? team.id : participant?.id || collaborator?._id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='w-auto'>
        <div className='flex items-center gap-3 transition-all p-1.5 rounded-lg cursor-pointer hover:bg-gray-50'>
          <Avatar className={`h-8 w-8 ${avatarClass} transition-colors`}>
            {data.avatar ? (
              <AvatarImage src={data.avatar} alt={name} />
            ) : (
              <AvatarFallback className={`${fallbackClass} font-medium`}>
                {name
                  .split(' ')
                  .map((n) => {
                    return n.charAt(0).toUpperCase();
                  })
                  .join('')}
              </AvatarFallback>
            )}
          </Avatar>
          <div className='hidden sm:block'>
            <div className='flex items-center gap-1'>
              <p className='text-sm font-medium capitalize'>
                {name.length > 15 ? `${name.substring(0, 15)}...` : name}
              </p>
            </div>
            <div className='flex items-center gap-1.5 mt-0.5'>
              {getRoleBadge(role)}
              {isTeam && team.members && (
                <Badge variant='outline' className='bg-gray-100 text-gray-800 font-normal'>
                  {team.members} members
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='w-64'>
        {email && (
          <DropdownMenuItem
            className='cursor-pointer'
            onClick={() => {
              navigator.clipboard?.writeText(email);
              toast.success('Email copied to clipboard');
            }}
          >
            <Mail className='h-4 w-4 mr-2' />
            {email.length > 30 ? `${email.substring(0, 30)}...` : email}
          </DropdownMenuItem>
        )}
        <DropdownMenuLabel className='px-2 py-1.5 text-xs text-gray-500'>
          <hr />
        </DropdownMenuLabel>
        <DropdownMenuItem
          className='cursor-pointer text-red-500'
          onClick={() => {
            return id && onRemove(id);
          }}
        >
          Remove from project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
