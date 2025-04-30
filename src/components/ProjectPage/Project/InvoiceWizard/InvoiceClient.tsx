import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Plus, Search } from 'lucide-react';

interface InvoiceClientProps {
  clients: any[];
  selectedClient: any | null;
  handleSelectClient: (client: any) => void;
}

const InvoiceClient = ({ clients, selectedClient, handleSelectClient }: InvoiceClientProps) => {
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

      <div className='space-y-2'>
        {clients.map((client: any) => {
          return (
            <div
              key={client.id}
              className={cn(
                'border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors',
                selectedClient?.id === client.id && 'border-primary bg-primary/5',
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
                {selectedClient?.id === client.id && <Check className='h-5 w-5 text-primary' />}
              </div>
            </div>
          );
        })}
      </div>

      <Button className='w-full'>
        <Plus className='mr-2 h-4 w-4' />
        Add New Client
      </Button>
    </motion.div>
  );
};

export default InvoiceClient;
