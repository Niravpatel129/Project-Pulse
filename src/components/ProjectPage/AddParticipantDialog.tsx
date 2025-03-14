import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Copy, Mail, PlusCircle, Search, Send, UserPlus } from 'lucide-react';
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

interface AddParticipantDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddParticipant: (participant: Participant) => void;
  predefinedRoles: Role[];
  onAddRole: (role: Role) => void;
  getRoleBadge: (roleName: string) => React.ReactElement;
}

export default function AddParticipantDialog({
  isOpen,
  onOpenChange,
  onAddParticipant,
  predefinedRoles,
  onAddRole,
  getRoleBadge,
}: AddParticipantDialogProps) {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantRole, setNewParticipantRole] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantPhone, setNewParticipantPhone] = useState('');
  const [newParticipantNotes, setNewParticipantNotes] = useState('');
  const [newParticipantPermissions, setNewParticipantPermissions] = useState<string[]>([]);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteLink, setInviteLink] = useState('https://project.example.com/invite/abc123xyz');
  const [linkCopied, setLinkCopied] = useState(false);

  // Mock previous clients/team members for the CRM integration
  const previousContacts = [
    {
      id: 'c1',
      name: 'Alex Johnson',
      role: 'CLIENT',
      email: 'alex@example.com',
      initials: 'AJ',
      phone: '+1 (555) 234-5678',
      status: 'active' as const,
      permissions: ['view', 'download', 'comment'],
      dateAdded: '2023-01-10',
      lastActive: '2023-06-15',
      contractSigned: true,
      paymentStatus: 'paid' as const,
      notes: 'Returning client, 3 previous projects',
    },
    {
      id: 'c2',
      name: 'Maria Garcia',
      role: 'CLIENT',
      email: 'maria@example.com',
      initials: 'MG',
      phone: '+1 (555) 345-6789',
      status: 'active' as const,
      permissions: ['view', 'download', 'comment'],
      dateAdded: '2023-02-22',
      lastActive: '2023-05-30',
      contractSigned: true,
      paymentStatus: 'paid' as const,
      notes: 'Referred by Alex Johnson',
    },
    {
      id: 'c3',
      name: 'James Wilson',
      role: 'ASSISTANT',
      email: 'james@example.com',
      initials: 'JW',
      phone: '+1 (555) 456-7890',
      status: 'active' as const,
      permissions: ['edit', 'upload', 'download'],
      dateAdded: '2022-11-15',
      lastActive: '2023-06-21',
      contractSigned: true,
      paymentStatus: 'paid' as const,
      notes: 'Regular assistant, available weekends',
    },
    {
      id: 'c4',
      name: 'Emma Davis',
      role: 'MAKEUP ARTIST',
      email: 'emma@example.com',
      initials: 'ED',
      phone: '+1 (555) 567-8901',
      status: 'active' as const,
      permissions: ['view', 'download'],
      dateAdded: '2023-03-05',
      lastActive: '2023-06-10',
      contractSigned: true,
      paymentStatus: 'paid' as const,
      notes: 'Specializes in natural makeup looks',
    },
  ];

  const filteredContacts = previousContacts.filter((contact) => {
    return (
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddParticipant = () => {
    if (newParticipantName.trim() === '' || newParticipantRole.trim() === '') return;

    const initials = newParticipantName
      .split(' ')
      .map((name) => {
        return name[0];
      })
      .join('')
      .toUpperCase();

    // Get permissions based on selected role
    const rolePermissions =
      predefinedRoles.find((r) => {
        return r.name === newParticipantRole.toUpperCase();
      })?.permissions || [];

    // Use selected permissions if any, otherwise use role default permissions
    const permissions =
      newParticipantPermissions.length > 0 ? newParticipantPermissions : rolePermissions;

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: newParticipantName,
      role: newParticipantRole.toUpperCase(),
      initials,
      email: newParticipantEmail,
      phone: newParticipantPhone,
      status: 'pending',
      permissions,
      dateAdded: new Date().toISOString().split('T')[0],
      notes: newParticipantNotes,
    };

    onAddParticipant(newParticipant);
    resetForm();
  };

  const handleAddExistingContact = (contact: (typeof previousContacts)[0]) => {
    const newParticipant: Participant = {
      ...contact,
      status: 'pending',
      dateAdded: new Date().toISOString().split('T')[0],
    };
    onAddParticipant(newParticipant);
  };

  const handleAddNewRole = () => {
    if (newRoleName.trim() === '') return;

    const newRole: Role = {
      id: `r${predefinedRoles.length + 1}`,
      name: newRoleName.toUpperCase(),
      permissions: newRolePermissions,
      color: 'bg-gray-100 text-gray-800',
    };

    onAddRole(newRole);
    setNewRoleName('');
    setNewRolePermissions([]);
    setIsEditingRole(false);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => {
      return setLinkCopied(false);
    }, 2000);
  };

  const resetForm = () => {
    setNewParticipantName('');
    setNewParticipantRole('');
    setNewParticipantEmail('');
    setNewParticipantPhone('');
    setNewParticipantNotes('');
    setNewParticipantPermissions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Manage Project Participants</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue='invite'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='invite'>Invite New</TabsTrigger>
            <TabsTrigger value='existing'>From Contacts</TabsTrigger>
            <TabsTrigger value='link'>Share Link</TabsTrigger>
          </TabsList>

          <TabsContent value='invite' className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={newParticipantName}
                onChange={(e) => {
                  return setNewParticipantName(e.target.value);
                }}
                placeholder='Enter participant name'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={newParticipantEmail}
                onChange={(e) => {
                  return setNewParticipantEmail(e.target.value);
                }}
                placeholder='Enter email address'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone (optional)</Label>
              <Input
                id='phone'
                type='tel'
                value={newParticipantPhone}
                onChange={(e) => {
                  return setNewParticipantPhone(e.target.value);
                }}
                placeholder='Enter phone number'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <div className='flex gap-2'>
                <Select value={newParticipantRole} onValueChange={setNewParticipantRole}>
                  <SelectTrigger className='flex-1'>
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
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={() => {
                    return setIsEditingRole(!isEditingRole);
                  }}
                >
                  <PlusCircle className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {isEditingRole && (
              <div className='space-y-4 p-3 border rounded-md bg-gray-50'>
                <h4 className='font-medium'>Create New Role</h4>
                <div className='space-y-2'>
                  <Label htmlFor='roleName'>Role Name</Label>
                  <Input
                    id='roleName'
                    value={newRoleName}
                    onChange={(e) => {
                      return setNewRoleName(e.target.value);
                    }}
                    placeholder='e.g., Videographer'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Permissions</Label>
                  <div className='grid grid-cols-2 gap-2'>
                    {['view', 'edit', 'upload', 'download', 'share', 'delete', 'comment'].map(
                      (perm) => {
                        return (
                          <div key={perm} className='flex items-center space-x-2'>
                            <Checkbox
                              id={`perm-${perm}`}
                              checked={newRolePermissions.includes(perm)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewRolePermissions([...newRolePermissions, perm]);
                                } else {
                                  setNewRolePermissions(
                                    newRolePermissions.filter((p) => {
                                      return p !== perm;
                                    }),
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`perm-${perm}`} className='text-sm capitalize'>
                              {perm}
                            </Label>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
                <Button onClick={handleAddNewRole} className='w-full'>
                  Add Role
                </Button>
              </div>
            )}

            <div className='space-y-2'>
              <Label>Custom Permissions (Optional)</Label>
              <div className='grid grid-cols-2 gap-2'>
                {['view', 'edit', 'upload', 'download', 'share', 'delete', 'comment'].map(
                  (perm) => {
                    return (
                      <div key={perm} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`participant-perm-${perm}`}
                          checked={newParticipantPermissions.includes(perm)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewParticipantPermissions([...newParticipantPermissions, perm]);
                            } else {
                              setNewParticipantPermissions(
                                newParticipantPermissions.filter((p) => {
                                  return p !== perm;
                                }),
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`participant-perm-${perm}`} className='text-sm capitalize'>
                          {perm}
                        </Label>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes (Optional)</Label>
              <Textarea
                id='notes'
                value={newParticipantNotes}
                onChange={(e) => {
                  return setNewParticipantNotes(e.target.value);
                }}
                placeholder='Add any notes about this participant'
                rows={3}
              />
            </div>

            <div className='flex gap-2'>
              <Button onClick={handleAddParticipant} className='flex-1'>
                Add Participant
              </Button>
              <Button variant='outline' className='flex gap-1'>
                <Mail className='h-4 w-4' />
                <span>Send Invite</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value='existing' className='space-y-4 py-2'>
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search contacts...'
                className='pl-8'
                value={searchTerm}
                onChange={(e) => {
                  return setSearchTerm(e.target.value);
                }}
              />
            </div>

            <div className='max-h-60 overflow-y-auto space-y-2'>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  return (
                    <div
                      key={contact.id}
                      className='flex items-center justify-between p-2 hover:bg-gray-50 rounded'
                    >
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-24 w-24'>
                          <AvatarFallback>{contact.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium capitalize'>{contact.name}</p>
                          <div className='flex items-center gap-2'>
                            <p className='text-xs text-muted-foreground'>{contact.email}</p>
                            {getRoleBadge(contact.role)}
                          </div>
                        </div>
                      </div>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => {
                          return handleAddExistingContact(contact);
                        }}
                        className='h-8 w-8 p-0'
                      >
                        <UserPlus className='h-4 w-4' />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p className='text-center text-sm text-muted-foreground py-4'>No contacts found</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value='link' className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label>Project Invite Link</Label>
              <div className='flex gap-2'>
                <div className='flex-1 p-2 bg-gray-50 rounded border text-sm overflow-hidden text-ellipsis whitespace-nowrap'>
                  {inviteLink}
                </div>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={handleCopyInviteLink}
                  className='relative'
                >
                  {linkCopied ? <CheckCircle2 className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>
                Share this link with people you want to invite to the project
              </p>
            </div>
            <Button className='w-full flex gap-1'>
              <Send className='h-4 w-4' />
              <span>Send Invite Link</span>
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
