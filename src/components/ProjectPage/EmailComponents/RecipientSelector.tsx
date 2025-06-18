import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface Participant {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
  status?: string;
}

interface RecipientSelectorProps {
  type: 'to' | 'cc' | 'bcc';
  label: string;
  recipients: string[];
  selectedParticipant: string;
  onSelectParticipant: (value: string) => void;
  onRemoveRecipient: (recipient: string) => void;
  participants: Participant[];
  showRemoveButton?: boolean;
  onToggleVisibility?: () => void;
}

export const RecipientSelector = ({
  type,
  label,
  recipients,
  selectedParticipant,
  onSelectParticipant,
  onRemoveRecipient,
  participants,
  showRemoveButton,
  onToggleVisibility,
}: RecipientSelectorProps) => {
  // Filter out participants without email addresses
  const validParticipants = participants.filter((p) => {
    return p.email;
  });

  // Find the selected participant's email
  const selectedParticipantEmail = validParticipants.find((p) => {
    return p.email === selectedParticipant;
  })?.email;

  return (
    <div>
      <div className='flex justify-between'>
        <Label htmlFor={`${type}-recipients`}>{label}</Label>
        {showRemoveButton && onToggleVisibility && (
          <button
            className='text-xs text-gray-500 hover:text-gray-700'
            onClick={onToggleVisibility}
          >
            <X className='h-3 w-3' />
          </button>
        )}
      </div>
      <div className='flex flex-wrap gap-2 mt-1 mb-2'>
        {recipients.map((recipient) => {
          return (
            <Badge key={recipient} variant='secondary' className='flex items-center gap-1'>
              {recipient}
              <button
                onClick={() => {
                  return onRemoveRecipient(recipient);
                }}
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          );
        })}
      </div>
      <div className='flex gap-2'>
        <Select
          value={selectedParticipantEmail || ''}
          onValueChange={(value) => {
            console.log('Selected participant email:', value);
            onSelectParticipant(value);
          }}
        >
          <SelectTrigger className='w-full ps-2 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0'>
            <SelectValue placeholder='Select participant' />
          </SelectTrigger>
          <SelectContent className='[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2'>
            <SelectGroup>
              <SelectLabel className='ps-2'>Project participants</SelectLabel>
              {validParticipants.map((participant) => {
                return (
                  <SelectItem key={participant._id} value={participant.email || ''}>
                    <Avatar className='size-5'>
                      {participant.avatar ? (
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                      ) : null}
                      <AvatarFallback className='text-xs'>
                        {participant.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className='truncate'>{participant.name}</span>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* <Button
          type='button'
          onClick={() => {
            console.log('Adding recipient:', selectedParticipantEmail);
            onAddRecipient();
          }}
          size='sm'
          disabled={!selectedParticipantEmail}
        >
          <Plus className='h-4 w-4' />
        </Button> */}
      </div>
    </div>
  );
};
