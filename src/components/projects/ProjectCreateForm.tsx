'use client';

import { Template } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTemplates } from '@/contexts/TemplatesContext';
import { newRequest } from '@/utils/newRequest';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import NewProjectDialog from '../ProjectPage/NewProjectDialog/NewProjectDialog';

// Types
interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  jobTitle?: string;
  mailingAddress?: string;
  comments?: string;
  customFields?: Record<string, string>;
}

interface CustomField {
  id: string;
  name: string;
  value: string;
}

// Form Schemas
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  type: z.string().min(1, 'Project type is required'),
  leadSource: z.string().min(1, 'Lead source is required'),
  stage: z.string().default('Initial Contact'),
  templateId: z.string().optional(),
});

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  jobTitle: z.string().optional(),
  mailingAddress: z.string().optional(),
  comments: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type ClientFormData = z.infer<typeof clientSchema>;

// Custom Field Component
const CustomFieldInput = ({
  field,
  onUpdate,
  onRemove,
}: {
  field: CustomField;
  onUpdate: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className='flex gap-2 items-start'>
      <div className='flex-1'>
        <Label>{field.name}</Label>
        <Input
          value={field.value}
          onChange={(e) => {
            return onUpdate(field.id, e.target.value);
          }}
          placeholder={`Enter ${field.name}`}
        />
      </div>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={() => {
          return onRemove(field.id);
        }}
        className='mt-6'
        aria-label={`Remove ${field.name} field`}
      >
        <X className='h-4 w-4' />
      </Button>
    </div>
  );
};

// Project Form Step Component
const ProjectFormStep = ({ control, errors }: { control: any; errors: any }) => {
  return (
    <div className='space-y-4'>
      <div className='grid gap-2'>
        <Label htmlFor='name'>Project Name</Label>
        <Controller
          name='name'
          control={control}
          render={({ field }) => {
            return (
              <Input
                {...field}
                id='name'
                placeholder='Enter project name'
                aria-invalid={errors.name ? 'true' : 'false'}
              />
            );
          }}
        />
        {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='type'>Project Type</Label>
        <Controller
          name='type'
          control={control}
          render={({ field }) => {
            return (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id='type'>
                  <SelectValue placeholder='Select project type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Development'>Development</SelectItem>
                  <SelectItem value='Design'>Design</SelectItem>
                  <SelectItem value='Research'>Research</SelectItem>
                  <SelectItem value='Marketing'>Marketing</SelectItem>
                  <SelectItem value='Consulting'>Consulting</SelectItem>
                  <SelectItem value='Other'>Other</SelectItem>
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.type && <p className='text-sm text-red-500'>{errors.type.message}</p>}
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='leadSource'>Lead Source</Label>
        <Controller
          name='leadSource'
          control={control}
          render={({ field }) => {
            return (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id='leadSource'>
                  <SelectValue placeholder='Select lead source' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Website'>Website</SelectItem>
                  <SelectItem value='Referral'>Referral</SelectItem>
                  <SelectItem value='Social Media'>Social Media</SelectItem>
                  <SelectItem value='Email Campaign'>Email Campaign</SelectItem>
                  <SelectItem value='Conference'>Conference</SelectItem>
                  <SelectItem value='Direct Contact'>Direct Contact</SelectItem>
                  <SelectItem value='Other'>Other</SelectItem>
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.leadSource && <p className='text-sm text-red-500'>{errors.leadSource.message}</p>}
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='stage'>Project Stage</Label>
        <Controller
          name='stage'
          control={control}
          render={({ field }) => {
            return (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id='stage'>
                  <SelectValue placeholder='Select project stage' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Initial Contact'>Initial Contact</SelectItem>
                  <SelectItem value='Needs Analysis'>Needs Analysis</SelectItem>
                  <SelectItem value='Proposal'>Proposal</SelectItem>
                  <SelectItem value='Negotiation'>Negotiation</SelectItem>
                  <SelectItem value='Closed Won'>Closed Won</SelectItem>
                  <SelectItem value='Closed Lost'>Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            );
          }}
        />
      </div>
    </div>
  );
};

export function ProjectCreateForm({
  setIsNewProjectDialogOpen,
  isNewProjectDialogOpen,
}: {
  setIsNewProjectDialogOpen: (isOpen: boolean) => void;
  isNewProjectDialogOpen: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [clientTab, setClientTab] = useState('new');
  const [existingClients, setExistingClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const { templates: existingTemplates, loadTemplates, createTemplate } = useTemplates();
  const [templates, setTemplates] = useState<Template[]>(existingTemplates);
  const [templateTab, setTemplateTab] = useState<'select' | 'create'>('select');

  const queryClient = useQueryClient();

  const {
    control: projectControl,
    handleSubmit: handleProjectSubmit,
    formState: { errors: projectErrors },
    reset: resetProjectForm,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      type: '',
      leadSource: '',
      stage: 'Initial Contact',
    },
  });

  const {
    control: clientControl,
    handleSubmit: handleClientSubmit,
    formState: { errors: clientErrors },
    reset: resetClientForm,
    watch: watchClient,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      website: '',
      jobTitle: '',
      mailingAddress: '',
      comments: '',
    },
  });

  const addCustomField = () => {
    if (newFieldName.trim()) {
      setCustomFields([
        ...customFields,
        { id: `field-${Date.now()}`, name: newFieldName, value: '' },
      ]);
      setNewFieldName('');
    }
  };

  const updateCustomField = (id: string, value: string) => {
    setCustomFields(
      customFields.map((field) => {
        return field.id === id ? { ...field, value } : field;
      }),
    );
  };

  const removeCustomField = (id: string) => {
    setCustomFields(
      customFields.filter((field) => {
        return field.id !== id;
      }),
    );
  };

  const handleCreateClient = async (data: ClientFormData) => {
    try {
      const customFieldsObj = customFields.reduce((acc, field) => {
        return {
          ...acc,
          [field.name]: field.value,
        };
      }, {});

      const clientData = {
        ...data,
        customFields: customFieldsObj,
      };

      const response = await newRequest.post<{ data: Client }>('/clients', clientData);
      const savedClient = response.data.data;
      setSelectedClient(savedClient);
      return savedClient;
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client');
      throw error;
    }
  };

  const loadExistingClients = async () => {
    setIsLoadingClients(true);
    try {
      const response = await newRequest.get<{ data: Client[] }>('/clients');
      setExistingClients(response.data.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoadingClients(false);
    }
  };

  const loadExistingTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      await loadTemplates();
      setTemplates(existingTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleSelectExistingClient = (client: Client) => {
    setSelectedClient(client);
  };

  const onSubmit = async (projectData: ProjectFormData) => {
    setIsSubmitting(true);

    try {
      let clientToAttach = selectedClient;

      if (!clientToAttach) {
        const clientData = watchClient();
        if (clientData.name && clientData.email) {
          clientToAttach = await handleCreateClient(clientData);
        }
      }

      if (!clientToAttach) {
        toast.error('Please add or select a client');
        setIsSubmitting(false);
        return;
      }

      const projectResponse = await newRequest.post<{ data: { _id: number } }>('/projects', {
        ...projectData,
        templateId: selectedTemplate?._id,
      });
      const projectId = projectResponse.data.data._id;

      await newRequest.post(`/projects/${projectId}/clients`, {
        clientId: clientToAttach._id,
      });

      await queryClient.invalidateQueries({ queryKey: ['projects'] });

      toast.success('Project created successfully');
      setIsNewProjectDialogOpen(false);

      // Reset forms
      resetProjectForm();
      resetClientForm();
      setSelectedClient(null);
      setCustomFields([]);
      setCurrentStep(1);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Button
        onClick={() => {
          return setIsNewProjectDialogOpen(true);
        }}
        variant='outline'
      >
        New Project
      </Button>
      <NewProjectDialog
        open={isNewProjectDialogOpen}
        onClose={() => {
          return setIsNewProjectDialogOpen(false);
        }}
      />
    </div>
  );
}
