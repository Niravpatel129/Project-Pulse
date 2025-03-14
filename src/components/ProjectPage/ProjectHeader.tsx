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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { AlertCircle, CheckCircle2, Clock, Plus, UserCircle, UserCog, Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import AddParticipantDialog from './AddParticipantDialog';

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
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: '1',
      name: 'You',
      role: 'ADMIN',
      avatar: 'https://picsum.photos/100/100?random=1',
      email: 'you@example.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      permissions: ['edit', 'upload', 'download', 'share', 'delete'],
      dateAdded: '2023-04-15',
      lastActive: '2023-06-22',
      contractSigned: true,
      paymentStatus: 'paid',
    },
    {
      id: '2',
      name: 'Shannon Zurawski',
      role: 'CLIENT',
      initials: 'SZ',
      email: 'shannon@example.com',
      phone: '+1 (555) 987-6543',
      status: 'active',
      permissions: ['view', 'download', 'comment'],
      dateAdded: '2023-04-16',
      lastActive: '2023-06-20',
      contractSigned: true,
      paymentStatus: 'partial',
      notes: 'Primary contact for wedding planning',
    },
  ]);

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
    setIsAddParticipantOpen(true);
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
      <Badge variant='outline' className={`${role.color} font-normal`}>
        {roleName}
      </Badge>
    ) : (
      <Badge variant='outline' className='bg-gray-100 text-gray-800 font-normal'>
        {roleName}
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
                  console.log('🚀 participant:', participant);
                  return (
                    <div key={participant._id} className='flex items-center gap-2'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {participant.avatar ? (
                            <Avatar className='h-10 w-10 cursor-pointer'>
                              <AvatarImage src={participant.avatar} alt={participant.name} />
                              <AvatarFallback>
                                {participant.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className='flex h-10 w-10 cursor-pointer items-center justify-center bg-gray-100'>
                              <span className='text-sm'>
                                {participant.name.charAt(0).toUpperCase()}
                              </span>
                            </Avatar>
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          <div>
                            <p className='font-medium'>{participant.name}</p>
                            <p className='text-xs text-muted-foreground'>{participant.role}</p>
                            {participant.email && <p className='text-xs'>{participant.email}</p>}
                            {participant.status && (
                              <div className='mt-1'>
                                {getStatusBadge(
                                  participant.status as 'active' | 'pending' | 'inactive',
                                )}
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <div className='hidden sm:block'>
                        <div className='flex items-center gap-1'>
                          <p className='text-sm font-medium capitalize'>{participant.name}</p>
                        </div>
                        <div className='flex items-center gap-1'>
                          {getRoleBadge(participant.role)}
                          {participant.status && (
                            <span className='text-xs ml-1'>
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
                      variant='ghost'
                      size='sm'
                      className='rounded-full shadow-none flex items-center justify-center'
                    >
                      <Plus className='h-4 w-4' />
                      <span className='text-xs hidden xs:inline ml-1'>ADD PARTICIPANT</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='center' className='pb-2 w-[280px]'>
                    <DropdownMenuLabel>Add Participant</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        return handleSelectRole('CLIENT');
                      }}
                      className='flex items-start gap-2'
                    >
                      <div
                        className='bg-background flex size-8 items-center justify-center rounded-md border flex-shrink-0'
                        aria-hidden='true'
                      >
                        <UserCircle className='h-4 w-4 opacity-60' />
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
                      className='flex items-start gap-2'
                    >
                      <div
                        className='bg-background flex size-8 items-center justify-center rounded-md border flex-shrink-0'
                        aria-hidden='true'
                      >
                        <Users className='h-4 w-4 opacity-60' />
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
                      className='flex items-start gap-2'
                    >
                      <div
                        className='bg-background flex size-8 items-center justify-center rounded-md border flex-shrink-0'
                        aria-hidden='true'
                      >
                        <UserCog className='h-4 w-4 opacity-60' />
                      </div>
                      <div className='overflow-hidden'>
                        <div className='text-sm font-medium'>Team Member</div>
                        <div className='text-muted-foreground text-xs line-clamp-2'>
                          Full access to edit, upload, and manage project content
                        </div>
                      </div>
                    </DropdownMenuItem>
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
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
