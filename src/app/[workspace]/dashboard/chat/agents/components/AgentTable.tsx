'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Bot, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Agent {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  sections: Array<{
    type: string;
    title: string;
    content?: string;
    tools?: Array<{ id: string; name: string }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface AgentTableProps {
  searchQuery: string;
  onEditAgent: (agent: Agent) => void;
}

const AgentTable = ({ searchQuery, onEditAgent }: AgentTableProps) => {
  const { data: agents = [], refetch } = useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await newRequest.get('/agents');
      return response.data.agents;
    },
  });

  const filteredAgents = agents.filter((agent) => {
    return (
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await newRequest.delete(`/agents/${agentId}`);
        toast.success('Agent deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete agent');
        console.error('Error deleting agent:', error);
      }
    }
  };

  if (filteredAgents.length === 0) {
    return (
      <div className='text-center py-12 border rounded-lg'>
        <Bot className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
        <p className='text-lg font-medium'>No AI Agents Found</p>
        <p className='text-sm text-muted-foreground'>
          {searchQuery
            ? 'No agents match your search criteria.'
            : 'Click "Create New Agent" to build your first intelligent assistant.'}
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Components</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAgents.map((agent) => {
            return (
              <TableRow key={agent._id}>
                <TableCell className='font-medium'>
                  <div className='flex items-center space-x-2'>
                    <Bot className='h-5 w-5 text-primary' />
                    <span>{agent.name}</span>
                  </div>
                </TableCell>
                <TableCell className='max-w-[300px] truncate'>
                  {agent.description || 'No description provided.'}
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap gap-1'>
                    {agent.sections.slice(0, 3).map((section, index) => {
                      return (
                        <span
                          key={index}
                          className='text-xs bg-muted dark:bg-muted/30 px-2 py-1 rounded-md'
                        >
                          {section.type === 'tools'
                            ? `Tools (${section.tools?.length || 0})`
                            : section.title.split(' ')[0]}
                        </span>
                      );
                    })}
                    {agent.sections.length > 3 && (
                      <span className='text-xs bg-muted dark:bg-muted/30 px-2 py-1 rounded-md'>
                        +{agent.sections.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {format(new Date(agent.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className='text-muted-foreground'>
                  {format(new Date(agent.updatedAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end space-x-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-destructive hover:text-destructive-foreground hover:bg-destructive'
                      onClick={() => {
                        return handleDeleteAgent(agent._id);
                      }}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        return onEditAgent(agent);
                      }}
                    >
                      <Edit3 className='h-4 w-4' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AgentTable;
