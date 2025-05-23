'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useParticipation } from '@/hooks/useParticipation';
import { usePipelineSettings } from '@/hooks/usePipelineSettings';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, Check, Circle, Paperclip, Plus, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import FileUploadManagerModal from '../FileComponents/FileUploadManagerModal';
import CreateClientDialog from './CreateClientDialog';

interface Stage {
  _id: string;
  name: string;
  color: string;
}

interface Status {
  _id: string;
  name: string;
  color: string;
}

interface TeamMember {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: any; // Allow additional properties from the hook
}

export default function NewProjectDialog({ open = true, onClose = () => {} }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Get pipeline settings from API
  const { stages, statuses, isLoading } = usePipelineSettings();
  const { teamMembers, isLoading: isLoadingTeamMembers } = useTeamMembers();

  // State for dropdown selections
  const [stage, setStage] = useState<Stage | null>(stages[0] || null);
  const [state, setState] = useState<Status | null>(statuses[0] || null);
  const [manager, setManager] = useState<TeamMember | null>(null);
  const [client, setClient] = useState<TeamMember[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [isCreateClientDialogOpen, setIsCreateClientDialogOpen] = useState(false);

  const { participants } = useParticipation();

  // State for filtered items
  const [filteredStages, setFilteredStages] = useState<Stage[]>([]);
  const [filteredStatuses, setFilteredStatuses] = useState<Status[]>([]);
  const [filteredTeamMembers, setFilteredTeamMembers] = useState<TeamMember[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<TeamMember[]>([]);

  // Add a ref to track initialization
  const initializedRef = useRef(false);

  // Initialize filtered items when data loads
  useEffect(() => {
    if (!initializedRef.current) {
      if (stages?.length) setFilteredStages(stages);
      if (statuses?.length) setFilteredStatuses(statuses);
      if (teamMembers?.length) setFilteredTeamMembers(teamMembers);
      if (participants?.length) setFilteredParticipants(participants);

      if (stages?.length || statuses?.length || teamMembers?.length || participants?.length) {
        initializedRef.current = true;
      }
    }
  }, [stages, statuses, teamMembers, participants]);

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: Status | null) => {
    if (!status?.name) return null;
    return (
      <div
        className='flex items-center text-xs font-medium'
        style={{
          color: status.color,
          borderColor: `${status.color}40`,
        }}
      >
        <div
          className='h-2 w-2 rounded-full mr-1.5'
          style={{ backgroundColor: status.color }}
        ></div>
        {status.name}
      </div>
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const newAttachments = Array.from(e.target.files).map((file: any) => {
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          file,
        };
      });
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleClientCreated = (newClient: any) => {
    console.log('🚀 newClient:', newClient);
    setClient([...client, newClient.participant]);
  };

  // Common dropdown menu content styles
  const dropdownContentClasses =
    'w-[180px] rounded-md border border-gray-200 shadow-sm p-0 max-h-[300px] flex flex-col';

  // Common dropdown menu item styles
  const dropdownItemClasses =
    'flex items-center justify-between text-xs py-1.5 rounded-sm text-gray-600 focus:text-gray-700 focus:bg-gray-50';

  // Common button styles for triggers
  const buttonTriggerClasses =
    'h-6 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50 px-2';

  // Common popover content styles
  const popoverContentClasses =
    'w-auto p-0 border border-gray-200 shadow-sm rounded-md min-w-[290px]';

  // Helper function for date buttons with clear functionality
  const renderDateButton = (date, setDate, placeholder) => {
    return (
      <Button variant='outline' size='sm' className={buttonTriggerClasses}>
        <Calendar className='h-3 w-3 mr-1 text-gray-400' />
        {date ? date.toLocaleDateString() : placeholder}
        {date && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setDate(null);
            }}
            className='!-m-1 !p-0 inline-flex'
          >
            <X className='h-2 w-2 text-gray-400' />
          </div>
        )}
      </Button>
    );
  };

  const handleCreateProject = async () => {
    setIsSubmitting(true);
    try {
      const projectData = {
        name: title,
        stage: stage?._id,
        status: state?._id,
        description: description,
        manager: manager?._id,
        participants: client.map((c) => {
          return c._id;
        }),
        startDate: startDate?.toISOString(),
        targetDate: targetDate?.toISOString(),
        attachments: attachments.map((file) => {
          return {
            fileId: file._id,
            name: file.originalName,
            size: file.size,
            type: file.contentType,
          };
        }),
      };

      const response = await newRequest.post('/projects', projectData);

      toast.success('Project created successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFileToProject = (file) => {
    setAttachments([...attachments, file]);
    setIsFileManagerOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] sm:max-w-[900px] p-0 gap-0 overflow-hidden border border-gray-200 shadow-sm rounded-lg min-h-[85vh] flex flex-col'>
        <VisuallyHidden>
          <DialogTitle>New Client Work</DialogTitle>
        </VisuallyHidden>

        <div className='p-5 space-y-5 flex-1 flex flex-col overflow-hidden'>
          <div className='flex items-center'>
            <VisuallyHidden>
              <div>New Client Work</div>
            </VisuallyHidden>
            <div className='flex items-center text-xs text-gray-500 font-medium'>
              <div className='flex items-center justify-center h-5 rounded text-gray-500 mr-2 w-full'>
                <span className='text-xs'>New Client Work</span>
              </div>
            </div>
          </div>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 rounded-full absolute right-5 top-5'
            onClick={onClose}
          >
            <X className='h-4 w-4 text-gray-500' />
          </Button>
          <div className='flex items-start space-x-3'>
            <div className='flex-1 space-y-1.5'>
              <Input
                className='rounded-none shadow-none border-none !text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300'
                value={title}
                onChange={(e) => {
                  return setTitle(e.target.value);
                }}
                placeholder='Project title'
              />
            </div>
          </div>

          <div className='flex flex-wrap gap-1.5 pt-2'>
            {/* Pipeline Stage Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className={buttonTriggerClasses}
                  disabled={isLoading}
                >
                  <Circle
                    className='h-3 w-3 mr-1'
                    style={{
                      color: stage?.color || '#3b82f6',
                    }}
                  />
                  {stage?.name || 'Select stage'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className={dropdownContentClasses}>
                <div className='p-1 border-b border-gray-100'>
                  <Input
                    className='h-7 text-xs'
                    placeholder='Search stages...'
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filtered =
                        stages?.filter((stage) => {
                          return stage.name.toLowerCase().includes(searchTerm);
                        }) || [];
                      setFilteredStages(filtered);
                    }}
                  />
                </div>
                <div className='overflow-y-auto'>
                  {filteredStages.map((option) => {
                    return (
                      <DropdownMenuItem
                        key={option._id}
                        onClick={() => {
                          return setStage(option);
                        }}
                        className={dropdownItemClasses}
                      >
                        <div className='flex items-center'>
                          <div
                            className='h-2 w-2 rounded-full mr-2'
                            style={{ backgroundColor: option.color }}
                          ></div>
                          {option.name}
                        </div>
                        {stage?._id === option._id && <Check className='h-3 w-3 text-gray-500' />}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Project State Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className={buttonTriggerClasses}
                  disabled={isLoading}
                >
                  {renderStatusBadge(state) || 'Select status'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className={dropdownContentClasses}>
                <div className='p-1 border-b border-gray-100'>
                  <Input
                    className='h-7 text-xs'
                    placeholder='Search statuses...'
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filtered =
                        statuses?.filter((status) => {
                          return status.name.toLowerCase().includes(searchTerm);
                        }) || [];
                      setFilteredStatuses(filtered);
                    }}
                  />
                </div>
                <div className='overflow-y-auto'>
                  {filteredStatuses.map((option) => {
                    return (
                      <DropdownMenuItem
                        key={option._id}
                        onClick={() => {
                          return setState(option);
                        }}
                        className={dropdownItemClasses}
                      >
                        {renderStatusBadge(option)}
                        {state?._id === option._id && <Check className='h-3 w-3 text-gray-500' />}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Manager Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className={buttonTriggerClasses}
                  disabled={isLoadingTeamMembers}
                >
                  <Users className='h-3 w-3 mr-1 text-gray-400' />
                  {manager ? manager.name || '' : 'Manager'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className={dropdownContentClasses}>
                <div className='p-1 border-b border-gray-100'>
                  <Input
                    className='h-7 text-xs'
                    placeholder='Search managers...'
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filtered =
                        teamMembers?.filter((member: any) => {
                          return member?.name?.toLowerCase().includes(searchTerm) || '';
                        }) || [];
                      setFilteredTeamMembers(filtered);
                    }}
                  />
                </div>
                <div className='overflow-y-auto'>
                  {filteredTeamMembers.map(({ user }) => {
                    console.log('🚀 filteredTeamMembers:', filteredTeamMembers);
                    return (
                      <DropdownMenuItem
                        key={user._id}
                        onClick={() => {
                          return setManager(user);
                        }}
                        className={dropdownItemClasses}
                      >
                        <div className='flex items-center'>
                          <Avatar className='h-4 w-4 mr-1.5'>
                            <AvatarFallback className='text-[10px]'>
                              {user.name?.charAt(0) || ''}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name || ''}</span>
                        </div>
                        {manager?._id === user._id && <Check className='h-3 w-3 text-gray-500' />}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Client Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className={buttonTriggerClasses}>
                  <Users className='h-3 w-3 mr-1 text-gray-400' />
                  Client {client.length > 0 && `(${client.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className={dropdownContentClasses}>
                <div className='p-1 border-b border-gray-100'>
                  <Input
                    className='h-7 text-xs'
                    placeholder='Search clients...'
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      const filtered =
                        participants?.filter((participant) => {
                          return participant.name?.toLowerCase().includes(searchTerm) || '';
                        }) || [];
                      setFilteredParticipants(filtered);
                    }}
                  />
                </div>
                <div className='overflow-y-auto'>
                  {filteredParticipants.map((user) => {
                    return (
                      <DropdownMenuItem
                        key={user._id}
                        onClick={() => {
                          if (
                            client.some((m) => {
                              return m._id === user._id;
                            })
                          ) {
                            setClient(
                              client.filter((m) => {
                                return m._id !== user._id;
                              }),
                            );
                          } else {
                            setClient([...client, user]);
                          }
                        }}
                        className={dropdownItemClasses}
                      >
                        <div className='flex items-center'>
                          <Avatar className='h-4 w-4 mr-1.5'>
                            <AvatarFallback className='text-[10px]'>
                              {user.name?.charAt(0) || ''}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name || ''}</span>
                        </div>
                        {client.some((m) => {
                          return m._id === user._id;
                        }) && <Check className='h-3 w-3 text-gray-500' />}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
                <DropdownMenuItem
                  onClick={() => {
                    return setIsCreateClientDialogOpen(true);
                  }}
                  className='flex items-center text-xs py-1.5 rounded-sm text-gray-600 focus:text-gray-700 focus:bg-gray-50 '
                >
                  <Plus className='h-3 w-3 mr-1.5 text-gray-400' />
                  Create New Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Start Date Popover */}
            <Popover>
              <PopoverTrigger asChild>
                {renderDateButton(startDate, setStartDate, 'Start date')}
              </PopoverTrigger>
              <PopoverContent className={popoverContentClasses} align='start'>
                <CalendarComponent
                  mode='single'
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className='rounded-md'
                />
              </PopoverContent>
            </Popover>

            {/* Target Date Popover */}
            <Popover>
              <PopoverTrigger asChild>
                {renderDateButton(targetDate, setTargetDate, 'Target date')}
              </PopoverTrigger>
              <PopoverContent className={popoverContentClasses} align='start'>
                <CalendarComponent
                  mode='single'
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                  className='rounded-md'
                />
              </PopoverContent>
            </Popover>

            {/* Attachment Button */}
            <Button
              variant='outline'
              size='sm'
              className={buttonTriggerClasses}
              onClick={() => {
                return setIsFileManagerOpen(true);
              }}
            >
              <Paperclip className='h-3 w-3 mr-1 text-gray-400' />
              Attachments {attachments.length > 0 && `(${attachments.length})`}
            </Button>
          </div>

          {/* Display attachments if any */}
          {attachments.length > 0 && (
            <div className='mt-2 space-y-1'>
              {attachments.map((file, index) => {
                return (
                  <div
                    key={index}
                    className='flex items-center text-xs text-gray-600 bg-gray-50 p-1.5 rounded'
                  >
                    <Paperclip className='h-3 w-3 mr-1.5 text-gray-400' />
                    <span className='flex-1 truncate'>{file.originalName}</span>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-4 w-4 p-0'
                      onClick={() => {
                        return setAttachments(
                          attachments.filter((_, i) => {
                            return i !== index;
                          }),
                        );
                      }}
                    >
                      <X className='h-3 w-3 text-gray-400' />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <Textarea
            className='flex-1 border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 font-medium text-black placeholder:text-gray-300 leading-relaxed shadow-none mt-4 text-lg whitespace-pre-line'
            placeholder='Write a description, a project brief, or collect ideas...'
            style={{ lineHeight: '2.5' }}
            value={description}
            onChange={(e) => {
              return setDescription(e.target.value);
            }}
          />
        </div>

        <DialogFooter className='p-3 border-t border-gray-100 flex justify-between mt-auto'>
          <div className='flex-1'></div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              className='h-7 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className='h-7 rounded text-xs font-normal bg-gray-900 hover:bg-gray-800 text-white'
              onClick={() => {
                // confirm we have title, stage, status
                if (!title) {
                  toast.error('Please fill in a title');
                  return;
                }
                if (!stage) {
                  toast.error('Please select a stage');
                  return;
                }
                if (!state) {
                  toast.error('Please select a status');
                  return;
                }
                handleCreateProject();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create project'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <CreateClientDialog
        open={isCreateClientDialogOpen}
        onOpenChange={setIsCreateClientDialogOpen}
        onClientCreated={handleClientCreated}
      />

      <FileUploadManagerModal
        isOpen={isFileManagerOpen}
        onClose={() => {
          return setIsFileManagerOpen(false);
        }}
        handleAddFileToProject={handleAddFileToProject}
      />
    </Dialog>
  );
}
