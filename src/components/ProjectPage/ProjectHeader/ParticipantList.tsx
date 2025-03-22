import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collaborator, Participant } from './types';

interface ParticipantListProps {
  participants: Participant[];
  collaborators: Collaborator[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveParticipant: (id: string) => void;
  onRemoveCollaborator: (id: string) => void;
  getRoleBadge: (role: string) => React.ReactNode;
  getStatusBadge: (status: 'active' | 'pending' | 'inactive') => React.ReactNode;
}

export function ParticipantList({
  participants,
  collaborators,
  isOpen,
  onOpenChange,
  onRemoveParticipant,
  onRemoveCollaborator,
  getRoleBadge,
  getStatusBadge,
}: ParticipantListProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Project Members</DialogTitle>
        </DialogHeader>
        <div className='max-h-[60vh] overflow-y-auto'>
          <div className='space-y-4 py-2'>
            {/* Participants Section */}
            {participants.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-2'>Participants</h3>
                {participants.map((participant) => {
                  return (
                    <div
                      key={participant.id}
                      className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8 bg-gray-200'>
                          {participant.avatar ? (
                            <AvatarImage src={participant.avatar} alt={participant.name} />
                          ) : (
                            <AvatarFallback className='bg-gray-200 text-gray-800 font-medium'>
                              {participant.name
                                .split(' ')
                                .map((n) => {
                                  return n.charAt(0).toUpperCase();
                                })
                                .join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium'>{participant.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {participant.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {getRoleBadge(participant.role)}
                        {participant.status && getStatusBadge(participant.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Collaborators Section */}
            {collaborators.length > 0 && (
              <div>
                <h3 className='text-sm font-medium text-muted-foreground mb-2'>Collaborators</h3>
                {collaborators.map((collaborator) => {
                  return (
                    <div
                      key={collaborator._id}
                      className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8 bg-indigo-100'>
                          {collaborator.avatar ? (
                            <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                          ) : (
                            <AvatarFallback className='bg-indigo-100 text-indigo-800 font-medium'>
                              {collaborator.name
                                .split(' ')
                                .map((n) => {
                                  return n.charAt(0).toUpperCase();
                                })
                                .join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium'>{collaborator.name} | Collaborator</p>
                          <p className='text-xs text-muted-foreground'>
                            {collaborator.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        {getRoleBadge(collaborator.role)}
                        {collaborator.status && getStatusBadge(collaborator.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {participants.length === 0 && collaborators.length === 0 && (
              <div className='text-center text-muted-foreground py-4'>No project members found</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
