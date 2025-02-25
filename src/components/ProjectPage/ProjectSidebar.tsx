'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { Progress } from '@/components/ui/progress';
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

import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Copy,
  Link as LinkIcon,
  Lock,
  Mail,
  PlusCircle,
  Settings,
  Share2,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function ProjectSidebar({ project, onUpdateProject }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isClientPortalDialogOpen, setIsClientPortalDialogOpen] = useState(false);
  const [sharingSettings, setSharingSettings] = useState({
    privacyLevel: 'signup_required',
    requirePassword: false,
    password: '',
    teamMembers: [],
    customMessage: '',
    expirationDays: '30',
    allowedEmails: [],
  });
  const [clientEmail, setClientEmail] = useState('');
  const [allowedEmailInput, setAllowedEmailInput] = useState('');
  const portalURL = `https://pulse.example.com/client/${project?.id || 'project-id'}`;

  const handleStageChange = async (value) => {
    await onUpdateProject?.({ stage: value });
  };

  const handleLeadSourceChange = async (value) => {
    await onUpdateProject?.({ leadSource: value });
  };

  const addTask = (title) => {
    setTasks([...tasks, { id: Date.now(), title, completed: false }]);
  };

  const addTimeEntry = (description, duration) => {
    setTimeEntries([...timeEntries, { id: Date.now(), description, duration }]);
  };

  const handleSharingSettingsChange = (key, value) => {
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

  const removeAllowedEmail = (email) => {
    setSharingSettings({
      ...sharingSettings,
      allowedEmails: sharingSettings.allowedEmails.filter((e) => e !== email),
    });
  };

  const handleAllowedEmailKeyDown = (e) => {
    // Allow adding email with Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllowedEmail();
    }
  };

  // Function to handle the privacy level change
  const handlePrivacyLevelChange = (value) => {
    handleSharingSettingsChange('privacyLevel', value);

    // Clear allowed emails when changing from email_restricted to another mode
    if (value !== 'email_restricted') {
      setSharingSettings((prev) => ({
        ...prev,
        privacyLevel: value,
        allowedEmails: [],
      }));
    }
  };

  return (
    <div className='w-full max-w-full md:w-80 space-y-6 overflow-hidden'>
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
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email-message'>Message (Optional)</Label>
                  <Textarea
                    id='email-message'
                    placeholder='Add a personal message to your client...'
                    rows={3}
                    value={sharingSettings.customMessage}
                    onChange={(e) => handleSharingSettingsChange('customMessage', e.target.value)}
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
                          onChange={(e) => setAllowedEmailInput(e.target.value)}
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
                            {sharingSettings.allowedEmails.map((email, index) => (
                              <div
                                key={index}
                                className='flex items-center justify-between py-1 px-2 text-sm bg-background/50 rounded my-1'
                              >
                                <span className='truncate'>{email}</span>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  className='h-7 w-7 p-0'
                                  onClick={() => removeAllowedEmail(email)}
                                >
                                  <X className='h-3.5 w-3.5' />
                                  <span className='sr-only'>Remove</span>
                                </Button>
                              </div>
                            ))}
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
                      onCheckedChange={(checked) =>
                        handleSharingSettingsChange('requirePassword', checked)
                      }
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
                        onChange={(e) => handleSharingSettingsChange('password', e.target.value)}
                      />
                    </div>
                  )}

                  <div className='space-y-1.5'>
                    <Label>Link Expiration</Label>
                    <Select
                      value={sharingSettings.expirationDays}
                      onValueChange={(value) =>
                        handleSharingSettingsChange('expirationDays', value)
                      }
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
                              {['Jane Cooper', 'Wade Warren', 'Robert Fox'].map((name, i) => (
                                <div key={i} className='flex items-center space-x-2'>
                                  <Checkbox id={`member-${i}`} />
                                  <Label htmlFor={`member-${i}`}>{name}</Label>
                                </div>
                              ))}
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
              <Button variant='outline' onClick={() => setIsClientPortalDialogOpen(false)}>
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
          <Select defaultValue={project?.stage ?? 'FOLLOW_UP'} onValueChange={handleStageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='FOLLOW_UP'>Follow Up</SelectItem>
              <SelectItem value='BOOKED'>Booked</SelectItem>
              <SelectItem value='COMPLETED'>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Lead Source</label>
          <Select
            defaultValue={project?.leadSource ?? 'INSTAGRAM'}
            onValueChange={handleLeadSourceChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='INSTAGRAM'>Instagram</SelectItem>
              <SelectItem value='REFERRAL'>Referral</SelectItem>
              <SelectItem value='WEBSITE'>Website</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='tasks'>
            <AccordionTrigger>Tasks</AccordionTrigger>
            <AccordionContent>
              {tasks.map((task) => (
                <div key={task.id} className='flex items-center space-x-2'>
                  <Checkbox id={`task-${task.id}`} checked={task.completed} />
                  <Label htmlFor={`task-${task.id}`}>{task.title}</Label>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' className='w-full mt-2'>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const title = (e.target as HTMLFormElement).taskTitle.value;
                      addTask(title);
                    }}
                  >
                    <Input id='taskTitle' placeholder='Task title' />
                    <Button type='submit' className='mt-2'>
                      Add Task
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='time-tracker'>
            <AccordionTrigger>Time Tracker</AccordionTrigger>
            <AccordionContent>
              {timeEntries.map((entry) => (
                <div key={entry.id} className='flex justify-between items-center'>
                  <span>{entry.description}</span>
                  <span>{entry.duration}</span>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' className='w-full mt-2'>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    Add Time Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Time Entry</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const description = (e.target as HTMLFormElement).description.value;
                      const duration = (e.target as HTMLFormElement).duration.value;
                      addTimeEntry(description, duration);
                    }}
                  >
                    <Input id='description' placeholder='Description' className='mb-2' />
                    <Input id='duration' placeholder='Duration (e.g., 2h 30m)' />
                    <Button type='submit' className='mt-2'>
                      Add Entry
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='notes'>
            <AccordionTrigger>Notes</AccordionTrigger>
            <AccordionContent>
              <textarea
                className='w-full p-2 border rounded'
                rows={4}
                placeholder='Add your notes here...'
              ></textarea>
              <Button className='w-full mt-2'>Save Notes</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className='rounded-lg border p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              <span className='font-medium'>Workflow</span>
            </div>
            <div className='space-x-2'>
              <Button variant='link' className='h-auto p-0 text-[#5DD3D1] hover:text-[#4CC3C1]'>
                FULL VIEW
              </Button>
              <Button variant='link' className='h-auto p-0 text-[#5DD3D1] hover:text-[#4CC3C1]'>
                REMOVE
              </Button>
            </div>
          </div>
          <div className='mt-4 space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Progress</span>
              <span>75%</span>
            </div>
            <Progress value={75} className='h-2' />
          </div>
          <div className='mt-4'>
            <p className='text-sm font-medium'>Current Step: Final Review</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Reviewing final deliverables before client presentation
            </p>
          </div>
        </div>

        <Button
          variant='outline'
          className='w-full justify-between'
          onClick={() => setIsExpanded(!isExpanded)}
        >
          MORE OPTIONS
          <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
        </Button>
      </div>
    </div>
  );
}
