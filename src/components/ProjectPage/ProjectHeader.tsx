'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  Plus,
  PlusCircle,
  Search,
  Send,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

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
    },
    {
      id: 'r2',
      name: 'TEAM MEMBER',
      permissions: ['edit', 'upload', 'download', 'share'],
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'r3',
      name: 'ASSISTANT',
      permissions: ['edit', 'upload', 'download'],
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'r4',
      name: 'PHOTOGRAPHER',
      permissions: ['edit', 'upload', 'download', 'share', 'delete'],
      color: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'r5',
      name: 'MAKEUP ARTIST',
      permissions: ['view', 'download'],
      color: 'bg-pink-100 text-pink-800',
    },
    { id: 'r6', name: 'VIEWER', permissions: ['view'], color: 'bg-gray-100 text-gray-800' },
  ]);

  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantRole, setNewParticipantRole] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantPhone, setNewParticipantPhone] = useState('');
  const [newParticipantNotes, setNewParticipantNotes] = useState('');
  const [newParticipantPermissions, setNewParticipantPermissions] = useState<string[]>([]);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [inviteLink, setInviteLink] = useState('https://project.example.com/invite/abc123xyz');
  const [linkCopied, setLinkCopied] = useState(false);

  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const [isViewParticipantOpen, setIsViewParticipantOpen] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  const [newRoleColor, setNewRoleColor] = useState('bg-gray-100 text-gray-800');

  // Mock previous clients/team members for the CRM integration
  const previousContacts = [
    {
      id: 'c1',
      name: 'Alex Johnson',
      role: 'CLIENT',
      email: 'alex@example.com',
      initials: 'AJ',
      phone: '+1 (555) 234-5678',
      status: 'active' as const,
      permissions: ['view', 'download', 'comment'],
      dateAdded: '2023-01-10',
      lastActive: '2023-06-15',
      contractSigned: true,
      paymentStatus: 'paid' as const,
      notes: 'Returning client, 3 previous projects',
    },
    {
      id: 'c2',
      name: 'Maria Garcia',
      role: 'CLIENT',
      email: 'maria@example.com',
      initials: 'MG',
      phone: '+1 (555) 345-6789',
      status: 'active' as const,
      permissions: ['view', 'download', 'comment'],
      dateAdded: '2023-02-22',
      lastActive: '2023-05-30',
      contractSigned: true,
      paymentStatus: 'paid' as const,
      notes: 'Referred by Alex Johnson',
    },
    {
      id: 'c3',
      name: 'James Wilson',
      role: 'ASSISTANT',
      email: 'james@example.com',
      initials: 'JW',
      phone: '+1 (555) 456-7890',
      status: 'active' as const,
      permissions: ['edit', 'upload', 'download'],
      dateAdded: '2022-11-15',
      lastActive: '2023-06-21',
      contractSigned: true,
      paymentStatus: 'paid' as const,
      notes: 'Regular assistant, available weekends',
    },
    {
      id: 'c4',
      name: 'Emma Davis',
      role: 'MAKEUP ARTIST',
      email: 'emma@example.com',
      initials: 'ED',
      phone: '+1 (555) 567-8901',
      status: 'active' as const,
      permissions: ['view', 'download'],
      dateAdded: '2023-03-05',
      lastActive: '2023-06-10',
      contractSigned: true,
      paymentStatus: 'paid' as const,
      notes: 'Specializes in natural makeup looks',
    },
  ];

  const filteredContacts = previousContacts.filter((contact) => {
    return (
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddParticipant = () => {
    if (newParticipantName.trim() === '' || newParticipantRole.trim() === '') return;

    const initials = newParticipantName
      .split(' ')
      .map((name) => {
        return name[0];
      })
      .join('')
      .toUpperCase();

    // Get permissions based on selected role
    const rolePermissions =
      predefinedRoles.find((r) => {
        return r.name === newParticipantRole.toUpperCase();
      })?.permissions || [];

    // Use selected permissions if any, otherwise use role default permissions
    const permissions =
      newParticipantPermissions.length > 0 ? newParticipantPermissions : rolePermissions;

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName,
      role: newParticipantRole.toUpperCase(),
      initials,
      email: newParticipantEmail,
      phone: newParticipantPhone,
      status: 'pending',
      permissions,
      dateAdded: new Date().toISOString().split('T')[0],
      notes: newParticipantNotes,
    };

    setParticipants([...participants, newParticipant]);
    setNewParticipantName('');
    setNewParticipantRole('');
    setNewParticipantEmail('');
    setNewParticipantPhone('');
    setNewParticipantNotes('');
    setNewParticipantPermissions([]);
    setIsAddParticipantOpen(false);
  };

  const handleAddExistingContact = (contact: (typeof previousContacts)[0]) => {
    const exists = participants.some((p) => {
      return p.id === contact.id;
    });
    if (!exists) {
      setParticipants([
        ...participants,
        {
          ...contact,
          status: 'pending',
          dateAdded: new Date().toISOString().split('T')[0],
        },
      ]);
    }
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(
      participants.filter((p) => {
        return p.id !== id;
      }),
    );
  };

  const handleUpdateParticipantRole = (id: string, newRole: string) => {
    // Get permissions for the new role
    const rolePermissions =
      predefinedRoles.find((r) => {
        return r.name === newRole;
      })?.permissions || [];

    setParticipants(
      participants.map((p) => {
        return p.id === id
          ? {
              ...p,
              role: newRole.toUpperCase(),
              permissions: rolePermissions,
            }
          : p;
      }),
    );
  };

  const handleUpdateParticipantStatus = (
    id: string,
    newStatus: 'active' | 'pending' | 'inactive',
  ) => {
    setParticipants(
      participants.map((p) => {
        return p.id === id ? { ...p, status: newStatus } : p;
      }),
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileSubmit = () => {
    if (selectedFile) {
      // Here you would typically upload the file to your backend
      console.log('Uploading file:', selectedFile.name);
      // Reset and close dialog
      setSelectedFile(null);
      setIsNewFileDialogOpen(false);
    }
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => {
      return setLinkCopied(false);
    }, 2000);
  };

  const handleViewParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsViewParticipantOpen(true);
  };

  const handleAddNewRole = () => {
    if (newRoleName.trim() === '') return;

    const newRole: Role = {
      id: `r${predefinedRoles.length + 1}`,
      name: newRoleName.toUpperCase(),
      permissions: newRolePermissions,
      color: newRoleColor,
    };

    setPredefinedRoles([...predefinedRoles, newRole]);
    setNewRoleName('');
    setNewRolePermissions([]);
    setIsEditingRole(false);
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

                {/* Add Participant Button */}
                <Dialog open={isAddParticipantOpen} onOpenChange={setIsAddParticipantOpen}>
                  <DialogTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <Plus className='h-3 w-3 sm:h-4 sm:w-4' />
                      <span className='text-xs hidden xs:inline'>ADD PARTICIPANT</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>Manage Project Participants</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue='invite'>
                      <TabsList className='grid w-full grid-cols-3'>
                        <TabsTrigger value='invite'>Invite New</TabsTrigger>
                        <TabsTrigger value='existing'>From Contacts</TabsTrigger>
                        <TabsTrigger value='link'>Share Link</TabsTrigger>
                      </TabsList>

                      <TabsContent value='invite' className='space-y-4 py-2'>
                        <div className='space-y-2'>
                          <Label htmlFor='name'>Name</Label>
                          <Input
                            id='name'
                            value={newParticipantName}
                            onChange={(e) => {
                              return setNewParticipantName(e.target.value);
                            }}
                            placeholder='Enter participant name'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='email'>Email</Label>
                          <Input
                            id='email'
                            type='email'
                            value={newParticipantEmail}
                            onChange={(e) => {
                              return setNewParticipantEmail(e.target.value);
                            }}
                            placeholder='Enter email address'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='phone'>Phone (optional)</Label>
                          <Input
                            id='phone'
                            type='tel'
                            value={newParticipantPhone}
                            onChange={(e) => {
                              return setNewParticipantPhone(e.target.value);
                            }}
                            placeholder='Enter phone number'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='role'>Role</Label>
                          <div className='flex gap-2'>
                            <Select
                              value={newParticipantRole}
                              onValueChange={setNewParticipantRole}
                            >
                              <SelectTrigger className='flex-1'>
                                <SelectValue placeholder='Select a role' />
                              </SelectTrigger>
                              <SelectContent>
                                {predefinedRoles.map((role) => {
                                  return (
                                    <SelectItem key={role.id} value={role.name}>
                                      {role.name}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <Button
                              type='button'
                              variant='outline'
                              size='icon'
                              onClick={() => {
                                return setIsEditingRole(!isEditingRole);
                              }}
                            >
                              <PlusCircle className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>

                        {isEditingRole && (
                          <div className='space-y-4 p-3 border rounded-md bg-gray-50'>
                            <h4 className='font-medium'>Create New Role</h4>
                            <div className='space-y-2'>
                              <Label htmlFor='roleName'>Role Name</Label>
                              <Input
                                id='roleName'
                                value={newRoleName}
                                onChange={(e) => {
                                  return setNewRoleName(e.target.value);
                                }}
                                placeholder='e.g., Videographer'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label>Permissions</Label>
                              <div className='grid grid-cols-2 gap-2'>
                                {[
                                  'view',
                                  'edit',
                                  'upload',
                                  'download',
                                  'share',
                                  'delete',
                                  'comment',
                                ].map((perm) => {
                                  return (
                                    <div key={perm} className='flex items-center space-x-2'>
                                      <Checkbox
                                        id={`perm-${perm}`}
                                        checked={newRolePermissions.includes(perm)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setNewRolePermissions([...newRolePermissions, perm]);
                                          } else {
                                            setNewRolePermissions(
                                              newRolePermissions.filter((p) => {
                                                return p !== perm;
                                              }),
                                            );
                                          }
                                        }}
                                      />
                                      <Label
                                        htmlFor={`perm-${perm}`}
                                        className='text-sm capitalize'
                                      >
                                        {perm}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <Button onClick={handleAddNewRole} className='w-full'>
                              Add Role
                            </Button>
                          </div>
                        )}

                        <div className='space-y-2'>
                          <Label>Custom Permissions (Optional)</Label>
                          <div className='grid grid-cols-2 gap-2'>
                            {[
                              'view',
                              'edit',
                              'upload',
                              'download',
                              'share',
                              'delete',
                              'comment',
                            ].map((perm) => {
                              return (
                                <div key={perm} className='flex items-center space-x-2'>
                                  <Checkbox
                                    id={`participant-perm-${perm}`}
                                    checked={newParticipantPermissions.includes(perm)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewParticipantPermissions([
                                          ...newParticipantPermissions,
                                          perm,
                                        ]);
                                      } else {
                                        setNewParticipantPermissions(
                                          newParticipantPermissions.filter((p) => {
                                            return p !== perm;
                                          }),
                                        );
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`participant-perm-${perm}`}
                                    className='text-sm capitalize'
                                  >
                                    {perm}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='notes'>Notes (Optional)</Label>
                          <Textarea
                            id='notes'
                            value={newParticipantNotes}
                            onChange={(e) => {
                              return setNewParticipantNotes(e.target.value);
                            }}
                            placeholder='Add any notes about this participant'
                            rows={3}
                          />
                        </div>

                        <div className='flex gap-2'>
                          <Button onClick={handleAddParticipant} className='flex-1'>
                            Add Participant
                          </Button>
                          <Button variant='outline' className='flex gap-1'>
                            <Mail className='h-4 w-4' />
                            <span>Send Invite</span>
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value='existing' className='space-y-4 py-2'>
                        <div className='relative'>
                          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                          <Input
                            placeholder='Search contacts...'
                            className='pl-8'
                            value={searchTerm}
                            onChange={(e) => {
                              return setSearchTerm(e.target.value);
                            }}
                          />
                        </div>

                        <div className='max-h-60 overflow-y-auto space-y-2'>
                          {filteredContacts.length > 0 ? (
                            filteredContacts.map((contact) => {
                              return (
                                <div
                                  key={contact.id}
                                  className='flex items-center justify-between p-2 hover:bg-gray-50 rounded'
                                >
                                  <div className='flex items-center gap-2'>
                                    <Avatar className='h-24 w-24'>
                                      <AvatarFallback>{contact.initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className='text-sm font-medium capitalize'>
                                        {contact.name}
                                      </p>
                                      <div className='flex items-center gap-2'>
                                        <p className='text-xs text-muted-foreground'>
                                          {contact.email}
                                        </p>
                                        {getRoleBadge(contact.role)}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size='sm'
                                    variant='ghost'
                                    onClick={() => {
                                      return handleAddExistingContact(contact);
                                    }}
                                    className='h-8 w-8 p-0'
                                  >
                                    <UserPlus className='h-4 w-4' />
                                  </Button>
                                </div>
                              );
                            })
                          ) : (
                            <p className='text-center text-sm text-muted-foreground py-4'>
                              No contacts found
                            </p>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value='link' className='space-y-4 py-2'>
                        <div className='space-y-2'>
                          <Label>Project Invite Link</Label>
                          <div className='flex gap-2'>
                            <div className='flex-1 p-2 bg-gray-50 rounded border text-sm overflow-hidden text-ellipsis whitespace-nowrap'>
                              {inviteLink}
                            </div>
                            <Button
                              variant='outline'
                              size='icon'
                              onClick={handleCopyInviteLink}
                              className='relative'
                            >
                              {linkCopied ? (
                                <CheckCircle2 className='h-4 w-4' />
                              ) : (
                                <Copy className='h-4 w-4' />
                              )}
                            </Button>
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            Share this link with people you want to invite to the project
                          </p>
                        </div>
                        <Button className='w-full flex gap-1'>
                          <Send className='h-4 w-4' />
                          <span>Send Invite Link</span>
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
