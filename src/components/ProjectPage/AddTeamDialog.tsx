import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { UserPlus } from 'lucide-react';
import { useState } from 'react';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  color: string;
  description?: string;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  initials?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'pending' | 'inactive';
  permissions: string[];
  dateAdded: string;
  lastActive?: string;
  contractSigned?: boolean;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  notes?: string;
}

interface AddTeamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: string;
  onAddParticipant: (participant: Participant) => void;
  predefinedRoles: Role[];
}

export default function AddTeamDialog({
  isOpen,
  onOpenChange,
  selectedRole,
  onAddParticipant,
  predefinedRoles,
}: AddTeamDialogProps) {
  const [teamName, setTeamName] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamRole, setTeamRole] = useState(selectedRole || '');

  const handleAddTeam = () => {
    if (teamName.trim() === '' || teamRole.trim() === '') return;

    const initials = teamName
      .split(' ')
      .map((name) => {
        return name[0];
      })
      .join('')
      .toUpperCase();

    const rolePermissions =
      predefinedRoles.find((r) => {
        return r.name === teamRole.toUpperCase();
      })?.permissions || [];

    const newTeam: Participant = {
      id: Date.now().toString(),
      name: teamName,
      role: teamRole.toUpperCase(),
      initials,
      email: teamEmail,
      status: 'pending',
      permissions: rolePermissions,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onAddParticipant(newTeam);
    resetForm();
  };

  const resetForm = () => {
    setTeamName('');
    setTeamEmail('');
    setTeamRole(selectedRole || '');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Team</DialogTitle>
          <DialogDescription>Add a new team to the project.</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='team-name'>Team Name</Label>
            <Input
              id='team-name'
              value={teamName}
              onChange={(e) => {
                return setTeamName(e.target.value);
              }}
              placeholder='Enter team name'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='team-email'>Team Email (optional)</Label>
            <Input
              id='team-email'
              type='email'
              value={teamEmail}
              onChange={(e) => {
                return setTeamEmail(e.target.value);
              }}
              placeholder='Enter team email address'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='team-role'>Role</Label>
            <Select value={teamRole} onValueChange={setTeamRole}>
              <SelectTrigger>
                <SelectValue placeholder='Select a role' />
              </SelectTrigger>
              <SelectContent>
                {predefinedRoles.map((role) => {
                  return (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button
            className='w-full mt-4'
            onClick={handleAddTeam}
            disabled={!teamName.trim() || !teamRole.trim()}
          >
            <UserPlus className='mr-2 h-4 w-4' />
            Add Team
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
