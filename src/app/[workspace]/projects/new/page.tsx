'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { newRequest } from '@/utils/newRequest';
import { ChevronLeft, ChevronRight, PlusCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  jobTitle?: string;
  mailingAddress?: string;
  comments?: string;
  customFields?: Record<string, string>;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setParticipantFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add a custom field
  const addCustomField = () => {
    if (newFieldName.trim()) {
      setCustomFields([
        ...customFields,
        { id: `field-${Date.now()}`, name: newFieldName, value: '' },
      ]);
      setNewFieldName('');
    }
  };

  // Update custom field value
  const updateCustomField = (id: string, value: string) => {
    setCustomFields(customFields.map((field) => (field.id === id ? { ...field, value } : field)));
  };

  // Remove a custom field
  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter((field) => field.id !== id));
  };

  const handleCreateParticipant = async () => {
    try {
      // Create custom fields object
      const customFieldsObj = customFields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]: field.value,
        }),
        {},
      );

      // Create a new participant from the form data
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

      // Save the participant to the backend first
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
      // Load existing participants when moving to step 2
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
      // Fetch participants from API
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

  const handleParticipantAdded = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsParticipantModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let participantToAttach = selectedParticipant;

      // If no participant is selected but we have form data, create one first
      if (!participantToAttach && participantFormData.name && participantFormData.email) {
        participantToAttach = await handleCreateParticipant();
      }

      // Ensure we have a participant to attach to the project
      if (!participantToAttach) {
        toast.error('Please add or select a participant');
        setIsSubmitting(false);
        return;
      }

      // First, create the project without participant information
      const projectData = {
        ...formData,
      };

      // Call the API to create a new project
      const projectResponse = await newRequest.post<{ data: { _id: number } }>(
        '/projects',
        projectData,
      );

      const projectId = projectResponse.data.data._id;

      // Now attach the participant to the project in a separate call
      await newRequest.post(`/projects/${projectId}/participants`, {
        participantId: participantToAttach.id,
      });

      toast.success('Project created successfully');
      // Redirect to the new project's detail page
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto py-8 max-w-3xl'>
      <div className='mb-6'>
        <Button variant='ghost' size='sm' asChild className='mb-2'>
          <Link href='/projects'>
            <ChevronLeft className='mr-2 h-4 w-4' />
            Back to Projects
          </Link>
        </Button>
        <h1 className='text-3xl font-bold'>Create New Project</h1>
        <p className='text-muted-foreground mt-1'>
          Fill in the details below to create a new project
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentStep === 1 ? 'Project Details' : 'Add Primary Participant'}</CardTitle>
          <CardDescription>
            {currentStep === 1
              ? 'Provide basic information about your project'
              : 'Add participant details for this project'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
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
                    onValueChange={(value) => handleSelectChange('type', value)}
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
                    onValueChange={(value) => handleSelectChange('leadSource', value)}
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
                    onValueChange={(value) => handleSelectChange('stage', value)}
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
                  <Button type='button' variant='outline' onClick={() => router.push('/projects')}>
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
                        onClick={() => setSelectedParticipant(null)}
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

                      {/* Custom Fields Section */}
                      <div className='border rounded-md p-4 space-y-4 mt-4'>
                        <div className='flex justify-between items-center'>
                          <h3 className='text-sm font-medium'>Custom Fields</h3>
                          <p className='text-sm text-muted-foreground'>
                            Add additional information as needed
                          </p>
                        </div>

                        {customFields.map((field) => (
                          <div key={field.id} className='flex gap-2 items-start'>
                            <div className='flex-1'>
                              <Label>{field.name}</Label>
                              <Input
                                value={field.value}
                                onChange={(e) => updateCustomField(field.id, e.target.value)}
                                placeholder={`Enter ${field.name}`}
                              />
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => removeCustomField(field.id)}
                              className='mt-6'
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ))}

                        <div className='flex gap-2'>
                          <Input
                            placeholder="Add new field (e.g., 'LinkedIn Profile')"
                            value={newFieldName}
                            onChange={(e) => setNewFieldName(e.target.value)}
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
                          {existingParticipants.map((participant) => (
                            <div
                              key={participant.id}
                              className='flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-gray-50'
                              onClick={() => handleSelectExistingParticipant(participant)}
                            >
                              <div>
                                <p className='font-medium'>{participant.name}</p>
                                <p className='text-sm text-muted-foreground'>{participant.email}</p>
                              </div>
                              <Button type='button' variant='ghost' size='sm'>
                                Select
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-center py-4'>
                          <p>No existing participants found.</p>
                          <Button
                            type='button'
                            variant='outline'
                            className='mt-2'
                            onClick={() => setParticipantTab('new')}
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
        </CardContent>
      </Card>
    </div>
  );
}
