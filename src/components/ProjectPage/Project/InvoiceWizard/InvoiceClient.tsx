import CreateClientDialog from '@/components/ProjectPage/NewProjectDialog/CreateClientDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Edit, MoreVertical, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface InvoiceClientProps {
  clients: any[];
  selectedClient: any | null;
  handleSelectClient: (client: any) => void;
}

const InvoiceClient = ({ clients, selectedClient, handleSelectClient }: InvoiceClientProps) => {
  const { project } = useProject();
  const participants = project.participants || [];
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Helper function to check if a client is selected
  const isClientSelected = (client: any) => {
    if (!selectedClient) return false;

    // Check for id match
    if (selectedClient.id && client.id) {
      return selectedClient.id === client.id;
    }

    // Check for _id match
    if (selectedClient._id && client._id) {
      return selectedClient._id === client._id;
    }

    return false;
  };

  const handleClientCreated = (newClient: any) => {
    // Select the newly created client
    handleSelectClient(newClient);
  };

  const handleEditClient = (client: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setClientToEdit(client);
    setIsClientDialogOpen(true);
  };

  const handleDeleteClient = async (client: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const clientId = client.id || client._id;
      await newRequest.delete(`/workspaces/clients/${clientId}`);

      toast.success('Client deleted successfully');

      // If the deleted client was selected, clear the selection
      if (isClientSelected(client)) {
        handleSelectClient(null);
      }

      // Invalidate clients query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      if (project) {
        queryClient.invalidateQueries({ queryKey: ['project'] });
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      key='client'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='space-y-4'
    >
      <div className='relative'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input placeholder='Search clients...' className='w-full pl-8' />
      </div>

      {participants.length > 0 && (
        <div className='space-y-2'>
          <h3 className='font-medium flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Project Participants
          </h3>
          {participants.map((participant: any) => {
            return (
              <div
                key={participant._id}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors',
                  isClientSelected(participant) && 'border-primary bg-primary/5',
                )}
                onClick={() => {
                  return handleSelectClient(participant);
                }}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar>
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className='font-medium'>{participant.name}</h3>
                      <p className='text-sm text-muted-foreground'>{participant.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {isClientSelected(participant) && (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => {
                              return e.stopPropagation();
                            }}
                          >
                            <Button variant='ghost' size='icon' className='h-8 w-8'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={(e) => {
                                return handleEditClient(participant, e);
                              }}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                return handleDeleteClient(participant, e);
                              }}
                              disabled={isDeleting}
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Check className='h-5 w-5 text-primary' />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {clients.length > 0 && (
        <div className='space-y-2'>
          <h3 className='font-medium'>Clients</h3>
          {clients.map((client: any) => {
            return (
              <div
                key={client.id}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors',
                  isClientSelected(client) && 'border-primary bg-primary/5',
                )}
                onClick={() => {
                  return handleSelectClient(client);
                }}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar>
                      <AvatarImage src={client.avatar || '/placeholder.svg'} />
                      <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className='font-medium'>{client.name}</h3>
                      <p className='text-sm text-muted-foreground'>{client.company}</p>
                      <p className='text-sm text-muted-foreground'>{client.email}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {isClientSelected(client) && (
                      <>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => {
                              return e.stopPropagation();
                            }}
                          >
                            <Button variant='ghost' size='icon' className='h-8 w-8'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={(e) => {
                                return handleEditClient(client, e);
                              }}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                return handleDeleteClient(client, e);
                              }}
                              disabled={isDeleting}
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Check className='h-5 w-5 text-primary' />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button
        className='w-full'
        onClick={() => {
          setClientToEdit(null);
          return setIsClientDialogOpen(true);
        }}
      >
        <Plus className='mr-2 h-4 w-4' />
        Add New Client
      </Button>

      <CreateClientDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onClientCreated={handleClientCreated}
        project={project}
        clientToEdit={clientToEdit}
      />
    </motion.div>
  );
};

export default InvoiceClient;
