'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

import { useProject, type Project } from '@/contexts/ProjectContext';
import { Copy, Link as LinkIcon, Lock, Mail, PlusCircle, Share2, X } from 'lucide-react';
import { useState } from 'react';

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
  privacyLevel: 'signup_required' | 'email_restricted' | 'public';
  requirePassword: boolean;
  password: string;
  teamMembers: string[];
  customMessage: string;
  expirationDays: string;
  allowedEmails: string[];
}

export function ProjectSidebar({
  onUpdateProject,
}: {
  onUpdateProject: (data: Partial<Project>) => Promise<void>;
}) {
  const { project } = useProject();
  console.log('🚀 project:', project);
  const [tasks, setTasks] = useState<Task[]>(project?.tasks || []);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isClientPortalDialogOpen, setIsClientPortalDialogOpen] = useState(false);
  const [sharingSettings, setSharingSettings] = useState<SharingSettings>({
    privacyLevel: 'signup_required',
    requirePassword: false,
    password: '',
    teamMembers: [],
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
  });
  const [clientEmail, setClientEmail] = useState(
    project?.participants?.find((p) => {
      return p.role === 'client';
    })?.email || '',
  );
  const [allowedEmailInput, setAllowedEmailInput] = useState('');
  const portalURL = `https://pulse.example.com/client/${project?._id || 'project-id'}`;

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

  const handleSharingSettingsChange = (
    key: keyof SharingSettings,
    value: string | boolean | string[],
  ) => {
    setSharingSettings({
      ...sharingSettings,
      [key]: value,
    });
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(portalURL);
    toast({
      title: 'Link copied to clipboard',
      description: 'You can now share this link with your client',
    });
  };

  const sendClientPortalEmail = () => {
    // In a real app, this would call an API endpoint to send the email
    if (!clientEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter a client email address',
        variant: 'destructive',
      });
      return;
    }

    // If privacy level is email_restricted, validate that we have at least one allowed email
    if (
      sharingSettings.privacyLevel === 'email_restricted' &&
      sharingSettings.allowedEmails.length === 0
    ) {
      toast({
        title: 'No allowed emails',
        description:
          'You need to add at least one allowed email address when using "Specific Email Addresses Only"',
        variant: 'destructive',
      });
      return;
    }

    // Success case
    toast({
      title: 'Portal link sent',
      description: `Client portal link has been sent to ${clientEmail}`,
    });
    setIsClientPortalDialogOpen(false);
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
  const handlePrivacyLevelChange = (value: SharingSettings['privacyLevel']) => {
    handleSharingSettingsChange('privacyLevel', value);

    // Clear allowed emails when changing from email_restricted to another mode
    if (value !== 'email_restricted') {
      setSharingSettings((prev) => {
        return {
          ...prev,
          privacyLevel: value,
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
          <DialogContent className='sm:max-w-[500px]'>
            <DialogHeader>
              <DialogTitle>Share Client Portal</DialogTitle>
              <DialogDescription>
                Configure sharing settings and send your client a portal link
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue='email' className='mt-4'>
              <TabsList className='grid grid-cols-2 w-full'>
                <TabsTrigger value='email'>Send Email</TabsTrigger>
                <TabsTrigger value='settings'>Portal Settings</TabsTrigger>
              </TabsList>

              <TabsContent value='email' className='space-y-4 py-2'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm font-medium mb-1'>Client Portal Link</div>
                  <Button variant='outline' size='sm' onClick={copyLinkToClipboard} className='h-8'>
                    <Copy className='h-3.5 w-3.5 mr-1' />
                    Copy
                  </Button>
                </div>
                <div className='flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-md text-sm'>
                  <LinkIcon className='h-3.5 w-3.5 text-gray-500' />
                  <span className='text-gray-700 text-xs truncate'>{portalURL}</span>
                </div>

                <div className='space-y-2 pt-2'>
                  <Label htmlFor='client-email'>Client Email</Label>
                  <Input
                    id='client-email'
                    type='email'
                    placeholder='client@example.com'
                    value={clientEmail}
                    onChange={(e) => {
                      return setClientEmail(e.target.value);
                    }}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email-message'>Message (Optional)</Label>
                  <Textarea
                    id='email-message'
                    placeholder='Add a personal message to your client...'
                    rows={3}
                    value={sharingSettings.customMessage}
                    onChange={(e) => {
                      return handleSharingSettingsChange('customMessage', e.target.value);
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value='settings' className='space-y-4 py-2'>
                <div className='space-y-3'>
                  <div className='space-y-1.5'>
                    <Label>Access Type</Label>
                    <Select
                      value={sharingSettings.privacyLevel}
                      onValueChange={handlePrivacyLevelChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='public'>Public Link (Anyone with link)</SelectItem>
                        <SelectItem value='signup_required'>Require Account Signup</SelectItem>
                        <SelectItem value='email_restricted'>
                          Specific Email Addresses Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {sharingSettings.privacyLevel === 'email_restricted' && (
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <Label>Allowed Email Addresses</Label>
                        {clientEmail && !sharingSettings.allowedEmails.includes(clientEmail) && (
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            className='h-7 text-xs'
                            onClick={() => {
                              // Add the currently entered client email to allowed emails
                              setSharingSettings({
                                ...sharingSettings,
                                allowedEmails: [...sharingSettings.allowedEmails, clientEmail],
                              });
                              toast({
                                title: 'Email added',
                                description: `${clientEmail} added to allowed emails`,
                              });
                            }}
                          >
                            Add Client Email
                          </Button>
                        )}
                      </div>
                      <div className='flex space-x-2'>
                        <Input
                          placeholder='client@example.com'
                          value={allowedEmailInput}
                          onChange={(e) => {
                            return setAllowedEmailInput(e.target.value);
                          }}
                          onKeyDown={handleAllowedEmailKeyDown}
                        />
                        <Button
                          type='button'
                          variant='secondary'
                          onClick={addAllowedEmail}
                          className='shrink-0'
                        >
                          Add
                        </Button>
                      </div>
                      <div className='mt-2 space-y-1'>
                        {sharingSettings.allowedEmails.length === 0 ? (
                          <p className='text-xs text-muted-foreground py-2'>
                            No email addresses added yet. Portal will not be accessible.
                          </p>
                        ) : (
                          <div className='bg-muted/50 rounded-md p-1 max-h-28 overflow-y-auto'>
                            {sharingSettings.allowedEmails.map((email, index) => {
                              return (
                                <div
                                  key={index}
                                  className='flex items-center justify-between py-1 px-2 text-sm bg-background/50 rounded my-1'
                                >
                                  <span className='truncate'>{email}</span>
                                  <Button
                                    size='sm'
                                    variant='ghost'
                                    className='h-7 w-7 p-0'
                                    onClick={() => {
                                      return removeAllowedEmail(email);
                                    }}
                                  >
                                    <X className='h-3.5 w-3.5' />
                                    <span className='sr-only'>Remove</span>
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label>Password Protection</Label>
                      <p className='text-xs text-muted-foreground'>
                        Require a password to access the portal
                      </p>
                    </div>
                    <Switch
                      checked={sharingSettings.requirePassword}
                      onCheckedChange={(checked) => {
                        return handleSharingSettingsChange('requirePassword', checked);
                      }}
                    />
                  </div>

                  {sharingSettings.requirePassword && (
                    <div className='space-y-1.5'>
                      <Label htmlFor='portal-password'>Portal Password</Label>
                      <Input
                        id='portal-password'
                        type='password'
                        placeholder='Enter a secure password'
                        value={sharingSettings.password}
                        onChange={(e) => {
                          return handleSharingSettingsChange('password', e.target.value);
                        }}
                      />
                    </div>
                  )}

                  <div className='space-y-1.5'>
                    <Label>Link Expiration</Label>
                    <Select
                      value={sharingSettings.expirationDays}
                      onValueChange={(value) => {
                        return handleSharingSettingsChange('expirationDays', value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='7'>7 days</SelectItem>
                        <SelectItem value='30'>30 days</SelectItem>
                        <SelectItem value='90'>90 days</SelectItem>
                        <SelectItem value='never'>Never expires</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between'>
                      <Label>Team Members with Access</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant='outline' size='sm' className='h-8'>
                            <PlusCircle className='h-3.5 w-3.5 mr-1' />
                            Add
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-60 p-0'>
                          <div className='p-2'>
                            <div className='space-y-2'>
                              {['Jane Cooper', 'Wade Warren', 'Robert Fox'].map((name, i) => {
                                return (
                                  <div key={i} className='flex items-center space-x-2'>
                                    <Checkbox id={`member-${i}`} />
                                    <Label htmlFor={`member-${i}`}>{name}</Label>
                                  </div>
                                );
                              })}
                            </div>
                            <Button size='sm' className='w-full mt-2'>
                              Add Selected
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className='bg-gray-50 rounded-md p-1'>
                      {sharingSettings.teamMembers.length === 0 ? (
                        <p className='text-xs text-muted-foreground py-2 px-2'>
                          No team members added yet
                        </p>
                      ) : (
                        <div className='space-y-1'>{/* Would render team members here */}</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className='mt-4'>
              <Button
                variant='outline'
                onClick={() => {
                  return setIsClientPortalDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={sendClientPortalEmail}>
                <Mail className='mr-2 h-4 w-4' />
                Send Portal Link
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
