import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Mail, Users } from 'lucide-react';
import { toast } from 'sonner';
import AddParticipantDialog from '../AddParticipantDialog';
import AddTeamDialog from '../AddTeamDialog';
import { Role } from '../ProjectHeader/types';

const getRoleBadge = (roleName: string, predefinedRoles: Role[]) => {
  const role = predefinedRoles.find((r) => {
    return r.name === roleName;
  });

  // Refined color palette for better visual harmony
  const defaultColors = {
    CLIENT: 'bg-blue-50 text-blue-700 border-blue-100',
    COLLABORATOR: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'TEAM MEMBER': 'bg-green-50 text-green-700 border-green-100',
    moderator: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  const badgeColor = role
    ? role.color
    : defaultColors[roleName] || 'bg-gray-50 text-gray-700 border-gray-100';

  return (
    <Badge variant='outline' className={`${badgeColor} font-normal capitalize text-xs`}>
      {roleName || 'Client'}
    </Badge>
  );
};

const ParticipantSkeleton = () => {
  return (
    <div className='flex items-center gap-2.5 p-1.5 rounded-lg'>
      <Skeleton className='h-8 w-8 rounded-full' />
      <div className='hidden sm:block space-y-1.5'>
        <Skeleton className='h-3.5 w-24' />
        <Skeleton className='h-3 w-16' />
      </div>
    </div>
  );
};

const ParticipantCard = ({ participant, predefinedRoles, onRemove, type = 'participant' }) => {
  const avatarClass =
    type === 'collaborator'
      ? 'border-indigo-100 hover:border-indigo-200 bg-indigo-50'
      : type === 'team'
      ? 'border-green-100 hover:border-green-200 bg-green-50'
      : 'border-gray-100 hover:border-gray-200 bg-gray-50';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='w-auto'>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className='flex items-center  rounded-lg cursor-pointer hover:bg-gray-50/50 transition-colors'>
              <Avatar className={` h-8 w-8 border-2 ${avatarClass} transition-colors`}>
                {participant.avatar ? (
                  <AvatarImage src={participant.avatar} alt={participant.name} />
                ) : (
                  <AvatarFallback className={`text-purple-700 font-medium text-xs bg-purple-100`}>
                    {participant.name
                      .split(' ')
                      .map((n) => {
                        return n.charAt(0).toUpperCase();
                      })
                      .join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className='hidden sm:block'>
                {/* <div className='flex items-center gap-1'>
              <p className='text-xs font-medium text-gray-900'>
              {participant.name.length > 15
              ? `${participant.name.substring(0, 15)}...`
              : participant.name}
              </p>
              </div> */}
                {/* <div className='flex items-center gap-1.5 mt-0.5'>
              {getRoleBadge(participant.role, predefinedRoles)}
              {type === 'collaborator' && (
                <Badge
                variant='outline'
                  className='bg-indigo-50 text-indigo-700 border-indigo-100 text-xs'
                >
                  Collaborator
                </Badge>
              )}
              {type === 'team' && participant.members && (
                <Badge
                  variant='outline'
                  className='bg-gray-50 text-gray-700 border-gray-100 text-xs'
                >
                  {participant.members} members
                </Badge>
              )}
            </div> */}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{participant.name}</p>
          </TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='center' className='w-64'>
        <DropdownMenuItem
          className='cursor-pointer text-sm'
          onClick={() => {
            if (participant.email) {
              navigator.clipboard?.writeText(participant.email);
              toast.success('Email copied to clipboard');
            }
          }}
        >
          <Mail className='h-4 w-4 mr-2 text-gray-500' />
          {participant.email && participant.email.length > 30
            ? `${participant.email.substring(0, 30)}...`
            : participant.email || 'No email'}
        </DropdownMenuItem>
        {type === 'team' && (
          <DropdownMenuItem
            className='cursor-pointer text-sm'
            onClick={() => {
              return toast.info('View team details');
            }}
          >
            <Users className='h-4 w-4 mr-2 text-gray-500' />
            View team details
          </DropdownMenuItem>
        )}
        <DropdownMenuLabel className='px-2 py-1.5 text-xs text-gray-500'>
          <hr />
        </DropdownMenuLabel>
        <DropdownMenuItem
          className='cursor-pointer text-sm text-red-600 hover:text-red-700'
          onClick={() => {
            return onRemove(participant._id || participant.id);
          }}
        >
          Remove from project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function ProjectParticipants({
  isLoadingProject,
  project,
  isLoadingCollaborators,
  collaborators,
  isLoadingTeams,
  teams,
  predefinedRoles,
  handleRemoveParticipant,
  handleRemoveCollaborator,
  handleRemoveTeam,
  handleSelectRole,
  isAddParticipantOpen,
  setIsAddParticipantOpen,
  isAddTeamOpen,
  setIsAddTeamOpen,
  selectedRole,
  handleAddParticipant,
  handleAddRole,
}) {
  return (
    <div id='participants-section' className='px-4 py-3 sm:py-4'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-3'>
          {/* Participants */}
          {isLoadingProject ? (
            <>
              <ParticipantSkeleton />
              <ParticipantSkeleton />
              <ParticipantSkeleton />
            </>
          ) : (
            project?.participants?.map((participant) => {
              return (
                <ParticipantCard
                  key={participant._id}
                  participant={participant}
                  predefinedRoles={predefinedRoles}
                  onRemove={handleRemoveParticipant}
                />
              );
            })
          )}

          {/* Collaborators */}
          {!isLoadingCollaborators &&
            collaborators.map((collaborator) => {
              return (
                <ParticipantCard
                  key={collaborator._id}
                  participant={collaborator}
                  predefinedRoles={predefinedRoles}
                  onRemove={handleRemoveCollaborator}
                  type='collaborator'
                />
              );
            })}

          {/* Teams */}
          {!isLoadingTeams &&
            teams.map((team) => {
              return (
                <ParticipantCard
                  key={team.id}
                  participant={team}
                  predefinedRoles={predefinedRoles}
                  onRemove={handleRemoveTeam}
                  type='team'
                />
              );
            })}

          {/* Add Participant Button */}
          {/* <DropdownMenu>
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
              <DropdownMenuLabel className='text-center py-2 border-b mb-2 text-sm font-medium'>
                Add Participant
              </DropdownMenuLabel>
              <div className='space-y-1'>
                <DropdownMenuItem
                  onClick={() => {
                    return handleSelectRole('CLIENT');
                  }}
                  className='flex items-start gap-3 p-2.5 rounded-md hover:bg-primary/5 cursor-pointer'
                >
                  <div className='bg-blue-50 flex size-10 items-center justify-center rounded-full border border-blue-100 flex-shrink-0'>
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
                    return handleSelectRole('COLLABORATOR');
                  }}
                  className='flex items-start gap-3 p-2.5 rounded-md hover:bg-primary/5 cursor-pointer'
                >
                  <div className='bg-indigo-50 flex size-10 items-center justify-center rounded-full border border-indigo-100 flex-shrink-0'>
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
                    return handleSelectRole('TEAM MEMBER');
                  }}
                  className='flex items-start gap-3 p-2.5 rounded-md hover:bg-primary/5 cursor-pointer'
                >
                  <div className='bg-green-50 flex size-10 items-center justify-center rounded-full border border-green-100 flex-shrink-0'>
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
          </DropdownMenu> */}

          <AddParticipantDialog
            isOpen={isAddParticipantOpen}
            onOpenChange={setIsAddParticipantOpen}
            onAddParticipant={handleAddParticipant}
            predefinedRoles={predefinedRoles}
            onAddRole={handleAddRole}
            getRoleBadge={(roleName: string) => {
              return getRoleBadge(roleName, predefinedRoles);
            }}
          />

          <AddTeamDialog
            isOpen={isAddTeamOpen}
            onOpenChange={setIsAddTeamOpen}
            selectedRole={selectedRole}
            onAddParticipant={handleAddParticipant}
          />
        </div>
      </div>
    </div>
  );
}
