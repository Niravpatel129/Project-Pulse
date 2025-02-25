'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { cn } from '@/lib/utils';
import { ChevronDown, Lock, PlusCircle, Settings, Share2 } from 'lucide-react';
import { useState } from 'react';

export function ProjectSidebar({ project, onUpdateProject }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);

  const handleStageChange = async (value) => {
    await onUpdateProject?.({ stage: value });
  };

  const handleLeadSourceChange = async (value) => {
    await onUpdateProject?.({ leadSource: value });
  };

  const addTask = (title) => {
    setTasks([...tasks, { id: Date.now(), title, completed: false }]);
  };

  const addTimeEntry = (description, duration) => {
    setTimeEntries([...timeEntries, { id: Date.now(), description, duration }]);
  };

  return (
    <div className='w-80 space-y-6'>
      <div className='rounded-lg bg-gray-50 p-4'>
        <div className='mb-4 flex items-center gap-2'>
          <Lock className='h-4 w-4' />
          <span className='font-medium'>Only visible to you</span>
        </div>
        <p className='text-sm text-muted-foreground'>
          Private place for you and your internal team to manage this project.
        </p>
        <Button variant='link' className='mt-2 h-auto p-0 text-[#5DD3D1] hover:text-[#4CC3C1]'>
          <Share2 className='mr-2 h-4 w-4' />
          Send client portal link
        </Button>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Stage</label>
          <Select defaultValue={project?.stage ?? 'FOLLOW_UP'} onValueChange={handleStageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='FOLLOW_UP'>Follow Up</SelectItem>
              <SelectItem value='BOOKED'>Booked</SelectItem>
              <SelectItem value='COMPLETED'>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Lead Source</label>
          <Select
            defaultValue={project?.leadSource ?? 'INSTAGRAM'}
            onValueChange={handleLeadSourceChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='INSTAGRAM'>Instagram</SelectItem>
              <SelectItem value='REFERRAL'>Referral</SelectItem>
              <SelectItem value='WEBSITE'>Website</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='tasks'>
            <AccordionTrigger>Tasks</AccordionTrigger>
            <AccordionContent>
              {tasks.map((task) => (
                <div key={task.id} className='flex items-center space-x-2'>
                  <Checkbox id={`task-${task.id}`} checked={task.completed} />
                  <Label htmlFor={`task-${task.id}`}>{task.title}</Label>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' className='w-full mt-2'>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const title = (e.target as HTMLFormElement).taskTitle.value;
                      addTask(title);
                    }}
                  >
                    <Input id='taskTitle' placeholder='Task title' />
                    <Button type='submit' className='mt-2'>
                      Add Task
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='time-tracker'>
            <AccordionTrigger>Time Tracker</AccordionTrigger>
            <AccordionContent>
              {timeEntries.map((entry) => (
                <div key={entry.id} className='flex justify-between items-center'>
                  <span>{entry.description}</span>
                  <span>{entry.duration}</span>
                </div>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='outline' className='w-full mt-2'>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    Add Time Entry
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Time Entry</DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const description = (e.target as HTMLFormElement).description.value;
                      const duration = (e.target as HTMLFormElement).duration.value;
                      addTimeEntry(description, duration);
                    }}
                  >
                    <Input id='description' placeholder='Description' className='mb-2' />
                    <Input id='duration' placeholder='Duration (e.g., 2h 30m)' />
                    <Button type='submit' className='mt-2'>
                      Add Entry
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='notes'>
            <AccordionTrigger>Notes</AccordionTrigger>
            <AccordionContent>
              <textarea
                className='w-full p-2 border rounded'
                rows={4}
                placeholder='Add your notes here...'
              ></textarea>
              <Button className='w-full mt-2'>Save Notes</Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className='rounded-lg border p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              <span className='font-medium'>Workflow</span>
            </div>
            <div className='space-x-2'>
              <Button variant='link' className='h-auto p-0 text-[#5DD3D1] hover:text-[#4CC3C1]'>
                FULL VIEW
              </Button>
              <Button variant='link' className='h-auto p-0 text-[#5DD3D1] hover:text-[#4CC3C1]'>
                REMOVE
              </Button>
            </div>
          </div>
          <div className='mt-4 space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>Progress</span>
              <span>75%</span>
            </div>
            <Progress value={75} className='h-2' />
          </div>
          <div className='mt-4'>
            <p className='text-sm font-medium'>Current Step: Final Review</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Reviewing final deliverables before client presentation
            </p>
          </div>
        </div>

        <Button
          variant='outline'
          className='w-full justify-between'
          onClick={() => setIsExpanded(!isExpanded)}
        >
          MORE OPTIONS
          <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
        </Button>
      </div>
    </div>
  );
}
