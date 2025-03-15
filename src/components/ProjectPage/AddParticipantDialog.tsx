import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useProject } from '@/contexts/ProjectContext';
import { useParticipantForm } from '@/hooks/useParticipantForm';
import { useParticipantMutations } from '@/hooks/useParticipantMutations';
import { cn } from '@/lib/utils';
import { participantService } from '@/services/participantService';
import { Participant, Role } from '@/types/project';
import { useQuery } from '@tanstack/react-query';
import { ChevronDownIcon, PhoneIcon, Plus, Search, UserPlus, X } from 'lucide-react';
import { useId, useState } from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { toast } from 'sonner';

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
  const [searchTerm, setSearchTerm] = useState('');
  const phoneInputId = useId();
  const { project } = useProject();
  const [error, setError] = useState('');

  const { formData, setters, validation, customFieldHandlers, resetForm } = useParticipantForm();

  const { addParticipantMutation, addExistingContactMutation } = useParticipantMutations(
    project?._id || '',
    onOpenChange,
  );

  // Fetch existing contacts using React Query
  const { data: previousContacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['participants'],
    queryFn: participantService.fetchParticipants,
    enabled: isOpen,
  });

  const filteredContacts = previousContacts.filter((contact) => {
    return (
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleAddParticipant = async () => {
    const isNameValid = validation.validateName(formData.name);
    const isEmailValid = validation.validateEmail(formData.email);

    if (!isNameValid || !isEmailValid) {
      toast.error('Validation Error', {
        description: 'Please fix the errors in the form before submitting.',
      });
      return;
    }

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dateAdded: new Date().toISOString().split('T')[0],
      notes: formData.notes,
      customFields: formData.customFields,
    };

    addParticipantMutation.mutate(newParticipant);
  };

  const handleAddExistingContact = async (contact: Participant) => {
    addExistingContactMutation.mutate(contact);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Manage Project Participants</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue='invite'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='invite'>Invite New</TabsTrigger>
            <TabsTrigger value='existing'>Existing Participants</TabsTrigger>
          </TabsList>

          <TabsContent value='invite' className='space-y-4 py-2'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => {
                  setters.setName(e.target.value);
                  if (validation.nameError) validation.validateName(e.target.value);
                }}
                onBlur={(e) => {
                  return validation.validateName(e.target.value);
                }}
                placeholder='Enter participant name'
                className={validation.nameError ? 'border-red-500' : ''}
              />
              {validation.nameError && (
                <p className='text-xs text-red-500 mt-1'>{validation.nameError}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) => {
                  setters.setEmail(e.target.value);
                  if (validation.emailError) validation.validateEmail(e.target.value);
                }}
                onBlur={(e) => {
                  return validation.validateEmail(e.target.value);
                }}
                placeholder='Enter email address'
                className={validation.emailError ? 'border-red-500' : ''}
              />
              {validation.emailError && (
                <p className='text-xs text-red-500 mt-1'>{validation.emailError}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor={phoneInputId}>Phone (optional)</Label>
              <RPNInput.default
                className='flex rounded-md shadow-xs'
                international
                flagComponent={FlagComponent}
                countrySelectComponent={CountrySelect}
                inputComponent={PhoneInput}
                id={phoneInputId}
                placeholder='Enter phone number'
                value={formData.phone}
                onChange={(newValue) => {
                  return setters.setPhone(newValue ?? '');
                }}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes (Optional)</Label>
              <Textarea
                id='notes'
                value={formData.notes}
                onChange={(e) => {
                  return setters.setNotes(e.target.value);
                }}
                placeholder='Add any notes about this participant'
                rows={3}
              />
            </div>

            {/* Custom Fields Section */}
            <div className='space-y-3 pb-2'>
              <div className='flex items-center justify-between'>
                <Label>Custom Fields</Label>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground'
                  onClick={() => {
                    return setters.setNewFieldName('Field Name');
                  }}
                >
                  <Plus className='h-3 w-3' />
                  Add Field
                </Button>
              </div>

              {formData.newFieldName !== '' && (
                <div className='flex items-center gap-2'>
                  <Input
                    placeholder='Field name'
                    value={formData.newFieldName}
                    onChange={(e) => {
                      return setters.setNewFieldName(e.target.value);
                    }}
                    className='flex-1'
                  />
                  <Button
                    size='sm'
                    onClick={customFieldHandlers.handleAddCustomField}
                    disabled={!formData.newFieldName.trim()}
                  >
                    Add
                  </Button>
                </div>
              )}

              {formData.customFields.map((field, index) => {
                return (
                  <div key={index} className='flex items-center gap-2'>
                    <Label className='w-1/3 text-sm'>{field.key}</Label>
                    <Input
                      value={field.value}
                      onChange={(e) => {
                        return customFieldHandlers.handleUpdateCustomField(index, e.target.value);
                      }}
                      placeholder={`Enter ${field.key.toLowerCase()}`}
                      className='flex-1'
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        return customFieldHandlers.handleRemoveCustomField(index);
                      }}
                      className='h-8 w-8 p-0'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div>{error && <p className='text-xs text-red-500 mt-1'>{error}</p>}</div>
            <div className='flex gap-2'>
              <Button
                onClick={handleAddParticipant}
                className='flex-1 gap-1'
                disabled={!validation.isFormValid || addParticipantMutation.isPending}
                isLoading={addParticipantMutation.isPending}
              >
                {!addParticipantMutation.isPending && <UserPlus className='h-4 w-4' />}
                Add Participant
              </Button>
            </div>
          </TabsContent>

          <TabsContent value='existing' className='space-y-4 py-2'>
            <div className='relative'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search existing participants...'
                className='pl-8'
                value={searchTerm}
                onChange={(e) => {
                  return setSearchTerm(e.target.value);
                }}
              />
            </div>

            <div className='max-h-72 overflow-y-auto space-y-2 rounded-md border p-1'>
              {isLoadingContacts ? (
                <div className='text-center py-8 px-4'>
                  <p className='text-sm text-muted-foreground'>Loading contacts...</p>
                </div>
              ) : filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  return (
                    <div
                      key={contact.id}
                      className='flex items-center justify-between p-3 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200 transition-all'
                    >
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-10 w-10 border border-gray-100 shadow-sm'>
                          <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                            {contact.name
                              ?.split(' ')
                              .map((name) => {
                                return name[0];
                              })
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium'>{contact.name}</p>
                          <div className='flex flex-col gap-1 mt-1 sm:flex-row sm:items-center sm:gap-2'>
                            <p className='text-xs text-muted-foreground'>{contact.email}</p>
                          </div>
                          <p className='text-xs text-muted-foreground mt-1'>{contact.phone}</p>
                        </div>
                      </div>
                      <Button
                        size='sm'
                        onClick={() => {
                          return handleAddExistingContact(contact);
                        }}
                        className='h-8 gap-1'
                        disabled={addExistingContactMutation.isPending}
                        isLoading={addExistingContactMutation.isPending}
                      >
                        {!addExistingContactMutation.isPending && (
                          <UserPlus className='h-3.5 w-3.5' />
                        )}
                        <span className='hidden sm:inline'>Add</span>
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className='text-center py-8 px-4'>
                  <p className='text-sm text-muted-foreground mb-2'>No contacts found</p>
                  <p className='text-xs text-muted-foreground'>
                    Try a different search term or add a new participant
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

const PhoneInput = ({ className, ...props }: React.ComponentProps<'input'>) => {
  return (
    <Input
      data-slot='phone-input'
      className={cn('-ms-px rounded-s-none shadow-none focus-visible:z-10', className)}
      {...props}
    />
  );
};

PhoneInput.displayName = 'PhoneInput';

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: { label: string; value: RPNInput.Country | undefined }[];
};

const CountrySelect = ({ disabled, value, onChange, options }: CountrySelectProps) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as RPNInput.Country);
  };

  return (
    <div className='border-input bg-background text-muted-foreground focus-within:border-ring focus-within:ring-ring/50 hover:bg-accent hover:text-foreground has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 relative inline-flex items-center self-stretch rounded-s-md border py-2 ps-3 pe-2 transition-[color,box-shadow] outline-none focus-within:z-10 focus-within:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50'>
      <div className='inline-flex items-center gap-1' aria-hidden='true'>
        <FlagComponent country={value} countryName={value} aria-hidden='true' />
        <span className='text-muted-foreground/80'>
          <ChevronDownIcon size={16} aria-hidden='true' />
        </span>
      </div>
      <select
        disabled={disabled}
        value={value}
        onChange={handleSelect}
        className='absolute inset-0 text-sm opacity-0'
        aria-label='Select country'
      >
        <option key='default' value=''>
          Select a country
        </option>
        {options
          .filter((x) => {
            return x.value;
          })
          .map((option, i) => {
            return (
              <option key={option.value ?? `empty-${i}`} value={option.value}>
                {option.label} {option.value && `+${RPNInput.getCountryCallingCode(option.value)}`}
              </option>
            );
          })}
      </select>
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className='w-5 rounded-sm'>
      {Flag ? <Flag title={countryName} /> : <PhoneIcon size={16} aria-hidden='true' />}
    </span>
  );
};
