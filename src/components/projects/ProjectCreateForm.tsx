'use client';

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
interface Participant {
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
});

const participantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  jobTitle: z.string().optional(),
  mailingAddress: z.string().optional(),
  comments: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type ParticipantFormData = z.infer<typeof participantSchema>;

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
const ProjectFormStep = ({
  control,
  errors,
  onNext,
  onClose,
}: {
  control: any;
  errors: any;
  onNext: () => void;
  onClose: () => void;
}) => {
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

      <div className='flex justify-end gap-4 mt-6'>
        <Button type='button' variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button type='button' onClick={onNext} disabled={Object.keys(errors).length > 0}>
          Next Step
          <ChevronRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};

export function ProjectCreateForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [participantTab, setParticipantTab] = useState('new');
  const [existingParticipants, setExistingParticipants] = useState<Participant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState('');

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
    control: participantControl,
    handleSubmit: handleParticipantSubmit,
    formState: { errors: participantErrors },
    reset: resetParticipantForm,
    watch: watchParticipant,
  } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
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

  const handleCreateParticipant = async (data: ParticipantFormData) => {
    try {
      const customFieldsObj = customFields.reduce((acc, field) => {
        return {
          ...acc,
          [field.name]: field.value,
        };
      }, {});

      const participantData = {
        ...data,
        customFields: customFieldsObj,
      };

      const response = await newRequest.post<{ data: Participant }>(
        '/participants',
        participantData,
      );
      const savedParticipant = response.data.data;
      setSelectedParticipant(savedParticipant);
      return savedParticipant;
    } catch (error) {
      console.error('Error creating participant:', error);
      toast.error('Failed to create participant');
      throw error;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      loadExistingParticipants();
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const loadExistingParticipants = async () => {
    setIsLoadingParticipants(true);
    try {
      const response = await newRequest.get<{ data: Participant[] }>('/participants');
      setExistingParticipants(response.data.data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const handleSelectExistingParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
  };

  const onSubmit = async (projectData: ProjectFormData) => {
    setIsSubmitting(true);

    try {
      let participantToAttach = selectedParticipant;

      if (!participantToAttach) {
        const participantData = watchParticipant();
        if (participantData.name && participantData.email) {
          participantToAttach = await handleCreateParticipant(participantData);
        }
      }

      if (!participantToAttach) {
        toast.error('Please add or select a participant');
        setIsSubmitting(false);
        return;
      }

      const projectResponse = await newRequest.post<{ data: { _id: number } }>(
        '/projects',
        projectData,
      );
      const projectId = projectResponse.data.data._id;

      await newRequest.post(`/projects/${projectId}/participants`, {
        participantId: participantToAttach._id,
      });

      await queryClient.invalidateQueries({ queryKey: ['projects'] });

      toast.success('Project created successfully');
      setIsOpen(false);

      // Reset forms
      resetProjectForm();
      resetParticipantForm();
      setSelectedParticipant(null);
      setCustomFields([]);
      setCurrentStep(1);
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
          <SheetDescription>Fill in the details below to create a new project</SheetDescription>
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
              >
                <ProjectFormStep
                  control={projectControl}
                  errors={projectErrors}
                  onNext={handleNextStep}
                  onClose={() => {
                    return setIsOpen(false);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key='step2'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className='space-y-4'
              >
                {selectedParticipant ? (
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-3 border rounded-md'>
                      <div>
                        <p className='font-medium'>{selectedParticipant.name}</p>
                        <p className='text-sm text-muted-foreground'>{selectedParticipant.email}</p>
                      </div>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          return setSelectedParticipant(null);
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Tabs defaultValue='new' value={participantTab} onValueChange={setParticipantTab}>
                    <TabsList className='grid w-full grid-cols-2 mb-4'>
                      <TabsTrigger value='new'>Add New Participant</TabsTrigger>
                      <TabsTrigger value='existing'>Select Existing</TabsTrigger>
                    </TabsList>

                    <TabsContent value='new' className='space-y-4'>
                      <form onSubmit={handleParticipantSubmit(handleCreateParticipant)}>
                        <div className='grid gap-2'>
                          <Label htmlFor='participantName'>Name*</Label>
                          <Controller
                            name='name'
                            control={participantControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='participantName'
                                  placeholder='Enter participant name'
                                  aria-invalid={participantErrors.name ? 'true' : 'false'}
                                />
                              );
                            }}
                          />
                          {participantErrors.name && (
                            <p className='text-sm text-red-500'>{participantErrors.name.message}</p>
                          )}
                        </div>

                        <div className='grid gap-2'>
                          <Label htmlFor='participantEmail'>Email*</Label>
                          <Controller
                            name='email'
                            control={participantControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='participantEmail'
                                  type='email'
                                  placeholder='Enter participant email'
                                  aria-invalid={participantErrors.email ? 'true' : 'false'}
                                />
                              );
                            }}
                          />
                          {participantErrors.email && (
                            <p className='text-sm text-red-500'>
                              {participantErrors.email.message}
                            </p>
                          )}
                        </div>

                        <div className='grid gap-2'>
                          <Label htmlFor='participantPhone'>Phone</Label>
                          <Controller
                            name='phone'
                            control={participantControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='participantPhone'
                                  placeholder='Enter participant phone'
                                />
                              );
                            }}
                          />
                        </div>

                        <div className='grid gap-2'>
                          <Label htmlFor='participantJobTitle'>Job Title</Label>
                          <Controller
                            name='jobTitle'
                            control={participantControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='participantJobTitle'
                                  placeholder='Enter job title'
                                />
                              );
                            }}
                          />
                        </div>

                        <div className='grid gap-2'>
                          <Label htmlFor='participantWebsite'>Website</Label>
                          <Controller
                            name='website'
                            control={participantControl}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  id='participantWebsite'
                                  placeholder='Enter website'
                                  aria-invalid={participantErrors.website ? 'true' : 'false'}
                                />
                              );
                            }}
                          />
                          {participantErrors.website && (
                            <p className='text-sm text-red-500'>
                              {participantErrors.website.message}
                            </p>
                          )}
                        </div>

                        <div className='border rounded-md p-4 space-y-4 mt-4'>
                          <div className='flex justify-between items-center'>
                            <h3 className='text-sm font-medium'>Custom Fields</h3>
                            <p className='text-sm text-muted-foreground'>
                              Add additional information as needed
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
                              placeholder="Add new field (e.g., 'LinkedIn Profile')"
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
                      </form>
                    </TabsContent>

                    <TabsContent value='existing'>
                      {isLoadingParticipants ? (
                        <div className='text-center py-4'>Loading participants...</div>
                      ) : existingParticipants.length > 0 ? (
                        <div className='space-y-2 max-h-80 overflow-y-auto'>
                          {existingParticipants.map((participant) => {
                            return (
                              <div
                                key={participant._id}
                                className='flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50'
                                onClick={() => {
                                  return handleSelectExistingParticipant(participant);
                                }}
                              >
                                <div>
                                  <p className='font-medium'>{participant.name}</p>
                                  <p className='text-sm text-muted-foreground'>
                                    {participant.email}
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
                          <p>No existing participants found.</p>
                          <Button
                            type='button'
                            variant='outline'
                            className='mt-2'
                            onClick={() => {
                              return setParticipantTab('new');
                            }}
                          >
                            Create New Participant
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                <div className='flex justify-between gap-4 mt-6'>
                  <Button type='button' variant='outline' onClick={handlePrevStep}>
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Previous Step
                  </Button>
                  <Button
                    type='submit'
                    disabled={
                      isSubmitting ||
                      (!selectedParticipant &&
                        participantTab === 'new' &&
                        (!watchParticipant('name') || !watchParticipant('email')))
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
