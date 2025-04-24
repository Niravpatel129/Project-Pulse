'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Edit, ImageIcon, Mail, Settings, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Extend the Workspace interface
interface ExtendedWorkspace {
  name: string;
  slug: string;
  description?: string;
}

// Team member interface
interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const { workspace } = useWorkspace();
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('moderator');

  // Edit member state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState('');

  const { teamMembers, isLoading: isLoadingTeam } = useTeamMembers();

  // Initialize form with current workspace data
  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name);
      setWorkspaceSlug(workspace.slug);
      setWorkspaceDescription((workspace as ExtendedWorkspace).description || '');
    }
  }, [workspace]);

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: (data: { name?: string; slug?: string; description?: string }) => {
      return newRequest.put(`/workspaces/${params.workspace}`, data);
    },
    onSuccess: () => {
      toast.success('Workspace updated successfully');
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
    },
    onError: (error) => {
      console.error('Failed to update workspace:', error);
      toast.error('Failed to update workspace');
    },
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) => {
      return newRequest.post('/workspaces/invite', data);
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      setInviteEmail('');
      setInviteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
    onError: (error) => {
      console.error('Failed to send invitation:', error);
      toast.error('Failed to send invitation');
    },
  });

  // Remove team member mutation
  const removeTeamMemberMutation = useMutation({
    mutationFn: (memberId: string) => {
      return newRequest.delete(`/workspaces/members/${memberId}`);
    },
    onSuccess: () => {
      toast.success('Team member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
    onError: (error) => {
      console.error('Failed to remove team member:', error);
      toast.error('Failed to remove team member');
    },
  });

  // Update team member mutation
  const updateTeamMemberMutation = useMutation({
    mutationFn: (data: { memberId: string; role: string }) => {
      return newRequest.put(`/workspaces/members/${data.memberId}`, { role: data.role });
    },
    onSuccess: () => {
      toast.success('Team member updated successfully');
      setEditDialogOpen(false);
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
    onError: (error) => {
      console.error('Failed to update team member:', error);
      toast.error('Failed to update team member');
    },
  });

  const handleSaveBasicSettings = () => {
    updateWorkspaceMutation.mutate({
      name: workspaceName,
      slug: workspaceSlug,
      description: workspaceDescription,
    });
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;

    inviteUserMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
    });
  };

  const handleRemoveTeamMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      removeTeamMemberMutation.mutate(memberId);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setEditRole(member.role);
    setEditDialogOpen(true);
  };

  const handleUpdateMember = () => {
    if (!selectedMember || !editRole) return;

    updateTeamMemberMutation.mutate({
      memberId: selectedMember._id,
      role: editRole,
    });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${params.workspace}`);
    toast.success('Invite link copied to clipboard');
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className='container mx-auto py-8 px-4 max-w-6xl'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Workspace Settings</h1>
          <p className='text-muted-foreground mt-1'>Manage your workspace settings and team</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <TabsList className='bg-muted/50'>
            <TabsTrigger value='general' className='data-[state=active]:bg-white'>
              <Settings className='mr-2 h-4 w-4' />
              General
            </TabsTrigger>
            <TabsTrigger value='team' className='data-[state=active]:bg-white'>
              <Users className='mr-2 h-4 w-4' />
              Team
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Settings Tab */}
        <TabsContent value='general' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
              <CardDescription>
                Configure your workspace name, slug, and other details
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='workspaceName'>Workspace Name</Label>
                  <Input
                    id='workspaceName'
                    value={workspaceName}
                    onChange={(e) => {
                      return setWorkspaceName(e.target.value);
                    }}
                    placeholder='My Workspace'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='workspaceSlug'>Workspace Slug</Label>
                  <Input
                    id='workspaceSlug'
                    value={workspaceSlug}
                    onChange={(e) => {
                      return setWorkspaceSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    placeholder='my-workspace'
                    className='lowercase'
                  />
                  <p className='text-sm text-muted-foreground'>
                    This will be used in your workspace URL: {window.location.origin}/
                    {workspaceSlug || 'workspace-slug'}
                  </p>
                </div>
                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='workspaceDescription'>Description</Label>
                  <Textarea
                    id='workspaceDescription'
                    value={workspaceDescription}
                    onChange={(e) => {
                      return setWorkspaceDescription(e.target.value);
                    }}
                    placeholder="Describe your workspace's purpose"
                    className='min-h-[100px]'
                  />
                </div>
              </div>

              <Separator className='my-6' />

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Workspace Logo</h3>
                    <p className='text-sm text-muted-foreground'>
                      Upload a logo for your workspace
                    </p>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Avatar className='h-16 w-16'>
                      <AvatarImage src='/placeholder-logo.png' alt='Workspace Logo' />
                      <AvatarFallback className='bg-primary/10'>
                        <ImageIcon className='h-8 w-8 text-primary' />
                      </AvatarFallback>
                    </Avatar>
                    <Button variant='outline' size='sm'>
                      Upload
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className='my-6' />

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Workspace Visibility</h3>
                    <p className='text-sm text-muted-foreground'>
                      Control who can discover your workspace
                    </p>
                  </div>
                  <Switch id='visibility' defaultChecked />
                </div>
              </div>
            </CardContent>
            <div className='flex items-center justify-end p-6 pt-0'>
              <Button
                onClick={handleSaveBasicSettings}
                disabled={updateWorkspaceMutation.isPending}
              >
                {updateWorkspaceMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value='team' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your workspace team members and their roles
                  </CardDescription>
                </div>
                <div className='flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0'>
                  <Button variant='outline' onClick={copyInviteLink}>
                    <Copy className='mr-2 h-4 w-4' />
                    Copy Invite Link
                  </Button>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
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
                              This invitation grants access to your entire workspace
                            </TooltipContent>
                          </Tooltip>
                        </DialogTitle>
                        <DialogDescription>
                          Send an invitation to join your workspace
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
                              <SelectItem value='admin'>Admin</SelectItem>
                              <SelectItem value='moderator'>Moderator</SelectItem>
                              <SelectItem value='member'>Member</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        className='w-full'
                        onClick={handleInviteUser}
                        disabled={!inviteEmail.trim() || inviteUserMutation.isPending}
                      >
                        {inviteUserMutation.isPending ? 'Sending...' : 'Send Invitation'}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {isLoadingTeam ? (
                  <div className='text-center py-6'>Loading team members...</div>
                ) : teamMembers.length === 0 ? (
                  <div className='text-center py-6 text-muted-foreground'>
                    No team members yet. Invite someone to get started!
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {teamMembers.map((member) => {
                      return (
                        <div
                          key={member._id}
                          className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/10 transition-colors'
                        >
                          <div className='flex items-center gap-4'>
                            <Avatar>
                              <AvatarImage src={`https://avatar.vercel.sh/${member.email}`} />
                              <AvatarFallback>
                                {getInitials(member.name || member.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className='font-medium'>{member.name || member.email}</p>
                              <p className='text-sm text-muted-foreground'>{member.email}</p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge className={`${getRoleColor(member.role)} capitalize`}>
                              {member.role}
                            </Badge>
                            <div className='flex items-center'>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => {
                                  return handleEditMember(member);
                                }}
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => {
                                  return handleRemoveTeamMember(member._id);
                                }}
                                disabled={removeTeamMemberMutation.isPending}
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  width='16'
                                  height='16'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='text-destructive'
                                >
                                  <path d='M3 6h18'></path>
                                  <path d='M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6'></path>
                                  <path d='M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2'></path>
                                </svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Edit Team Member</DialogTitle>
                <DialogDescription>
                  Update role and permissions for {selectedMember?.name || selectedMember?.email}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='flex items-center gap-4 mb-4'>
                  <Avatar>
                    <AvatarImage
                      src={selectedMember ? `https://avatar.vercel.sh/${selectedMember.email}` : ''}
                      alt={selectedMember?.name || 'Team member'}
                    />
                    <AvatarFallback>
                      {selectedMember?.name
                        ? getInitials(selectedMember.name)
                        : selectedMember?.email
                        ? getInitials(selectedMember.email.split('@')[0])
                        : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='font-medium'>{selectedMember?.name || selectedMember?.email}</p>
                    <p className='text-sm text-muted-foreground'>{selectedMember?.email}</p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='edit-role'>Role</Label>
                  <Select value={editRole} onValueChange={setEditRole}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='admin'>Admin</SelectItem>
                      <SelectItem value='moderator'>Moderator</SelectItem>
                      <SelectItem value='member'>Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-muted-foreground mt-2'>
                    {editRole === 'admin' && 'Full access to all settings and resources'}
                    {editRole === 'moderator' &&
                      'Can manage projects, but has limited access to workspace settings'}
                    {editRole === 'member' && 'Can view and edit assigned projects only'}
                  </p>
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => {
                    return setEditDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateMember}
                  disabled={
                    !editRole ||
                    editRole === selectedMember?.role ||
                    updateTeamMemberMutation.isPending
                  }
                >
                  {updateTeamMemberMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Manage your pending workspace invitations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-6 text-muted-foreground'>No pending invitations</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
