'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Brain,
  CalendarDays,
  Lightbulb,
  ListChecks,
  Mail,
  MessageSquareText,
  Plus,
  Search,
  SearchCode,
  Settings2,
  Wrench,
} from 'lucide-react';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AgentSheet from './components/AgentSheet';
import AgentTable from './components/AgentTable';

// Types
type ToolId = 'send_email' | 'search_web' | 'calendar_lookup';
interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

type SectionType = 'system_prompt' | 'instructions' | 'output_structure' | 'examples' | 'tools';
interface Section {
  id: string;
  type: SectionType;
  title: string;
  content?: string;
  examples?: string;
  tools?: Tool[];
}

interface Agent {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

// Mock Data
const AVAILABLE_TOOLS: Tool[] = [
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Allows the agent to send emails.',
    icon: Mail,
  },
  {
    id: 'search_web',
    name: 'Search Web',
    description: 'Enables web searching capabilities.',
    icon: SearchCode,
  },
  {
    id: 'calendar_lookup',
    name: 'Calendar Lookup',
    description: 'Accesses calendar information.',
    icon: CalendarDays,
  },
];

const SECTION_TEMPLATES: Omit<Section, 'id' | 'content' | 'examples' | 'tools'>[] = [
  { type: 'system_prompt', title: 'System Prompt / Role / Persona' },
  { type: 'instructions', title: 'Instructions / Conditions' },
  { type: 'output_structure', title: 'Output Structure' },
  { type: 'examples', title: 'Examples' },
  { type: 'tools', title: 'Tools' },
];

const mockAgents: Agent[] = [
  {
    _id: uuidv4(),
    name: 'Support Assistant',
    description: 'Handles customer support queries and provides information.',
    sections: [
      {
        id: uuidv4(),
        type: 'system_prompt',
        title: 'System Prompt / Role / Persona',
        content: 'You are a friendly and helpful support assistant.',
      },
      {
        id: uuidv4(),
        type: 'instructions',
        title: 'Instructions / Conditions',
        content: 'Always be polite. If you cannot answer, escalate to a human.',
      },
      { id: uuidv4(), type: 'tools', title: 'Tools', tools: [AVAILABLE_TOOLS[0]] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: uuidv4(),
    name: 'Content Creator',
    description: 'Generates creative content based on prompts.',
    sections: [
      {
        id: uuidv4(),
        type: 'system_prompt',
        title: 'System Prompt / Role / Persona',
        content: 'You are a creative writer specializing in marketing copy.',
      },
      {
        id: uuidv4(),
        type: 'examples',
        title: 'Examples',
        examples:
          'Input: Product: new shoes\nOutput: Step into style with our new shoe collection!\n\nInput: Service: consulting\nOutput: Transform your business with expert consulting services.',
      },
      { id: uuidv4(), type: 'tools', title: 'Tools', tools: [AVAILABLE_TOOLS[1]] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: uuidv4(),
    name: 'Meeting Scheduler',
    description: 'Helps schedule and manage meetings efficiently.',
    sections: [
      {
        id: uuidv4(),
        type: 'system_prompt',
        title: 'System Prompt / Role / Persona',
        content: 'You are an efficient meeting scheduler and calendar manager.',
      },
      {
        id: uuidv4(),
        type: 'instructions',
        title: 'Instructions / Conditions',
        content: 'Check availability before scheduling. Send confirmation emails.',
      },
      { id: uuidv4(), type: 'tools', title: 'Tools', tools: [AVAILABLE_TOOLS[2]] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: uuidv4(),
    name: 'Research Assistant',
    description: 'Conducts web research and summarizes findings.',
    sections: [
      {
        id: uuidv4(),
        type: 'system_prompt',
        title: 'System Prompt / Role / Persona',
        content: 'You are a thorough research assistant with attention to detail.',
      },
      {
        id: uuidv4(),
        type: 'output_structure',
        title: 'Output Structure',
        content: 'Provide sources, key findings, and a summary.',
      },
      { id: uuidv4(), type: 'tools', title: 'Tools', tools: [AVAILABLE_TOOLS[1]] },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getSectionIcon = (type: SectionType) => {
  switch (type) {
    case 'system_prompt':
      return Brain;
    case 'instructions':
      return MessageSquareText;
    case 'output_structure':
      return ListChecks;
    case 'examples':
      return Lightbulb;
    case 'tools':
      return Wrench;
    default:
      return Settings2;
  }
};

const AgentsPage = () => {
  const [activeTab, setActiveTab] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAgentSheetOpen, setIsAgentSheetOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleCreateAgent = () => {
    setSelectedAgent(null);
    setIsAgentSheetOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsAgentSheetOpen(true);
  };

  return (
    <div className='container mx-auto py-8 px-4 sm:px-6 lg:px-8'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>AI Agents</h1>
          <p className='text-muted-foreground mt-1'>
            Manage and configure your intelligent agents.
          </p>
        </div>
        <Button onClick={handleCreateAgent} className='mt-4 sm:mt-0'>
          <Plus className='mr-2 h-4 w-4' /> Create New Agent
        </Button>
      </div>

      <div className='flex items-center space-x-2 mb-6'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search agents...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      <AgentTable searchQuery={searchQuery} onEditAgent={handleEditAgent} mockData={mockAgents} />
      <AgentSheet
        open={isAgentSheetOpen}
        onOpenChange={setIsAgentSheetOpen}
        existingAgent={selectedAgent}
      />
    </div>
  );
};

export default AgentsPage;
