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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useTemplates } from '@/contexts/TemplatesContext';
import { newRequest } from '@/utils/newRequest';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, PlusCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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

export function ProjectCreateForm() {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Project
        </Button>
      </SheetTrigger>
      <SheetContent className='w-full sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>
            Follow these steps to create a well-structured project. Each step helps ensure your
            project is properly organized and tracked.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleProjectSubmit(onSubmit)} className='space-y-6 py-4'>
          <AnimatePresence mode='wait'>
            {currentStep === 1 ? (
              <motion.div
                key='step1'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='space-y-6'
              >
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>Step 1: Project Setup</h3>
                  <p className='text-sm text-muted-foreground'>
                    Start by defining the basic information about your project. This helps you and
                    your team understand the project&apos;s purpose, scope, and current status.
                  </p>
                </div>

                <ProjectFormStep control={projectControl} errors={projectErrors} />

                <div className='flex justify-end gap-4 mt-6'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      return setIsOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='button'
                    onClick={() => {
                      setCurrentStep(2);
                      loadExistingClients();
                    }}
                  >
                    Next: Add Client
                    <ChevronRight className='ml-2 h-4 w-4' />
                  </Button>
                </div>
              </motion.div>
            ) : currentStep === 2 ? (
              <motion.div
                key='step2'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='space-y-6'
              >
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>Step 2: Client Information</h3>
                  <p className='text-sm text-muted-foreground'>
                    Add your client&apos;s details to keep track of who you&apos;re working with.
                    This information helps with communication, invoicing, and maintaining a record
                    of your client relationships.
                  </p>
                </div>

                <div className='space-y-4'>
                  {selectedClient ? (
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between p-3 border rounded-md'>
                        <div>
                          <p className='font-medium'>{selectedClient.name}</p>
                          <p className='text-sm text-muted-foreground'>{selectedClient.email}</p>
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            return setSelectedClient(null);
                          }}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Tabs defaultValue='new' value={clientTab} onValueChange={setClientTab}>
                      <TabsList className='grid w-full grid-cols-2 mb-4'>
                        <TabsTrigger value='new'>Add New Client</TabsTrigger>
                        <TabsTrigger value='existing'>Select Existing</TabsTrigger>
                      </TabsList>

                      <TabsContent value='new' className='space-y-4'>
                        <div className='grid gap-2'>
                          <Label htmlFor='clientName'>Name*</Label>
                          <Controller
                            name='name'
                            control={clientControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='clientName'
                                  placeholder='Enter client name'
                                  aria-invalid={clientErrors.name ? 'true' : 'false'}
                                />
                              );
                            }}
                          />
                          {clientErrors.name && (
                            <p className='text-sm text-red-500'>{clientErrors.name.message}</p>
                          )}
                        </div>

                        <div className='grid gap-2'>
                          <Label htmlFor='clientEmail'>Email*</Label>
                          <Controller
                            name='email'
                            control={clientControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='clientEmail'
                                  type='email'
                                  placeholder='Enter client email'
                                  aria-invalid={clientErrors.email ? 'true' : 'false'}
                                />
                              );
                            }}
                          />
                          {clientErrors.email && (
                            <p className='text-sm text-red-500'>{clientErrors.email.message}</p>
                          )}
                        </div>

                        <div className='grid gap-2'>
                          <Label htmlFor='clientPhone'>Phone</Label>
                          <Controller
                            name='phone'
                            control={clientControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='clientPhone'
                                  placeholder='Enter client phone'
                                />
                              );
                            }}
                          />
                        </div>

                        <div className='grid gap-2'>
                          <Label htmlFor='clientJobTitle'>Job Title</Label>
                          <Controller
                            name='jobTitle'
                            control={clientControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='clientJobTitle'
                                  placeholder='Enter job title'
                                />
                              );
                            }}
                          />
                        </div>

                        <div className='grid gap-2'>
                          <Label htmlFor='clientWebsite'>Website</Label>
                          <Controller
                            name='website'
                            control={clientControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='clientWebsite'
                                  placeholder='Enter website'
                                  aria-invalid={clientErrors.website ? 'true' : 'false'}
                                />
                              );
                            }}
                          />
                          {clientErrors.website && (
                            <p className='text-sm text-red-500'>{clientErrors.website.message}</p>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value='existing'>
                        {isLoadingClients ? (
                          <div className='text-center py-4'>Loading clients...</div>
                        ) : existingClients.length > 0 ? (
                          <div className='space-y-2 max-h-80 overflow-y-auto'>
                            {existingClients.map((client) => {
                              return (
                                <div
                                  key={client._id}
                                  className='flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50'
                                  onClick={() => {
                                    return handleSelectExistingClient(client);
                                  }}
                                >
                                  <div>
                                    <p className='font-medium'>{client.name}</p>
                                    <p className='text-sm text-muted-foreground'>{client.email}</p>
                                  </div>
                                  <Button type='button' variant='ghost' size='sm'>
                                    Select
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className='text-center py-4'>
                            <p>No existing clients found.</p>
                            <Button
                              type='button'
                              variant='outline'
                              className='mt-2'
                              onClick={() => {
                                return setClientTab('new');
                              }}
                            >
                              Create New Client
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </div>

                <div className='flex justify-between gap-4 mt-6'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      return setCurrentStep(1);
                    }}
                  >
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Previous Step
                  </Button>
                  <Button
                    type='button'
                    onClick={() => {
                      setCurrentStep(3);
                      loadExistingTemplates();
                    }}
                  >
                    Next: Add Template (Optional)
                    <ChevronRight className='ml-2 h-4 w-4' />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key='step3'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='space-y-6'
              >
                <div className='space-y-2'>
                  <h3 className='text-lg font-medium'>Step 3: Project Template (Optional)</h3>
                  <p className='text-sm text-muted-foreground'>
                    Templates help standardize your project structure and ensure consistency. You
                    can select an existing template or create a new one to define the required
                    fields and information for this type of project.
                  </p>
                </div>

                <div className='space-y-4'>
                  <Tabs
                    defaultValue='select'
                    value={templateTab}
                    onValueChange={(v) => {
                      return setTemplateTab(v as 'select' | 'create');
                    }}
                  >
                    <TabsList className='grid w-full grid-cols-2 mb-4'>
                      <TabsTrigger value='select'>Select Template</TabsTrigger>
                      <TabsTrigger value='create'>Create New</TabsTrigger>
                    </TabsList>

                    <TabsContent value='select' className='space-y-4'>
                      {isLoadingTemplates ? (
                        <div className='text-center py-4'>Loading templates...</div>
                      ) : templates.length > 0 ? (
                        <div className='space-y-2 max-h-80 overflow-y-auto'>
                          {templates.map((template) => {
                            return (
                              <div
                                key={template._id}
                                className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${
                                  selectedTemplate?._id === template._id ? 'bg-gray-50' : ''
                                }`}
                                onClick={() => {
                                  return setSelectedTemplate(template);
                                }}
                              >
                                <div>
                                  <p className='font-medium'>{template.name}</p>
                                  <p className='text-sm text-muted-foreground'>
                                    {template.description}
                                  </p>
                                </div>
                                <Button type='button' variant='ghost' size='sm'>
                                  Select
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className='text-center py-4'>
                          <p>No templates found.</p>
                          <Button
                            type='button'
                            variant='outline'
                            className='mt-2'
                            onClick={() => {
                              return setTemplateTab('create');
                            }}
                          >
                            Create New Template
                          </Button>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value='create' className='space-y-4'>
                      <div className='grid gap-2'>
                        <Label htmlFor='templateName'>Template Name</Label>
                        <Input
                          id='templateName'
                          placeholder='Enter template name'
                          value={newFieldName}
                          onChange={(e) => {
                            return setNewFieldName(e.target.value);
                          }}
                        />
                      </div>

                      <div className='grid gap-2'>
                        <Label htmlFor='templateDescription'>Description</Label>
                        <Textarea
                          id='templateDescription'
                          placeholder='Enter template description'
                          className='h-20'
                        />
                      </div>

                      <div className='border rounded-md p-4 space-y-4 mt-4'>
                        <div className='flex justify-between items-center'>
                          <h3 className='text-sm font-medium'>Template Fields</h3>
                          <p className='text-sm text-muted-foreground'>
                            Add fields that will be required for this project type
                          </p>
                        </div>

                        {customFields.map((field) => {
                          return (
                            <CustomFieldInput
                              key={field.id}
                              field={field}
                              onUpdate={updateCustomField}
                              onRemove={removeCustomField}
                            />
                          );
                        })}

                        <div className='flex gap-2'>
                          <Input
                            placeholder="Add new field (e.g., 'Project Scope')"
                            value={newFieldName}
                            onChange={(e) => {
                              return setNewFieldName(e.target.value);
                            }}
                            className='flex-1'
                          />
                          <Button
                            type='button'
                            variant='outline'
                            onClick={addCustomField}
                            disabled={!newFieldName.trim()}
                          >
                            <PlusCircle className='h-4 w-4 mr-2' />
                            Add Field
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className='flex justify-between gap-4 mt-6'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      return setCurrentStep(2);
                    }}
                  >
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Previous Step
                  </Button>
                  <Button
                    type='submit'
                    disabled={
                      isSubmitting ||
                      (!selectedClient &&
                        clientTab === 'new' &&
                        (!watchClient('name') || !watchClient('email')))
                    }
                  >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </SheetContent>
    </Sheet>
  );
}
