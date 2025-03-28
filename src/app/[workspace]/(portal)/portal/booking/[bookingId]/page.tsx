'use client';

import { Button } from '@/components/ui/button';
import { newRequest } from '@/utils/newRequest';
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
        <div className='max-w-3xl mx-auto space-y-6'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='flex items-start justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 mb-2'>{booking?.meetingPurpose}</h1>
                <div className='space-y-3 mt-4'>
                  <div className='flex items-center text-gray-600'>
                    <Clock className='w-4 h-4 mr-2 text-gray-400' />
                    <span>{booking?.meetingDuration} minutes</span>
                  </div>
                  <div className='flex items-center text-gray-600'>
                    <MapPin className='w-4 h-4 mr-2 text-gray-400' />
                    <span>
                      {booking?.meetingLocation === 'other'
                        ? booking?.customLocation
                        : booking?.meetingLocation}
                    </span>
                  </div>
                  <div className='flex items-center text-gray-600'>
                    <Users className='w-4 h-4 mr-2 text-gray-400' />
                    <span>1-on-1 Meeting</span>
                  </div>
                </div>
              </div>
              <div className='text-sm text-gray-500'>{availability?.timezone}</div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-6'>Select a Date & Time</h2>

            <div className='grid grid-cols-7 gap-2 mb-8'>
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayKey = dayName.toLowerCase().substring(0, 3);
                const fullDayKey = {
                  sun: 'sunday',
                  mon: 'monday',
                  tue: 'tuesday',
                  wed: 'wednesday',
                  thu: 'thursday',
                  fri: 'friday',
                  sat: 'saturday',
                }[dayKey];

                const isEnabled = availability?.availabilitySlots[fullDayKey]?.isEnabled;
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={i}
                    onClick={() => {
                      return isEnabled && handleDateSelect(date);
                    }}
                    className={`text-center p-3 rounded-lg transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : isEnabled
                        ? 'hover:bg-gray-50 border border-gray-100'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    } ${isToday ? 'border-2 border-primary' : ''}`}
                  >
                    <div className='text-sm font-medium'>{dayName}</div>
                    <div className='text-lg font-semibold mt-1'>{date.getDate()}</div>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className='mt-8'>
                <h3 className='text-sm font-medium text-gray-900 mb-4'>Available Time Slots</h3>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                  {generateTimeSlots(selectedDate).map((slot, index) => {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          return handleTimeSlotSelect(slot);
                        }}
                        className={`p-3 rounded-lg text-sm transition-all duration-200 ${
                          selectedTimeSlot?.start === slot.start
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-gray-50 border border-gray-100'
                        }`}
                      >
                        {slot.start} - {slot.end}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedTimeSlot && !bookingSuccess && (
              <div className='mt-8 flex justify-end'>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className='w-full sm:w-auto px-8'
                >
                  {isSubmitting ? (
                    <div className='flex items-center'>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
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
                  <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3'>
                    <svg
                      className='w-4 h-4 text-green-600'
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
                  <h3 className='text-green-800 font-medium'>Booking Confirmed!</h3>
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
                    <p>
                      Available {availability.availabilitySlots.monday.slots[0].start} -{' '}
                      {availability.availabilitySlots.friday.slots[0].end}
                    </p>
                  )}
                <p>Minimum notice: {availability?.minimumNotice} hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
