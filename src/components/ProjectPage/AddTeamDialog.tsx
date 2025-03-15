import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mail, Search, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

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
  companyName?: string;
  companyType?: string;
  companyWebsite?: string;
  mailingAddress?: string;
}

interface AddTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: string;
  onAddParticipant: (participant: Participant) => void;
}

export default function AddTeamDialog({
  isOpen,
  onOpenChange,
  selectedRole,
  onAddParticipant,
}: AddTeamDialogProps) {
  const [activeTab, setActiveTab] = useState('collaborator');
  const queryClient = useQueryClient();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MODERATOR');

  // Collaborator fields
  const [collaboratorName, setCollaboratorName] = useState('');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState(selectedRole || '');
  const [collaboratorPhone, setCollaboratorPhone] = useState('');
  const [collaboratorAddress, setCollaboratorAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Team fields
  const [teamRole, setTeamRole] = useState(selectedRole || 'MODERATOR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  const { project } = useProject();

  const predefinedRoles = [
    {
      id: '1',
      name: 'Admin',
      permissions: ['admin'],
    },
    {
      id: '2',
      name: 'Moderator',
      permissions: ['moderator'],
    },
  ];

  // Fetch workspace team members
  const { data: workspaceMembersResponse, isLoading } = useQuery({
    queryKey: ['workspaceMembers'],
    queryFn: async () => {
      const response = await newRequest.get('/workspaces/members');
      return response.data;
    },
  });

  const workspaceMembers = workspaceMembersResponse?.data || [];

  const filteredMembers = workspaceMembers?.filter((member) => {
    const memberName = member.user?.name || '';
    const memberEmail = member.user?.email || '';
    const memberRole = member.role || '';

    return (
      memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memberRole.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const addCollaboratorMutation = useMutation({
    mutationFn: (newCollaborator: Participant) => {
      return newRequest.post(`/projects/${project._id}/collaborator`, newCollaborator);
    },
    onSuccess: (response) => {
      // Get the newly added collaborator from the response
      const newCollaborator =
        response.data.data.collaborators[response.data.data.collaborators.length - 1];
      // Call the onAddParticipant with the last added collaborator
      onAddParticipant(newCollaborator);
      resetCollaboratorForm();
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['participants'] });
      queryClient.invalidateQueries({ queryKey: ['collaborators', project._id] });
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
    },
    onError: (error) => {
      console.error('Failed to add collaborator:', error);
      // You could add error handling/notification here
    },
  });

  const addTeamMutation = useMutation({
    mutationFn: (teamMembers: Participant[]) => {
      return newRequest.post(`/projects/${project._id}/team`, { members: teamMembers });
    },
    onSuccess: (response) => {
      toast.success('Team members added successfully');
      resetTeamForm();
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    },
    onError: (error) => {
      console.error('Failed to add team members:', error);
      toast.error('Failed to add team members');
    },
  });

  const inviteToWorkspaceMutation = useMutation({
    mutationFn: (inviteData: { email: string; role: string }) => {
      return newRequest.post('/workspaces/invite', inviteData);
    },
    onSuccess: () => {
      setInviteEmail('');
      setInviteRole('MODERATOR');
      setInviteModalOpen(false);
      // Optionally show success notification
      toast.success('Invitation sent successfully');

      queryClient.invalidateQueries({ queryKey: ['workspaceMembers'] });
    },
    onError: (error) => {
      console.error('Failed to send invitation:', error);
      // You could add error handling/notification here
    },
  });

  const handleAddCollaborator = () => {
    if (
      collaboratorName.trim() === '' ||
      collaboratorRole.trim() === '' ||
      collaboratorEmail.trim() === ''
    )
      return;

    const rolePermissions =
      predefinedRoles.find((r) => {
        return r.name === collaboratorRole.toUpperCase();
      })?.permissions || [];

    const newCollaborator: Participant = {
      id: Date.now().toString(),
      name: collaboratorName,
      role: collaboratorRole.toUpperCase(),
      email: collaboratorEmail,
      phone: collaboratorPhone,
      mailingAddress: collaboratorAddress,
      companyName,
      companyType,
      companyWebsite,
      status: 'pending',
      permissions: rolePermissions,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    // Use the mutation to add the collaborator
    addCollaboratorMutation.mutate(newCollaborator);
  };

  const handleAddTeam = () => {
    if (selectedTeamMembers.length === 0) return;

    // Create an array of team members to add
    const teamMembersToAdd = selectedTeamMembers
      .map((memberId) => {
        const member = workspaceMembers.find((m) => {
          return m._id === memberId;
        });
        if (!member) return null;

        const rolePermissions =
          predefinedRoles.find((r) => {
            return r.name === teamRole.toUpperCase();
          })?.permissions || [];

        return {
          id: member.user._id,
          name: member.user?.name || member?.email?.split('@')[0],
          role: teamRole.toUpperCase(),
          email: member.user?.email,
          status: 'pending',
          permissions: rolePermissions,
          dateAdded: new Date().toISOString().split('T')[0],
        };
      })
      .filter(Boolean) as Participant[];

    // Use the mutation to add team members
    addTeamMutation.mutate(teamMembersToAdd);

    // Also update the UI through the callback
    teamMembersToAdd.forEach((member) => {
      onAddParticipant(member);
    });
  };

  const handleInviteToWorkspace = () => {
    if (!inviteEmail.trim()) return;

    // Use the mutation to send the invitation
    inviteToWorkspaceMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => {
        return part[0];
      })
      .join('')
      .toUpperCase();
  };

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers((prev) => {
      return prev.includes(memberId)
        ? prev.filter((id) => {
            return id !== memberId;
          })
        : [...prev, memberId];
    });
  };

  const resetCollaboratorForm = () => {
    setCollaboratorName('');
    setCollaboratorEmail('');
    setCollaboratorRole(selectedRole || '');
    setCollaboratorPhone('');
    setCollaboratorAddress('');
    setCompanyName('');
    setCompanyType('');
    setCompanyWebsite('');
    onOpenChange(false);
  };

  const resetTeamForm = () => {
    setTeamRole(selectedRole || 'MODERATOR');
    setSelectedTeamMembers([]);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add Project Member</DialogTitle>
          <DialogDescription>Add a new collaborator or team to the project.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='collaborator' value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-2 mb-4'>
            <TabsTrigger value='collaborator'>Collaborator</TabsTrigger>
            <TabsTrigger value='team'>Team</TabsTrigger>
          </TabsList>

          <TabsContent value='collaborator' className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='collaborator-email'>Email Address *</Label>
              <Input
                id='collaborator-email'
                type='email'
                value={collaboratorEmail}
                onChange={(e) => {
                  return setCollaboratorEmail(e.target.value);
                }}
                placeholder='Enter email address'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='collaborator-name'>Full Name *</Label>
              <Input
                id='collaborator-name'
                value={collaboratorName}
                onChange={(e) => {
                  return setCollaboratorName(e.target.value);
                }}
                placeholder='Enter full name'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='collaborator-role'>Role *</Label>
              <Select
                value={collaboratorRole}
                onValueChange={setCollaboratorRole}
                defaultValue='MODERATOR'
              >
                <SelectTrigger className='h-7 w-full text-xs min-w-[150px]'>
                  <SelectValue placeholder='Select a role' />
                </SelectTrigger>
                <SelectContent className='w-full'>
                  <SelectItem value='ADMIN'>Admin</SelectItem>
                  <SelectItem value='MODERATOR'>Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Company Details</Label>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <Label htmlFor='company-type' className='text-xs'>
                    Company Type
                  </Label>
                  <Select value={companyType} onValueChange={setCompanyType}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Graphic Design'>Graphic Design</SelectItem>
                      <SelectItem value='Web Design'>Web Design</SelectItem>
                      <SelectItem value='Copywriting'>Copywriting</SelectItem>
                      <SelectItem value='UI/UX Design'>UI/UX Design</SelectItem>
                      <SelectItem value='Photography'>Photography</SelectItem>
                      <SelectItem value='Video Production'>Video Production</SelectItem>
                      <SelectItem value='Marketing'>Marketing</SelectItem>
                      <SelectItem value='Other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='company-name' className='text-xs'>
                    Company Name
                  </Label>
                  <Input
                    id='company-name'
                    value={companyName}
                    onChange={(e) => {
                      return setCompanyName(e.target.value);
                    }}
                    placeholder='Company name'
                  />
                </div>
              </div>
              <div>
                <Label htmlFor='company-website' className='text-xs'>
                  Company Website URL
                </Label>
                <Input
                  id='company-website'
                  value={companyWebsite}
                  onChange={(e) => {
                    return setCompanyWebsite(e.target.value);
                  }}
                  placeholder='https://example.com'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='collaborator-phone'>Phone</Label>
              <Input
                id='collaborator-phone'
                value={collaboratorPhone}
                onChange={(e) => {
                  return setCollaboratorPhone(e.target.value);
                }}
                placeholder='Enter phone number'
              />
            </div>

            <Button
              className='w-full mt-4'
              onClick={handleAddCollaborator}
              disabled={
                !collaboratorName.trim() || !collaboratorRole.trim() || !collaboratorEmail.trim()
              }
            >
              <UserPlus className='mr-2 h-4 w-4' />
              Add Collaborator
            </Button>
          </TabsContent>

          <TabsContent value='team' className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search by name, email or role...'
                className='pl-9'
                value={searchQuery}
                onChange={(e) => {
                  return setSearchQuery(e.target.value);
                }}
              />
            </div>

            <div className='flex flex-col space-y-2'>
              <div className='flex justify-between items-center'>
                <Label className='text-sm font-medium'>Team Members</Label>
              </div>

              <div className='max-h-60 overflow-y-auto space-y-1 rounded-md scrollbar-hide'>
                <div className='mb-4'>
                  <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant='outline' size='default' className='w-full'>
                        <Mail className='mr-2 h-4 w-4' />
                        Invite User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle className='flex items-center'>
                          Invite to Workspace
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant='outline'
                                className='ml-2 h-5 w-5 rounded-full bg-muted p-0 text-xs cursor-help'
                              >
                                ?
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              This invitation grants access to your entire workspace, not only this
                              specific project
                            </TooltipContent>
                          </Tooltip>
                        </DialogTitle>
                        <DialogDescription>
                          Send an invitation to join your workspace.
                        </DialogDescription>
                      </DialogHeader>
                      <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='invite-email'>Email Address</Label>
                          <Input
                            id='invite-email'
                            type='email'
                            value={inviteEmail}
                            onChange={(e) => {
                              return setInviteEmail(e.target.value);
                            }}
                            placeholder='colleague@example.com'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='invite-role'>Role</Label>
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a role' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='ADMIN'>Admin</SelectItem>
                              <SelectItem value='MODERATOR'>Moderator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        className='w-full'
                        onClick={handleInviteToWorkspace}
                        disabled={!inviteEmail.trim()}
                      >
                        Send Invitation
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>

                {isLoading ? (
                  <p className='text-center py-4 text-sm text-gray-500'>Loading team members...</p>
                ) : filteredMembers && filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => {
                    const memberName = member.user?.name || 'Unknown';
                    const memberEmail = member.user?.email || '';
                    const memberRole = member.role || '';
                    const memberId = member._id;

                    return (
                      <div
                        key={memberId}
                        className={`flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedTeamMembers.includes(memberId) ? 'bg-gray-50' : ''
                        }`}
                        onClick={() => {
                          return toggleTeamMember(memberId);
                        }}
                      >
                        <Checkbox
                          id={`member-${memberId}`}
                          checked={selectedTeamMembers.includes(memberId)}
                          className='mr-3'
                          onCheckedChange={() => {
                            return toggleTeamMember(memberId);
                          }}
                        />
                        <Avatar className='h-8 w-8 mr-3'>
                          <AvatarImage src={member.user?.avatar} alt={memberName} />
                          <AvatarFallback>{getInitials(memberName)}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium truncate'>{memberName}</p>
                          <p className='text-xs text-gray-500 truncate'>{memberEmail}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline'>{memberRole}</Badge>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className='text-center py-4 text-sm text-gray-500'>
                    {searchQuery ? 'No matching members found' : 'No team members found'}
                  </p>
                )}
              </div>
            </div>

            <Button
              className='w-full mt-4'
              onClick={handleAddTeam}
              disabled={!teamRole.trim() || selectedTeamMembers.length === 0}
            >
              <Users className='mr-2 h-4 w-4' />
              Add Selected Members ({selectedTeamMembers.length})
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
