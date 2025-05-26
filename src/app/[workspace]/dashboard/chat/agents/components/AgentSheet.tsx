'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Brain,
  CalendarDays,
  ChevronDown,
  GripVertical,
  Lightbulb,
  ListChecks,
  Mail,
  MessageSquareText,
  Plus,
  SearchCode,
  Settings2,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

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
  examples?: Array<{ id: string; input: string; output: string }>;
  tools?: Tool[];
}

interface Agent {
  _id?: string;
  name: string;
  description: string;
  icon?: string;
  sections: Section[];
  createdAt?: string;
  updatedAt?: string;
}

// Available Tools
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

// Section Templates
const SECTION_TEMPLATES: Omit<Section, 'id' | 'content' | 'examples' | 'tools'>[] = [
  { type: 'system_prompt', title: 'System Prompt / Role / Persona' },
  { type: 'instructions', title: 'Instructions / Conditions' },
  { type: 'output_structure', title: 'Output Structure' },
  { type: 'examples', title: 'Examples' },
  { type: 'tools', title: 'Tools' },
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

interface AgentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAgent?: Agent;
}

const AgentSheet = ({ open, onOpenChange, existingAgent }: AgentSheetProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [currentSections, setCurrentSections] = useState<Section[]>([]);

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      if (existingAgent) {
        setAgentName(existingAgent.name);
        setAgentDescription(existingAgent.description);
        setCurrentSections(JSON.parse(JSON.stringify(existingAgent.sections)));
      } else {
        setAgentName('');
        setAgentDescription('');
        setCurrentSections([]);
      }
    }
  }, [open, existingAgent]);

  const createAgent = useMutation({
    mutationFn: async (agentData: Agent) => {
      const response = await newRequest.post('/agents', agentData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Agent created successfully');
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create agent');
    },
  });

  const updateAgent = useMutation({
    mutationFn: async (agentData: Agent) => {
      const response = await newRequest.put(`/agents/${existingAgent?._id}`, agentData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Agent updated successfully');
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update agent');
    },
  });

  const handleSaveAgent = () => {
    if (!agentName.trim()) {
      toast.error('Agent name is required');
      return;
    }

    const agentData: Agent = {
      name: agentName.trim(),
      description: agentDescription.trim(),
      sections: currentSections,
    };

    if (existingAgent) {
      updateAgent.mutate(agentData);
    } else {
      createAgent.mutate(agentData);
    }
  };

  const addSectionToAgent = (sectionTemplate: Omit<Section, 'id'>) => {
    const newSection: Section = {
      ...sectionTemplate,
      id: uuidv4(),
      ...(sectionTemplate.type === 'tools' && { tools: [] }),
      ...(sectionTemplate.type === 'examples' && { examples: [] }),
      ...(sectionTemplate.type !== 'tools' &&
        sectionTemplate.type !== 'examples' && { content: '' }),
    };
    setCurrentSections([...currentSections, newSection]);
  };

  const removeSectionFromAgent = (sectionId: string) => {
    setCurrentSections(
      currentSections.filter((s) => {
        return s.id !== sectionId;
      }),
    );
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    setCurrentSections(
      currentSections.map((s) => {
        return s.id === sectionId ? { ...s, content } : s;
      }),
    );
  };

  const addExampleToSection = (sectionId: string) => {
    setCurrentSections(
      currentSections.map((s) => {
        if (s.id === sectionId && s.type === 'examples') {
          return {
            ...s,
            examples: [...(s.examples || []), { id: uuidv4(), input: '', output: '' }],
          };
        }
        return s;
      }),
    );
  };

  const updateExampleInSection = (
    sectionId: string,
    exampleId: string,
    part: 'input' | 'output',
    value: string,
  ) => {
    setCurrentSections(
      currentSections.map((s) => {
        if (s.id === sectionId && s.type === 'examples' && s.examples) {
          const updatedExamples = s.examples.map((ex) => {
            return ex.id === exampleId ? { ...ex, [part]: value } : ex;
          });
          return { ...s, examples: updatedExamples };
        }
        return s;
      }),
    );
  };

  const removeExampleFromSection = (sectionId: string, exampleId: string) => {
    setCurrentSections(
      currentSections.map((s) => {
        if (s.id === sectionId && s.type === 'examples' && s.examples) {
          return {
            ...s,
            examples: s.examples.filter((ex) => {
              return ex.id !== exampleId;
            }),
          };
        }
        return s;
      }),
    );
  };

  const addToolToSection = (sectionId: string, tool: Tool) => {
    setCurrentSections(
      currentSections.map((s) => {
        if (s.id === sectionId && s.type === 'tools') {
          if (
            s.tools?.find((t) => {
              return t.id === tool.id;
            })
          )
            return s; // Avoid duplicates
          return { ...s, tools: [...(s.tools || []), tool] };
        }
        return s;
      }),
    );
  };

  const removeToolFromSection = (sectionId: string, toolId: ToolId) => {
    setCurrentSections(
      currentSections.map((s) => {
        if (s.id === sectionId && s.type === 'tools') {
          return {
            ...s,
            tools: s.tools?.filter((t) => {
              return t.id !== toolId;
            }),
          };
        }
        return s;
      }),
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setAgentName('');
          setAgentDescription('');
          setCurrentSections([]);
        }
        onOpenChange(isOpen);
      }}
    >
      <SheetContent
        side='right'
        className='w-[800px] !max-w-[600px] fixed right-4 top-4 bottom-4 px-12 bg-background max-h-[calc(100vh-2rem)] overflow-y-auto border rounded-lg shadow-lg [&>button]:hidden scrollbar-hide flex flex-col p-0'
      >
        <VisuallyHidden>
          <SheetTitle className='sr-only'>
            {existingAgent ? 'Edit Agent' : 'Create New Agent'}
          </SheetTitle>
        </VisuallyHidden>
        <SheetHeader className='sticky top-0 right-3 z-10 bg-background pb-4'>
          <div className='flex justify-between items-center px-6 pt-4'>
            <div>
              <h2 className='text-lg font-bold'>
                {existingAgent ? `Edit Agent: ${existingAgent.name}` : 'Create New Agent'}
              </h2>
              <p className='text-[11px] text-muted-foreground'>
                Define the agent&apos;s core attributes, instructions, and capabilities.
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className='mt-4 flex-1 px-6'>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Set the agent&apos;s name and description.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label
                  htmlFor='agentName'
                  className='block text-[11px] font-medium text-muted-foreground'
                >
                  Agent Name
                </label>
                <Input
                  id='agentName'
                  placeholder='e.g., Marketing Copywriter'
                  value={agentName}
                  onChange={(e) => {
                    return setAgentName(e.target.value);
                  }}
                  className='mt-1'
                />
              </div>
              <div>
                <label
                  htmlFor='agentDescription'
                  className='block text-[11px] font-medium text-muted-foreground'
                >
                  Agent Description
                </label>
                <Textarea
                  id='agentDescription'
                  placeholder='e.g., Generates engaging marketing copy for various platforms.'
                  value={agentDescription}
                  onChange={(e) => {
                    return setAgentDescription(e.target.value);
                  }}
                  className='mt-1'
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className='flex justify-between items-center mt-8'>
            <h3 className='text-[11px] font-medium text-muted-foreground'>Agent Configuration</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline'>
                  <Plus className='mr-2 h-4 w-4' /> Add Section{' '}
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {SECTION_TEMPLATES.map((template) => {
                  const Icon = getSectionIcon(template.type);
                  return (
                    <DropdownMenuItem
                      key={template.type}
                      onClick={() => {
                        return addSectionToAgent(template);
                      }}
                    >
                      <Icon className='mr-2 h-4 w-4' />
                      <span>{template.title}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {currentSections.length === 0 && (
            <Card className='text-center py-12 border-dashed mt-4'>
              <CardContent className='flex flex-col items-center text-muted-foreground'>
                <Sparkles className='h-12 w-12 mb-3' />
                <p className='text-[11px] font-medium'>Your agent is a blank canvas!</p>
                <p className='text-[11px]'>
                  Start by adding sections like System Prompt or Tools to define it&apos;s behavior.
                </p>
              </CardContent>
            </Card>
          )}

          <div className='space-y-4 mt-4'>
            {currentSections.map((section) => {
              const SectionIcon = getSectionIcon(section.type);
              return (
                <Card key={section.id} className='bg-card/80 dark:bg-card/50 group/section'>
                  <CardHeader className='flex flex-row items-center justify-between py-3 px-4 border-b'>
                    <div className='flex items-center space-x-3'>
                      <GripVertical className='h-5 w-5 text-muted-foreground cursor-grab opacity-50 group-hover/section:opacity-100 transition-opacity' />
                      <SectionIcon className='h-5 w-5 text-primary' />
                      <h4 className='text-[13px] font-semibold'>{section.title}</h4>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        return removeSectionFromAgent(section.id);
                      }}
                      className='h-7 w-7 text-muted-foreground hover:text-destructive'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </CardHeader>
                  <CardContent className='p-4 space-y-3'>
                    {section.type === 'system_prompt' ||
                    section.type === 'instructions' ||
                    section.type === 'output_structure' ? (
                      <Textarea
                        placeholder={`Enter ${section.title.toLowerCase()} here...`}
                        value={section.content || ''}
                        onChange={(e) => {
                          return updateSectionContent(section.id, e.target.value);
                        }}
                        rows={5}
                        className='text-[11px]'
                      />
                    ) : section.type === 'examples' ? (
                      <div className='space-y-3'>
                        {section.examples?.map((ex) => {
                          return (
                            <Card
                              key={ex.id}
                              className='bg-background/70 dark:bg-background/40 p-3'
                            >
                              <div className='space-y-2'>
                                <Textarea
                                  placeholder='Input example...'
                                  value={ex.input}
                                  onChange={(e) => {
                                    return updateExampleInSection(
                                      section.id,
                                      ex.id,
                                      'input',
                                      e.target.value,
                                    );
                                  }}
                                  rows={2}
                                  className='text-[11px]'
                                />
                                <Textarea
                                  placeholder='Expected output example...'
                                  value={ex.output}
                                  onChange={(e) => {
                                    return updateExampleInSection(
                                      section.id,
                                      ex.id,
                                      'output',
                                      e.target.value,
                                    );
                                  }}
                                  rows={2}
                                  className='text-[11px]'
                                />
                              </div>
                              <div className='mt-2 flex justify-end'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => {
                                    return removeExampleFromSection(section.id, ex.id);
                                  }}
                                  className='text-xs text-destructive hover:text-destructive-foreground hover:bg-destructive'
                                >
                                  <Trash2 className='mr-1 h-3 w-3' /> Remove Example
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            return addExampleToSection(section.id);
                          }}
                        >
                          <Plus className='mr-2 h-4 w-4' /> Add Example
                        </Button>
                        {section.examples?.length === 0 && (
                          <p className='text-[11px] text-center text-muted-foreground py-2'>
                            No examples added for this section.
                          </p>
                        )}
                      </div>
                    ) : section.type === 'tools' ? (
                      <div className='space-y-3'>
                        {section.tools?.map((tool) => {
                          const ToolIcon = tool.icon;
                          return (
                            <div
                              key={tool.id}
                              className='flex items-center justify-between p-2.5 border rounded-md bg-background/70 dark:bg-background/40 group/tool'
                            >
                              <div className='flex items-center space-x-2'>
                                <GripVertical className='h-4 w-4 text-muted-foreground cursor-grab opacity-50 group-hover/tool:opacity-100 transition-opacity' />
                                <div>
                                  <span className='text-[11px] font-medium'>{tool.name}</span>
                                  <p className='text-[11px] text-muted-foreground'>
                                    {tool.description}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => {
                                  return removeToolFromSection(section.id, tool.id);
                                }}
                                className='h-7 w-7 text-muted-foreground hover:text-destructive'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          );
                        })}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='outline' size='sm'>
                              <Plus className='mr-2 h-4 w-4' /> Add Tool{' '}
                              <ChevronDown className='ml-2 h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='start'>
                            {AVAILABLE_TOOLS.map((tool) => {
                              return (
                                <DropdownMenuItem
                                  key={tool.id}
                                  onClick={() => {
                                    return addToolToSection(section.id, tool);
                                  }}
                                  disabled={section.tools?.some((t) => {
                                    return t.id === tool.id;
                                  })}
                                >
                                  {tool.icon &&
                                    React.createElement(tool.icon, { className: 'mr-2 h-4 w-4' })}
                                  {tool.name}
                                </DropdownMenuItem>
                              );
                            })}
                            {AVAILABLE_TOOLS.every((at) => {
                              return section.tools?.some((st) => {
                                return st.id === at.id;
                              });
                            }) &&
                              section.tools &&
                              section.tools.length > 0 && (
                                <DropdownMenuItem disabled>
                                  All available tools added
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {section.tools?.length === 0 && (
                          <p className='text-[11px] text-center text-muted-foreground py-2'>
                            No tools added to this section.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <SheetFooter className='sticky bottom-0 bg-background pt-4 border-none'>
          <div className='flex justify-end space-x-3 px-6 pb-3'>
            <Button
              variant='outline'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAgent}
              disabled={createAgent.isPending || updateAgent.isPending}
            >
              <Sparkles className='mr-2 h-4 w-4' />
              {existingAgent ? 'Save Changes' : 'Create Agent'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AgentSheet;
