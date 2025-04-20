'use client';

import { Button } from '@/components/ui/button';
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
import { useEffect, useState } from 'react';

// Define the automation types
type AutomationType = 'send_email' | 'create_task' | 'custom_workflow';

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
    } else {
      // Default values for new automation
      setName('New Automation');
      setType('send_email');
      setConfig({});
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
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email-template'>Email Template</Label>
              <Select
                value={config.template || 'default'}
                onValueChange={(value) => {
                  return setConfig({ ...config, template: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select template' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='default'>Default Template</SelectItem>
                  <SelectItem value='welcome'>Welcome Email</SelectItem>
                  <SelectItem value='onboarding'>Onboarding Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'create_task':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='task-title'>Task Title</Label>
              <Input
                id='task-title'
                value={config.title || ''}
                onChange={(e) => {
                  return setConfig({ ...config, title: e.target.value });
                }}
                placeholder='Enter task title'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='task-assignee'>Assignee</Label>
              <Select
                value={config.assignee || 'auto'}
                onValueChange={(value) => {
                  return setConfig({ ...config, assignee: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select assignee' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='auto'>Auto-assign</SelectItem>
                  <SelectItem value='current-user'>Current User</SelectItem>
                  <SelectItem value='team-lead'>Team Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'custom_workflow':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='workflow-name'>Workflow Name</Label>
              <Input
                id='workflow-name'
                value={config.workflowName || ''}
                onChange={(e) => {
                  return setConfig({ ...config, workflowName: e.target.value });
                }}
                placeholder='Enter workflow name'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='workflow-description'>Description</Label>
              <Input
                id='workflow-description'
                value={config.description || ''}
                onChange={(e) => {
                  return setConfig({ ...config, description: e.target.value });
                }}
                placeholder='Enter description'
              />
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
                  <SelectItem value='send_email'>Send Email</SelectItem>
                  <SelectItem value='create_task'>Create Task</SelectItem>
                  <SelectItem value='custom_workflow'>Custom Workflow</SelectItem>
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
