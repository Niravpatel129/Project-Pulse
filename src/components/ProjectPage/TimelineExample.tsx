'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  CheckSquare,
  Clock,
  Edit,
  FileText,
  Mail,
  Package,
  Plus,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import Timeline from './Timeline';

// Define the TimelineEvent type
interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'completed' | 'current' | 'upcoming';
  icon: React.ReactNode;
}

export default function TimelineExample() {
  // Initial events data
  const initialEvents = [
    {
      id: '9',
      title: 'Delivery scheduled',
      date: 'Nov 23, 2023',
      time: '10:00 a.m.',
      status: 'upcoming' as const,
      icon: <Truck className='h-5 w-5' />,
    },
    {
      id: '8',
      title: 'Quality check scheduled',
      date: 'Nov 22, 2023',
      time: '2:00 p.m.',
      status: 'upcoming' as const,
      icon: <CheckSquare className='h-5 w-5' />,
    },
    {
      id: '7',
      title: 'Production started',
      date: 'Nov 22, 2023',
      time: '9:00 a.m.',
      status: 'current' as const,
      icon: <Package className='h-5 w-5' />,
    },
    {
      id: '6',
      title: 'Design approved',
      date: 'Nov 21, 2023',
      time: '4:45 p.m.',
      status: 'completed' as const,
      icon: <CheckCircle className='h-5 w-5' />,
    },
    {
      id: '5',
      title: 'Design proof sent for approval',
      date: 'Nov 21, 2023',
      time: '2:30 p.m.',
      status: 'completed' as const,
      icon: <Mail className='h-5 w-5' />,
    },
    {
      id: '4',
      title: 'Your delivery date was updated to November 22',
      date: 'Nov 21, 2023',
      time: '10:15 a.m.',
      status: 'completed' as const,
      icon: <Clock className='h-5 w-5' />,
    },
    {
      id: '3',
      title: 'Your order started',
      date: 'Nov 20, 2023',
      time: '6:07 p.m.',
      status: 'completed' as const,
      icon: <CheckCircle className='h-5 w-5' />,
    },
    {
      id: '2',
      title: 'You submitted the requirements',
      date: 'Nov 20, 2023',
      time: '6:07 p.m.',
      status: 'completed' as const,
      icon: <Edit className='h-5 w-5' />,
    },
    {
      id: '1',
      title: 'You placed the order',
      date: 'Nov 20, 2023',
      time: '6:05 p.m.',
      status: 'completed' as const,
      icon: <FileText className='h-5 w-5' />,
    },
  ];

  // State to manage timeline events
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);

  // State for form inputs
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    status: 'upcoming' as 'completed' | 'current' | 'upcoming',
    iconType: 'edit',
  });

  // Function to handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  // Function to handle status selection
  const handleStatusChange = (value: string) => {
    setNewEvent({ ...newEvent, status: value as 'completed' | 'current' | 'upcoming' });
  };

  // Function to handle icon selection
  const handleIconChange = (value: string) => {
    setNewEvent({ ...newEvent, iconType: value });
  };

  // Function to add a new event
  const addEvent = () => {
    // Get icon based on selection
    let icon;
    switch (newEvent.iconType) {
      case 'edit':
        icon = <Edit className='h-5 w-5' />;
        break;
      case 'mail':
        icon = <Mail className='h-5 w-5' />;
        break;
      case 'clock':
        icon = <Clock className='h-5 w-5' />;
        break;
      case 'checkCircle':
        icon = <CheckCircle className='h-5 w-5' />;
        break;
      case 'checkSquare':
        icon = <CheckSquare className='h-5 w-5' />;
        break;
      case 'package':
        icon = <Package className='h-5 w-5' />;
        break;
      case 'truck':
        icon = <Truck className='h-5 w-5' />;
        break;
      case 'fileText':
        icon = <FileText className='h-5 w-5' />;
        break;
      default:
        icon = <Edit className='h-5 w-5' />;
    }

    // Create new event
    const newTimelineEvent: TimelineEvent = {
      id: (events.length + 1).toString(),
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      status: newEvent.status,
      icon,
    };

    // Add to events array
    setEvents([newTimelineEvent, ...events]);

    // Reset form
    setNewEvent({
      title: '',
      date: '',
      time: '',
      status: 'upcoming' as 'completed' | 'current' | 'upcoming',
      iconType: 'edit',
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='outline' className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Add Timeline Item
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Add Custom Timeline Item</DialogTitle>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='title' className='text-right'>
                  Title
                </Label>
                <Input
                  id='title'
                  name='title'
                  value={newEvent.title}
                  onChange={handleInputChange}
                  className='col-span-3'
                  placeholder='Design approval requested'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='date' className='text-right'>
                  Date
                </Label>
                <Input
                  id='date'
                  name='date'
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className='col-span-3'
                  placeholder='Nov 24, 2023'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='time' className='text-right'>
                  Time
                </Label>
                <Input
                  id='time'
                  name='time'
                  value={newEvent.time}
                  onChange={handleInputChange}
                  className='col-span-3'
                  placeholder='2:30 p.m.'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='status' className='text-right'>
                  Status
                </Label>
                <Select value={newEvent.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className='col-span-3'>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='current'>Current</SelectItem>
                    <SelectItem value='upcoming'>Upcoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='icon' className='text-right'>
                  Icon
                </Label>
                <Select value={newEvent.iconType} onValueChange={handleIconChange}>
                  <SelectTrigger className='col-span-3'>
                    <SelectValue placeholder='Select icon' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='edit'>Edit</SelectItem>
                    <SelectItem value='mail'>Mail</SelectItem>
                    <SelectItem value='clock'>Clock</SelectItem>
                    <SelectItem value='checkCircle'>Check Circle</SelectItem>
                    <SelectItem value='checkSquare'>Check Square</SelectItem>
                    <SelectItem value='package'>Package</SelectItem>
                    <SelectItem value='truck'>Truck</SelectItem>
                    <SelectItem value='fileText'>File Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type='submit' onClick={addEvent}>
                  Add Item
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Timeline events={events} title='Order Timeline' />
    </div>
  );
}
