'use client';

import { Button } from '@/components/ui/button';
import { newRequest } from '@/utils/newRequest';
import { CalendarX } from 'lucide-react';
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

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await newRequest.get(`/schedule/booking/${params.bookingId}`);
        const { projectName, participants } = response.data;
        setProjectName(projectName);
        setParticipants(participants);
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
    <div className='container mx-auto py-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold mb-2'>Schedule a Meeting</h1>
        <p className='text-muted-foreground mb-8'>Book a time to meet with {projectName}</p>
      </div>
    </div>
  );
}
