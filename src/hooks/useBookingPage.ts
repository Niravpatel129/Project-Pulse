import { newRequest } from '@/utils/newRequest';
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

type GuestInfo = {
  name: string;
  email: string;
  guestEmails: string[];
  notes: string;
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
  bookingBy: {
    name: string;
    avatar?: string;
    email: string;
  };
  scheduledTime?: string;
};

type TimeSlot = {
  start: string;
  end: string;
  isAvailable: boolean;
};

export function useBookingPage() {
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
  const [showGuestInfo, setShowGuestInfo] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    email: '',
    guestEmails: [],
    notes: '',
  });

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await newRequest.get(`/schedule/booking/${params.bookingId}`);
        const { booking, availability } = response.data.data;
        console.log('🚀 response.data.data:', response.data.data);
        setBooking(booking);
        setAvailability(availability);
        setProjectName(booking.meetingPurpose);

        // If booking is already booked, show confirmation UI
        if (booking.status === 'booked') {
          setBookingSuccess(true);
          // Set the selected date and time slot based on scheduledTime
          if (booking.scheduledTime) {
            const scheduledDate = new Date(booking.scheduledTime);
            setSelectedDate(scheduledDate);
            setSelectedTimeSlot({
              start: scheduledDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              }),
              end: new Date(
                scheduledDate.getTime() + booking.meetingDuration * 60000,
              ).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
              isAvailable: true,
            });
          }
        }
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
        guestInfo,
      });

      await newRequest.post(`/schedule/booking/${params.bookingId}/confirm`, {
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        guestInfo,
      });

      setBookingSuccess(true);
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      setError('Failed to confirm booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddGuestEmail = () => {
    if (guestInfo.guestEmails.length < 10) {
      setGuestInfo({
        ...guestInfo,
        guestEmails: [...guestInfo.guestEmails, ''],
      });
    }
  };

  const handleRemoveGuestEmail = (index: number) => {
    setGuestInfo({
      ...guestInfo,
      guestEmails: guestInfo.guestEmails.filter((_, i) => {
        return i !== index;
      }),
    });
  };

  const handleGuestEmailChange = (index: number, value: string) => {
    const newGuestEmails = [...guestInfo.guestEmails];
    newGuestEmails[index] = value;
    setGuestInfo({
      ...guestInfo,
      guestEmails: newGuestEmails,
    });
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

  return {
    participants,
    projectName,
    isLoading,
    error,
    booking,
    availability,
    selectedDate,
    selectedTimeSlot,
    isSubmitting,
    bookingSuccess,
    timeSearch,
    selectedTimeRange,
    showGuestInfo,
    guestInfo,
    router,
    setTimeSearch,
    setSelectedTimeRange,
    setShowGuestInfo,
    setGuestInfo,
    handleDateSelect,
    handleTimeSlotSelect,
    handleConfirmBooking,
    handleAddGuestEmail,
    handleRemoveGuestEmail,
    handleGuestEmailChange,
    generateTimeSlots,
    filterTimeSlots,
    timeRanges,
  };
}
