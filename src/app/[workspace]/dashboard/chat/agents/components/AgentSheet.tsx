'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  Lightbulb,
  ListChecks,
  Mail,
  MessageSquareText,
  MoreVertical,
  SearchCode,
  Settings2,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FiRadio } from 'react-icons/fi';
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
  examples?: string;
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

interface AgentSettings {
  systemPrompt: 'enable' | 'disable';
  instructions: 'enable' | 'disable';
  outputStructure: 'enable' | 'disable';
  examples: 'enable' | 'disable';
  tools: ToolId[];
  memory: 'enable' | 'disable';
  streaming: 'enable' | 'disable';
  temperature: 'low' | 'medium' | 'high';
  maxTokens: 'short' | 'medium' | 'long';
}

interface AgentSheetMenuProps {
  settings: AgentSettings;
  onSettingsChange: (settings: AgentSettings) => void;
}

const AgentSheetMenu = ({ settings, onSettingsChange }: AgentSheetMenuProps) => {
  const handleSettingChange = (key: keyof AgentSettings, value: string | ToolId[]) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const handleToolToggle = (toolId: ToolId) => {
    const currentTools = settings.tools;
    const newTools = currentTools.includes(toolId)
      ? currentTools.filter((id) => {
          return id !== toolId;
        })
      : [...currentTools, toolId];
    handleSettingChange('tools', newTools);
  };

  return (
    <div className='absolute right-3 top-3'>
      <DropdownMenu modal>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' sideOffset={5} className='z-[100] min-w-[240px]'>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Brain className='mr-2 h-4 w-4' />
              System Prompt
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.systemPrompt}
                onValueChange={(value) => {
                  return handleSettingChange('systemPrompt', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    return e.preventDefault();
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    return e.preventDefault();
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <MessageSquareText className='mr-2 h-4 w-4' />
              Instructions
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.instructions}
                onValueChange={(value) => {
                  return handleSettingChange('instructions', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    return e.preventDefault();
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    return e.preventDefault();
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ListChecks className='mr-2 h-4 w-4' />
              Output Structure
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.outputStructure}
                onValueChange={(value) => {
                  return handleSettingChange('outputStructure', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    return e.preventDefault();
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    return e.preventDefault();
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Lightbulb className='mr-2 h-4 w-4' />
              Examples
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={settings.examples}
                onValueChange={(value) => {
                  return handleSettingChange('examples', value);
                }}
              >
                <DropdownMenuRadioItem
                  value='enable'
                  onSelect={(e) => {
                    return e.preventDefault();
                  }}
                >
                  Enable
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value='disable'
                  onSelect={(e) => {
                    return e.preventDefault();
                  }}
                >
                  Disable
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Wrench className='mr-2 h-4 w-4' />
              Tools
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {AVAILABLE_TOOLS.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <DropdownMenuItem
                    key={tool.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      handleToolToggle(tool.id);
                    }}
                  >
                    <div className='flex items-center space-x-2'>
                      <ToolIcon className='h-4 w-4' />
                      <span>{tool.name}</span>
                      {settings.tools.includes(tool.id) && <span className='ml-auto'>✓</span>}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Settings2 className='mr-2 h-4 w-4' />
              Advanced Settings
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Memory</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={settings.memory}
                    onValueChange={(value) => {
                      return handleSettingChange('memory', value);
                    }}
                  >
                    <DropdownMenuRadioItem
                      value='enable'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Enable
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value='disable'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Disable
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Streaming</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={settings.streaming}
                    onValueChange={(value) => {
                      return handleSettingChange('streaming', value);
                    }}
                  >
                    <DropdownMenuRadioItem
                      value='enable'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Enable
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value='disable'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Disable
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Temperature</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={settings.temperature}
                    onValueChange={(value) => {
                      return handleSettingChange('temperature', value);
                    }}
                  >
                    <DropdownMenuRadioItem
                      value='low'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Low
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value='medium'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Medium
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value='high'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      High
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Max Tokens</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={settings.maxTokens}
                    onValueChange={(value) => {
                      return handleSettingChange('maxTokens', value);
                    }}
                  >
                    <DropdownMenuRadioItem
                      value='short'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Short
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value='medium'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Medium
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value='long'
                      onSelect={(e) => {
                        return e.preventDefault();
                      }}
                    >
                      Long
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
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
  const [agentSettings, setAgentSettings] = useState<AgentSettings>({
    systemPrompt: 'enable',
    instructions: 'enable',
    outputStructure: 'enable',
    examples: 'enable',
    tools: [],
    memory: 'enable',
    streaming: 'enable',
    temperature: 'medium',
    maxTokens: 'medium',
  });

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      if (existingAgent) {
        setAgentName(existingAgent.name);
        setAgentDescription(existingAgent.description);
        setCurrentSections(JSON.parse(JSON.stringify(existingAgent.sections)));
        // Set initial settings based on existing sections
        const initialSettings: AgentSettings = {
          systemPrompt: existingAgent.sections.some((s) => {
            return s.type === 'system_prompt';
          })
            ? 'enable'
            : 'disable',
          instructions: existingAgent.sections.some((s) => {
            return s.type === 'instructions';
          })
            ? 'enable'
            : 'disable',
          outputStructure: existingAgent.sections.some((s) => {
            return s.type === 'output_structure';
          })
            ? 'enable'
            : 'disable',
          examples: existingAgent.sections.some((s) => {
            return s.type === 'examples';
          })
            ? 'enable'
            : 'disable',
          tools:
            existingAgent.sections
              .find((s) => {
                return s.type === 'tools';
              })
              ?.tools?.map((t) => {
                return t.id;
              }) || [],
          memory: 'enable',
          streaming: 'enable',
          temperature: 'medium',
          maxTokens: 'medium',
        };
        setAgentSettings(initialSettings);
      } else {
        setAgentName('');
        setAgentDescription('');
        setCurrentSections([]);
        setAgentSettings({
          systemPrompt: 'enable',
          instructions: 'enable',
          outputStructure: 'enable',
          examples: 'enable',
          tools: [],
          memory: 'enable',
          streaming: 'enable',
          temperature: 'medium',
          maxTokens: 'medium',
        });
      }
    }
  }, [open, existingAgent]);

  // Update sections based on settings changes
  useEffect(() => {
    const updateSections = () => {
      const newSections: Section[] = [];

      if (agentSettings.systemPrompt === 'enable') {
        const existingSection = currentSections.find((s) => {
          return s.type === 'system_prompt';
        });
        if (existingSection) {
          newSections.push(existingSection);
        } else {
          newSections.push({
            id: uuidv4(),
            type: 'system_prompt',
            title: 'System Prompt / Role / Persona',
            content: '',
          });
        }
      }

      if (agentSettings.instructions === 'enable') {
        const existingSection = currentSections.find((s) => {
          return s.type === 'instructions';
        });
        if (existingSection) {
          newSections.push(existingSection);
        } else {
          newSections.push({
            id: uuidv4(),
            type: 'instructions',
            title: 'Instructions / Conditions',
            content: '',
          });
        }
      }

      if (agentSettings.outputStructure === 'enable') {
        const existingSection = currentSections.find((s) => {
          return s.type === 'output_structure';
        });
        if (existingSection) {
          newSections.push(existingSection);
        } else {
          newSections.push({
            id: uuidv4(),
            type: 'output_structure',
            title: 'Output Structure',
            content: '',
          });
        }
      }

      if (agentSettings.examples === 'enable') {
        const existingSection = currentSections.find((s) => {
          return s.type === 'examples';
        });
        if (existingSection) {
          newSections.push(existingSection);
        } else {
          newSections.push({
            id: uuidv4(),
            type: 'examples',
            title: 'Examples',
            examples: '',
          });
        }
      }

      if (agentSettings.tools.length > 0) {
        const existingSection = currentSections.find((s) => {
          return s.type === 'tools';
        });
        if (existingSection) {
          // Update tools based on settings
          const updatedTools = AVAILABLE_TOOLS.filter((tool) => {
            return agentSettings.tools.includes(tool.id);
          });
          newSections.push({
            ...existingSection,
            tools: updatedTools,
          });
        } else {
          newSections.push({
            id: uuidv4(),
            type: 'tools',
            title: 'Tools',
            tools: AVAILABLE_TOOLS.filter((tool) => {
              return agentSettings.tools.includes(tool.id);
            }),
          });
        }
      }

      setCurrentSections(newSections);
    };

    updateSections();
  }, [agentSettings]);

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
      ...(sectionTemplate.type === 'examples' && { examples: '' }),
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
        if (s.id === sectionId) {
          if (s.type === 'examples') {
            return { ...s, examples: content };
          }
          return { ...s, content };
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
            <AgentSheetMenu settings={agentSettings} onSettingsChange={setAgentSettings} />
          </div>
        </SheetHeader>

        <div className='flex-1 px-6'>
          <div className='space-y-4 px-1'>
            <div className=''>
              <div className='flex items-center mb-4'>
                <FiRadio className='h-5 w-5 text-primary mr-2' />
                <h4 className='text-[13px] font-semibold'>Agent Name</h4>
              </div>
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
          </div>

          <div className='space-y-4 mt-4'>
            {currentSections.map((section) => {
              const SectionIcon = getSectionIcon(section.type);
              return (
                <Accordion key={section.id} type='single' collapsible className='w-full'>
                  <AccordionItem value={section.id} className='border-none'>
                    <AccordionTrigger className='py-3  hover:no-underline px-1'>
                      <div className='flex items-center'>
                        <SectionIcon className='h-5 w-5 text-primary mr-2' />
                        <h4 className='text-[13px] font-semibold'>{section.title}</h4>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className=' pb-4 p-1'>
                      {section.type === 'system_prompt' ||
                      section.type === 'instructions' ||
                      section.type === 'output_structure' ||
                      section.type === 'examples' ? (
                        <div className=''>
                          <Textarea
                            placeholder={`Enter ${section.title.toLowerCase()} here...`}
                            value={
                              section.type === 'examples'
                                ? section.examples || ''
                                : section.content || ''
                            }
                            onChange={(e) => {
                              return updateSectionContent(section.id, e.target.value);
                            }}
                            rows={5}
                            className='text-[11px]'
                          />
                        </div>
                      ) : section.type === 'tools' ? (
                        <div className='space-y-2'>
                          {section.tools?.map((tool) => {
                            const ToolIcon = tool.icon;
                            return (
                              <div
                                key={tool.id}
                                className='flex items-center space-x-2 text-[11px] text-muted-foreground'
                              >
                                <ToolIcon className='h-4 w-4' />
                                <span>{tool.name}</span>
                              </div>
                            );
                          })}
                          {section.tools?.length === 0 && (
                            <p className='text-[11px] text-center text-muted-foreground'>
                              No tools selected. Use the menu to add tools.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
