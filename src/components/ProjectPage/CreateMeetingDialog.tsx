import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { format } from 'date-fns';

type TeamMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  availableTimes: {
    day: string;
    slots: { start: string; end: string }[];
  }[];
};

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  teamMembers: TeamMember[];
  onCreateMeeting: (e: React.FormEvent) => Promise<void>;
  meetingStartTime: string;
  setMeetingStartTime: (time: string) => void;
  meetingDuration: string;
  setMeetingDuration: (duration: string) => void;
  selectedTeamMembers: string[];
  setSelectedTeamMembers: (members: string[]) => void;
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  meetingDescription: string;
  setMeetingDescription: (description: string) => void;
  meetingType: string;
  setMeetingType: (type: string) => void;
  meetingTypeDetails: {
    videoType?: string;
    videoLink?: string;
    phoneNumber?: string;
    location?: string;
    otherDetails?: string;
  };
  setMeetingTypeDetails: (details: {
    videoType?: string;
    videoLink?: string;
    phoneNumber?: string;
    location?: string;
    otherDetails?: string;
  }) => void;
}

export default function CreateMeetingDialog({
  open,
  onOpenChange,
  selectedDate,
  teamMembers,
  onCreateMeeting,
  meetingStartTime,
  setMeetingStartTime,
  meetingDuration,
  setMeetingDuration,
  selectedTeamMembers,
  setSelectedTeamMembers,
  meetingTitle,
  setMeetingTitle,
  meetingDescription,
  setMeetingDescription,
  meetingType,
  setMeetingType,
  meetingTypeDetails,
  setMeetingTypeDetails,
}: CreateMeetingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
          <DialogDescription>
            Schedule a meeting on {format(selectedDate, 'MMMM d, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onCreateMeeting} className='space-y-6'>
          <div className='space-y-4'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>Meeting Title</Label>
              <Input
                id='title'
                value={meetingTitle}
                onChange={(e) => {
                  return setMeetingTitle(e.target.value);
                }}
                placeholder='Project Status Update'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Input
                id='description'
                value={meetingDescription}
                onChange={(e) => {
                  return setMeetingDescription(e.target.value);
                }}
                placeholder='Weekly project progress review and discussion'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='startTime'>Start Time</Label>
                <div className='relative'>
                  <Input
                    id='startTime'
                    value={meetingStartTime}
                    onChange={(e) => {
                      return setMeetingStartTime(e.target.value);
                    }}
                    onFocus={(e) => {
                      return e.target.select();
                    }}
                    className='w-full'
                  />
                </div>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='duration'>Duration</Label>
                <Input
                  id='duration'
                  value={meetingDuration}
                  onChange={(e) => {
                    return setMeetingDuration(e.target.value);
                  }}
                  placeholder='30'
                />
              </div>
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='type'>Meeting Type</Label>
              <Input
                id='type'
                value={meetingType}
                onChange={(e) => {
                  return setMeetingType(e.target.value);
                }}
                placeholder='Video Call'
              />
            </div>

            {meetingType === 'Video Call' && (
              <div className='grid gap-2'>
                <Label htmlFor='videoType'>Video Platform</Label>
                <Input
                  id='videoType'
                  value={meetingTypeDetails.videoType}
                  onChange={(e) => {
                    return setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      videoType: e.target.value,
                    });
                  }}
                  placeholder='Zoom'
                />
                <Label htmlFor='videoLink'>Meeting Link</Label>
                <Input
                  id='videoLink'
                  value={meetingTypeDetails.videoLink}
                  onChange={(e) => {
                    return setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      videoLink: e.target.value,
                    });
                  }}
                  placeholder='https://zoom.us/j/123456789'
                />
              </div>
            )}

            {meetingType === 'Phone Call' && (
              <div className='grid gap-2'>
                <Label htmlFor='phoneNumber'>Phone Number</Label>
                <Input
                  id='phoneNumber'
                  value={meetingTypeDetails.phoneNumber}
                  onChange={(e) => {
                    return setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      phoneNumber: e.target.value,
                    });
                  }}
                  placeholder='+1 (555) 123-4567'
                />
              </div>
            )}

            {meetingType === 'In Person' && (
              <div className='grid gap-2'>
                <Label htmlFor='location'>Location</Label>
                <Input
                  id='location'
                  value={meetingTypeDetails.location}
                  onChange={(e) => {
                    return setMeetingTypeDetails({
                      ...meetingTypeDetails,
                      location: e.target.value,
                    });
                  }}
                  placeholder='Office Conference Room'
                />
              </div>
            )}

            <div className='grid gap-2'>
              <Label>Participants</Label>
              {teamMembers.map((member) => {
                return (
                  <div key={member._id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={`member-${member._id}`}
                      checked={selectedTeamMembers.includes(member._id)}
                      defaultChecked={true}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTeamMembers([...selectedTeamMembers, member._id]);
                        } else {
                          setSelectedTeamMembers(
                            selectedTeamMembers.filter((id) => {
                              return id !== member._id;
                            }),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`member-${member._id}`} className='text-sm'>
                      {member.name} ({member.role})
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className='flex-col sm:flex-row gap-2'>
            <Button type='submit'>Create Meeting</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
