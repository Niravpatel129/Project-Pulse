'use client';

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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
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
import { useState } from 'react';
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

interface Role {
  id: string;
  name: string;
  permissions: string[];
  color: string;
  description?: string;
}

export default function ProjectHeader() {
  const { project, loading, error } = useProject();
  const [participants, setParticipants] = useState<Participant[]>([]);

  const [predefinedRoles, setPredefinedRoles] = useState<Role[]>([
    {
      id: 'r1',
      name: 'CLIENT',
      permissions: ['view', 'download', 'comment'],
      color: 'bg-blue-100 text-blue-800',
      description: 'Can view and download files, and leave comments',
    },
    {
      id: 'r2',
      name: 'TEAM MEMBER',
      permissions: ['edit', 'upload', 'download', 'share'],
      color: 'bg-green-100 text-green-800',
      description: 'Full access to edit, upload, and manage project content',
    },
    {
      id: 'r3',
      name: 'ASSISTANT',
      permissions: ['edit', 'upload', 'download'],
      color: 'bg-purple-100 text-purple-800',
      description: 'Can help with project tasks but with limited permissions',
    },
    {
      id: 'r4',
      name: 'PHOTOGRAPHER',
      permissions: ['edit', 'upload', 'download', 'share', 'delete'],
      color: 'bg-amber-100 text-amber-800',
      description: 'Can upload and manage photography assets',
    },
    {
      id: 'r5',
      name: 'MAKEUP ARTIST',
      permissions: ['view', 'download'],
      color: 'bg-pink-100 text-pink-800',
      description: 'Limited access to view project details and references',
    },
    {
      id: 'r6',
      name: 'VIEWER',
      permissions: ['view'],
      color: 'bg-gray-100 text-gray-800',
      description: 'Can only view project content, no other permissions',
    },
    {
      id: 'r7',
      name: 'COLLABORATOR',
      permissions: ['edit', 'upload', 'download', 'comment'],
      color: 'bg-indigo-100 text-indigo-800',
      description: 'Can contribute to the project with editing and commenting abilities',
    },
  ]);

  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const handleAddParticipant = (participant: Participant) => {
    const exists = participants.some((p) => {
      return p.id === participant.id;
    });
    if (!exists) {
      setParticipants([...participants, participant]);
    }
  };

  const handleAddRole = (role: Role) => {
    setPredefinedRoles([...predefinedRoles, role]);
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
    return role ? (
      <Badge variant='outline' className={`${role.color} font-normal capitalize`}>
        {roleName || 'Client'}
      </Badge>
    ) : (
      <Badge variant='outline' className='bg-gray-100 text-gray-800 font-normal capitalize'>
        {roleName || 'Client'}
      </Badge>
    );
  };

  if (error) return <div className='text-red-500'>{error}</div>;
  if (!project) return <></>;

  return (
    <div className='bg-white'>
      {/* Project Banner */}
      <div className='container mx-auto px-4 py-4 sm:py-6'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
          <div className='relative h-10 w-10 sm:h-16 sm:w-16 rounded-md overflow-hidden'>
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

      {/* Participants Section */}
      <TooltipProvider>
        <div className='container mx-auto px-4 py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex flex-wrap items-center gap-4'>
                {project.participants.map((participant) => {
                  return (
                    <div
                      key={participant._id}
                      className='flex items-center gap-3 transition-all  p-1.5 rounded-lg'
                    >
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Avatar className='h-10 w-10 cursor-pointer border-2 border-transparent hover:border-gray-300 transition-colors bg-gray-200'>
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
                        </HoverCardTrigger>
                        <HoverCardContent side='bottom' className='p-3 max-w-xs'>
                          <div className='space-y-3'>
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-10 w-10'>
                                {participant.avatar ? (
                                  <AvatarImage src={participant.avatar} alt={participant.name} />
                                ) : (
                                  <AvatarFallback className='bg-gray-200 text-gray-800 font-medium flex items-center justify-center'>
                                    {participant.name
                                      .split(' ')
                                      .map((n) => {
                                        return n.charAt(0).toUpperCase();
                                      })
                                      .join('')}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className='space-y-0.5'>
                                <p className='font-medium text-base'>{participant.name}</p>
                                <div className='flex items-center gap-2'>
                                  <span className='text-sm'>{participant.role}</span>
                                  {participant.status && (
                                    <span className='text-sm'>{participant.status}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {participant.email && (
                              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                <Mail className='h-3 w-3' />
                                <span>{participant.email}</span>
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                      <div className='hidden sm:block'>
                        <div className='flex items-center gap-1'>
                          <p className='text-sm font-medium capitalize'>{participant.name}</p>
                        </div>
                        <div className='flex items-center gap-1.5 mt-0.5'>
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
                    </div>
                  );
                })}

                {/* Add Participant Button with Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='rounded-full h-10 w-10 ml-2 border-dashed hover:border-primary hover:bg-primary/5 transition-colors'
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
                  predefinedRoles={predefinedRoles}
                />
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
