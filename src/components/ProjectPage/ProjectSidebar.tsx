'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

import { useProject, type Project } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Lock, Mail, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ShareDialog } from './FileComponents/ShareDialog';

interface Task {
  _id: string | number;
  title: string;
  description: string;
  status: string;
  dueDate: string;
}

interface TimeEntry {
  id: number;
  description: string;
  duration: number;
}

interface SharingSettings {
  accessType: 'signup_required' | 'email_restricted' | 'public';
  requirePassword: boolean;
  password: string;
  expirationDays: string;
  customMessage: string;
  allowedEmails: string[];
}

export function ProjectSidebar({
  onUpdateProject,
}: {
  onUpdateProject: (data: Partial<Project>) => Promise<void>;
}) {
  const { project } = useProject();
  const [tasks, setTasks] = useState<Task[]>(project?.tasks || []);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isClientPortalDialogOpen, setIsClientPortalDialogOpen] = useState(false);
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = useState(false);
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>(() => {
    return {
      accessType: 'signup_required',
      requirePassword: false,
      password: '',
      customMessage: '',
      expirationDays: '30',
      allowedEmails:
        project?.participants
          ?.filter((p) => {
            return p.role === 'client';
          })
          .map((p) => {
            return p.email;
          })
          .filter((email): email is string => {
            return email !== undefined;
          }) || [],
    };
  });
  const [clientEmail, setClientEmail] = useState(
    project?.participants?.find((p) => {
      return p.role === 'client';
    })?.email || '',
  );
  const [allowedEmailInput, setAllowedEmailInput] = useState('');
  const [portalURL, setPortalURL] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    accessType?: string;
    passwordProtected?: string;
  }>({});

  // Fetch initial sharing settings and portal URL
  const { data: sharingData, isLoading: isLoadingSharingData } = useQuery({
    queryKey: ['projectSharing', project?._id],
    queryFn: async () => {
      if (!project?._id) return null;

      const [settings] = await Promise.all([
        newRequest.get(`/projects/${project._id}/sharing/settings`),
      ]);

      return {
        settings: settings.data,
      };
    },
    enabled: !!project?._id,
  });

  // Update state when data is fetched using useEffect to prevent re-renders
  useEffect(() => {
    if (sharingData && !isLoadingSharingData && sharingData.settings) {
      setSharingSettings(sharingData.settings);
    }
  }, [sharingData, isLoadingSharingData]);

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!project?._id) throw new Error('Project ID is required');
      return newRequest.put(`/projects/${project._id}/sharing/settings`, {
        accessType: sharingSettings.accessType,
        passwordProtected: sharingSettings.requirePassword,
        password: sharingSettings.requirePassword ? sharingSettings.password : null,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Sharing settings saved successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to save sharing settings';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const sendPortalLinkMutation = useMutation({
    mutationFn: async () => {
      if (!project?._id) throw new Error('Project ID is required');
      return newRequest.post(`/projects/${project._id}/sharing/send-link`, {
        email: clientEmail,
        settings: sharingSettings,
      });
    },
    onSuccess: (response) => {
      toast({
        title: 'Success',
        description: response.data.message || 'Portal link has been sent successfully',
      });
      setIsSendEmailDialogOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send portal link',
        variant: 'destructive',
      });
    },
  });

  const handleStageChange = async (value: string) => {
    await onUpdateProject?.({ stage: value });
  };

  const handleLeadSourceChange = async (value: string) => {
    await onUpdateProject?.({ leadSource: value });
  };

  const addTask = (title: string) => {
    setTasks([
      ...tasks,
      { _id: Date.now(), title, description: '', status: 'pending', dueDate: '' },
    ]);
  };

  const addTimeEntry = (description: string, duration: number) => {
    setTimeEntries([...timeEntries, { id: Date.now(), description, duration }]);
  };

  const handleSharingSettingsChange = async (
    key: keyof SharingSettings,
    value: string | boolean | string[],
  ) => {
    const newSettings = {
      ...sharingSettings,
      [key]: value,
    };
    setSharingSettings(newSettings);

    // Clear validation errors when fields are updated
    if (key === 'accessType' && validationErrors.accessType) {
      setValidationErrors((prev) => {
        return { ...prev, accessType: undefined };
      });
    }
    if (key === 'requirePassword' && validationErrors.passwordProtected) {
      setValidationErrors((prev) => {
        return { ...prev, passwordProtected: undefined };
      });
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(portalURL);
    toast({
      title: 'Link copied to clipboard',
      description: 'You can now share this link with your client',
    });
  };

  const validateSettings = () => {
    const errors: { accessType?: string; passwordProtected?: string } = {};

    if (!sharingSettings.accessType) {
      errors.accessType = 'Access type is required';
    }

    if (sharingSettings.requirePassword && !sharingSettings.password) {
      errors.passwordProtected = 'Password is required when password protection is enabled';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveSettings = () => {
    if (validateSettings()) {
      saveSettingsMutation.mutate();
    }
  };

  const sendClientPortalEmail = async () => {
    if (!project?._id) return;

    if (!clientEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter a client email address',
        variant: 'destructive',
      });
      return;
    }

    if (
      sharingSettings.accessType === 'email_restricted' &&
      sharingSettings.allowedEmails.length === 0
    ) {
      toast({
        title: 'No allowed emails',
        description:
          'You need to add at least one allowed email address when using "Invited participants only"',
        variant: 'destructive',
      });
      return;
    }

    if (!validateSettings()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the sharing settings',
        variant: 'destructive',
      });
      return;
    }

    sendPortalLinkMutation.mutate();
  };

  const addAllowedEmail = () => {
    if (!allowedEmailInput) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(allowedEmailInput)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    // Add email to the allowed list
    setSharingSettings({
      ...sharingSettings,
      allowedEmails: [...sharingSettings.allowedEmails, allowedEmailInput],
    });

    // Clear the input
    setAllowedEmailInput('');
  };

  const removeAllowedEmail = (email: string) => {
    setSharingSettings({
      ...sharingSettings,
      allowedEmails: sharingSettings.allowedEmails.filter((e) => {
        return e !== email;
      }),
    });
  };

  const handleAllowedEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow adding email with Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllowedEmail();
    }
  };

  // Function to handle the privacy level change
  const handlePrivacyLevelChange = (value: SharingSettings['accessType']) => {
    handleSharingSettingsChange('accessType', value);

    // Clear allowed emails when changing from email_restricted to another mode
    if (value !== 'email_restricted') {
      setSharingSettings((prev) => {
        return {
          ...prev,
          accessType: value,
          allowedEmails: [],
        };
      });
    }
  };

  return (
    <div className='w-full max-w-full md:w-80 space-y-6 overflow-hidden p-1'>
      <div className='rounded-lg bg-gray-50 p-4'>
        <div className='mb-4 flex items-center gap-2'>
          <Lock className='h-4 w-4' />
          <span className='font-medium'>Only visible to you</span>
        </div>
        <p className='text-sm text-muted-foreground'>
          Private place for you and your internal team to manage this project.
        </p>
        <Dialog open={isClientPortalDialogOpen} onOpenChange={setIsClientPortalDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='link' className='mt-2 h-auto p-0 text-[#5DD3D1] hover:text-[#4CC3C1]'>
              <Share2 className='mr-2 h-4 w-4' />
              Send client portal link
            </Button>
          </DialogTrigger>
          <ShareDialog
            projectId={project?._id || ''}
            initialSettings={sharingSettings}
            onClose={() => {
              return setIsClientPortalDialogOpen(false);
            }}
            onSendEmail={() => {
              setIsClientPortalDialogOpen(false);
              setIsSendEmailDialogOpen(true);
            }}
          />
        </Dialog>

        <Dialog open={isSendEmailDialogOpen} onOpenChange={setIsSendEmailDialogOpen}>
          <DialogContent className='sm:max-w-[550px]'>
            <DialogHeader>
              <DialogTitle>Send Client Portal Link</DialogTitle>
              <DialogDescription>Send your client access to their project portal</DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-2'>
              <div className='space-y-2'>
                <div className='flex items-center space-x-2'>
                  <Label htmlFor='email-to' className='w-16'>
                    To:
                  </Label>
                  <Input
                    id='email-to'
                    type='email'
                    placeholder='client@example.com'
                    value={clientEmail}
                    onChange={(e) => {
                      return setClientEmail(e.target.value);
                    }}
                    className='flex-1'
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Label htmlFor='email-subject' className='w-16'>
                    Subject:
                  </Label>
                  <Input
                    id='email-subject'
                    type='text'
                    value={`Access your project portal: ${project?.name || 'Project'}`}
                    readOnly
                    className='flex-1 bg-gray-50'
                  />
                </div>

                <div className='mt-8'>
                  <Textarea
                    id='email-message'
                    placeholder='Add a personal message to your client...'
                    rows={12}
                    value={
                      sharingSettings.customMessage ||
                      `Hi,\n\nI've created a project portal for you to track our progress. You can access it using the link below:\n\n${portalURL}\n\nPlease let me know if you have any questions.\n\nBest regards`
                    }
                    onChange={(e) => {
                      return handleSharingSettingsChange('customMessage', e.target.value);
                    }}
                    className='w-full'
                  />
                </div>
              </div>
            </div>

            <DialogFooter className='mt-4'>
              <Button onClick={sendClientPortalEmail} disabled={sendPortalLinkMutation.isPending}>
                <Mail className='mr-2 h-4 w-4' />
                {sendPortalLinkMutation.isPending ? 'Sending...' : 'Send Email'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Stage</label>
          <Select value={project?.stage || 'Initial Contact'} onValueChange={handleStageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Initial Contact'>Initial Contact</SelectItem>
              <SelectItem value='Proposal'>Proposal</SelectItem>
              <SelectItem value='Negotiation'>Negotiation</SelectItem>
              <SelectItem value='Closed Won'>Closed Won</SelectItem>
              <SelectItem value='Closed Lost'>Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Lead Source</label>
          <Select value={project?.leadSource || 'Referral'} onValueChange={handleLeadSourceChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Referral'>Referral</SelectItem>
              <SelectItem value='Website'>Website</SelectItem>
              <SelectItem value='Social Media'>Social Media</SelectItem>
              <SelectItem value='Email Campaign'>Email Campaign</SelectItem>
              <SelectItem value='Conference'>Conference</SelectItem>
              <SelectItem value='Other'>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Project Type</label>
          <Select value={project?.projectType || 'Research'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Research'>Research</SelectItem>
              <SelectItem value='Development'>Development</SelectItem>
              <SelectItem value='Design'>Design</SelectItem>
              <SelectItem value='Marketing'>Marketing</SelectItem>
              <SelectItem value='Consulting'>Consulting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Status</label>
          <Select value={project?.projectStatus || 'planning'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='planning'>Planning</SelectItem>
              <SelectItem value='in_progress'>In Progress</SelectItem>
              <SelectItem value='review'>Review</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
              <SelectItem value='on_hold'>On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
