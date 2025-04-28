import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Plus, UserCircle, UserCog, Users } from 'lucide-react';
import { toast } from 'sonner';
import AddParticipantDialog from '../AddParticipantDialog';
import AddTeamDialog from '../AddTeamDialog';
import { Role } from '../ProjectHeader/types';

const getRoleBadge = (roleName: string, predefinedRoles: Role[]) => {
  const role = predefinedRoles.find((r) => {
    return r.name === roleName;
  });

  // Default colors for standard roles if not found in predefinedRoles
  const defaultColors = {
    CLIENT: 'bg-blue-100 text-blue-800',
    COLLABORATOR: 'bg-indigo-100 text-indigo-800',
    'TEAM MEMBER': 'bg-green-100 text-green-800',
    moderator: 'bg-purple-100 text-purple-800',
  };

  const badgeColor = role ? role.color : defaultColors[roleName] || 'bg-gray-100 text-gray-800';

  return (
    <Badge variant='outline' className={`${badgeColor} font-normal capitalize`}>
      {roleName || 'Client'}
    </Badge>
  );
};

const ParticipantSkeleton = () => {
  return (
    <div className='flex items-center gap-3 transition-all p-1.5 rounded-lg'>
      <Skeleton className='h-8 w-8 rounded-full' />
      <div className='hidden sm:block space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-3 w-16' />
      </div>
    </div>
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
    <div id='participants-section' className=' px-4 py-3 sm:py-4'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex flex-wrap items-center gap-4'>
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
                  <DropdownMenu key={participant._id}>
                    <DropdownMenuTrigger className='w-auto'>
                      <div className='flex items-center gap-3 transition-all p-1.5 rounded-lg cursor-pointer hover:bg-gray-50'>
                        <Avatar className='h-8 w-8 border-2 border-transparent hover:border-gray-300 transition-colors bg-gray-200'>
                          {participant.avatar ? (
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                          ) : (
                            <AvatarFallback className='bg-gray-200 text-gray-800 font-medium'>
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
                          <div className='flex items-center gap-1'>
                            <p className='text-sm font-medium capitalize'>
                              {participant.name.length > 15
                                ? `${participant.name.substring(0, 15)}...`
                                : participant.name}
                            </p>
                          </div>
                          <div className='flex items-center gap-1.5 mt-0.5'>
                            {getRoleBadge(participant.role, predefinedRoles)}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='center' className='w-64'>
                      <DropdownMenuItem
                        className='cursor-pointer '
                        onClick={() => {
                          if (participant.email) {
                            navigator.clipboard?.writeText(participant.email);
                            toast.success('Email copied to clipboard');
                          }
                        }}
                      >
                        <Mail className='h-4 w-4 mr-2' />
                        {participant.email && participant.email.length > 30
                          ? `${participant.email.substring(0, 30)}...`
                          : participant.email || 'No email'}
                      </DropdownMenuItem>
                      <DropdownMenuLabel className='px-2 py-1.5 text-xs text-gray-500'>
                        <hr />
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className='cursor-pointer text-red-500'
                        onClick={() => {
                          return handleRemoveParticipant(participant._id);
                        }}
                      >
                        Remove from project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })
            )}

            {/* Collaborators */}
            {isLoadingCollaborators ? (
              <>
                {/* <ParticipantSkeleton />
      <ParticipantSkeleton />
      <ParticipantSkeleton />
      <ParticipantSkeleton /> */}
              </>
            ) : (
              collaborators.map((collaborator) => {
                return (
                  <DropdownMenu key={collaborator._id}>
                    <DropdownMenuTrigger className='w-auto'>
                      <div className='flex items-center gap-3 transition-all p-1.5 rounded-lg cursor-pointer hover:bg-gray-50'>
                        <Avatar className='h-8 w-8 border-2 border-indigo-200 hover:border-indigo-300 transition-colors bg-indigo-100'>
                          {collaborator.avatar ? (
                            <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                          ) : (
                            <AvatarFallback className='bg-indigo-100 text-indigo-800 font-medium'>
                              {collaborator.name
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
                              {collaborator.name.length > 15
                                ? `${collaborator.name.substring(0, 15)}...`
                                : collaborator.name}{' '}
                            </p>
                          </div>
                          <div className='flex items-center gap-1.5 mt-0.5'>
                            {getRoleBadge(collaborator.role, predefinedRoles)}

                            <Badge
                              variant='outline'
                              className='bg-indigo-100 text-indigo-800 font-normal'
                            >
                              Collaborator
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='center' className='w-64'>
                      <DropdownMenuItem
                        className='cursor-pointer'
                        onClick={() => {
                          if (collaborator.email) {
                            navigator.clipboard?.writeText(collaborator.email);
                            toast.success('Email copied to clipboard');
                          }
                        }}
                      >
                        <Mail className='h-4 w-4 mr-2' />
                        {collaborator.email && collaborator.email.length > 30
                          ? `${collaborator.email.substring(0, 30)}...`
                          : collaborator.email || 'No email'}
                      </DropdownMenuItem>
                      <DropdownMenuLabel className='px-2 py-1.5 text-xs text-gray-500'>
                        <hr />
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className='cursor-pointer text-red-500'
                        onClick={() => {
                          return handleRemoveCollaborator(collaborator._id);
                        }}
                      >
                        Remove from project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })
            )}

            {/* Teams */}
            {isLoadingTeams ? (
              <>
                {/* <TeamSkeleton />
      <TeamSkeleton />
      <TeamSkeleton /> */}
              </>
            ) : (
              teams.map((team) => {
                return (
                  <DropdownMenu key={team.id}>
                    <DropdownMenuTrigger className='w-auto'>
                      <div className='flex items-center gap-3 transition-all p-1.5 rounded-lg cursor-pointer hover:bg-gray-50'>
                        <Avatar className='h-8 w-8 border-2 border-green-200 hover:border-green-300 transition-colors bg-green-100'>
                          {team.avatar ? (
                            <AvatarImage src={team.avatar} alt={team.name} />
                          ) : (
                            <AvatarFallback className='bg-green-100 text-green-800 font-medium'>
                              {team.name
                                ? team.name
                                    .split(' ')
                                    .map((n) => {
                                      return n.charAt(0).toUpperCase();
                                    })
                                    .join('')
                                : team.email
                                ? team.email.split('@')[0].charAt(0).toUpperCase()
                                : 'T'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className='hidden sm:block'>
                          <div className='flex items-center gap-1'>
                            <p className='text-sm font-medium capitalize'>
                              {team.name
                                ? team.name.length > 15
                                  ? `${team.name.substring(0, 15)}...`
                                  : team.name
                                : team.email
                                ? team.email.split('@')[0]
                                : 'Team'}{' '}
                            </p>
                          </div>
                          <div className='flex items-center gap-1.5 mt-0.5'>
                            <Badge
                              variant='outline'
                              className='bg-green-100 text-green-800 font-normal'
                            >
                              Team
                            </Badge>
                            {team.members && (
                              <Badge
                                variant='outline'
                                className='bg-gray-100 text-gray-800 font-normal'
                              >
                                {team.members} members
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='center' className='w-64'>
                      <DropdownMenuItem
                        className='cursor-pointer'
                        onClick={() => {
                          toast.info('View team details');
                        }}
                      >
                        <Users className='h-4 w-4 mr-2' />
                        View team details
                      </DropdownMenuItem>
                      <DropdownMenuLabel className='px-2 py-1.5 text-xs text-gray-500'>
                        <hr />
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className='cursor-pointer text-red-500'
                        onClick={() => {
                          return handleRemoveTeam(team.id);
                        }}
                      >
                        Remove from project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })
            )}

            {/* Add Participant Button with Dropdown */}
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
                      return handleSelectRole('CLIENT');
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
                      return handleSelectRole('COLLABORATOR');
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
                      return handleSelectRole('TEAM MEMBER');
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
    </div>
  );
}
