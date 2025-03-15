'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import AddTeamDialog from './AddTeamDialog';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  color: string;
  description?: string;
}

const predefinedRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    permissions: ['manage_team', 'manage_project', 'view_all'],
    color: 'bg-red-100 text-red-800',
    description: 'Full access to all project features',
  },
  {
    id: '2',
    name: 'moderator',
    permissions: ['manage_content', 'view_all'],
    color: 'bg-blue-100 text-blue-800',
    description: 'Can manage content and view all project details',
  },
];

export default function TeamMembersList() {
  const { project } = useProject();
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const handleAddParticipant = (participant: any) => {
    // The participant will be added through the mutation in AddTeamDialog
    // We just need to close the dialog
    setIsAddTeamDialogOpen(false);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Team Members</h2>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            return setIsAddTeamDialogOpen(true);
          }}
        >
          <UserPlus className='h-4 w-4 mr-2' />
          Add Member
        </Button>
      </div>

      <div className='grid gap-4'>
        {project?.participants && project.participants.length > 0 ? (
          project.participants.map((participant) => {
            return (
              <Card key={participant._id} className='p-4'>
                <div className='flex items-center space-x-4'>
                  <Avatar className='h-10 w-10'>
                    {participant.avatar ? (
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                    ) : (
                      <AvatarFallback>
                        {participant.name
                          .split(' ')
                          .map((n) => {
                            return n[0];
                          })
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900 truncate'>{participant.name}</p>
                    <p className='text-sm text-gray-500 truncate'>
                      {participant.email || 'No email provided'}
                    </p>
                  </div>
                  <Badge
                    variant='secondary'
                    className={
                      participant.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    {participant.role}
                  </Badge>
                </div>
              </Card>
            );
          })
        ) : (
          <div className='text-center py-8 bg-gray-50 rounded-lg'>
            <p className='text-sm text-gray-500'>No team members yet</p>
            <p className='text-xs text-gray-400 mt-1'>Click the button above to add team members</p>
          </div>
        )}
      </div>

      <AddTeamDialog
        isOpen={isAddTeamDialogOpen}
        onOpenChange={setIsAddTeamDialogOpen}
        selectedRole={selectedRole}
        onAddParticipant={handleAddParticipant}
      />
    </div>
  );
}
