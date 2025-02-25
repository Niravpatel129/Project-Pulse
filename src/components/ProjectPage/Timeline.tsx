'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'upcoming';
}

interface TimelineProps {
  events: TimelineEvent[];
  title?: string;
}

export default function Timeline({ events, title = 'Timeline' }: TimelineProps) {
  // Group events by date
  const groupedEvents = events.reduce<Record<string, TimelineEvent[]>>((groups, event) => {
    if (!groups[event.date]) {
      groups[event.date] = [];
    }
    groups[event.date].push(event);
    return groups;
  }, {});

  // Get sorted dates
  const sortedDates = Object.keys(groupedEvents);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {sortedDates.map((date) => (
            <div key={date} className='mb-4'>
              <h3 className='mb-2 font-medium text-gray-700'>{date}</h3>
              <div className='ml-4 space-y-1'>
                {groupedEvents[date].map((event, eventIndex) => (
                  <div key={event.id} className='flex items-start gap-4'>
                    {/* Timeline connector */}
                    <div className='flex flex-col items-center'>
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          event.status === 'completed'
                            ? 'bg-green-100 text-green-500'
                            : event.status === 'current'
                            ? 'bg-blue-100 text-blue-500'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {event.icon ||
                          (event.status === 'completed' ? (
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='24'
                              height='24'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              className='h-5 w-5'
                            >
                              <path d='M5 12l5 5l10 -10'></path>
                            </svg>
                          ) : event.status === 'current' ? (
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='24'
                              height='24'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              className='h-5 w-5'
                            >
                              <path d='M12 19l9 2l-9 -18l-9 18l9 -2z'></path>
                            </svg>
                          ) : (
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='24'
                              height='24'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              className='h-5 w-5'
                            >
                              <circle cx='12' cy='12' r='10'></circle>
                            </svg>
                          ))}
                      </div>
                      {eventIndex < groupedEvents[date].length - 1 && (
                        <div className='h-full w-0.5 bg-gray-200' style={{ height: '40px' }}></div>
                      )}
                    </div>

                    {/* Event content */}
                    <div className='flex-1 pb-8'>
                      <div className='flex flex-col'>
                        <h4 className='font-medium text-gray-900'>{event.title}</h4>
                        <p className='text-sm text-gray-500'>{event.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
