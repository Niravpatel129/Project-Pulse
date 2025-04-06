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
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, PlusCircle, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

export function ProjectCreateForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [participantTab, setParticipantTab] = useState('new');
  const [existingParticipants, setExistingParticipants] = useState<Participant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [customFields, setCustomFields] = useState<{ id: string; name: string; value: string }[]>(
    [],
  );
  const [newFieldName, setNewFieldName] = useState('');

  const [participantFormData, setParticipantFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    jobTitle: '',
    mailingAddress: '',
    comments: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    leadSource: '',
    stage: 'Initial Contact',
  });

  const queryClient = useQueryClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleParticipantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setParticipantFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => {
      return { ...prev, [field]: value };
    });
  };

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

  const handleCreateParticipant = async () => {
    try {
      const customFieldsObj = customFields.reduce((acc, field) => {
        return {
          ...acc,
          [field.name]: field.value,
        };
      }, {});

      const participantData = {
        name: participantFormData.name,
        email: participantFormData.email,
        phone: participantFormData.phone,
        website: participantFormData.website,
        jobTitle: participantFormData.jobTitle,
        mailingAddress: participantFormData.mailingAddress,
        comments: participantFormData.comments,
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
    if (currentStep === 1 && formData.name && formData.type && formData.leadSource) {
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
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const handleSelectExistingParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let participantToAttach = selectedParticipant;

      if (!participantToAttach && participantFormData.name && participantFormData.email) {
        participantToAttach = await handleCreateParticipant();
      }

      if (!participantToAttach) {
        toast.error('Please add or select a participant');
        setIsSubmitting(false);
        return;
      }

      const projectData = {
        ...formData,
      };

      const projectResponse = await newRequest.post<{ data: { _id: number } }>(
        '/projects',
        projectData,
      );
      const projectId = projectResponse.data.data._id;

      await newRequest.post(`/projects/${projectId}/participants`, {
        participantId: participantToAttach._id,
      });

      // Invalidate the projects query to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ['projects'] });

      toast.success('Project created successfully');
      setIsOpen(false);
      // Reset form
      setFormData({
        name: '',
        type: '',
        leadSource: '',
        stage: 'Initial Contact',
      });
      setParticipantFormData({
        name: '',
        email: '',
        phone: '',
        website: '',
        jobTitle: '',
        mailingAddress: '',
        comments: '',
      });
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
        <form onSubmit={handleSubmit} className='space-y-6 py-4'>
          {currentStep === 1 ? (
            <div className='space-y-4'>
              <div className='grid gap-2'>
                <Label htmlFor='name'>Project Name</Label>
                <Input
                  id='name'
                  name='name'
                  placeholder='Enter project name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='type'>Project Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    return handleSelectChange('type', value);
                  }}
                >
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
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='leadSource'>Lead Source</Label>
                <Select
                  value={formData.leadSource}
                  onValueChange={(value) => {
                    return handleSelectChange('leadSource', value);
                  }}
                >
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
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='stage'>Project Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => {
                    return handleSelectChange('stage', value);
                  }}
                >
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
              </div>

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
                  onClick={handleNextStep}
                  disabled={!formData.name || !formData.type || !formData.leadSource}
                >
                  Next Step
                  <ChevronRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
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
                    <div className='grid gap-2'>
                      <Label htmlFor='participantName'>Name*</Label>
                      <Input
                        id='participantName'
                        name='name'
                        placeholder='Enter participant name'
                        value={participantFormData.name}
                        onChange={handleParticipantChange}
                        required
                      />
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='participantEmail'>Email*</Label>
                      <Input
                        id='participantEmail'
                        name='email'
                        type='email'
                        placeholder='Enter participant email'
                        value={participantFormData.email}
                        onChange={handleParticipantChange}
                        required
                      />
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='participantPhone'>Phone</Label>
                      <Input
                        id='participantPhone'
                        name='phone'
                        placeholder='Enter participant phone'
                        value={participantFormData.phone}
                        onChange={handleParticipantChange}
                      />
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='participantJobTitle'>Job Title</Label>
                      <Input
                        id='participantJobTitle'
                        name='jobTitle'
                        placeholder='Enter job title'
                        value={participantFormData.jobTitle}
                        onChange={handleParticipantChange}
                      />
                    </div>

                    <div className='grid gap-2'>
                      <Label htmlFor='participantWebsite'>Website</Label>
                      <Input
                        id='participantWebsite'
                        name='website'
                        placeholder='Enter website'
                        value={participantFormData.website}
                        onChange={handleParticipantChange}
                      />
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
                          <div key={field.id} className='flex gap-2 items-start'>
                            <div className='flex-1'>
                              <Label>{field.name}</Label>
                              <Input
                                value={field.value}
                                onChange={(e) => {
                                  return updateCustomField(field.id, e.target.value);
                                }}
                                placeholder={`Enter ${field.name}`}
                              />
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => {
                                return removeCustomField(field.id);
                              }}
                              className='mt-6'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
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
                                <p className='text-sm text-muted-foreground'>{participant.email}</p>
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
                      (!participantFormData.name || !participantFormData.email))
                  }
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
