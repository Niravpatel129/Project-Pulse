'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Plus,
  UserCircle,
  UserCog,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import BlockWrapper from '../wrappers/BlockWrapper';
import AddParticipantDialog from './AddParticipantDialog';
import AddTeamDialog from './AddTeamDialog';

interface Participant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'pending' | 'inactive';
  permissions: string[];
  dateAdded: string;
  lastActive?: string;
  contractSigned?: boolean;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  notes?: string;
}

interface Collaborator {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: string;
  status?: 'active' | 'pending' | 'inactive';
}

interface Team {
  id: string;
  _id: string;
  name: string;
  avatar?: string;
  members?: number;
  description?: string;
  email?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  color: string;
  description?: string;
}

interface ProjectData {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  }>;
  [key: string]: unknown;
}

export default function ProjectHeader() {
  const { project, error } = useProject();
  const queryClient = useQueryClient();
  const [isSticky, setIsSticky] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false);

  // Use React Query to manage collaborators state
  const { data: collaborators = [] } = useQuery<Collaborator[]>({
    queryKey: ['collaborators', project?._id],
    queryFn: async () => {
      if (!project?._id) return [];
      const response = await newRequest.get(`/projects/${project._id}/collaborators`);
      return response.data.data || [];
    },
    enabled: !!project?._id,
  });

  // Use React Query to manage teams state
  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['teams', project?._id],
    queryFn: async () => {
      if (!project?._id) return [];
      const response = await newRequest.get(`/projects/${project._id}/team`);
      return response.data.data || [];
    },
    enabled: !!project?._id,
  });

  // Handle sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (bannerRef.current) {
        const bannerBottom = bannerRef.current.getBoundingClientRect().bottom;
        setIsSticky(bannerBottom <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      return window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Use React Query to manage participants state
  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: ['participants'],
    queryFn: () => {
      return Promise.resolve([]);
    },
    initialData: [],
  });

  const addParticipantMutation = useMutation({
    mutationFn: (newParticipant: Participant) => {
      // Here you would typically make an API call
      return Promise.resolve(newParticipant);
    },
    onSuccess: (newParticipant) => {
      queryClient.setQueryData<Participant[]>(['participants'], (oldData = []) => {
        const exists = oldData.some((p) => {
          return p.id === newParticipant.id;
        });
        if (!exists) {
          return [...oldData, newParticipant];
        }
        return oldData;
      });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const response = await newRequest.delete(
        `/projects/${project?._id}/participants/${participantId}`,
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove participant');
      }
      return participantId;
    },
    onSuccess: (participantId) => {
      queryClient.setQueryData(['project', project?._id], (oldData: ProjectData | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          participants: oldData.participants.filter((p) => {
            return p._id !== participantId;
          }),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['project', project?._id] });
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
    onError: (error) => {
      console.error('Error removing participant:', error);
    },
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (collaboratorId: string) => {
      const response = await newRequest.delete(
        `/projects/${project?._id}/collaborators/${collaboratorId}`,
      );
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove collaborator');
      }
      return collaboratorId;
    },
    onSuccess: (collaboratorId) => {
      queryClient.setQueryData<Collaborator[]>(['collaborators', project?._id], (oldData = []) => {
        return oldData.filter((c) => {
          return c._id !== collaboratorId;
        });
      });
      queryClient.invalidateQueries({ queryKey: ['collaborators', project?._id] });
      queryClient.invalidateQueries({ queryKey: ['project', project?._id] });
    },
    onError: (error) => {
      console.error('Error removing collaborator:', error);
    },
  });

  const removeTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const response = await newRequest.delete(`/projects/${project?._id}/team/${teamId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove team');
      }
      return teamId;
    },
    onSuccess: (teamId) => {
      queryClient.setQueryData<Team[]>(['teams', project?._id], (oldData = []) => {
        return oldData.filter((t) => {
          return t._id !== teamId;
        });
      });
      queryClient.invalidateQueries({ queryKey: ['teams', project?._id] });
      queryClient.invalidateQueries({ queryKey: ['project', project?._id] });
    },
    onError: (error) => {
      console.error('Error removing team:', error);
    },
  });

  const handleRemoveParticipant = (participantId: string) => {
    toast.promise(removeParticipantMutation.mutateAsync(participantId), {
      loading: 'Removing participant...',
      success: 'Participant removed successfully',
      error: 'Failed to remove participant',
    });
  };

  const handleRemoveCollaborator = (collaboratorId: string) => {
    toast.promise(removeCollaboratorMutation.mutateAsync(collaboratorId), {
      loading: 'Removing collaborator...',
      success: 'Collaborator removed successfully',
      error: 'Failed to remove collaborator',
    });
  };

  const handleRemoveTeam = (teamId: string) => {
    toast.promise(removeTeamMutation.mutateAsync(teamId), {
      loading: 'Removing team...',
      success: 'Team removed successfully',
      error: 'Failed to remove team',
    });
  };

  const [predefinedRoles, setPredefinedRoles] = useState<Role[]>([]);

  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const handleAddParticipant = (participant: Participant) => {
    addParticipantMutation.mutate(participant);
  };

  const addRoleMutation = useMutation({
    mutationFn: (newRole: Role) => {
      // Here you would typically make an API call
      return Promise.resolve(newRole);
    },
    onSuccess: (newRole) => {
      setPredefinedRoles((prev) => {
        return [...prev, newRole];
      });
    },
  });

  const handleAddRole = (role: Role) => {
    addRoleMutation.mutate(role);
  };

  const handleSelectRole = (roleName: string) => {
    setSelectedRole(roleName);

    // Open the appropriate dialog based on the role
    if (roleName === 'CLIENT') {
      setIsAddParticipantOpen(true);
      setIsAddTeamOpen(false);
    } else if (roleName === 'COLLABORATOR' || roleName === 'TEAM MEMBER') {
      setIsAddTeamOpen(true);
      setIsAddParticipantOpen(false);
    } else {
      setIsAddParticipantOpen(true);
      setIsAddTeamOpen(false);
    }
  };

  const getStatusBadge = (status: 'active' | 'pending' | 'inactive') => {
    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle2 className='h-3 w-3 mr-1' />,
      },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className='h-3 w-3 mr-1' /> },
      inactive: {
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle className='h-3 w-3 mr-1' />,
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant='outline' className={`flex items-center ${config.color} font-normal`}>
        {config.icon}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </Badge>
    );
  };

  const getRoleBadge = (roleName: string) => {
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

  const handleShowParticipants = () => {
    setShowParticipantsDialog(true);
  };

  const handleProjectStatus = () => {
    toast.info(`Current status: ${project.projectStatus || 'Active'}`);
  };

  if (error) return <div className='text-red-500'>{error}</div>;
  if (!project) return <></>;

  return (
    <BlockWrapper>
      <div className=''>
        {/* Project Banner */}
        <div ref={bannerRef} className=' w-full'>
          <div className='container mx-auto px-4 py-1 sm:py-1'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
              <div className='relative h-8 w-8 sm:h-16 sm:w-16 rounded-md overflow-hidden'>
                <Image
                  src='https://picsum.photos/200'
                  alt='Project Thumbnail'
                  fill
                  className='object-cover'
                  priority
                />
              </div>
              <div>
                <h1 className='text-xl sm:text-2xl font-medium capitalize'>{project.name}</h1>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {/* Format the creation date in a readable format */}
                  {project.projectType} - Created on{' '}
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Banner that appears when scrolling */}
        {isSticky && (
          <div className='fixed bg-white top-0 left-0 right-0 z-50  shadow-md border-b'>
            <div className='container mx-auto px-4 py-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='relative h-8 w-8 rounded-md overflow-hidden'>
                    <Image
                      src='https://picsum.photos/200'
                      alt='Project Thumbnail'
                      fill
                      className='object-cover'
                      priority
                    />
                  </div>
                  <h2 className='text-lg font-medium capitalize'>{project.name}</h2>
                  <Badge variant='outline' className='ml-2 bg-gray-100 text-gray-800'>
                    {project.projectType}
                  </Badge>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='flex items-center gap-1'
                    onClick={handleShowParticipants}
                  >
                    <Users className='h-4 w-4' />
                    <span className='hidden sm:inline'>Participants</span>
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center gap-1'
                    onClick={handleProjectStatus}
                  >
                    <Clock className='h-4 w-4' />
                    <span className='hidden sm:inline'>Project Status</span>
                    <Badge variant='outline' className='ml-2 bg-gray-100 text-gray-800'>
                      {project.projectStatus || 'Active'}
                    </Badge>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants Section */}
        <div id='participants-section' className='container mx-auto px-4 py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex flex-wrap items-center gap-4'>
                {/* Participants */}
                {project.participants.map((participant) => {
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
                              {getRoleBadge(participant.role)}
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
                })}

                {/* Collaborators */}
                {collaborators.map((collaborator) => {
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
                              {getRoleBadge(collaborator.role)}

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
                })}

                {/* Teams */}
                {teams.map((team) => {
                  console.log('🚀 team:', team);
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
                })}

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
                  getRoleBadge={getRoleBadge}
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

        {/* Participants Dialog */}
        <Dialog open={showParticipantsDialog} onOpenChange={setShowParticipantsDialog}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Project Members</DialogTitle>
            </DialogHeader>
            <div className='max-h-[60vh] overflow-y-auto'>
              <div className='space-y-4 py-2'>
                {/* Participants Section */}
                {project.participants.length > 0 && (
                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-2'>Participants</h3>
                    {project.participants.map((participant) => {
                      return (
                        <div
                          key={participant._id}
                          className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'
                        >
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8 bg-gray-200'>
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
                            <div>
                              <p className='text-sm font-medium'>{participant.name}</p>
                              <p className='text-xs text-muted-foreground'>
                                {participant.email || 'No email'}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            {getRoleBadge(participant.role)}
                            {participant.status && (
                              <span>
                                {getStatusBadge(
                                  participant.status as 'active' | 'pending' | 'inactive',
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Collaborators Section */}
                {collaborators.length > 0 && (
                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                      Collaborators
                    </h3>
                    {collaborators.map((collaborator) => {
                      return (
                        <div
                          key={collaborator._id}
                          className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'
                        >
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-8 w-8 bg-indigo-100'>
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
                            <div>
                              <p className='text-sm font-medium'>
                                {collaborator.name} | Collaborator
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {collaborator.email || 'No email'}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            {getRoleBadge(collaborator.role)}
                            {collaborator.status && (
                              <span>
                                {getStatusBadge(
                                  collaborator.status as 'active' | 'pending' | 'inactive',
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {project.participants.length === 0 && collaborators.length === 0 && (
                  <div className='text-center text-muted-foreground py-4'>
                    No project members found
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BlockWrapper>
  );
}
