'use client';

import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Mail, User } from 'lucide-react';
import { EmailCard } from './EmailCard';
import { EmailComponent } from './EmailComponent';

interface ActivityUser {
  _id: string;
  name: string;
  email: string;
}

interface ActivityProject {
  _id: string;
  name: string;
}

interface Activity {
  _id: string;
  user: ActivityUser;
  workspace: string;
  project: ActivityProject;
  type: string;
  action: string;
  description: string;
  entityId: string;
  entityType: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ActivitiesResponse {
  statusCode: number;
  data: Activity[];
  message: string;
  success: boolean;
}

interface EmailSender {
  _id: string;
  name: string;
  email: string;
}

interface EmailMessage {
  _id: string;
  projectId: string;
  subject: string;
  body: string;
  to: string[];
  cc: string[];
  bcc: string[];
  from: string;
  attachments: any[];
  sentBy: EmailSender;
  status: string;
  sentAt: string;
  messageId: string;
  references: string[];
  trackingAddress: string;
  direction: string;
  openCount: number;
  unmatched: boolean;
  createdAt: string;
  updatedAt: string;
  children: EmailMessage[];
  depth: number;
  parentId: string | null;
}

interface EmailThread {
  threadId: string | null;
  subject: string;
  lastMessageAt: number;
  messageCount: number;
  participants: string[];
  messages: EmailMessage[];
}

interface EmailsResponse {
  success: boolean;
  threads: EmailThread[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// Combined type for chronological sorting
interface TimelineItem {
  type: 'activity' | 'email';
  timestamp: string;
  data: Activity | EmailThread;
}

export default function ProjectHome() {
  const { project } = useProject();

  const { data: emailsData, isLoading: isLoadingEmails } = useQuery({
    queryKey: ['emailHistory', project?._id],
    queryFn: async () => {
      const response = await newRequest.get<EmailsResponse>(`/emails/history/${project._id}`);
      return response.data;
    },
    enabled: !!project?._id,
  });

  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['recentActivities', project?._id],
    queryFn: async () => {
      const response = await newRequest.get<ActivitiesResponse>(
        `/activities/recent/${project._id}`,
        {
          params: {
            limit: 5,
          },
        },
      );
      return response.data;
    },
    enabled: !!project?._id,
  });

  const recentActivities = activitiesData?.data || [];
  const emailThreads = emailsData?.threads || [];

  // Combine activities and email threads into a single timeline
  const timelineItems: TimelineItem[] = [
    ...recentActivities.map((activity) => {
      return {
        type: 'activity' as const,
        timestamp: activity.createdAt,
        data: activity,
      };
    }),
    ...emailThreads.map((thread) => {
      return {
        type: 'email' as const,
        timestamp: new Date(thread.lastMessageAt).toISOString(),
        data: thread,
      };
    }),
  ];

  // Sort combined items by timestamp (newest first)
  const sortedTimelineItems = timelineItems.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className='space-y-6'>
      <EmailComponent />

      {/* Combined Activity and Email Feed */}
      <div className='space-y-4'>
        <h3 className='text-sm font-medium'>Recent activity & messages</h3>
        <div className='space-y-3'>
          {isLoadingActivities || isLoadingEmails ? (
            <div className='text-sm text-gray-500'>Loading activities and emails...</div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {sortedTimelineItems.map((item) => {
                if (item.type === 'activity') {
                  const activity = item.data as Activity;
                  // Determine icon based on activity type/action
                  let icon = 'file-text';
                  if (activity.type === 'user') icon = 'user';
                  else if (activity.type === 'email' || activity.type === 'message') icon = 'mail';

                  return (
                    <motion.div
                      key={`activity-${activity._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className='p-3'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 bg-gray-100 p-2 rounded-full'>
                            {icon === 'user' && <User className='h-4 w-4 text-gray-500' />}
                            {icon === 'file-text' && <FileText className='h-4 w-4 text-gray-500' />}
                            {icon === 'mail' && <Mail className='h-4 w-4 text-gray-500' />}
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>{activity.description}</p>
                            <p className='text-xs text-gray-500'>
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                } else {
                  const thread = item.data as EmailThread;
                  const latestMessage = thread.messages[thread.messages.length - 1];
                  return (
                    <motion.div
                      key={`email-${thread.threadId || latestMessage._id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <EmailCard
                        email={{
                          id: latestMessage._id,
                          from: {
                            name: latestMessage.sentBy?.name,
                            email: latestMessage.from,
                          },
                          to: latestMessage.to.join(', '),
                          subject: thread.subject,
                          content: latestMessage.body,
                          date: latestMessage.sentAt || latestMessage.createdAt,
                          attachments: latestMessage.attachments,
                          messageCount: thread.messageCount,
                        }}
                      />
                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Footer information */}
      <div className='mt-6 pt-4 border-t border-gray-200 text-center w-full flex justify-center items-center'>
        <div className='flex items-center gap-2'>
          <Mail className='h-4 w-4 text-gray-500' />
          <p className='text-sm text-gray-500'>You can respond to messages here or via email</p>
        </div>
      </div>
    </div>
  );
}
