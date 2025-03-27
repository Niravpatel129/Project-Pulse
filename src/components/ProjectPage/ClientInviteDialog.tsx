import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { addHours } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

type Participant = {
  _id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  status?: string;
};

type ClientInviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName?: string;
  participants: Participant[];
};

export default function ClientInviteDialog({
  open,
  onOpenChange,
  projectName,
  participants,
}: ClientInviteDialogProps) {
  const [startDateRange, setStartDateRange] = useState<Date | undefined>(new Date());
  const [endDateRange, setEndDateRange] = useState<Date | undefined>(addHours(new Date(), 30 * 24));
  const [selectedClientEmail, setSelectedClientEmail] = useState<string>('');
  const [meetingPurpose, setMeetingPurpose] = useState<string>('');
  const [meetingDuration, setMeetingDuration] = useState<string>('60');
  const { project } = useProject();

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send invitation email to client
    // In a real app, this would call an API endpoint
    try {
      const response = await newRequest.post('/schedule/invite', {
        clientEmail: selectedClientEmail,
        meetingPurpose,
        meetingDuration,
        startDateRange,
        endDateRange,
        projectId: project?._id,
      });

      toast.success(`Invitation sent to ${selectedClientEmail}`);
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Send Client Invite</DialogTitle>
          <DialogDescription>
            Allow your client to book a meeting from your available times
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendInvite}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='clientEmail'>Client Email</Label>
              <Select value={selectedClientEmail} onValueChange={setSelectedClientEmail}>
                <SelectTrigger id='clientEmail'>
                  <SelectValue placeholder='Select client email' />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((participant) => {
                    return (
                      <SelectItem key={participant._id} value={participant.email}>
                        {participant.email}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className='grid gap-2'>
              <Label>Date Range</Label>
              <div className='flex flex-col sm:flex-row items-center gap-2'>
                <div className='w-full'>
                  <DatePicker
                    date={startDateRange}
                    setDate={setStartDateRange}
                    placeholder='Start date'
                    minDate={new Date()}
                    maxDate={endDateRange}
                  />
                </div>
                <span className='hidden sm:inline'>to</span>
                <span className='inline sm:hidden my-1'>to</span>
                <div className='w-full'>
                  <DatePicker
                    date={endDateRange}
                    setDate={setEndDateRange}
                    placeholder='End date'
                    minDate={startDateRange || new Date()}
                  />
                </div>
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='meetingPurpose'>Meeting Purpose</Label>
              <Input
                id='meetingPurpose'
                value={meetingPurpose}
                onChange={(e) => {
                  return setMeetingPurpose(e.target.value);
                }}
                placeholder={`Discuss ${projectName || 'project'} details`}
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='meetingDuration'>Meeting Duration</Label>
              <Select value={meetingDuration} onValueChange={setMeetingDuration}>
                <SelectTrigger id='meetingDuration'>
                  <SelectValue placeholder='Select duration' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='30'>30 minutes</SelectItem>
                  <SelectItem value='60'>1 hour</SelectItem>
                  <SelectItem value='90'>1.5 hours</SelectItem>
                  <SelectItem value='120'>2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className='flex-col sm:flex-row gap-2'>
            <Button type='submit'>Send Invite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
