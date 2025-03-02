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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  jobTitle?: string;
  mailingAddress?: string;
  comments?: string;
  // Any custom fields will be stored here
  customFields?: Record<string, string>;
}

interface AddParticipantModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onParticipantAdded: (participant: Participant) => void;
}

// Sample existing participants for demonstration
const EXISTING_PARTICIPANTS: Participant[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    jobTitle: 'Project Manager',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '(555) 987-6543',
    jobTitle: 'Designer',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael@example.com',
    phone: '(555) 456-7890',
    jobTitle: 'Developer',
  },
];

// Form schema
const participantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  website: z.string().optional(),
  jobTitle: z.string().optional(),
  mailingAddress: z.string().optional(),
  comments: z.string().optional(),
});

export default function AddParticipantModal({
  projectId,
  isOpen,
  onClose,
  onParticipantAdded,
}: AddParticipantModalProps) {
  const [activeTab, setActiveTab] = useState('new');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<{ id: string; name: string; value: string }[]>(
    [],
  );
  const [newFieldName, setNewFieldName] = useState('');

  // Initialize form
  const form = useForm<z.infer<typeof participantSchema>>({
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

  // Handle form submission
  const onSubmit = (values: z.infer<typeof participantSchema>) => {
    // Create new participant with form values and any custom fields
    const customFieldsObj = customFields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.value,
      }),
      {},
    );

    const newParticipant: Participant = {
      id: `new-${Date.now()}`,
      name: values.name,
      email: values.email,
      phone: values.phone,
      website: values.website,
      jobTitle: values.jobTitle,
      mailingAddress: values.mailingAddress,
      ...values,
      customFields: customFieldsObj,
    };

    onParticipantAdded(newParticipant);
    onClose();
  };

  // Handle adding an existing participant
  const handleAddExisting = () => {
    if (selectedParticipant) {
      const participant = EXISTING_PARTICIPANTS.find((p) => p.id === selectedParticipant);
      if (participant) {
        onParticipantAdded(participant);
        onClose();
      }
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add Participant to Project</DialogTitle>
          <DialogDescription>
            Add a team member, client, or other participant to this project.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='new'>Create New</TabsTrigger>
            <TabsTrigger value='existing'>Add Existing</TabsTrigger>
          </TabsList>

          <TabsContent value='new' className='pt-4'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Core Fields */}
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name*</FormLabel>
                        <FormControl>
                          <Input placeholder='Full name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input placeholder='Email address' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder='Phone number' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='website'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder='Website URL' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='jobTitle'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder='Job title' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Fields */}
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='mailingAddress'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mailing Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder='Street address, city, state, zip' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='comments'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Additional notes about this participant'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Custom Fields Section */}
                <div className='border rounded-md p-4 space-y-4'>
                  <div className='flex justify-between items-center'>
                    <h3 className='text-sm font-medium'>Custom Fields</h3>
                    <FormDescription>Add additional information as needed</FormDescription>
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

                <DialogFooter>
                  <Button type='button' variant='outline' onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type='submit'>Add Participant</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value='existing' className='pt-4'>
            <div className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                Select from existing participants to add to this project:
              </p>

              <RadioGroup
                value={selectedParticipant || ''}
                onValueChange={setSelectedParticipant}
                className='space-y-2'
              >
                {EXISTING_PARTICIPANTS.map((participant) => (
                  <div
                    key={participant.id}
                    className='flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted'
                  >
                    <RadioGroupItem id={participant.id} value={participant.id} />
                    <div className='flex-1 space-y-1'>
                      <Label htmlFor={participant.id} className='font-medium cursor-pointer'>
                        {participant.name}
                      </Label>
                      <p className='text-sm text-muted-foreground'>{participant.email}</p>
                      {participant.jobTitle && (
                        <p className='text-xs text-muted-foreground'>{participant.jobTitle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <DialogFooter className='mt-6'>
                <Button type='button' variant='outline' onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleAddExisting} disabled={!selectedParticipant}>
                  Add Selected Participant
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
