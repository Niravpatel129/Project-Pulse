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
import { useEffect, useState } from 'react';

// Define the automation types
type AutomationType = 'send_email' | 'create_project' | 'assign_project_manager';

// Define the automation interface
interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  enabled: boolean;
  config?: Record<string, any>;
}

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation?: Automation;
  onSave: (automation: Automation) => void;
  generateId: () => string;
}

export function AutomationDialog({
  open,
  onOpenChange,
  automation,
  onSave,
  generateId,
}: AutomationDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AutomationType>('send_email');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('general');

  // Set initial values when editing an existing automation
  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setType(automation.type);
      setConfig(automation.config || {});
      // When editing an existing automation, set the active tab to configuration
      setActiveTab('config');
    } else {
      // Default values for new automation
      setName('New Automation');
      setType('send_email');
      setConfig({});
      // When creating a new automation, start with general tab
      setActiveTab('general');
    }
  }, [automation, open]);

  const handleSave = () => {
    const newAutomation: Automation = {
      id: automation?.id || generateId(),
      name,
      type,
      enabled: automation?.enabled ?? true,
      config,
    };

    onSave(newAutomation);
    onOpenChange(false);
  };

  // Different config forms based on automation type
  const renderConfigFields = () => {
    switch (type) {
      case 'send_email':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email-subject'>Email Subject</Label>
              <Input
                id='email-subject'
                value={config.subject || ''}
                onChange={(e) => {
                  return setConfig({ ...config, subject: e.target.value });
                }}
                placeholder='Enter email subject'
              />
              <p className='text-xs text-gray-500'>
                You can use {'{client_name}'} and {'{project_name}'} as variables
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email-body'>Email Content</Label>
              <Textarea
                id='email-body'
                value={config.body || ''}
                onChange={(e) => {
                  return setConfig({ ...config, body: e.target.value });
                }}
                placeholder='Enter email content'
                rows={6}
              />
              <div className='flex flex-wrap gap-2 mt-2'>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.body?.substring(0, cursorPos) || '';
                    const textAfter = config.body?.substring(cursorPos) || '';
                    const newText = textBefore + '{{client_name}}' + textAfter;
                    setConfig({ ...config, body: newText });
                  }}
                >
                  Client Name
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.body?.substring(0, cursorPos) || '';
                    const textAfter = config.body?.substring(cursorPos) || '';
                    const newText = textBefore + '{{project_name}}' + textAfter;
                    setConfig({ ...config, body: newText });
                  }}
                >
                  Project Name
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.body?.substring(0, cursorPos) || '';
                    const textAfter = config.body?.substring(cursorPos) || '';
                    const newText = textBefore + '{{project_link}}' + textAfter;
                    setConfig({ ...config, body: newText });
                  }}
                >
                  Project Link
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById('email-body') as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.body?.substring(0, cursorPos) || '';
                    const textAfter = config.body?.substring(cursorPos) || '';
                    const newText = textBefore + '{{submission_date}}' + textAfter;
                    setConfig({ ...config, body: newText });
                  }}
                >
                  Submission Date
                </Button>
              </div>
            </div>

            <div className='flex items-center space-x-2 pt-2'>
              <Checkbox
                id='cc-team'
                checked={config.ccTeam || false}
                onCheckedChange={(checked) => {
                  return setConfig({ ...config, ccTeam: checked === true });
                }}
              />
              <Label htmlFor='cc-team'>CC team members on this email</Label>
            </div>
          </div>
        );

      case 'create_project':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='project-name-template'>Project Name Template</Label>
              <Input
                id='project-name-template'
                value={config.projectNameTemplate || 'Form Submission - {submission_date}'}
                onChange={(e) => {
                  return setConfig({ ...config, projectNameTemplate: e.target.value });
                }}
                placeholder='Enter project name template'
              />
              <p className='text-xs text-gray-500'>
                You can use {'{client_name}'}, {'{submission_date}'}, and {'{form_title}'} as
                variables
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='project-description'>Project Description</Label>
              <Textarea
                id='project-description'
                value={config.description || ''}
                onChange={(e) => {
                  return setConfig({ ...config, description: e.target.value });
                }}
                placeholder='Enter project description'
                rows={4}
              />
              <div className='flex flex-wrap gap-2 mt-2'>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById(
                      'project-description',
                    ) as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.description?.substring(0, cursorPos) || '';
                    const textAfter = config.description?.substring(cursorPos) || '';
                    const newText = textBefore + '{{client_name}}' + textAfter;
                    setConfig({ ...config, description: newText });
                  }}
                >
                  Client Name
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById(
                      'project-description',
                    ) as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.description?.substring(0, cursorPos) || '';
                    const textAfter = config.description?.substring(cursorPos) || '';
                    const newText = textBefore + '{{form_title}}' + textAfter;
                    setConfig({ ...config, description: newText });
                  }}
                >
                  Form Title
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById(
                      'project-description',
                    ) as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.description?.substring(0, cursorPos) || '';
                    const textAfter = config.description?.substring(cursorPos) || '';
                    const newText = textBefore + '{{submission_date}}' + textAfter;
                    setConfig({ ...config, description: newText });
                  }}
                >
                  Submission Date
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='project-template'>Project Template Content</Label>
              <Textarea
                id='project-template'
                value={config.projectTemplate || ''}
                onChange={(e) => {
                  return setConfig({ ...config, projectTemplate: e.target.value });
                }}
                placeholder='Enter project template content (tasks, milestones, etc.)'
                rows={6}
              />
              <div className='flex flex-wrap gap-2 mt-2'>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById(
                      'project-template',
                    ) as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.projectTemplate?.substring(0, cursorPos) || '';
                    const textAfter = config.projectTemplate?.substring(cursorPos) || '';
                    const newText = textBefore + '{{client_name}}' + textAfter;
                    setConfig({ ...config, projectTemplate: newText });
                  }}
                >
                  Client Name
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById(
                      'project-template',
                    ) as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.projectTemplate?.substring(0, cursorPos) || '';
                    const textAfter = config.projectTemplate?.substring(cursorPos) || '';
                    const newText = textBefore + '{{form_title}}' + textAfter;
                    setConfig({ ...config, projectTemplate: newText });
                  }}
                >
                  Form Title
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  type='button'
                  onClick={() => {
                    const textarea = document.getElementById(
                      'project-template',
                    ) as HTMLTextAreaElement;
                    const cursorPos = textarea.selectionStart;
                    const textBefore = config.projectTemplate?.substring(0, cursorPos) || '';
                    const textAfter = config.projectTemplate?.substring(cursorPos) || '';
                    const newText = textBefore + '{{submission_date}}' + textAfter;
                    setConfig({ ...config, projectTemplate: newText });
                  }}
                >
                  Submission Date
                </Button>
              </div>
              <p className='text-xs text-gray-500'>
                Specify tasks, milestones, and other project structure
              </p>
            </div>
          </div>
        );

      case 'assign_project_manager':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='assignee-type'>Assignment Method</Label>
              <Select
                value={config.assigneeType || 'auto'}
                onValueChange={(value) => {
                  return setConfig({ ...config, assigneeType: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select assignment method' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='auto'>Auto-assign (Round-robin)</SelectItem>
                  <SelectItem value='current-user'>Current User</SelectItem>
                  <SelectItem value='specific'>Specific Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.assigneeType === 'specific' && (
              <div className='space-y-2'>
                <Label htmlFor='specific-assignee'>Team Member</Label>
                <Select
                  value={config.specificAssignee || ''}
                  onValueChange={(value) => {
                    return setConfig({ ...config, specificAssignee: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select team member' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='user1'>John Doe</SelectItem>
                    <SelectItem value='user2'>Jane Smith</SelectItem>
                    <SelectItem value='user3'>Sam Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='flex items-center space-x-2 pt-2'>
              <Checkbox
                id='notify-assignee'
                checked={config.notifyAssignee !== false}
                onCheckedChange={(checked) => {
                  return setConfig({ ...config, notifyAssignee: checked === true });
                }}
              />
              <Label htmlFor='notify-assignee'>Send notification to assignee</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{automation ? 'Edit Automation' : 'Add Automation'}</DialogTitle>
          <DialogDescription>
            Configure an automation that will trigger when the form is submitted.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='mt-4'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='config'>Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='space-y-4 pt-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Automation Name</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => {
                  return setName(e.target.value);
                }}
                placeholder='Enter automation name'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='type'>Automation Type</Label>
              <Select
                value={type}
                onValueChange={(value: AutomationType) => {
                  return setType(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='create_project'>Create Project</SelectItem>
                  <SelectItem value='assign_project_manager'>Assign Project Manager</SelectItem>
                  <SelectItem value='send_email'>Send Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value='config' className='pt-4'>
            {renderConfigFields()}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              return onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Automation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
