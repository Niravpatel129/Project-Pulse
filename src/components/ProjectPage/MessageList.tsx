import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, DollarSign, Paperclip, Star } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

interface Activity {
  id: number;
  actor: {
    id: string;
    name: string;
    avatar?: string;
    role?: 'client' | 'freelancer' | 'system';
  };
  content: string;
  timestamp: string;
  activityType: 'milestone' | 'delivery' | 'revision' | 'payment' | 'message' | 'review' | 'order';
  status?: 'completed' | 'pending' | 'cancelled';
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  metadata?: {
    amount?: number;
    dueDate?: string;
    rating?: number;
    orderNumber?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of the chat container when component mounts or activities change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activities]);

  // Use stable formatting functions that won't cause hydration mismatches
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      // Use a more explicit date format that's consistent across server and client
      const month = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][date.getMonth()];
      return `${month} ${date.getDate()}, ${date.getFullYear()}`;
    } catch {
      // Ignore error and return fallback
      return 'Invalid date';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      // Format time manually to ensure consistency
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes} ${ampm}`;
    } catch {
      // Ignore error and return fallback
      return '';
    }
  };

  // Use useMemo to prevent recalculation on re-renders
  const groupedActivities = useMemo(() => {
    const grouped: { [key: string]: Activity[] } = {};
    activities.forEach((activity) => {
      const date = formatDate(activity.timestamp);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });
    return grouped;
  }, [activities]);

  const getActivityLabel = (activity: Activity) => {
    switch (activity.activityType) {
      case 'milestone':
        return `Milestone ${activity.status === 'completed' ? 'Completed' : 'Created'}`;
      case 'delivery':
        return `Delivery ${activity.status === 'completed' ? 'Accepted' : 'Submitted'}`;
      case 'revision':
        return 'Revision Requested';
      case 'payment':
        return 'Payment Processed';
      case 'message':
        return 'New Message';
      case 'review':
        return 'Review Posted';
      case 'order':
        return 'Order Placed';
      default:
        return 'Update';
    }
  };

  // Format due date consistently
  const formatDueDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Use a more explicit date format that's consistent across server and client
      const month = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][date.getMonth()];
      return `${month} ${date.getDate()}, ${date.getFullYear()}`;
    } catch {
      // Ignore error and return fallback
      return 'Invalid date';
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      className='flex flex-col space-y-6 h-[400px] overflow-y-auto p-4 rounded-lg'
    >
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <div key={date} className='space-y-4'>
          <div className='flex items-center gap-2'>
            <div className='h-px flex-1 bg-gray-200'></div>
            <span className='text-xs font-medium text-gray-500'>{date}</span>
            <div className='h-px flex-1 bg-gray-200'></div>
          </div>

          {dateActivities.map((activity) => (
            <div key={activity.id} className='flex gap-4 animate-in fade-in slide-in-from-bottom-2'>
              <div className='relative'>
                <Avatar className='h-8 w-8 shrink-0 mt-1 border-2 border-white'>
                  <AvatarImage src={activity.actor.avatar} alt={activity.actor.name} />
                  <AvatarFallback>{activity.actor.name[0]}</AvatarFallback>
                </Avatar>
              </div>

              <div className='flex-1 space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-sm'>{activity.actor.name}</span>
                  <span className='text-xs text-gray-500'>{formatTime(activity.timestamp)}</span>

                  <div className='flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs'>
                    <span>{getActivityLabel(activity)}</span>
                  </div>

                  {activity.actor.role && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        activity.actor.role === 'client'
                          ? 'bg-blue-50 text-blue-600'
                          : activity.actor.role === 'freelancer'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-gray-50 text-gray-600'
                      }`}
                    >
                      {activity.actor.role.charAt(0).toUpperCase() + activity.actor.role.slice(1)}
                    </span>
                  )}
                </div>

                <div className='rounded-md bg-white border border-gray-200 p-4'>
                  <p className='text-sm text-gray-800'>{activity.content}</p>

                  {activity.metadata && (
                    <div className='mt-2 pt-2 border-t border-gray-100'>
                      {activity.metadata.amount && (
                        <div className='flex items-center gap-2 text-sm'>
                          <DollarSign className='h-3 w-3 text-gray-500' />
                          <span className='font-medium'>
                            ${activity.metadata.amount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {activity.metadata.dueDate && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Calendar className='h-3 w-3 text-gray-500' />
                          <span>Due: {formatDueDate(activity.metadata.dueDate)}</span>
                        </div>
                      )}

                      {activity.metadata.rating && (
                        <div className='flex items-center gap-1 text-sm'>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < activity.metadata!.rating!
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {activity.metadata.orderNumber && (
                        <div className='flex items-center gap-2 text-sm'>
                          <span className='text-xs text-gray-500'>
                            Order #{activity.metadata.orderNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {activity.attachments && activity.attachments.length > 0 && (
                    <div className='mt-3 pt-3 border-t border-gray-100 space-y-2'>
                      <p className='text-xs font-medium text-gray-500'>Attachments</p>
                      <div className='grid grid-cols-2 gap-2'>
                        {activity.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            className='flex items-center gap-2 p-2 rounded-md border border-gray-200 text-xs hover:bg-gray-50 transition-colors'
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <Paperclip className='h-3 w-3 text-gray-400' />
                            <span className='truncate'>{attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {activity.status && (
                  <div className='flex justify-end'>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        activity.status === 'completed'
                          ? 'bg-green-50 text-green-600'
                          : activity.status === 'pending'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
