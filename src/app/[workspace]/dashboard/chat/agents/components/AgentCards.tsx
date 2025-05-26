'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
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

interface AgentCardsProps {
  searchQuery: string;
  onEditAgent: (agent: Agent) => void;
}

const AgentCards = ({ searchQuery, onEditAgent }: AgentCardsProps) => {
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
      <Card className='text-center py-12 border-dashed'>
        <CardContent className='flex flex-col items-center text-muted-foreground'>
          <Bot className='h-12 w-12 mb-3' />
          <p className='text-lg font-medium'>No AI Agents Found</p>
          <p className='text-sm'>
            {searchQuery
              ? 'No agents match your search criteria.'
              : 'Click "Create New Agent" to build your first intelligent assistant.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {filteredAgents.map((agent) => {
        return (
          <Card
            key={agent._id}
            className='flex flex-col hover:shadow-lg transition-shadow duration-200'
          >
            <CardHeader className='pb-3'>
              <div className='flex items-start justify-between'>
                <div className='flex items-center space-x-3'>
                  <Bot className='h-10 w-10 text-primary flex-shrink-0' />
                  <div>
                    <CardTitle className='text-lg'>{agent.name}</CardTitle>
                    <CardDescription className='text-xs line-clamp-2 h-8'>
                      {agent.description || 'No description provided.'}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className='flex-grow pt-2 pb-3'>
              <h5 className='text-xs font-semibold text-muted-foreground mb-1.5'>
                Key Components:
              </h5>
              {agent.sections.length > 0 ? (
                <div className='flex flex-wrap gap-1.5'>
                  {agent.sections.slice(0, 4).map((section, index) => {
                    return (
                      <span
                        key={index}
                        title={section.title}
                        className='flex items-center text-xs bg-muted dark:bg-muted/30 px-2 py-1 rounded-md'
                      >
                        {section.type === 'tools'
                          ? `Tools (${section.tools?.length || 0})`
                          : section.title.split(' ')[0]}
                      </span>
                    );
                  })}
                  {agent.sections.length > 4 && (
                    <span className='text-xs bg-muted dark:bg-muted/30 px-2 py-1 rounded-md'>
                      ...
                    </span>
                  )}
                </div>
              ) : (
                <p className='text-xs text-muted-foreground'>No components configured.</p>
              )}
            </CardContent>
            <CardFooter className='border-t pt-4 flex justify-end space-x-2'>
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive-foreground hover:bg-destructive'
                onClick={() => {
                  return handleDeleteAgent(agent._id);
                }}
              >
                <Trash2 className='mr-1.5 h-3.5 w-3.5' /> Delete
              </Button>
              <Button
                variant='default'
                size='sm'
                onClick={() => {
                  return onEditAgent(agent);
                }}
              >
                <Edit3 className='mr-1.5 h-3.5 w-3.5' /> Edit
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default AgentCards;
