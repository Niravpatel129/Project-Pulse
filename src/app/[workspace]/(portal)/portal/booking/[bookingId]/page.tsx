'use client';

import { Button } from '@/components/ui/button';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useBookingPage } from '@/hooks/useBookingPage';
import { format } from 'date-fns';
import {
  CalendarX,
  ChevronRight,
  Clock,
  Globe,
  MapPin,
  MapPinCheckIcon,
  Plus,
  X,
} from 'lucide-react';
import Image from 'next/image';

export default function BookingPage() {
  const {
    isLoading,
    error,
    booking,
    availability,
    selectedDate,
    selectedTimeSlot,
    isSubmitting,
    bookingSuccess,
    showGuestInfo,
    guestInfo,
    router,
    setShowGuestInfo,
    setGuestInfo,
    handleDateSelect,
    handleTimeSlotSelect,
    handleConfirmBooking,
    handleAddGuestEmail,
    handleRemoveGuestEmail,
    handleGuestEmailChange,
    generateTimeSlots,
  } = useBookingPage();

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
    <div className='min-h-screen overflow-hidden'>
      <div className='container mx-auto py-8 px-4'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {bookingSuccess ? (
            <div className='mt-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100'>
              <div className='max-w-2xl mx-auto text-center space-y-6'>
                <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-8 h-8 text-green-600'
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

                <div className='space-y-2'>
                  <h3 className='text-2xl font-semibold text-gray-900'>You are scheduled</h3>
                  <p className='text-gray-600'>
                    A calendar invitation has been sent to your email address.
                  </p>
                </div>

                <div className='bg-gray-50 rounded-lg p-6 space-y-4 text-left'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      {booking?.bookingBy?.avatar && (
                        <Image
                          src={booking.bookingBy.avatar}
                          alt={booking.bookingBy.name}
                          className='w-10 h-10 rounded-full'
                          width={40}
                          height={40}
                        />
                      )}
                      <div>
                        <h4 className='font-medium text-gray-900'>{booking?.meetingPurpose}</h4>
                        <p className='text-sm text-gray-500'>{booking?.bookingBy?.name}</p>
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const searchQuery = 'subject:"Invitation from" in:anywhere newer_than:1d';
                        const encodedQuery = encodeURIComponent(searchQuery);
                        window.open(
                          `https://mail.google.com/mail/u/0/#search/${encodedQuery}`,
                          '_blank',
                        );
                      }}
                    >
                      Open Invitation
                    </Button>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Clock className='w-4 h-4' />
                      <span>{booking?.meetingDuration} Minute Meeting</span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <CalendarX className='w-4 h-4' />
                      <span>
                        {selectedTimeSlot?.start} - {selectedTimeSlot?.end},{' '}
                        {selectedDate?.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-gray-600'>
                      <Globe className='w-4 h-4' />
                      <span>{availability?.timezone}</span>
                    </div>
                  </div>
                </div>

                <div className='pt-4'>
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
              </div>
            </div>
          ) : (
            <>
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-4'>
                    <div>
                      <div className='flex items-center gap-3 mb-2'>
                        {booking?.bookingBy?.avatar && (
                          <Image
                            src={booking.bookingBy.avatar}
                            alt={booking.bookingBy.name}
                            className='w-8 h-8 rounded-full'
                            width={32}
                            height={32}
                          />
                        )}
                        <div>
                          <h1 className='text-2xl font-bold text-gray-900'>
                            {booking?.meetingPurpose}
                          </h1>
                          <p className='text-gray-500 text-sm'>
                            {booking?.bookingBy?.name} requested the meeting
                          </p>
                        </div>
                      </div>
                      <p className='text-gray-500 text-sm'>
                        Select a time slot that works best for you
                      </p>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
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
                        <CalendarX className='w-5 h-5 mr-2 text-primary' />
                        <div>
                          <p className='text-sm text-gray-500'>Preferred Date Range</p>
                          <p className='font-medium'>
                            {booking?.dateRange?.start && booking?.dateRange?.end
                              ? `${format(new Date(booking.dateRange.start), 'MMM d')} - ${format(
                                  new Date(booking.dateRange.end),
                                  'MMM d',
                                )}`
                              : 'Flexible'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full'>
                    {availability?.timezone}
                  </div>
                </div>
              </div>

              {showGuestInfo ? (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                  {/* Left Column - Selected Time Summary */}
                  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                    <div className='flex items-center'></div>

                    <div className=''>
                      <div className='flex items-center text-gray-600  p-3 rounded-lg'>
                        <CalendarX className='w-5 h-5 mr-2 text-primary' />
                        <div>
                          <p className='font-medium text-sm'>
                            {selectedDate?.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center text-gray-600  p-3 rounded-lg'>
                        <Clock className='w-5 h-5 mr-2 text-primary' />
                        <div>
                          <p className='font-medium text-sm'>{selectedTimeSlot?.start}</p>
                        </div>
                      </div>
                      <div className='flex items-center text-gray-600  p-3 rounded-lg'>
                        <MapPinCheckIcon className='w-5 h-5 mr-2 text-primary' />
                        <div>
                          <p className='font-medium text-sm'>{booking?.meetingDuration} minutes</p>
                        </div>
                      </div>
                      <div className='flex items-center text-gray-600  p-3 rounded-lg'>
                        <Globe className='w-5 h-5 mr-2 text-primary' />
                        <div>
                          <p className='font-medium text-sm'>{availability?.timezone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Guest Information Form */}
                  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 md:col-span-2'>
                    <div className='flex items-center'>
                      <div
                        onClick={() => {
                          return setShowGuestInfo(false);
                        }}
                        className='text-gray-500 hover:text-gray-700 cursor-pointer hover:underline'
                      >
                        <ChevronRight className='w-4 h-4 rotate-180 mr-2' />
                        <span className='sr-only'>Back</span>
                      </div>
                      <h3 className='text-lg font-semibold'>Guest Information</h3>
                    </div>

                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='name'>Your Name</Label>
                        <Input
                          id='name'
                          value={guestInfo.name}
                          onChange={(e) => {
                            return setGuestInfo({ ...guestInfo, name: e.target.value });
                          }}
                          placeholder='Enter your full name'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='email'>Your Email</Label>
                        <Input
                          id='email'
                          type='email'
                          value={guestInfo.email}
                          onChange={(e) => {
                            return setGuestInfo({ ...guestInfo, email: e.target.value });
                          }}
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label className='flex items-center'>
                          <span>Guest Email(s)</span>
                          <span className='text-sm text-gray-500 ml-2'>(Optional)</span>
                        </Label>
                        <div className='space-y-2'>
                          {guestInfo.guestEmails.map((email, index) => {
                            return (
                              <div key={index} className='flex gap-2'>
                                <Input
                                  type='email'
                                  value={email}
                                  onChange={(e) => {
                                    return handleGuestEmailChange(index, e.target.value);
                                  }}
                                  placeholder='Enter guest email'
                                />
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => {
                                    return handleRemoveGuestEmail(index);
                                  }}
                                  className='text-gray-500 hover:text-gray-700'
                                >
                                  <X className='w-4 h-4' />
                                </Button>
                              </div>
                            );
                          })}
                          {guestInfo.guestEmails.length < 10 && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={handleAddGuestEmail}
                              className='w-full'
                            >
                              <Plus className='w-4 h-4 mr-2' />
                              Add Guest Email
                            </Button>
                          )}
                        </div>
                        <p className='text-sm text-gray-500'>
                          Notify up to 10 additional guests of the scheduled event.
                        </p>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='notes'>Meeting Notes</Label>
                        <Textarea
                          id='notes'
                          value={guestInfo.notes}
                          onChange={(e) => {
                            return setGuestInfo({ ...guestInfo, notes: e.target.value });
                          }}
                          placeholder='Please share anything that will help prepare for our meeting.'
                          className='min-h-[100px]'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                  <div className='rounded-md border'>
                    <div className='flex max-sm:flex-col'>
                      <div className='flex-1 p-4 sm:p-6'>
                        <CustomCalendar
                          selected={selectedDate}
                          onSelect={(newDate) => {
                            if (newDate) {
                              handleDateSelect(newDate);
                            }
                          }}
                          maxDate={
                            booking?.dateRange?.end ? new Date(booking?.dateRange?.end) : undefined
                          }
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
                                {generateTimeSlots(selectedDate || new Date()).map(
                                  (slot, index) => {
                                    return (
                                      <div
                                        key={index}
                                        className='flex items-center justify-between gap-2'
                                      >
                                        <Button
                                          variant={
                                            selectedTimeSlot?.start === slot.start
                                              ? 'default'
                                              : 'outline'
                                          }
                                          className='w-full h-14'
                                          onClick={() => {
                                            return handleTimeSlotSelect(slot);
                                          }}
                                        >
                                          {slot.start}
                                        </Button>
                                        <div
                                          className='overflow-hidden'
                                          style={{
                                            width:
                                              selectedTimeSlot?.start === slot.start &&
                                              !bookingSuccess
                                                ? '60px'
                                                : '0px',
                                            transition: 'width 0.3s ease-in-out 0.1s',
                                            flexShrink: 0,
                                          }}
                                        >
                                          <Button
                                            variant='outline'
                                            className='w-14 h-14'
                                            onClick={() => {
                                              if (selectedTimeSlot?.start === slot.start) {
                                                setShowGuestInfo(true);
                                              }
                                            }}
                                          >
                                            <span className='sr-only'>Next</span>
                                            <ChevronRight className='w-4 h-4' />
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showGuestInfo && (
                <div className='flex justify-end mt-6'>
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting || !guestInfo.name}
                    className='w-full sm:w-auto px-8 py-6 text-base'
                  >
                    {isSubmitting ? (
                      <div className='flex items-center'>
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                        Scheduling...
                      </div>
                    ) : (
                      'Schedule Event'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
