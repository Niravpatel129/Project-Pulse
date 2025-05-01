import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: any) => void;
  project?: any;
  clientToEdit?: any | null;
}

export default function CreateClientDialog({
  open,
  onOpenChange,
  onClientCreated,
  project,
  clientToEdit,
}: CreateClientDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const isEditMode = !!clientToEdit;

  // Load client data when editing
  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setEmail(clientToEdit.email || '');
      setPhone(clientToEdit.phone || '');
      setCompany(clientToEdit.company || '');
    } else {
      // Reset form when not editing
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
    }
  }, [clientToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;

      if (isEditMode) {
        // Update existing client
        const clientId = clientToEdit.id || clientToEdit._id;
        response = await newRequest.patch(`/workspaces/clients/${clientId}`, {
          name,
          email,
          phone,
          company,
        });
        toast.success('Client updated successfully');
      } else {
        // Create new client
        response = await newRequest.post('/workspaces/clients', {
          name,
          email,
          phone,
          company,
          status: 'active',
          projectId: project?._id,
        });
        toast.success('Client created successfully');
      }

      const clientData = response.data.data;
      onClientCreated(clientData);
      onOpenChange(false);

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');

      // Invalidate clients query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      if (project) {
        queryClient.invalidateQueries({ queryKey: ['project'] });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} client:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} client`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[400px] p-6 border border-gray-100 shadow-sm rounded-lg'>
        <DialogHeader className='mb-4'>
          <DialogTitle className='text-base font-medium text-gray-800'>
            {isEditMode ? 'Edit Client' : 'New Client'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-xs font-normal text-gray-600'>
              Name
            </Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => {
                return setName(e.target.value);
              }}
              required
              className='h-9 text-sm'
              placeholder='Enter client name'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='email' className='text-xs font-normal text-gray-600'>
              Email
            </Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => {
                return setEmail(e.target.value);
              }}
              required
              className='h-9 text-sm'
              placeholder='client@example.com'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phone' className='text-xs font-normal text-gray-600'>
              Phone
            </Label>
            <Input
              id='phone'
              value={phone}
              onChange={(e) => {
                return setPhone(e.target.value);
              }}
              className='h-9 text-sm'
              placeholder='Optional'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='company' className='text-xs font-normal text-gray-600'>
              Company
            </Label>
            <Input
              id='company'
              value={company}
              onChange={(e) => {
                return setCompany(e.target.value);
              }}
              className='h-9 text-sm'
              placeholder='Optional'
            />
          </div>
          <DialogFooter className='mt-6 gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                return onOpenChange(false);
              }}
              className='h-8 text-xs font-normal text-gray-600 border-gray-200'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='h-8 text-xs font-normal bg-gray-900 hover:bg-gray-800 transition-colors'
            >
              {isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Client'
                : 'Create Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
