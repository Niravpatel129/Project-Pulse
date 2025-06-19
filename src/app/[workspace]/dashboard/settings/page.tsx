'use client';

import { PaymentIntegrations } from '@/components/settings/PaymentIntegrations';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AtSign, Edit, ImageIcon, Loader2, Mail, Settings, Users, XCircle } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Extend the Workspace interface
interface ExtendedWorkspace {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
}

// Team member interface
interface TeamMember {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    needsPasswordChange: boolean;
  };
  role: string;
  _id: string;
}

// Add new interface for email integration
interface EmailIntegration {
  id: string;
  type: 'gmail' | 'custom';
  email: string;
  status: 'connected' | 'pending' | 'failed';
  provider?: string;
  dnsRecords?: {
    type: string;
    name: string;
    value: string;
  }[];
}

interface GmailStatus {
  connected: boolean;
  message: string;
  primaryEmail: string | null;
  integrations: Array<{
    email: string;
    isPrimary: boolean;
    isActive: boolean;
    lastSynced: string;
    isExpired: boolean;
    connectedAt: string;
  }>;
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [workspaceLogo, setWorkspaceLogo] = useState<string | null>(null);
  const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('moderator');
  const [origin, setOrigin] = useState('');

  // Edit member state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState('');

  const { teamMembers, isLoading: isLoadingTeam, invitations } = useTeamMembers();
  const { workspace, connectStripe, disconnectStripe } = useWorkspace();

  // Add Stripe account status query
  const { data: stripeStatus } = useQuery({
    queryKey: ['stripe-account-status'],
    queryFn: async () => {
      // pass refreshUrl and redirectUrl
      const response = await newRequest.get('/stripe/connect/account-status');

      return response.data.data;
    },
  });

  // Filter out members who have pending invitations
  const activeTeamMembers = teamMembers.filter((member) => {
    // If there are no invitations or if the member is an owner, always show them
    if (!invitations || invitations.length === 0 || member.role === 'owner') return true;

    // Check if a member's email exists in the pending invitations
    const isPending = invitations.some((invitation) => {
      return invitation.email === member.user.email;
    });
    return !isPending;
  });

  const { data: workspaceData } = useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const response = await newRequest.get(`/workspaces/current-workspace`);
      return response.data;
    },
    enabled: !!params.workspace,
  });
  console.log('🚀 workspaceData:', workspaceData);

  // Initialize form with current workspace data
  useEffect(() => {
    if (workspaceData && workspaceData.data) {
      setWorkspaceName(workspaceData.data.name);
      setWorkspaceSlug(workspaceData.data.slug);
      setWorkspaceDescription((workspaceData.data as ExtendedWorkspace).description || '');
      setWorkspaceLogo((workspaceData.data as ExtendedWorkspace).logo || null);
      setTempLogoUrl(null); // Reset temp logo when workspace data changes
      setLogoFile(null); // Reset logo file when workspace data changes

      // Invalidate Gmail status when workspace data changes
      queryClient.invalidateQueries({ queryKey: ['gmail-status'] });
    }
    console.log('🚀 workspace:', workspaceData);
  }, [workspaceData, queryClient]);

  // Set origin in client-side only
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Cleanup object URLs when component unmounts or when they change
  useEffect(() => {
    return () => {
      if (tempLogoUrl && tempLogoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(tempLogoUrl);
      }
    };
  }, [tempLogoUrl]);

  // Update workspace mutation with logo upload
  const updateWorkspaceMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      slug?: string;
      description?: string;
      logoFile?: File | null;
      removeLogo?: boolean;
    }) => {
      const { logoFile, removeLogo, ...restData } = data;

      // Create form data for the request
      const formData = new FormData();

      // Add all regular fields
      Object.entries(restData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value as string);
        }
      });

      // Add logo if it exists
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      // Add logo removal flag if needed
      if (removeLogo) {
        formData.append('removeLogo', 'true');
      }

      // Single API call to update the workspace with all changes
      return newRequest.put(`/workspaces/${params.workspace}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  });

  // Invite user mutation
  const inviteUserMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) => {
      return newRequest.post(`/workspaces/invite`, data);
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

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: (token: string) => {
      return newRequest.delete(`/workspaces/invite/${token}`);
    },
    onSuccess: () => {
      toast.success('Invitation revoked successfully');
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
    },
    onError: (error) => {
      console.error('Failed to revoke invitation:', error);
      toast.error('Failed to revoke invitation');
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

  const [emailIntegrations, setEmailIntegrations] = useState<EmailIntegration[]>([]);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<'gmail' | 'custom'>(
    'gmail',
  );
  const [newEmail, setNewEmail] = useState('');

  // Add polling function
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastAuthAttempt, setLastAuthAttempt] = useState<number | null>(null);

  // Add polling function
  const startPollingGmailStatus = () => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Start new polling
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['gmail-status'] });
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);

    // Stop polling after 30 seconds (15 attempts)
    setTimeout(() => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }, 30000);
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch Gmail status with polling logic
  const { data: gmailStatus } = useQuery<GmailStatus>({
    queryKey: ['gmail-status'],
    queryFn: async () => {
      const response = await newRequest.get('/gmail/status');
      return response.data;
    },
  });

  // Effect to handle Gmail status updates
  useEffect(() => {
    if (gmailStatus && lastAuthAttempt) {
      // If we have a recent auth attempt and the status shows connected,
      // we can stop polling
      if (gmailStatus.connected) {
        const timeSinceAuth = Date.now() - lastAuthAttempt;
        if (timeSinceAuth < 30000) {
          // Within 30 seconds
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }
    }
  }, [gmailStatus, lastAuthAttempt, pollingInterval]);

  // Effect to check for recent auth attempts when page loads
  useEffect(() => {
    const checkRecentAuth = async () => {
      try {
        const response = await newRequest.get('/gmail/status');
        const data = response.data as GmailStatus;

        // If we have integrations but they're not connected yet,
        // this might indicate a recent auth attempt
        if (data.integrations?.length > 0 && !data.connected) {
          setLastAuthAttempt(Date.now());
          startPollingGmailStatus();
        }
      } catch (error) {
        console.error('Failed to check Gmail status:', error);
      }
    };

    checkRecentAuth();

    // Add visibility change event listener
    const handleVisibilityChange = () => {
      console.log('visibility change', document.visibilityState);
      if (document.visibilityState === 'visible') {
        console.log('window became visible');
        queryClient.invalidateQueries({ queryKey: ['gmail-status'] });
      }
    };

    console.log('Setting up visibility change listener');
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      console.log('Cleaning up visibility change listener');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [queryClient]);

  // Update the GMAIL_AUTH_SUCCESS handler in both places
  const handleGmailAuthSuccess = () => {
    setLastAuthAttempt(Date.now());
    queryClient.invalidateQueries({ queryKey: ['gmail-status'] });
    queryClient.invalidateQueries({ queryKey: ['email-integrations'] });
    startPollingGmailStatus();
    setIsAddingEmail(false);
    setIsConnectingGmail(false);
    toast.success('Gmail account connected successfully');
  };

  // Fetch email integrations
  const { data: emailIntegrationsData } = useQuery<EmailIntegration[]>({
    queryKey: ['email-integrations'],
    queryFn: async () => {
      const response = await newRequest.get(`/workspaces/email-integrations`);
      return response.data;
    },
  });

  useEffect(() => {
    if (emailIntegrationsData) {
      setEmailIntegrations(emailIntegrationsData);
    }
  }, [emailIntegrationsData]);

  // Add custom email mutation
  const addCustomEmailMutation = useMutation({
    mutationFn: (email: string) => {
      return newRequest.post(`/workspaces/email-integrations/custom`, { email });
    },
    onSuccess: (response) => {
      setEmailIntegrations([...emailIntegrations, response.data]);
      setNewEmail('');
      setIsAddingEmail(false);
      toast.success('Custom email added successfully');
    },
    onError: (error) => {
      console.error('Failed to add custom email:', error);
      toast.error('Failed to add custom email');
    },
  });

  // Remove email integration mutation
  const removeEmailIntegrationMutation = useMutation({
    mutationFn: (id: string) => {
      return newRequest.delete(`/workspaces/email-integrations/${id}`);
    },
    onSuccess: (_, id) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['email-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['gmail-status'] });

      // Update local state as well for immediate feedback
      setEmailIntegrations(
        emailIntegrations.filter((e) => {
          return e.id !== id;
        }),
      );
      toast.success('Email integration removed successfully');
    },
    onError: (error) => {
      console.error('Failed to remove email integration:', error);
      toast.error('Failed to remove email integration');
    },
  });

  const handleSaveBasicSettings = () => {
    // Prepare update data with all form fields
    const updateData: any = {
      name: workspaceName,
      slug: workspaceSlug,
      description: workspaceDescription,
    };

    // Include logo if changed
    if (logoFile) {
      updateData.logoFile = logoFile;
    } else if (tempLogoUrl === '') {
      // Empty string indicates logo removal
      updateData.removeLogo = true;
    }

    // Set uploading state if we're including a logo
    if (logoFile) {
      setIsUploadingLogo(true);
    }

    updateWorkspaceMutation.mutate(updateData, {
      onSuccess: () => {
        toast.success('Workspace updated successfully');
        queryClient.invalidateQueries({ queryKey: ['workspace'] });

        // Clean up
        if (tempLogoUrl && tempLogoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(tempLogoUrl);
        }
        setTempLogoUrl(null);
        setLogoFile(null);
        setIsUploadingLogo(false);
      },
      onError: (error) => {
        console.error('Failed to update workspace:', error);
        toast.error('Failed to update workspace');
        setIsUploadingLogo(false);
      },
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

  const handleRevokeInvitation = (token: string) => {
    if (confirm('Are you sure you want to revoke this invitation?')) {
      revokeInvitationMutation.mutate(token);
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
      memberId: selectedMember.user._id,
      role: editRole,
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'moderator':
        return 'bg-green-100 text-green-800';
      case 'client':
        return 'bg-yellow-100 text-yellow-800';
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

  const handleLogoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)|image\/(svg|svg+xml)/i)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // If there was a previous blob URL, revoke it to prevent memory leaks
    if (tempLogoUrl && tempLogoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(tempLogoUrl);
    }

    // Create a local preview URL
    const previewUrl = URL.createObjectURL(file);
    setTempLogoUrl(previewUrl);
    setLogoFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelLogoChange = () => {
    // Revoke URL if it's a blob URL to prevent memory leaks
    if (tempLogoUrl && tempLogoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(tempLogoUrl);
    }
    setTempLogoUrl(null);
    setLogoFile(null);
  };

  // Initialize activeTab from URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      // Map payment-integrations to integrations for backward compatibility
      const mappedTab = tabParam === 'payment-integrations' ? 'integrations' : tabParam;
      // Only set if it's a valid tab
      const validTabs = ['general', 'team', 'email', 'integrations'];
      if (validTabs.includes(mappedTab)) {
        setActiveTab(mappedTab);
      }
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const currentPath = window.location.pathname;
    const newUrl = `${currentPath}?tab=${newTab}`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className='bg-background dark:bg-[#141414] pb-10 w-full'>
      <div className='container mx-auto py-8 px-4 max-w-6xl '>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-[#3F3F46] dark:text-white'>
              Workspace Settings
            </h1>
            <p className='text-[#3F3F46]/60 dark:text-[#8b8b8b] mt-1'>
              Manage your workspace settings and team
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className='space-y-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <TabsList className='bg-muted/50 dark:bg-[#232323]/50'>
              <TabsTrigger
                value='general'
                className='data-[state=active]:bg-black data-[state=active]:text-white'
              >
                <Settings className='mr-2 h-4 w-4' />
                General
              </TabsTrigger>
              <TabsTrigger
                value='team'
                className='data-[state=active]:bg-black data-[state=active]:text-white'
              >
                <Users className='mr-2 h-4 w-4' />
                Team
              </TabsTrigger>
              <TabsTrigger
                value='email'
                className='data-[state=active]:bg-black data-[state=active]:text-white'
              >
                <Mail className='mr-2 h-4 w-4' />
                Email
              </TabsTrigger>
              <TabsTrigger
                value='integrations'
                className='data-[state=active]:bg-black data-[state=active]:text-white'
              >
                <ImageIcon className='mr-2 h-4 w-4' />
                Integrations
              </TabsTrigger>
            </TabsList>
          </div>

          {/* General Settings Tab */}
          <TabsContent value='general' className='space-y-6'>
            <Card className='bg-white dark:bg-[#181818] border-[#E4E4E7] dark:border-[#232428]'>
              <CardHeader>
                <CardTitle className='text-[#3F3F46] dark:text-white'>Basic Settings</CardTitle>
                <CardDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                  Configure your workspace name, slug, and other details
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='workspaceName' className='text-[#3F3F46] dark:text-white'>
                      Workspace Name
                    </Label>
                    <Input
                      disabled={true}
                      id='workspaceName'
                      value={workspaceName}
                      onChange={(e) => {
                        return setWorkspaceName(e.target.value);
                      }}
                      placeholder='My Workspace'
                      className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='workspaceSlug' className='text-[#3F3F46] dark:text-white'>
                      Workspace Slug
                    </Label>
                    <Input
                      disabled={true}
                      id='workspaceSlug'
                      value={workspaceSlug}
                      onChange={(e) => {
                        return setWorkspaceSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                      }}
                      placeholder='my-workspace'
                      className='lowercase bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white'
                    />
                    <div className='text-sm text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                      This will be used in your workspace URL:
                      <div className=''>{`${
                        workspaceSlug ? workspaceSlug.toLowerCase() : ''
                      }.${'hourblock.com'}`}</div>
                    </div>
                  </div>
                </div>

                <Separator className='my-6 bg-[#E4E4E7] dark:bg-[#232428]' />

                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h3 className='font-medium text-[#3F3F46] dark:text-white'>Workspace Logo</h3>
                      <p className='text-sm text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                        Upload a logo for your workspace
                      </p>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Avatar className='h-16 w-16'>
                        {tempLogoUrl && tempLogoUrl !== '' ? (
                          <AvatarImage src={tempLogoUrl} alt='Workspace Logo (pending)' />
                        ) : workspaceLogo ? (
                          <AvatarImage src={workspaceLogo} alt='Workspace Logo' />
                        ) : (
                          <AvatarFallback className='bg-primary/10 text-primary'>
                            <ImageIcon className='h-8 w-8' />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <input
                          type='file'
                          ref={fileInputRef}
                          accept='image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
                          onChange={handleFileChange}
                          className='hidden'
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={handleLogoUpload}
                          disabled={updateWorkspaceMutation.isPending || isUploadingLogo}
                          className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#252525]'
                        >
                          {isUploadingLogo ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className='my-6' />
              </CardContent>
              <div className='flex items-center justify-end p-6 pt-0'>
                <Button
                  onClick={handleSaveBasicSettings}
                  disabled={updateWorkspaceMutation.isPending}
                  className='bg-black hover:bg-black/90 text-white'
                >
                  {updateWorkspaceMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value='team' className='space-y-6'>
            <Card className='bg-white dark:bg-[#181818] border-[#E4E4E7] dark:border-[#232428]'>
              <CardHeader>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                  <div>
                    <CardTitle className='text-[#3F3F46] dark:text-white'>Team Members</CardTitle>
                    <CardDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                      Manage your workspace team members and their roles
                    </CardDescription>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0'>
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className='bg-black hover:bg-black/90 text-white'>
                          <Mail className='mr-2 h-4 w-4' />
                          Invite User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-md bg-white dark:bg-[#181818] text-[#3F3F46] dark:text-white border-[#E4E4E7] dark:border-[#232428]'>
                        <DialogHeader>
                          <DialogTitle className='flex items-center text-[#3F3F46] dark:text-white'>
                            Invite to Workspace
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant='outline'
                                  className='ml-2 h-5 w-5 rounded-full bg-muted dark:bg-[#232323] p-0 text-xs cursor-help border-[#E4E4E7] dark:border-[#313131]'
                                >
                                  ?
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent className='bg-white dark:bg-[#232323] text-[#3F3F46] dark:text-white border-[#E4E4E7] dark:border-[#313131]'>
                                This invitation grants access to your entire workspace
                              </TooltipContent>
                            </Tooltip>
                          </DialogTitle>
                          <DialogDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                            Send an invitation to join your workspace
                          </DialogDescription>
                        </DialogHeader>
                        <div className='space-y-4 py-4'>
                          <div className='space-y-2'>
                            <Label
                              htmlFor='invite-email'
                              className='text-[#3F3F46] dark:text-white'
                            >
                              Email Address
                            </Label>
                            <Input
                              id='invite-email'
                              type='email'
                              value={inviteEmail}
                              onChange={(e) => {
                                return setInviteEmail(e.target.value);
                              }}
                              placeholder='colleague@example.com'
                              className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor='invite-role' className='text-[#3F3F46] dark:text-white'>
                              Role
                            </Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                              <SelectTrigger className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white'>
                                <SelectValue placeholder='Select a role' />
                              </SelectTrigger>
                              <SelectContent className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white'>
                                <SelectItem value='admin'>Admin</SelectItem>
                                <SelectItem value='moderator'>Moderator</SelectItem>
                                <SelectItem value='client'>Client</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          className='w-full bg-black hover:bg-black/90 text-white'
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
                    <div className='text-center py-6 text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                      Loading team members...
                    </div>
                  ) : activeTeamMembers.length === 0 ? (
                    <div className='text-center py-6 text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                      No team members yet. Invite someone to get started!
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {activeTeamMembers.map((member) => {
                        return (
                          <div
                            key={member._id}
                            className='flex items-center justify-between p-4 border border-[#E4E4E7] dark:border-[#232428] rounded-lg hover:bg-[#F4F4F5] dark:hover:bg-[#252525] transition-colors'
                          >
                            <div className='flex items-center gap-4'>
                              {/* <Avatar>
                                <AvatarImage
                                  src={
                                    member?.user?.avatar ||
                                    `https://avatar.vercel.sh/${member.user.email}`
                                  }
                                />
                                <AvatarFallback className='bg-[#E4E4E7] dark:bg-[#232323]'>
                                  {getInitials(member.user.name || member.user.email)}
                                </AvatarFallback>
                              </Avatar> */}
                              <div>
                                <p className='font-medium text-[#3F3F46] dark:text-white'>
                                  {member.user.name || member.user.email}
                                </p>
                                <p className='text-sm text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                                  {member.user.email}
                                </p>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge className={`${getRoleColor(member.role)} capitalize`}>
                                {member.role}
                              </Badge>
                              <div className='flex items-center'>
                                {member.role !== 'owner' && (
                                  <>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      onClick={() => {
                                        return handleEditMember(member);
                                      }}
                                      className='text-[#3F3F46]/60 hover:text-[#3F3F46] dark:text-[#8b8b8b] dark:hover:text-white'
                                    >
                                      <Edit className='h-4 w-4' />
                                    </Button>
                                    <Button
                                      variant='ghost'
                                      size='icon'
                                      onClick={() => {
                                        console.log('🚀 member:', member);
                                        return handleRemoveTeamMember(member.user._id);
                                      }}
                                      disabled={removeTeamMemberMutation.isPending}
                                      className='text-[#3F3F46]/60 hover:text-[#3F3F46] dark:text-[#8b8b8b] dark:hover:text-white'
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
                                  </>
                                )}
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
              <DialogContent className='sm:max-w-md bg-white dark:bg-[#181818] text-[#3F3F46] dark:text-white border-[#E4E4E7] dark:border-[#232428]'>
                <DialogHeader>
                  <DialogTitle className='text-[#3F3F46] dark:text-white'>
                    Edit Team Member
                  </DialogTitle>
                  <DialogDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                    Update role and permissions for{' '}
                    {selectedMember?.user?.name || selectedMember?.user?.email}
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='flex items-center gap-4 mb-4'>
                    <Avatar>
                      <AvatarImage
                        src={
                          selectedMember
                            ? `https://avatar.vercel.sh/${selectedMember.user.email}`
                            : ''
                        }
                        alt={selectedMember?.user?.name || 'Team member'}
                      />
                      <AvatarFallback className='bg-[#E4E4E7] dark:bg-[#232323]'>
                        {selectedMember?.user?.name
                          ? getInitials(selectedMember.user.name)
                          : selectedMember?.user?.email
                          ? getInitials(selectedMember.user.email.split('@')[0])
                          : '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium text-[#3F3F46] dark:text-white'>
                        {selectedMember?.user?.name || selectedMember?.user?.email}
                      </p>
                      <p className='text-sm text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                        {selectedMember?.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='edit-role' className='text-[#3F3F46] dark:text-white'>
                      Role
                    </Label>
                    <Select value={editRole} onValueChange={setEditRole}>
                      <SelectTrigger className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white'>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                      <SelectContent className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white'>
                        <SelectItem value='admin'>Admin</SelectItem>
                        <SelectItem value='moderator'>Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b] mt-2'>
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
                    className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#252525]'
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
                    className='bg-black hover:bg-black/90 text-white'
                  >
                    {updateTeamMemberMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card className='bg-white dark:bg-[#181818] border-[#E4E4E7] dark:border-[#232428]'>
              <CardHeader>
                <CardTitle className='text-[#3F3F46] dark:text-white'>
                  Pending Invitations
                </CardTitle>
                <CardDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                  Manage your pending workspace invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!invitations || invitations.length === 0 ? (
                  <div className='text-center py-6 text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                    No pending invitations
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {invitations.map((invitation, index) => {
                      return (
                        <div
                          key={index}
                          className='flex items-center justify-between p-4 border border-[#E4E4E7] dark:border-[#232428] rounded-lg'
                        >
                          <div className='flex-1'>
                            <p className='font-medium text-[#3F3F46] dark:text-white'>
                              {invitation.email}
                            </p>
                            <div className='flex items-center gap-2 mt-1'>
                              <Badge className={`${getRoleColor(invitation.role)} capitalize`}>
                                {invitation.role}
                              </Badge>
                              <span className='text-sm text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                                Invited by {invitation.invitedBy.name || invitation.invitedBy.email}
                              </span>
                            </div>
                            <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b] mt-1'>
                              Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              return handleRevokeInvitation(invitation.token);
                            }}
                            disabled={revokeInvitationMutation.isPending}
                            className='text-[#3F3F46]/60 hover:text-[#3F3F46] dark:text-[#8b8b8b] dark:hover:text-white'
                          >
                            <XCircle className='h-4 w-4 text-destructive' />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Integration Tab */}
          <TabsContent value='email' className='space-y-6'>
            <Card className='bg-white dark:bg-[#181818] border-[#E4E4E7] dark:border-[#232428]'>
              <CardHeader>
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
                  <div>
                    <CardTitle className='text-[#3F3F46] dark:text-white'>
                      Email Integration
                    </CardTitle>
                    <CardDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                      Connect your email accounts to send emails from your workspace
                    </CardDescription>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0'>
                    <Button
                      onClick={() => {
                        return setIsAddingEmail(true);
                      }}
                      className='bg-black hover:bg-black/90 text-white'
                    >
                      <Mail className='mr-2 h-4 w-4' />
                      Add Email
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {!gmailStatus?.connected && !gmailStatus?.integrations?.length ? (
                    <div className='text-center py-6 text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                      No email integrations added yet. Add one to get started!
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {gmailStatus?.integrations?.map((integration) => {
                        return (
                          <div
                            key={integration.email}
                            className='flex flex-col p-4 border border-[#E4E4E7] dark:border-[#232428] rounded-lg'
                          >
                            <div className='flex items-center justify-between mb-4'>
                              <div className='flex items-center gap-2'>
                                <span className='font-medium text-[#3F3F46] dark:text-white'>
                                  {integration.email}
                                </span>
                                <Badge
                                  className={
                                    integration.isActive && !integration.isExpired
                                      ? 'bg-green-100 text-green-800'
                                      : integration.isExpired
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {integration.isActive && !integration.isExpired
                                    ? 'Connected'
                                    : integration.isExpired
                                    ? 'Expired'
                                    : 'Inactive'}
                                </Badge>
                              </div>
                              {integration.isExpired && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => {
                                    setIsConnectingGmail(true);
                                    setIsAddingEmail(false);
                                    // Gmail integration logic
                                    const width = 600;
                                    const height = 600;
                                    const left = window.screenX + (window.outerWidth - width) / 2;
                                    const top = window.screenY + (window.outerHeight - height) / 2;

                                    newRequest
                                      .get('/gmail/auth-url')
                                      .then((response) => {
                                        let authUrl = response.data.authUrl;
                                        if (authUrl) {
                                          const url = new URL(authUrl);
                                          if (!url.searchParams.has('response_type')) {
                                            url.searchParams.append('response_type', 'code');
                                          }
                                          if (!url.searchParams.has('state')) {
                                            url.searchParams.append('state', 'gmail_auth');
                                          }
                                          if (!url.searchParams.has('redirect_uri')) {
                                            url.searchParams.append(
                                              'redirect_uri',
                                              'https://www.hourblock.com/sync/google/callback',
                                            );
                                          }
                                          authUrl = url.toString();

                                          const popup = window.open(
                                            authUrl,
                                            'gmailAuth',
                                            `width=${width},height=${height},left=${left},top=${top}`,
                                          );

                                          // Set up message listener for communication from the popup
                                          const messageHandler = (event: MessageEvent) => {
                                            if (event.origin !== window.location.origin) return;

                                            if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
                                              window.removeEventListener('message', messageHandler);
                                              handleGmailAuthSuccess();
                                            }

                                            if (event.data?.type === 'GMAIL_AUTH_ERROR') {
                                              window.removeEventListener('message', messageHandler);
                                              console.error('Gmail auth error:', event.data.error);
                                              setIsConnectingGmail(false);
                                              toast.error('Failed to connect Gmail account');
                                            }
                                          };

                                          window.addEventListener('message', messageHandler);

                                          // Check if popup was closed manually
                                          const checkPopupClosed = setInterval(() => {
                                            if (popup?.closed) {
                                              clearInterval(checkPopupClosed);
                                              window.removeEventListener('message', messageHandler);
                                              setIsConnectingGmail(false);
                                            }
                                          }, 500);
                                        }
                                      })
                                      .catch((error) => {
                                        console.error('Failed to get auth URL:', error);
                                        setIsConnectingGmail(false);
                                        toast.error('Failed to start Gmail connection');
                                      });
                                  }}
                                  className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#252525]'
                                >
                                  {isConnectingGmail ? (
                                    <>
                                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                      Connecting...
                                    </>
                                  ) : (
                                    'Reconnect'
                                  )}
                                </Button>
                              )}
                            </div>
                            {integration.lastSynced && (
                              <div className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                                Last synced: {new Date(integration.lastSynced).toLocaleString()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='billing' className='p-6'></TabsContent>

          <TabsContent value='integrations' className='p-6'>
            <PaymentIntegrations
              stripeStatus={stripeStatus}
              connectStripe={connectStripe}
              disconnectStripe={disconnectStripe}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Email Integration Dialog */}
      <Dialog open={isAddingEmail} onOpenChange={setIsAddingEmail}>
        <DialogContent className='sm:max-w-2xl bg-white dark:bg-[#181818] text-[#3F3F46] dark:text-white border-[#E4E4E7] dark:border-[#232428]'>
          <DialogHeader>
            <DialogTitle className='text-[#3F3F46] dark:text-white'>
              Set Up Email Sending
            </DialogTitle>
            <DialogDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
              Choose how you want to send emails from your workspace
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-6 py-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div
                className={`relative flex flex-col p-6 border rounded-lg transition-all duration-200 ${
                  selectedIntegrationType === 'gmail'
                    ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                    : 'border-[#E4E4E7] dark:border-[#232428] hover:border-black/20 dark:hover:border-white/20'
                } cursor-pointer`}
                onClick={() => {
                  return setSelectedIntegrationType('gmail');
                }}
              >
                {selectedIntegrationType === 'gmail' && (
                  <div className='absolute top-4 right-4'>
                    <div className='h-5 w-5 rounded-full bg-black dark:bg-white flex items-center justify-center'>
                      <svg
                        className='h-3 w-3 text-white dark:text-black'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={3}
                          d='M5 13l4 4L19 7'
                        />
                      </svg>
                    </div>
                  </div>
                )}
                <div className='flex items-center gap-3 mb-4'>
                  <div
                    className={`p-2 rounded-lg ${
                      selectedIntegrationType === 'gmail'
                        ? 'bg-black dark:bg-white'
                        : 'bg-[#F4F4F5] dark:bg-[#232323]'
                    }`}
                  >
                    <ImageIcon
                      className={`h-6 w-6 ${
                        selectedIntegrationType === 'gmail'
                          ? 'text-white dark:text-black'
                          : 'text-[#3F3F46] dark:text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className='font-medium text-[#3F3F46] dark:text-white'>
                      Google Workspace / Gmail
                    </h4>
                    <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                      Recommended for most teams
                    </p>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-sm text-[#3F3F46] dark:text-white'>
                    <svg
                      className='h-4 w-4 text-green-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Quick setup with Google OAuth</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-[#3F3F46] dark:text-white'>
                    <svg
                      className='h-4 w-4 text-green-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>No DNS configuration needed</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-[#3F3F46] dark:text-white'>
                    <svg
                      className='h-4 w-4 text-green-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Works with any Google account</span>
                  </div>
                </div>
              </div>

              <div
                className={`relative flex flex-col p-6 border rounded-lg transition-all duration-200 ${
                  selectedIntegrationType === 'custom'
                    ? 'border-black dark:border-white bg-black/5 dark:bg-white/5'
                    : 'border-[#E4E4E7] dark:border-[#232428] hover:border-black/20 dark:hover:border-white/20'
                } cursor-not-allowed opacity-60`}
                onClick={() => {
                  return; // Disable click handler
                }}
              >
                <div className='flex items-center gap-3 mb-4'>
                  <div
                    className={`p-2 rounded-lg ${
                      selectedIntegrationType === 'custom'
                        ? 'bg-black dark:bg-white'
                        : 'bg-[#F4F4F5] dark:bg-[#232323]'
                    }`}
                  >
                    <AtSign
                      className={`h-6 w-6 ${
                        selectedIntegrationType === 'custom'
                          ? 'text-white dark:text-black'
                          : 'text-[#3F3F46] dark:text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className='font-medium text-[#3F3F46] dark:text-white'>
                      Custom Domain Email
                    </h4>
                    <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                      For professional branding
                    </p>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-sm text-[#3F3F46] dark:text-white'>
                    <svg
                      className='h-4 w-4 text-green-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Professional email addresses</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-[#3F3F46] dark:text-white'>
                    <svg
                      className='h-4 w-4 text-green-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Higher sending limits</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-[#3F3F46] dark:text-white'>
                    <svg
                      className='h-4 w-4 text-green-500'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    <span>Better email deliverability</span>
                  </div>
                </div>
                <div className='absolute bottom-4 right-4'>
                  <Badge
                    variant='secondary'
                    className='bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                  >
                    Coming Soon
                  </Badge>
                </div>
              </div>
            </div>

            {selectedIntegrationType === 'custom' && (
              <div className='space-y-2 p-4 bg-[#F4F4F5] dark:bg-[#232323] rounded-lg opacity-60 pointer-events-none'>
                <Label htmlFor='custom-email' className='text-[#3F3F46] dark:text-white'>
                  Your Email Address
                </Label>
                <Input
                  id='custom-email'
                  type='email'
                  value={newEmail}
                  onChange={(e) => {
                    return setNewEmail(e.target.value);
                  }}
                  placeholder='support@yourdomain.com'
                  className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white'
                />
                <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b] mt-1'>
                  This will be the email address you&apos;ll use to send emails from your workspace
                </p>
              </div>
            )}
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                return setIsAddingEmail(false);
              }}
              className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#252525]'
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('selectedIntegrationType', selectedIntegrationType);
                if (selectedIntegrationType === 'gmail') {
                  setIsConnectingGmail(true);
                  setIsAddingEmail(false);
                  // Gmail integration logic
                  const width = 600;
                  const height = 600;
                  const left = window.screenX + (window.outerWidth - width) / 2;
                  const top = window.screenY + (window.outerHeight - height) / 2;

                  newRequest
                    .get('/gmail/auth-url')
                    .then((response) => {
                      let authUrl = response.data.authUrl;
                      if (authUrl) {
                        const url = new URL(authUrl);
                        if (!url.searchParams.has('response_type')) {
                          url.searchParams.append('response_type', 'code');
                        }
                        if (!url.searchParams.has('state')) {
                          url.searchParams.append('state', 'gmail_auth');
                        }
                        if (!url.searchParams.has('redirect_uri')) {
                          url.searchParams.append(
                            'redirect_uri',
                            'https://www.hourblock.com/sync/google/callback',
                          );
                        }
                        authUrl = url.toString();

                        const popup = window.open(
                          authUrl,
                          'gmailAuth',
                          `width=${width},height=${height},left=${left},top=${top}`,
                        );

                        // Set up message listener for communication from the popup
                        const messageHandler = (event: MessageEvent) => {
                          if (event.origin !== window.location.origin) return;

                          if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
                            window.removeEventListener('message', messageHandler);
                            handleGmailAuthSuccess();
                          }

                          if (event.data?.type === 'GMAIL_AUTH_ERROR') {
                            window.removeEventListener('message', messageHandler);
                            console.error('Gmail auth error:', event.data.error);
                            setIsConnectingGmail(false);
                            toast.error('Failed to connect Gmail account');
                          }
                        };

                        window.addEventListener('message', messageHandler);

                        // Check if popup was closed manually
                        const checkPopupClosed = setInterval(() => {
                          if (popup?.closed) {
                            clearInterval(checkPopupClosed);
                            window.removeEventListener('message', messageHandler);
                            setIsConnectingGmail(false);
                          }
                        }, 500);
                      }
                    })
                    .catch((error) => {
                      console.error('Failed to get auth URL:', error);
                      setIsConnectingGmail(false);
                      toast.error('Failed to start Gmail connection');
                    });
                } else {
                  addCustomEmailMutation.mutate(newEmail);
                }
              }}
              disabled={
                (selectedIntegrationType === 'custom' && !newEmail.trim()) ||
                addCustomEmailMutation.isPending ||
                isConnectingGmail
              }
              className='bg-black hover:bg-black/90 text-white'
            >
              {selectedIntegrationType === 'gmail' ? (
                isConnectingGmail ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Connecting...
                  </>
                ) : (
                  'Continue with Google'
                )
              ) : addCustomEmailMutation.isPending ? (
                'Adding...'
              ) : (
                'Add Custom Email'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
