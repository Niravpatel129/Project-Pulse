'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Clock,
  Download,
  Grid,
  ListTodo,
  MoreHorizontal,
  Plus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface CalendarEvent {
  id: number;
  title: string;
  type: 'Meeting' | 'Internal' | 'Workshop' | 'Presentation' | 'Deadline' | 'Call';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  participants: string[];
  description: string;
  project: string;
  status: 'Confirmed' | 'Tentative' | 'Recurring';
}

// Mock calendar events
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: 'Client Meeting - Acme Corp',
    type: 'Meeting',
    date: '2024-04-19',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Conference Room A',
    participants: ['Sarah Johnson', 'John Smith', 'Emma Wilson'],
    description: 'Discuss requirements for the new CRM implementation project.',
    project: 'Enterprise CRM Implementation',
    status: 'Confirmed',
  },
  {
    id: 2,
    title: 'Website Design Review',
    type: 'Internal',
    date: '2024-04-19',
    startTime: '13:00',
    endTime: '14:00',
    location: 'Virtual',
    participants: ['David Chen', 'Lisa Anderson', 'Michael Brown'],
    description: 'Review design mockups for the e-commerce platform upgrade.',
    project: 'E-commerce Platform Upgrade',
    status: 'Confirmed',
  },
  {
    id: 3,
    title: 'Project Kickoff - Mobile App',
    type: 'Meeting',
    date: '2024-04-20',
    startTime: '09:30',
    endTime: '11:00',
    location: 'Conference Room B',
    participants: ['David Chen', 'Emma Johnson', 'Alex Wong'],
    description: 'Initial kickoff meeting for the retail mobile application development.',
    project: 'Mobile App Development - Retail',
    status: 'Confirmed',
  },
  {
    id: 4,
    title: 'Marketing Strategy Session',
    type: 'Workshop',
    date: '2024-04-20',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Marketing Department',
    participants: ['Maria Rodriguez', 'Jennifer Martinez', 'Michael Brown'],
    description: 'Brainstorming session for Q3 marketing campaigns.',
    project: 'Content Marketing Package',
    status: 'Confirmed',
  },
  {
    id: 5,
    title: 'Data Migration Planning',
    type: 'Internal',
    date: '2024-04-21',
    startTime: '11:00',
    endTime: '12:30',
    location: 'Virtual',
    participants: ['Robert Jackson', 'Sarah Williams', 'Alex Wong'],
    description: 'Technical planning for the data warehouse migration project.',
    project: 'Data Warehouse Migration',
    status: 'Confirmed',
  },
  {
    id: 6,
    title: 'Client Demo - Global Financial',
    type: 'Presentation',
    date: '2024-04-22',
    startTime: '15:00',
    endTime: '16:30',
    location: 'Client Office',
    participants: ['Robert Jackson', 'Maria Rodriguez', 'David Lee'],
    description: 'Demonstrate the new data analytics dashboard to the client.',
    project: 'Data Warehouse Migration',
    status: 'Confirmed',
  },
  {
    id: 7,
    title: 'Security Audit Preparation',
    type: 'Internal',
    date: '2024-04-23',
    startTime: '10:00',
    endTime: '11:00',
    location: 'Virtual',
    participants: ['Emily Taylor', 'David Lee', 'John Smith'],
    description: 'Prepare documentation and systems for the upcoming security audit.',
    project: 'Cybersecurity Audit & Remediation',
    status: 'Confirmed',
  },
  {
    id: 8,
    title: 'Weekly Team Standup',
    type: 'Internal',
    date: '2024-04-23',
    startTime: '09:00',
    endTime: '09:30',
    location: 'Conference Room A',
    participants: ['All Team Members'],
    description: 'Weekly progress update and task planning.',
    project: 'Company-wide',
    status: 'Recurring',
  },
  {
    id: 9,
    title: 'Supply Chain Review',
    type: 'Meeting',
    date: '2024-04-24',
    startTime: '13:30',
    endTime: '15:00',
    location: 'Conference Room B',
    participants: ['Alex Wong', 'David Lee', 'Sarah Johnson'],
    description: 'Review current supply chain processes and identify optimization opportunities.',
    project: 'Supply Chain Optimization',
    status: 'Tentative',
  },
  {
    id: 10,
    title: 'Marketing Campaign Launch',
    type: 'Deadline',
    date: '2024-04-25',
    startTime: '00:00',
    endTime: '23:59',
    location: 'N/A',
    participants: ['Maria Rodriguez', 'Jennifer Martinez'],
    description: 'Launch date for the Q2 marketing campaign.',
    project: 'Content Marketing Package',
    status: 'Confirmed',
  },
  {
    id: 11,
    title: 'Executive Review',
    type: 'Meeting',
    date: '2024-04-21',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Executive Boardroom',
    participants: ['Sarah Johnson', 'Robert Jackson', 'Maria Rodriguez', 'CEO'],
    description: 'Quarterly review of all major client projects and company performance.',
    project: 'Company-wide',
    status: 'Confirmed',
  },
  {
    id: 12,
    title: 'Client Call - Artisan Goods',
    type: 'Call',
    date: '2024-04-19',
    startTime: '15:30',
    endTime: '16:00',
    location: 'Phone',
    participants: ['Justin Miller', 'Lisa Anderson'],
    description: 'Weekly progress update call for the e-commerce platform.',
    project: 'E-commerce Platform Upgrade',
    status: 'Confirmed',
  },
];

// Mock days for calendar view
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Hours for day view
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

type CalendarView = 'month' | 'week' | 'day' | 'list';

export default function CalendarPage() {
  const { isAuthenticated, user } = useAuth();
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date('2024-04-19')); // Set to a date with events
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);

  // Get unique event types for filter
  const eventTypes = [...new Set(events.map((event) => event.type))];

  // Filter events based on the type filter
  const filteredEvents = events.filter(
    (event) => typeFilter === 'all' || event.type === typeFilter,
  );

  // Move to previous period based on current view
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  // Move to next period based on current view
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date('2024-04-19')); // Set to current date in real app
  };

  // Function to generate days for month view
  const getDaysInMonth = (year: number, month: number) => {
    if (year === undefined || month === undefined || isNaN(year) || isNaN(month)) {
      // Use fallback date if invalid inputs
      const fallbackDate = new Date('2024-04-19');
      year = fallbackDate.getFullYear();
      month = fallbackDate.getMonth();
    }

    try {
      const date = new Date(year, month, 1);
      const days = [];

      // Make sure date is valid
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Make sure firstDay and lastDay are valid
      if (isNaN(firstDay.getTime()) || isNaN(lastDay.getTime())) {
        throw new Error('Invalid firstDay or lastDay');
      }

      // Include days from previous month to fill first week
      const daysFromPrevMonth = firstDay.getDay();
      const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);

      // Make sure prevMonth is valid
      if (isNaN(prevMonth.getTime())) {
        throw new Error('Invalid prevMonth');
      }

      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        try {
          const prevDate = new Date(
            prevMonth.getFullYear(),
            prevMonth.getMonth(),
            prevMonth.getDate() - i,
          );
          if (isNaN(prevDate.getTime())) {
            continue; // Skip invalid dates
          }
          days.push({
            date: prevDate,
            isCurrentMonth: false,
          });
        } catch (e) {
          console.error('Error creating previous month date:', e);
        }
      }

      // Add all days in current month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        try {
          const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
          if (isNaN(currentDate.getTime())) {
            continue; // Skip invalid dates
          }
          days.push({
            date: currentDate,
            isCurrentMonth: true,
          });
        } catch (e) {
          console.error('Error creating current month date:', e);
        }
      }

      // Add days from next month to complete the grid
      const remainingDays = 42 - days.length; // 6 rows of 7 days
      for (let i = 1; i <= remainingDays; i++) {
        try {
          const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, i);
          if (isNaN(nextDate.getTime())) {
            continue; // Skip invalid dates
          }
          days.push({
            date: nextDate,
            isCurrentMonth: false,
          });
        } catch (e) {
          console.error('Error creating next month date:', e);
        }
      }

      return days;
    } catch (e) {
      console.error('Error in getDaysInMonth:', e);
      // Return a fallback grid of dates
      const fallbackDate = new Date('2024-04-19');
      const fallbackYear = fallbackDate.getFullYear();
      const fallbackMonth = fallbackDate.getMonth();

      // Create a basic grid of 42 days (6 weeks)
      const fallbackDays = [];
      for (let i = 1; i <= 42; i++) {
        fallbackDays.push({
          date: new Date(fallbackYear, fallbackMonth, i),
          isCurrentMonth: i <= 30, // Assume 30 days in current month
        });
      }
      return fallbackDays;
    }
  };

  // Function to get days for week view
  const getDaysInWeek = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      // Return a fallback week if date is invalid
      const fallbackDate = new Date('2024-04-19');
      date = fallbackDate;
    }

    try {
      const day = date.getDay();
      const diff = date.getDate() - day;
      const days = [];

      for (let i = 0; i < 7; i++) {
        try {
          const newDate = new Date(date);
          newDate.setDate(diff + i);
          // Verify the date is valid before adding it
          if (isNaN(newDate.getTime())) {
            // If invalid, use a fallback date
            days.push(new Date('2024-04-19'));
          } else {
            days.push(newDate);
          }
        } catch (e) {
          // If date creation fails, use a fallback
          console.error('Error creating date in getDaysInWeek:', e);
          days.push(new Date('2024-04-19'));
        }
      }

      return days;
    } catch (e) {
      console.error('Error in getDaysInWeek:', e);
      // Return a week of fallback dates
      return Array.from({ length: 7 }, () => new Date('2024-04-19'));
    }
  };

  // Function to format date to YYYY-MM-DD for comparison
  const formatDateToString = (date: Date | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return ''; // Return empty string if date is invalid
    }

    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  // Function to get events for a specific date
  const getEventsForDate = (date: Date | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return []; // Return empty array if date is invalid
    }

    const dateString = formatDateToString(date);
    return filteredEvents.filter((event) => event.date === dateString);
  };

  // Function to render event badge with appropriate color based on type
  const renderEventBadge = (type: string) => {
    let className = '';

    switch (type) {
      case 'Meeting':
        className = 'bg-blue-100 text-blue-800';
        break;
      case 'Internal':
        className = 'bg-slate-100 text-slate-800';
        break;
      case 'Workshop':
        className = 'bg-purple-100 text-purple-800';
        break;
      case 'Presentation':
        className = 'bg-green-100 text-green-800';
        break;
      case 'Deadline':
        className = 'bg-red-100 text-red-800';
        break;
      case 'Call':
        className = 'bg-amber-100 text-amber-800';
        break;
      default:
        className = 'bg-slate-100 text-slate-800';
        break;
    }

    return <Badge className={className}>{type}</Badge>;
  };

  // Function to create time slot label (e.g., "10:00 AM")
  const formatTimeSlot = (hour: number) => {
    return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
  };

  // Function to check if an event is in a specific time slot
  const isEventInTimeSlot = (event: CalendarEvent, hour: number) => {
    const eventStartHour = parseInt(event.startTime.split(':')[0]);
    return eventStartHour === hour;
  };

  // Function to get event position and height for day view based on time
  const getEventPosition = (event: CalendarEvent) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMinute = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinute = parseInt(event.endTime.split(':')[1]);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const duration = endMinutes - startMinutes;

    return {
      top: `${(startMinutes - 8 * 60) * (100 / 720)}%`, // 720 minutes in 12 hours (8 AM to 8 PM)
      height: `${(duration * 100) / 720}%`,
    };
  };

  // Get the calendar data based on current view
  const days =
    view === 'month'
      ? getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
      : view === 'week'
      ? getDaysInWeek(currentDate)
      : [currentDate];

  return (
    <div className='container mx-auto py-6 px-4 sm:px-6 max-w-7xl'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>Calendar</h1>
          <p className='text-muted-foreground mt-1 text-sm md:text-base'>
            Manage your schedule, meetings, and deadlines
          </p>
        </div>
        <div className='flex flex-wrap gap-2 mt-2 sm:mt-0'>
          <Button variant='outline' size='sm' className='h-9'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button size='sm' className='h-9' asChild>
            <Link href='/calendar/new-event'>
              <Plus className='mr-2 h-4 w-4' />
              New Event
            </Link>
          </Button>
        </div>
      </div>

      <div className='flex flex-col md:flex-row gap-4 mb-6'>
        <div className='flex items-center flex-wrap gap-2'>
          <div className='flex space-x-1'>
            <Button variant='outline' size='icon' onClick={goToPrevious} className='h-8 w-8'>
              <ArrowLeft className='h-4 w-4' />
              <span className='sr-only'>Previous</span>
            </Button>
            <Button variant='outline' size='sm' onClick={goToToday} className='h-8'>
              Today
            </Button>
            <Button variant='outline' size='icon' onClick={goToNext} className='h-8 w-8'>
              <ArrowRight className='h-4 w-4' />
              <span className='sr-only'>Next</span>
            </Button>
          </div>
          <span className='font-medium text-base md:text-lg ml-2'>
            {view === 'month'
              ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : view === 'week'
              ? `${MONTHS[days[0].getMonth()]} ${days[0].getDate()} - ${
                  MONTHS[days[6].getMonth()]
                } ${days[6].getDate()}, ${days[6].getFullYear()}`
              : `${
                  MONTHS[currentDate.getMonth()]
                } ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
          </span>
        </div>

        <div className='flex items-center ml-auto'>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className='w-[160px] sm:w-[180px] h-8'>
              <SelectValue placeholder='All event types' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Event Type</SelectLabel>
                <SelectItem value='all'>All Types</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='bg-card rounded-lg border shadow-sm overflow-hidden'>
        <Tabs
          value={view}
          onValueChange={(value) => setView(value as CalendarView)}
          className='w-full'
        >
          <div className='px-4 pt-3'>
            <TabsList className='grid grid-cols-4 mb-4 w-full sm:w-auto'>
              <TabsTrigger value='month'>
                <Grid className='h-4 w-4 mr-2 hidden sm:inline-block' />
                Month
              </TabsTrigger>
              <TabsTrigger value='week'>
                <CalendarIcon className='h-4 w-4 mr-2 hidden sm:inline-block' />
                Week
              </TabsTrigger>
              <TabsTrigger value='day'>
                <Clock className='h-4 w-4 mr-2 hidden sm:inline-block' />
                Day
              </TabsTrigger>
              <TabsTrigger value='list'>
                <ListTodo className='h-4 w-4 mr-2 hidden sm:inline-block' />
                List
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='month' className='p-0'>
            <div className='rounded-md overflow-hidden'>
              <div className='grid grid-cols-7 bg-muted/20'>
                {SHORT_DAYS.map((day) => (
                  <div
                    key={day}
                    className='py-2 px-1 sm:px-3 text-center font-medium text-xs sm:text-sm border-b'
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className='grid grid-cols-7 auto-rows-fr bg-background'>
                {days.map((day, index) => {
                  const eventsForDay = getEventsForDate(day.date);
                  const maxEventsToShow = 2;
                  const hasMoreEvents = eventsForDay.length > maxEventsToShow;

                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] sm:min-h-[110px] p-1 border-r border-b relative ${
                        !day.isCurrentMonth ? 'bg-muted/10' : ''
                      } ${
                        day.date &&
                        formatDateToString(day.date) === formatDateToString(new Date('2024-04-19'))
                          ? 'bg-primary/5'
                          : ''
                      } hover:bg-muted/5 transition-colors`}
                    >
                      <div
                        className={`text-right p-1 ${
                          !day.isCurrentMonth ? 'text-muted-foreground' : ''
                        }`}
                      >
                        {day.date && day.date.getDate ? (
                          <span
                            className={`text-xs sm:text-sm inline-flex items-center justify-center rounded-full ${
                              formatDateToString(day.date) ===
                              formatDateToString(new Date('2024-04-19'))
                                ? 'h-6 w-6 bg-primary text-primary-foreground font-medium'
                                : ''
                            }`}
                          >
                            {day.date.getDate()}
                          </span>
                        ) : (
                          ''
                        )}
                      </div>
                      <div className='space-y-1 mt-1'>
                        {eventsForDay.slice(0, maxEventsToShow).map((event) => (
                          <div
                            key={event.id}
                            className='text-xs bg-primary/10 p-1 rounded truncate cursor-pointer hover:bg-primary/20 transition-colors'
                            onClick={() => setSelectedEvent(event)}
                          >
                            <span className='hidden sm:inline'>{event.startTime} - </span>
                            {event.title}
                          </div>
                        ))}
                        {hasMoreEvents && (
                          <div className='text-xs text-muted-foreground p-1'>
                            +{eventsForDay.length - maxEventsToShow} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value='week' className='p-0'>
            <div className='rounded-md overflow-hidden overflow-x-auto'>
              <div className='grid grid-cols-8 min-w-[640px]'>
                <div className='border-r bg-muted/10'>
                  <div className='h-12 border-b'></div>
                  {HOURS.map((hour) => (
                    <div key={hour} className='h-16 border-b text-xs p-1 text-muted-foreground'>
                      {formatTimeSlot(hour)}
                    </div>
                  ))}
                </div>

                {days.map((date, dateIndex) => {
                  const eventsForDay = getEventsForDate(date);
                  const formattedDay =
                    date && typeof date.getDay === 'function'
                      ? `${SHORT_DAYS[date.getDay()]} ${date.getDate()}`
                      : 'Invalid Date';
                  const isToday =
                    date && formatDateToString(date) === formatDateToString(new Date('2024-04-19'));

                  return (
                    <div key={dateIndex} className='border-r'>
                      <div
                        className={`h-12 p-2 border-b font-medium flex items-center justify-center text-sm ${
                          isToday ? 'bg-primary/10 text-primary' : 'bg-muted/10'
                        }`}
                      >
                        {formattedDay}
                      </div>

                      {HOURS.map((hour) => {
                        const eventsInHour = eventsForDay.filter((event) =>
                          isEventInTimeSlot(event, hour),
                        );

                        return (
                          <div
                            key={hour}
                            className='h-16 border-b relative hover:bg-muted/5 transition-colors'
                          >
                            {eventsInHour.map((event) => (
                              <div
                                key={event.id}
                                className='absolute left-0 right-0 mx-1 p-1 bg-primary/10 rounded border-l-2 border-primary overflow-hidden cursor-pointer hover:bg-primary/20 transition-colors'
                                style={getEventPosition(event)}
                                onClick={() => setSelectedEvent(event)}
                              >
                                <div className='text-xs font-medium truncate'>{event.title}</div>
                                <div className='text-xs text-muted-foreground truncate'>
                                  {event.startTime} - {event.endTime}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value='day' className='p-4'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
              <div className='lg:col-span-3 rounded-md border shadow-sm overflow-hidden'>
                <div className='h-12 p-2 border-b font-medium bg-primary/10 flex items-center justify-center'>
                  {currentDate && typeof currentDate.getDay === 'function'
                    ? `${DAYS_OF_WEEK[currentDate.getDay()]}, ${
                        MONTHS[currentDate.getMonth()]
                      } ${currentDate.getDate()}`
                    : 'Invalid Date'}
                </div>
                <div className='grid grid-cols-1'>
                  {HOURS.map((hour) => {
                    const eventsForDay = getEventsForDate(currentDate);
                    const eventsInHour = eventsForDay.filter((event) =>
                      isEventInTimeSlot(event, hour),
                    );

                    return (
                      <div
                        key={hour}
                        className='h-20 border-b grid grid-cols-8 hover:bg-muted/5 transition-colors'
                      >
                        <div className='col-span-1 p-2 text-xs sm:text-sm text-muted-foreground border-r'>
                          {formatTimeSlot(hour)}
                        </div>
                        <div className='col-span-7 relative p-1'>
                          {eventsInHour.map((event, idx) => (
                            <div
                              key={event.id}
                              className='absolute left-0 right-0 mx-2 p-2 bg-primary/10 rounded border-l-2 border-primary cursor-pointer hover:bg-primary/20 transition-colors'
                              style={{
                                ...getEventPosition(event),
                                zIndex: 10 + idx,
                              }}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <div className='font-medium text-sm'>{event.title}</div>
                              <div className='text-xs text-muted-foreground'>
                                {event.startTime} - {event.endTime} • {event.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <Card className='h-full'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-lg'>Upcoming Events</CardTitle>
                    <CardDescription>Your schedule for the next few days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {filteredEvents
                        .filter((event) => new Date(event.date) >= currentDate)
                        .sort(
                          (a, b) =>
                            a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
                        )
                        .slice(0, 5)
                        .map((event) => (
                          <div
                            key={event.id}
                            className='p-2 border rounded-md cursor-pointer hover:bg-muted/5 transition-colors'
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className='font-medium text-sm'>{event.title}</div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                              {' • '}
                              {event.startTime} - {event.endTime}
                            </div>
                            <div className='mt-1'>{renderEventBadge(event.type)}</div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='list' className='p-0'>
            <div className='rounded-md overflow-hidden'>
              <div className='grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] items-center border-b font-medium p-3 bg-muted/20 text-sm'>
                <div className='px-2'>Date</div>
                <div className='px-4'>Event</div>
                <div className='hidden md:block px-2'>Location</div>
                <div className='px-2'>Time</div>
                <div className='text-right px-2'>Actions</div>
              </div>

              <div className='divide-y'>
                {filteredEvents
                  .sort(
                    (a, b) =>
                      a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
                  )
                  .map((event) => (
                    <div
                      key={event.id}
                      className='grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] items-center p-3 hover:bg-muted/5 transition-colors'
                    >
                      <div className='text-xs sm:text-sm whitespace-nowrap px-2'>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className='px-4'>
                        <div className='font-medium text-sm sm:text-base'>{event.title}</div>
                        <div className='flex flex-wrap items-center gap-2 mt-1'>
                          {renderEventBadge(event.type)}
                          <span className='text-xs text-muted-foreground'>{event.project}</span>
                        </div>
                      </div>
                      <div className='hidden md:block text-xs sm:text-sm text-muted-foreground whitespace-nowrap px-2'>
                        {event.location}
                      </div>
                      <div className='text-xs sm:text-sm whitespace-nowrap px-2'>
                        {event.startTime} - {event.endTime}
                      </div>
                      <div className='text-right px-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-8 w-8'>
                              <MoreHorizontal className='h-4 w-4' />
                              <span className='sr-only'>Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedEvent(event)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/calendar/edit-event/${event.id}`}>Edit Event</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Cancel Event</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedEvent && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200'>
          <div className='bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto border'>
            <div className='p-6'>
              <div className='flex justify-between items-start'>
                <h3 className='text-xl font-semibold'>{selectedEvent.title}</h3>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 rounded-full'
                  onClick={() => setSelectedEvent(null)}
                >
                  <span className='sr-only'>Close</span>
                  &times;
                </Button>
              </div>

              <div className='mt-4 space-y-4'>
                <div className='flex items-center'>
                  <CalendarIcon className='h-5 w-5 mr-2 text-muted-foreground' />
                  <span className='text-sm'>
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className='flex items-center'>
                  <Clock className='h-5 w-5 mr-2 text-muted-foreground' />
                  <span className='text-sm'>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </span>
                </div>

                <div>{renderEventBadge(selectedEvent.type)}</div>

                <div className='flex items-start'>
                  <Users className='h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 mt-0.5' />
                  <div>
                    <div className='font-medium mb-1 text-sm'>Participants</div>
                    <ul className='list-disc list-inside pl-2'>
                      {selectedEvent.participants.map((person: string, idx: number) => (
                        <li key={idx} className='text-sm'>
                          {person}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className='border-t pt-4'>
                  <div className='font-medium mb-2 text-sm'>Description</div>
                  <p className='text-sm'>{selectedEvent.description}</p>
                </div>

                <div className='flex justify-between border-t pt-4'>
                  <span className='text-sm text-muted-foreground'>
                    Project: {selectedEvent.project}
                  </span>
                  <Badge
                    className={
                      selectedEvent.status === 'Confirmed'
                        ? 'bg-green-100 text-green-800'
                        : selectedEvent.status === 'Tentative'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>

                <div className='flex justify-end gap-2 mt-6'>
                  <Button variant='outline' size='sm' onClick={() => setSelectedEvent(null)}>
                    Close
                  </Button>
                  <Button size='sm' asChild>
                    <Link href={`/calendar/edit-event/${selectedEvent.id}`}>Edit Event</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
