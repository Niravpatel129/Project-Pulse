'use client';

import { Button } from '@/components/ui/button';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { newRequest } from '@/utils/newRequest';
import { format } from 'date-fns';
import { CalendarX, Clock, MapPin, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Participant = {
  _id: string;
  name: string;
  email?: string;
  role: string;
  avatar?: string;
  status?: string;
};

type AvailabilitySlot = {
  start: string;
  end: string;
};

type DayAvailability = {
  isEnabled: boolean;
  slots: AvailabilitySlot[];
};

type Availability = {
  availabilitySlots: {
    [key: string]: DayAvailability;
  };
  timezone: string;
  minimumNotice: number;
};

type Booking = {
  dateRange: {
    start: string;
    end: string;
  };
  meetingDuration: number;
  meetingPurpose: string;
  meetingLocation: string;
  customLocation?: string;
  status: string;
};

type TimeSlot = {
  start: string;
  end: string;
  isAvailable: boolean;
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [timeSearch, setTimeSearch] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await newRequest.get(`/schedule/booking/${params.bookingId}`);
        const { booking, availability } = response.data.data;
        console.log('🚀 response.data.data:', response.data.data);
        setBooking(booking);
        setAvailability(availability);
        setProjectName(booking.meetingPurpose);
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        if (error.response?.status === 404) {
          setError('This booking link is no longer available or has expired.');
        } else {
          setError('Something went wrong. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (params.bookingId) {
      fetchBookingDetails();
    }
  }, [params.bookingId]);

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    if (!availability) return [];

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailability = availability.availabilitySlots[dayName];

    if (!dayAvailability?.isEnabled || !dayAvailability.slots.length) return [];

    const slots: TimeSlot[] = [];
    const [startHour, startMinute] = dayAvailability.slots[0].start.split(':').map(Number);
    const [endHour, endMinute] = dayAvailability.slots[0].end.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (startTime < endTime) {
      const slotEnd = new Date(startTime);
      slotEnd.setMinutes(startTime.getMinutes() + (booking?.meetingDuration || 30));

      if (slotEnd <= endTime) {
        slots.push({
          start: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          end: slotEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          isAvailable: true,
        });
      }

      startTime.setMinutes(startTime.getMinutes() + 30);
    }

    return slots;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || !booking) return;

    setIsSubmitting(true);
    try {
      const startTime = new Date(selectedDate);

      // Parse the time string (e.g., "9:00 AM")
      const [time, period] = selectedTimeSlot.start.split(' ');
      const [hoursStr, minutesStr] = time.split(':');
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + booking.meetingDuration);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        throw new Error('Invalid date/time values');
      }

      const formattedStartTime = startTime.toISOString();
      const formattedEndTime = endTime.toISOString();

      console.log('Booking details:', {
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        duration: booking.meetingDuration,
      });

      await newRequest.post(`/schedule/booking/${params.bookingId}/confirm`, {
        startTime: formattedStartTime,
        endTime: formattedEndTime,
      });

      setBookingSuccess(true);
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      setError('Failed to confirm booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeRange = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const filterTimeSlots = (slots: TimeSlot[]): TimeSlot[] => {
    return slots.filter((slot) => {
      const matchesSearch =
        timeSearch === '' ||
        slot.start.toLowerCase().includes(timeSearch.toLowerCase()) ||
        slot.end.toLowerCase().includes(timeSearch.toLowerCase());

      const matchesRange =
        selectedTimeRange === 'all' || getTimeRange(slot.start) === selectedTimeRange;

      return matchesSearch && matchesRange;
    });
  };

  const timeRanges = [
    { id: 'all', label: 'All Times' },
    { id: 'morning', label: 'Morning (12am - 12pm)' },
    { id: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
    { id: 'evening', label: 'Evening (5pm - 12am)' },
  ];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4'>
        <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
          <CalendarX className='w-8 h-8 text-muted-foreground' />
        </div>
        <h1 className='text-2xl font-semibold mb-2'>Booking Not Found</h1>
        <p className='text-muted-foreground text-center mb-6 max-w-md'>{error}</p>
        <Button
          onClick={() => {
            return router.push('/');
          }}
        >
          Return Home
        </Button>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto py-8 px-4'>
        <div className='max-w-4xl mx-auto space-y-6'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='flex items-start justify-between'>
              <div className='space-y-4'>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                    {booking?.meetingPurpose}
                  </h1>
                  <p className='text-gray-500 text-sm'>
                    Select a time slot that works best for you
                  </p>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg'>
                    <Clock className='w-5 h-5 mr-2 text-primary' />
                    <div>
                      <p className='text-sm text-gray-500'>Duration</p>
                      <p className='font-medium'>{booking?.meetingDuration} minutes</p>
                    </div>
                  </div>
                  <div className='flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg'>
                    <MapPin className='w-5 h-5 mr-2 text-primary' />
                    <div>
                      <p className='text-sm text-gray-500'>Location</p>
                      <p className='font-medium'>
                        {booking?.meetingLocation === 'other'
                          ? booking?.customLocation
                          : booking?.meetingLocation}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center text-gray-600 bg-gray-50 p-3 rounded-lg'>
                    <Users className='w-5 h-5 mr-2 text-primary' />
                    <div>
                      <p className='text-sm text-gray-500'>Type</p>
                      <p className='font-medium'>1-on-1 Meeting</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full'>
                {availability?.timezone}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='rounded-md border'>
              <div className='flex max-sm:flex-col'>
                <div className='flex-1 p-4 sm:p-6'>
                  <CustomCalendar
                    selected={selectedDate}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setSelectedDate(newDate);
                        setSelectedTimeSlot(null);
                      }
                    }}
                    disabled={[{ before: new Date() }]}
                    className='w-full'
                  />
                </div>
                <div className='relative w-full max-sm:h-64 sm:w-80 border-t sm:border-t-0 sm:border-l'>
                  <div className='absolute inset-0 py-4'>
                    <ScrollArea className='h-full'>
                      <div className='space-y-3'>
                        <div className='flex h-8 shrink-0 items-center px-4'>
                          <p className='text-sm font-medium'>
                            {selectedDate && format(selectedDate, 'EEEE, d')}
                          </p>
                        </div>
                        <div className='grid gap-2 px-4 max-sm:grid-cols-2'>
                          {generateTimeSlots(selectedDate || new Date()).map((slot, index) => {
                            return (
                              <Button
                                key={index}
                                variant={
                                  selectedTimeSlot?.start === slot.start ? 'default' : 'outline'
                                }
                                size='sm'
                                className='w-full h-9'
                                onClick={() => {
                                  return setSelectedTimeSlot(slot);
                                }}
                              >
                                {slot.start}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </div>

            {selectedTimeSlot && !bookingSuccess && (
              <div className='mt-8 flex justify-end'>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className='w-full sm:w-auto px-8 py-6 text-base'
                >
                  {isSubmitting ? (
                    <div className='flex items-center'>
                      <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                      Confirming...
                    </div>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            )}

            {bookingSuccess && (
              <div className='mt-8 p-6 bg-green-50 rounded-lg border border-green-100'>
                <div className='flex items-center mb-4'>
                  <div className='w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3'>
                    <svg
                      className='w-5 h-5 text-green-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </div>
                  <h3 className='text-green-800 font-medium text-lg'>Booking Confirmed!</h3>
                </div>
                <p className='text-green-700 text-sm mb-6'>
                  Your meeting has been scheduled for{' '}
                  <span className='font-medium'>
                    {selectedDate?.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>{' '}
                  at {selectedTimeSlot?.start}.
                </p>
                <Button
                  onClick={() => {
                    return router.push('/');
                  }}
                  variant='outline'
                  className='w-full sm:w-auto'
                >
                  Return Home
                </Button>
              </div>
            )}

            <div className='mt-8 pt-6 border-t border-gray-100'>
              <div className='text-sm text-gray-500 space-y-2'>
                {availability?.availabilitySlots.monday?.slots[0] &&
                  availability?.availabilitySlots.friday?.slots[0] && (
                    <p className='flex items-center'>
                      <Clock className='w-4 h-4 mr-2' />
                      Available {availability.availabilitySlots.monday.slots[0].start} -{' '}
                      {availability.availabilitySlots.friday.slots[0].end}
                    </p>
                  )}
                <p className='flex items-center'>
                  <CalendarX className='w-4 h-4 mr-2' />
                  Minimum notice: {availability?.minimumNotice} hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
