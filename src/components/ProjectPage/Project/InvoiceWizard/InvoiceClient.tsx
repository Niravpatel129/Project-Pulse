import CreateClientDialog from '@/components/ProjectPage/NewProjectDialog/CreateClientDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Plus, Search, Users } from 'lucide-react';
import { useState } from 'react';

interface InvoiceClientProps {
  clients: any[];
  selectedClient: any | null;
  handleSelectClient: (client: any) => void;
}

const InvoiceClient = ({ clients, selectedClient, handleSelectClient }: InvoiceClientProps) => {
  const { project } = useProject();
  const participants = project.participants || [];
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

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
                  {isClientSelected(participant) && <Check className='h-5 w-5 text-primary' />}
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
                  {isClientSelected(client) && <Check className='h-5 w-5 text-primary' />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button
        className='w-full'
        onClick={() => {
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
      />
    </motion.div>
  );
};

export default InvoiceClient;
