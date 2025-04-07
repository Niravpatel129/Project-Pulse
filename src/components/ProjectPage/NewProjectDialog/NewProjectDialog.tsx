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
import { Calendar, Check, Circle, Paperclip, Users, X } from 'lucide-react';
import { useRef, useState } from 'react';

export default function NewProjectDialog({ open = true, onClose = () => {} }) {
  const [title, setTitle] = useState('dfgdfgdfg');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  // State for dropdown selections
  const [status, setStatus] = useState('Backlog');
  const [priority, setPriority] = useState('No priority');
  const [lead, setLead] = useState(null);
  const [client, setClient] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [targetDate, setTargetDate] = useState(null);

  // Sample data for dropdowns
  const statusOptions = ['Backlog', 'Todo', 'In Progress', 'Done', 'Canceled'];
  const priorityOptions = ['No priority', 'Urgent', 'High', 'Medium', 'Low'];
  const userOptions = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ];

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] sm:max-w-[900px] p-0 gap-0 overflow-hidden border border-gray-200 shadow-sm rounded-lg min-h-[85vh] flex flex-col'>
        <VisuallyHidden>
          <DialogTitle>New Project</DialogTitle>
        </VisuallyHidden>

        <div className='p-5 space-y-5 flex-1 flex flex-col overflow-hidden'>
          <div className='flex items-center'>
            <VisuallyHidden>
              <div>New Project</div>
            </VisuallyHidden>
            <div className='flex items-center text-xs text-gray-500 font-medium'>
              <div className='flex items-center justify-center h-5 rounded text-gray-500 mr-2 w-full'>
                <span className='text-xs'>New Project</span>
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
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-6 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50 px-2'
                >
                  <Circle className='h-3 w-3 mr-1 text-gray-400' />
                  {status}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='w-[180px] rounded-md border border-gray-200 shadow-sm p-1'
              >
                {statusOptions.map((option) => {
                  return (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => {
                        return setStatus(option);
                      }}
                      className='flex items-center justify-between text-xs py-1.5 rounded-sm text-gray-600 focus:text-gray-700 focus:bg-gray-50'
                    >
                      {option}
                      {status === option && <Check className='h-3 w-3 text-gray-500' />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-6 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50 px-2'
                >
                  <span className='text-xs mr-1 text-gray-400'>···</span>
                  {priority}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='w-[180px] rounded-md border border-gray-200 shadow-sm p-1'
              >
                {priorityOptions.map((option) => {
                  return (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => {
                        return setPriority(option);
                      }}
                      className='flex items-center justify-between text-xs py-1.5 rounded-sm text-gray-600 focus:text-gray-700 focus:bg-gray-50'
                    >
                      {option}
                      {priority === option && <Check className='h-3 w-3 text-gray-500' />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Lead Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-6 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50 px-2'
                >
                  <Users className='h-3 w-3 mr-1 text-gray-400' />
                  {lead ? lead.name : 'Lead'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='w-[180px] rounded-md border border-gray-200 shadow-sm p-1'
              >
                {userOptions.map((user) => {
                  return (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => {
                        return setLead(user);
                      }}
                      className='flex items-center justify-between text-xs py-1.5 rounded-sm text-gray-600 focus:text-gray-700 focus:bg-gray-50'
                    >
                      <div className='flex items-center'>
                        <Avatar className='h-4 w-4 mr-1.5'>
                          <AvatarFallback className='text-[10px]'>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                      {lead?.id === user.id && <Check className='h-3 w-3 text-gray-500' />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Client Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-6 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50 px-2'
                >
                  <Users className='h-3 w-3 mr-1 text-gray-400' />
                  Client {client.length > 0 && `(${client.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                className='w-[180px] rounded-md border border-gray-200 shadow-sm p-1'
              >
                {userOptions.map((user) => {
                  return (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => {
                        if (
                          client.some((m) => {
                            return m.id === user.id;
                          })
                        ) {
                          setClient(
                            client.filter((m) => {
                              return m.id !== user.id;
                            }),
                          );
                        } else {
                          setClient([...client, user]);
                        }
                      }}
                      className='flex items-center justify-between text-xs py-1.5 rounded-sm text-gray-600 focus:text-gray-700 focus:bg-gray-50'
                    >
                      <div className='flex items-center'>
                        <Avatar className='h-4 w-4 mr-1.5'>
                          <AvatarFallback className='text-[10px]'>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                      {client.some((m) => {
                        return m.id === user.id;
                      }) && <Check className='h-3 w-3 text-gray-500' />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Start Date Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-6 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50 px-2'
                >
                  <Calendar className='h-3 w-3 mr-1 text-gray-400' />
                  {startDate ? startDate.toLocaleDateString() : 'Start date'}
                  {startDate && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setStartDate(null);
                      }}
                      className='!-m-1 !p-0 inline-flex'
                    >
                      <X className='h-2 w-2 text-gray-400' />
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto p-0 border border-gray-200 shadow-sm rounded-md min-w-[290px]'
                align='start'
              >
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
                <Button
                  variant='outline'
                  size='sm'
                  className='h-6 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50 px-2'
                >
                  <Calendar className='h-3 w-3 mr-1 text-gray-400' />
                  {targetDate ? targetDate.toLocaleDateString() : 'Target date'}
                  {targetDate && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetDate(null);
                      }}
                      className='!-m-1 !p-0 inline-flex'
                    >
                      <X className='h-2 w-2 text-gray-400' />
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto p-0 border border-gray-200 shadow-sm rounded-md min-w-[290px]'
                align='start'
              >
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
              className='h-6 rounded text-xs font-normal border-gray-200 text-gray-600 hover:bg-gray-50 px-2'
              onClick={handleAttachmentClick}
            >
              <Paperclip className='h-3 w-3 mr-1 text-gray-400' />
              Attachments {attachments.length > 0 && `(${attachments.length})`}
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileChange}
                className='hidden'
                multiple
              />
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
                    <span className='flex-1 truncate'>{file.name}</span>
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
            <Button className='h-7 rounded text-xs font-normal bg-gray-900 hover:bg-gray-800 text-white'>
              Create project
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
