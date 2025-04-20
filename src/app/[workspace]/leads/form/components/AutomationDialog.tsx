'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CaretSortIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { useEffect, useRef, useState } from 'react';

// Define the automation types
type AutomationType = 'send_email' | 'create_project' | 'assign_project_manager';

// Helper function to convert field names to variable slugs
const slugifyForVariable = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/-+/g, '_') // Replace hyphens with underscores
    .replace(/^_+/, '') // Trim underscores from start
    .replace(/_+$/, '') // Trim underscores from end
    .replace(/_+/g, '_'); // Replace multiple underscores with single
};

// Define the form element type
type FormElement = {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  clientFields?: {
    email: boolean;
    name: boolean;
    phone: boolean;
    address: boolean;
    company: boolean;
    custom: string[];
  };
  // Other properties not needed for this component
  [key: string]: any;
};

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
  formElements: FormElement[];
}

// Interface for our variable items
interface VariableItem {
  label: string;
  value: string;
  group: string;
  description?: string;
  id?: string;
}

export function AutomationDialog({
  open,
  onOpenChange,
  automation,
  onSave,
  generateId,
  formElements,
}: AutomationDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AutomationType>('send_email');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('general');
  const [variablePopoverOpen, setVariablePopoverOpen] = useState(false);
  const [currentTextareaId, setCurrentTextareaId] = useState<string | null>(null);
  const [variables, setVariables] = useState<VariableItem[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

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

  // Generate variables list based on available form elements
  useEffect(() => {
    const variablesList: VariableItem[] = [
      // System variables
      {
        label: 'Submission Date',
        value: 'submission_date',
        group: 'System',
        description: 'Date when the form was submitted',
      },
      {
        label: 'Form Title',
        value: 'form_title',
        group: 'System',
        description: 'Title of this form',
      },
    ];

    // Project-specific variables
    variablesList.push(
      {
        label: 'Project Name',
        value: 'project_name',
        group: 'Project',
        description: 'Name of the created project',
      },
      {
        label: 'Project Link',
        value: 'project_link',
        group: 'Project',
        description: 'Link to access the project',
      },
    );

    // Client details variables
    const clientDetailsElement = formElements.find((element) => {
      return element.type === 'Client Details';
    });
    if (clientDetailsElement && clientDetailsElement.clientFields) {
      const clientFields = clientDetailsElement.clientFields;

      if (clientFields.name) {
        variablesList.push({
          label: 'Client Name',
          value: 'client_name',
          group: 'Client',
          description: 'Full name of the client',
        });
      }

      if (clientFields.email) {
        variablesList.push({
          label: 'Client Email',
          value: 'client_email',
          group: 'Client',
          description: 'Email address of the client',
        });
      }

      if (clientFields.phone) {
        variablesList.push({
          label: 'Client Phone',
          value: 'client_phone',
          group: 'Client',
          description: 'Phone number of the client',
        });
      }

      if (clientFields.company) {
        variablesList.push({
          label: 'Client Company',
          value: 'client_company',
          group: 'Client',
          description: 'Company name of the client',
        });
      }

      if (clientFields.address) {
        variablesList.push({
          label: 'Client Address',
          value: 'client_address',
          group: 'Client',
          description: 'Address of the client',
        });
      }

      // Add custom client fields to variables list
      if (clientFields.custom && clientFields.custom.length > 0) {
        clientFields.custom.forEach((field) => {
          const varName = slugifyForVariable(field);
          variablesList.push({
            label: field,
            value: varName,
            group: 'Client',
            description: `Custom client field: ${field}`,
          });
        });
      }
    }

    // Create a mapping of variable names to field IDs
    const mappings: Record<string, string> = {};

    // Form field variables
    formElements
      .filter((element) => {
        return element.type !== 'Client Details';
      })
      .forEach((element) => {
        // Create a readable variable name from the field title
        let variableName = slugifyForVariable(element.title);

        // Ensure uniqueness by adding the element ID if the name already exists
        if (mappings[variableName]) {
          // If we already have this variable name, append a suffix to make it unique
          let counter = 1;
          let uniqueVariableName;
          do {
            uniqueVariableName = `${variableName}_${counter}`;
            counter++;
          } while (mappings[uniqueVariableName]);

          variableName = uniqueVariableName;
        }

        // Store the mapping
        mappings[variableName] = element.id;

        variablesList.push({
          label: element.title,
          value: variableName,
          group: 'Form Fields',
          description: `${element.type} field${
            element.description ? `: ${element.description}` : ''
          }`,
          id: element.id, // Store original ID for proper identification
        });
      });

    setVariables(variablesList);
    setFieldMappings(mappings);
  }, [formElements]);

  const handleSave = () => {
    const newAutomation: Automation = {
      id: automation?.id || generateId(),
      name,
      type,
      enabled: automation?.enabled ?? true,
      config: {
        ...config,
        // Store the field mappings in the config so we can find the actual fields later
        fieldMappings,
      },
    };

    onSave(newAutomation);
    onOpenChange(false);
  };

  // Function to insert variable into a field
  const insertVariable = (fieldId: string, variable: string) => {
    const textarea = textareaRefs.current[fieldId];
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value?.substring(0, cursorPos) || '';
    const textAfter = textarea.value?.substring(cursorPos) || '';
    const newText = textBefore + `{{${variable}}}` + textAfter;

    // Update the correct config field based on fieldId
    if (fieldId === 'email-body') {
      setConfig({ ...config, body: newText });
    } else if (fieldId === 'project-description') {
      setConfig({ ...config, description: newText });
    } else if (fieldId === 'email-subject') {
      setConfig({ ...config, subject: newText });
    } else if (fieldId === 'project-name-template') {
      setConfig({ ...config, projectNameTemplate: newText });
    }

    // After inserting, focus the textarea and set cursor position after the inserted variable
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newCursorPosition = cursorPos + variable.length + 4; // +4 for the "{{" and "}}"
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  // Function to handle variable selection
  const handleVariableSelect = (value: string) => {
    if (currentTextareaId) {
      insertVariable(currentTextareaId, value);
      setVariablePopoverOpen(false);
    }
  };

  // Variable selector component
  const VariableSelector = ({ fieldId }: { fieldId: string }) => {
    return (
      <div className='flex items-center'>
        <Popover
          modal
          open={variablePopoverOpen && currentTextareaId === fieldId}
          onOpenChange={(open) => {
            setVariablePopoverOpen(open);
            if (open) setCurrentTextareaId(fieldId);
          }}
        >
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm' className='h-8 gap-1 border-dashed'>
              <PlusCircledIcon className='h-3.5 w-3.5' />
              <span>Insert Variable</span>
              <CaretSortIcon className='h-3.5 w-3.5 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[300px] p-0' align='start'>
            <Command>
              <CommandInput placeholder='Search variables...' />
              <CommandList>
                <CommandEmpty>No variables found.</CommandEmpty>
                {['System', 'Project', 'Client', 'Form Fields'].map((group) => {
                  const groupVariables = variables.filter((v) => {
                    return v.group === group;
                  });
                  if (groupVariables.length === 0) return null;

                  return (
                    <CommandGroup key={group} heading={group}>
                      {groupVariables.map((variable) => {
                        return (
                          <CommandItem
                            key={`${variable.group}-${variable.value}-${variable.id || ''}`}
                            value={variable.value}
                            onSelect={handleVariableSelect}
                            className='flex flex-col items-start'
                          >
                            <div className='flex w-full justify-between'>
                              <span>{variable.label}</span>
                              <Badge variant='outline' className='ml-2 text-xs'>
                                {`{{${variable.value}}}`}
                              </Badge>
                            </div>
                            {variable.description && (
                              <span className='text-xs text-muted-foreground mt-0.5'>
                                {variable.description}
                              </span>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                })}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Function to create a textarea with variable support
  const createVariableTextarea = ({
    id,
    value,
    onChange,
    placeholder,
    rows = 4,
  }: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    rows?: number;
  }) => {
    return (
      <div className='space-y-2'>
        <div className='flex justify-between items-center'>
          <Label htmlFor={id} className='text-sm font-medium'>
            {id === 'email-subject'
              ? 'Email Subject'
              : id === 'email-body'
              ? 'Email Content'
              : id === 'project-name-template'
              ? 'Project Name Template'
              : id === 'project-description'
              ? 'Project Description'
              : 'Content'}
          </Label>
          <VariableSelector fieldId={id} />
        </div>
        <Textarea
          id={id}
          ref={(el) => {
            textareaRefs.current[id] = el;
            return null;
          }}
          value={value}
          onChange={(e) => {
            return onChange(e.target.value);
          }}
          placeholder={placeholder}
          rows={rows}
          className='font-mono text-sm'
        />
        <p className='text-xs text-muted-foreground'>
          Use <code className='bg-muted px-1 py-0.5 rounded'>{'{{variable}}'}</code> syntax to
          insert dynamic content.
        </p>
      </div>
    );
  };

  // Function to generate a default project description using all form fields
  const generateDefaultProjectDescription = () => {
    let description = 'Form submission details:\n\n';

    // Add client details if available
    const clientDetailsElement = formElements.find((element) => {
      return element.type === 'Client Details';
    });
    if (clientDetailsElement && clientDetailsElement.clientFields) {
      const clientFields = clientDetailsElement.clientFields;
      description += '## Client Information\n';
      if (clientFields.name) description += '- Name: {{client_name}}\n';
      if (clientFields.email) description += '- Email: {{client_email}}\n';
      if (clientFields.phone) description += '- Phone: {{client_phone}}\n';
      if (clientFields.company) description += '- Company: {{client_company}}\n';
      if (clientFields.address) description += '- Address: {{client_address}}\n';

      if (clientFields.custom && clientFields.custom.length > 0) {
        clientFields.custom.forEach((field) => {
          const varName = slugifyForVariable(field);
          description += `- ${field}: {{${varName}}}\n`;
        });
      }
      description += '\n';
    }

    // Add all other form fields
    description += '## Form Responses\n';
    formElements
      .filter((element) => {
        return element.type !== 'Client Details';
      })
      .sort((a, b) => {
        return a.order - b.order;
      })
      .forEach((element) => {
        const variableName = Object.keys(fieldMappings).find((key) => {
          return fieldMappings[key] === element.id;
        });
        if (variableName) {
          description += `- ${element.title}: {{${variableName}}}\n`;
        }
      });

    description += '\nSubmission Date: {{submission_date}}';

    return description;
  };

  // Different config forms based on automation type
  const renderConfigFields = () => {
    switch (type) {
      case 'send_email':
        return (
          <div className='space-y-6'>
            {createVariableTextarea({
              id: 'email-subject',
              value: config.subject || '',
              onChange: (value) => {
                return setConfig({ ...config, subject: value });
              },
              placeholder: 'Enter email subject, e.g. "Your project has been created!"',
            })}

            {createVariableTextarea({
              id: 'email-body',
              value: config.body || '',
              onChange: (value) => {
                return setConfig({ ...config, body: value });
              },
              placeholder: 'Enter email content. You can use variables like {{client_name}}.',
              rows: 8,
            })}

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
          <div className='space-y-6'>
            {createVariableTextarea({
              id: 'project-name-template',
              value: config.projectNameTemplate || 'Form Submission - {{submission_date}}',
              onChange: (value) => {
                return setConfig({ ...config, projectNameTemplate: value });
              },
              placeholder: 'Enter project name template',
              rows: 1,
            })}

            {createVariableTextarea({
              id: 'project-description',
              value: config.description || generateDefaultProjectDescription(),
              onChange: (value) => {
                return setConfig({ ...config, description: value });
              },
              placeholder: 'Enter project description',
              rows: 6,
            })}
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
      <DialogContent className='sm:max-w-[600px]'>
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
            {type === 'send_email' && (
              <div className='mb-4 px-2'>
                <p className='text-sm text-muted-foreground mb-1'>
                  <strong>Pro tip:</strong> Email templates will be sent to the client&apos;s email
                  address captured in the form.
                </p>
              </div>
            )}
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
