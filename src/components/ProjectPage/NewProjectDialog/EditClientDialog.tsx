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

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  onClientUpdated: (client: any) => void;
}

export default function EditClientDialog({
  open,
  onOpenChange,
  client,
  onClientUpdated,
}: EditClientDialogProps) {
  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone || '');
  const [company, setCompany] = useState(client.company || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Update form values when client prop changes
  useEffect(() => {
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || '');
    setCompany(client.company || '');
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await newRequest.put(`/participants/${client.id}`, {
        name,
        email,
        phone,
        company,
        status: 'active',
      });

      const updatedClient = response.data.data;
      toast.success('Client updated successfully');
      onClientUpdated(updatedClient);
      onOpenChange(false);

      // Invalidate clients query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['participants'] });
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[400px] p-6 border border-gray-100 shadow-sm rounded-lg'>
        <DialogHeader className='mb-4'>
          <DialogTitle className='text-base font-medium text-gray-800'>Edit Client</DialogTitle>
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
              {isSubmitting ? 'Updating...' : 'Update Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
