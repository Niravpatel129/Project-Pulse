'use client';

import AddParticipantModal from '@/components/participants/AddParticipantModal';
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
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);

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

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, you would call your API here
      console.log('Submitting project:', formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Set the created project ID (would come from API response)
      const mockProjectId = Math.floor(Math.random() * 1000) + 1;
      setCreatedProjectId(mockProjectId);

      // Show participant modal instead of redirecting
      setShowParticipantModal(true);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParticipantAdded = (participant: any) => {
    console.log('Participant added:', participant);

    // After participant is added, redirect to the new project's detail page
    if (createdProjectId) {
      router.push(`/projects/${createdProjectId}`);
    } else {
      // Fallback to projects list if project ID is somehow missing
      router.push('/projects');
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
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Provide basic information about your project</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
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
            </div>

            <div className='flex justify-end gap-4'>
              <Button type='button' variant='outline' onClick={() => router.push('/projects')}>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting || !formData.name || !formData.type || !formData.leadSource}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Participant Modal */}
      {showParticipantModal && createdProjectId && (
        <AddParticipantModal
          projectId={createdProjectId}
          isOpen={showParticipantModal}
          onClose={() => {
            // If user closes the modal without adding a participant, still redirect to project detail
            router.push(`/projects/${createdProjectId}`);
          }}
          onParticipantAdded={handleParticipantAdded}
        />
      )}
    </div>
  );
}
