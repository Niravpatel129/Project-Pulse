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

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function ProjectSidebar({
  onUpdateProject,
}: {
  onUpdateProject: (data: Partial<Project>) => Promise<void>;
}) {
  const { project } = useProject();
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
          .map((c) => {
            return c.email;
          })
          .filter((email): email is string => {
            return email !== undefined;
          }) || [],
    };
  });
  const [clientEmail, setClientEmail] = useState(
    project?.participants?.find((c) => {
      return c.email;
    })?.email || '',
  );

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

  const updateSharingSettingsMutation = useMutation({
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
    onError: (error: ApiError) => {
      if (!error) return;

      const errorMessage =
        error?.response?.data?.message || error.message || 'Failed to save sharing settings';
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

  const handleProjectTypeChange = async (value: string) => {
    await onUpdateProject?.({ projectType: value });
  };

  const handleProjectStatusChange = async (value: string) => {
    await onUpdateProject?.({ projectStatus: value });
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

  return (
    <div className='w-full max-w-full lg:w-80 overflow-hidden'>
      <div className='rounded-md bg-white p-6 shadow-sm border border-gray-100'>
        <div className='mb-6 flex items-center gap-2'>
          <Lock className='h-4 w-4 text-primary' />
          <span className='text-sm font-medium text-foreground'>Project Details</span>
        </div>

        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='properties'>
            <AccordionTrigger className='text-sm font-medium text-foreground'>
              Properties
            </AccordionTrigger>
            <AccordionContent>
              <div className='space-y-4 pt-2'>
                <div className='space-y-2'>
                  <label className='text-xs font-medium text-muted-foreground'>Stage</label>
                  <Select
                    value={project?.stage || 'Initial Contact'}
                    onValueChange={handleStageChange}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='text-xs'>
                      <SelectItem value='Initial Contact'>Initial Contact</SelectItem>
                      <SelectItem value='Proposal'>Proposal</SelectItem>
                      <SelectItem value='Negotiation'>Negotiation</SelectItem>
                      <SelectItem value='Closed Won'>Closed Won</SelectItem>
                      <SelectItem value='Closed Lost'>Closed Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-medium text-muted-foreground'>Lead Source</label>
                  <Select
                    value={project?.leadSource || 'Referral'}
                    onValueChange={handleLeadSourceChange}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='text-xs'>
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
                  <label className='text-xs font-medium text-muted-foreground'>Project Type</label>
                  <Select
                    value={project?.projectType || 'Research'}
                    onValueChange={handleProjectTypeChange}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='text-xs'>
                      <SelectItem value='Research'>Research</SelectItem>
                      <SelectItem value='Development'>Development</SelectItem>
                      <SelectItem value='Design'>Design</SelectItem>
                      <SelectItem value='Marketing'>Marketing</SelectItem>
                      <SelectItem value='Consulting'>Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-medium text-muted-foreground'>Status</label>
                  <Select
                    value={project?.projectStatus || 'planning'}
                    onValueChange={handleProjectStatusChange}
                  >
                    <SelectTrigger className='h-8 text-xs'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='text-xs'>
                      <SelectItem value='planning'>Planning</SelectItem>
                      <SelectItem value='in_progress'>In Progress</SelectItem>
                      <SelectItem value='review'>Review</SelectItem>
                      <SelectItem value='completed'>Completed</SelectItem>
                      <SelectItem value='on_hold'>On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='description'>
            <AccordionTrigger className='text-sm font-medium text-foreground'>
              Description
            </AccordionTrigger>
            <AccordionContent>
              <div className='pt-2'>
                <Textarea
                  placeholder='Add a project description...'
                  className='min-h-[100px] text-sm'
                  value={project?.description || ''}
                  onChange={(e) => {
                    return onUpdateProject?.({ description: e.target.value });
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='sharing'>
            <AccordionTrigger className='text-sm font-medium text-foreground'>
              Sharing Settings
            </AccordionTrigger>
            <AccordionContent>
              <div className='pt-2 space-y-4'>
                <Dialog open={isClientPortalDialogOpen} onOpenChange={setIsClientPortalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant='outline' className='w-full h-8 text-xs'>
                      <Share2 className='mr-2 h-3.5 w-3.5' />
                      Configure Sharing
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
                  <DialogContent className='sm:max-w-[480px] p-6'>
                    <DialogHeader className='mb-4'>
                      <DialogTitle className='text-base font-medium'>
                        Send Client Portal Link
                      </DialogTitle>
                      <DialogDescription className='text-xs text-muted-foreground mt-1'>
                        Send your client access to their project portal
                      </DialogDescription>
                    </DialogHeader>

                    <div className='space-y-4'>
                      <div className='space-y-3'>
                        <div className='flex items-center space-x-3'>
                          <Label htmlFor='email-to' className='w-12 text-xs text-muted-foreground'>
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
                            className='flex-1 h-8 text-xs'
                          />
                        </div>

                        <div className='flex items-center space-x-3'>
                          <Label
                            htmlFor='email-subject'
                            className='w-12 text-xs text-muted-foreground'
                          >
                            Subject:
                          </Label>
                          <Input
                            id='email-subject'
                            type='text'
                            value={`Access your project portal: ${project?.name || 'Project'}`}
                            readOnly
                            className='flex-1 h-8 text-xs bg-muted'
                          />
                        </div>

                        <div className='mt-4'>
                          <Textarea
                            id='email-message'
                            placeholder='Add a personal message to your client...'
                            rows={8}
                            value={
                              sharingSettings.customMessage ||
                              `Hi,\n\nI've created a project portal for you to track our progress. You can access it using the link below:\n\n${portalURL}\n\nPlease let me know if you have any questions.\n\nBest regards`
                            }
                            onChange={(e) => {
                              return handleSharingSettingsChange('customMessage', e.target.value);
                            }}
                            className='w-full text-xs'
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter className='mt-6'>
                      <Button
                        onClick={sendClientPortalEmail}
                        disabled={sendPortalLinkMutation.isPending}
                        className='h-8 text-xs'
                      >
                        <Mail className='mr-2 h-3.5 w-3.5' />
                        {sendPortalLinkMutation.isPending ? 'Sending...' : 'Send Email'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
