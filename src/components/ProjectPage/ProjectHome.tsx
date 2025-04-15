'use client';

import { Attachment as ApiAttachment } from '@/api/models';
import { Card } from '@/components/ui/card';
import { NotesProvider } from '@/contexts/NotesContext';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { format, isThisWeek, isThisYear, isToday, isYesterday } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Mail, User } from 'lucide-react';
import { EmailCard } from './EmailCard';
import { NoteCard } from './NoteCard';
import ProjectMessageInput from './ProjectMessageInput';

interface ActivityUser {
  _id: string;
  name: string;
  email: string;
}

interface ActivityProject {
  _id: string;
  name: string;
}

interface EmailAttachment {
  name: string;
  size: number;
  type: string;
  url: string;
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
  metadata: Record<string, unknown>;
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
  attachments: ApiAttachment[];
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
  replies: EmailMessage[];
  replyEmailId?: {
    shortEmailId: string;
  };
  trackingData?: {
    shortProjectId: string;
    shortThreadId: string;
    shortUserId: string;
  };
  isRead: boolean;
}

interface EmailThread {
  threadId: string | null;
  subject: string;
  lastMessageAt: number;
  messageCount: number;
  participants: string[];
  messages: EmailMessage[];
  isRead: boolean;
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

interface Note {
  _id: string;
  content: string;
  attachments: {
    _id: string;
    name: string;
    originalName: string;
    downloadURL: string;
    contentType: string;
    size: number;
  }[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Combined type for chronological sorting
interface TimelineItem {
  type: 'activity' | 'email' | 'note';
  timestamp: string;
  data: Activity | EmailThread | Note;
}

// Helper function to recursively map email messages
const mapEmailMessage = (message: EmailMessage) => {
  return {
    id: message._id,
    from: {
      name: message.sentBy?.name || message.from,
      email: message.from,
    },
    to: message.to.join(', '),
    subject: message.subject,
    content: message.body,
    sentBy: message.sentBy,
    date: message.sentAt || message.createdAt,
    attachments: message.attachments,
    direction: message.direction as 'inbound' | 'outbound',
    messageId: message.messageId,
    references: message.references,
    trackingData: message.trackingData,
    shortEmailId: message?.replyEmailId?.shortEmailId,
    replies: message.replies.map(mapEmailMessage),
    isRead: message.isRead,
  };
};

const mapApiAttachmentToEmailAttachment = (apiAttachment: ApiAttachment): EmailAttachment => {
  return {
    name: apiAttachment.fileName,
    size: apiAttachment.fileSize,
    type: apiAttachment.fileType,
    url: apiAttachment.downloadUrl,
  };
};

// Helper function to get date group label
const getDateGroupLabel = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This week';
  if (isThisYear(date)) return format(date, 'MMMM d');
  return format(date, 'MMMM d, yyyy');
};

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

  const { data: notesData, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes', project?._id],
    queryFn: async () => {
      const response = await newRequest.get(`/notes/project/${project._id}`);
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
  const notes = notesData?.data || [];

  // Combine activities, email threads, and notes into a single timeline
  const timelineItems: TimelineItem[] = [
    ...recentActivities.map((activity) => {
      return {
        type: 'activity' as const,
        timestamp: activity.createdAt,
        data: activity,
      };
    }),
    // Only include the latest message from each thread
    ...emailThreads.map((thread) => {
      const latestMessage = thread.messages[0];
      return {
        type: 'email' as const,
        timestamp: new Date(thread.lastMessageAt).toISOString(),
        data: {
          ...thread,
          // Include the full thread data but mark the latest message
          latestMessage,
          isLatestInThread: true,
        },
      };
    }),
    // Add notes to the timeline
    ...notes.map((note) => {
      return {
        type: 'note' as const,
        timestamp: note.createdAt,
        data: note,
      };
    }),
  ];

  // Sort combined items by timestamp (newest first)
  const sortedTimelineItems = timelineItems.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Group items by date
  const groupedTimelineItems = sortedTimelineItems.reduce((groups, item) => {
    const date = new Date(item.timestamp);
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = {
        label: getDateGroupLabel(date),
        items: [],
      };
    }
    groups[dateKey].items.push(item);
    return groups;
  }, {} as Record<string, { label: string; items: TimelineItem[] }>);

  return (
    <motion.div
      className='space-y-6'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Message Input */}
      <motion.div layout transition={{ duration: 0.3 }}>
        <ProjectMessageInput />
      </motion.div>

      {/* Combined Activity and Email Feed */}
      <motion.div className='space-y-4' layout transition={{ duration: 0.3 }}>
        <h3 className='text-sm font-medium'>Recent activity & project notes</h3>
        <div className='space-y-4'>
          {isLoadingActivities || isLoadingEmails || isLoadingNotes ? (
            <motion.div
              className='text-sm text-gray-500'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Loading activities and emails...
            </motion.div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {Object.entries(groupedTimelineItems).map(([dateKey, group]) => {
                return (
                  <motion.div
                    key={dateKey}
                    className='space-y-4'
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {group.items.map((item) => {
                      if (item.type === 'activity') {
                        const activity = item.data as Activity;
                        let icon = 'file-text';
                        if (activity.type === 'user') icon = 'user';
                        else if (activity.type === 'email' || activity.type === 'message')
                          icon = 'mail';

                        return (
                          <motion.div
                            key={`activity-${activity._id}`}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className='p-3'>
                              <div className='flex items-center gap-3'>
                                <div className='flex-shrink-0 bg-gray-100 p-2 rounded-full'>
                                  {icon === 'user' && <User className='h-4 w-4 text-gray-500' />}
                                  {icon === 'file-text' && (
                                    <FileText className='h-4 w-4 text-gray-500' />
                                  )}
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
                      } else if (item.type === 'note') {
                        const note = item.data as Note;
                        return (
                          <motion.div
                            key={`note-${note._id}`}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <NotesProvider projectId={project._id}>
                              <NoteCard note={note} />
                            </NotesProvider>
                          </motion.div>
                        );
                      } else {
                        const thread = item.data as EmailThread & {
                          latestMessage: EmailMessage;
                          isLatestInThread: boolean;
                        };
                        const latestMessage = thread.latestMessage;
                        return (
                          <motion.div
                            key={`email-${thread.threadId || latestMessage._id}`}
                            className='w-full'
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
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
                                attachments: latestMessage.attachments.map(
                                  mapApiAttachmentToEmailAttachment,
                                ),
                                messageCount: thread.messageCount,
                                messageId: latestMessage.messageId,
                                references: latestMessage.references,
                                trackingData: latestMessage.trackingData,
                                replies: latestMessage.replies.map(mapEmailMessage),
                                direction: latestMessage.direction as 'inbound' | 'outbound',
                                sentBy: latestMessage.sentBy,
                                isLatestInThread: true,
                                threadId: thread.threadId,
                                isRead: latestMessage.isRead,
                              }}
                            />
                          </motion.div>
                        );
                      }
                    })}
                    <motion.div
                      className='flex items-center gap-2'
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className='h-px flex-1 bg-gray-200' />
                      <span className='text-xs font-medium text-gray-500 px-2'>{group.label}</span>
                      <div className='h-px flex-1 bg-gray-200' />
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Footer information */}
      <motion.div
        className='mt-6 pt-4 border-t border-gray-200 text-center w-full flex justify-center items-center'
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className='flex items-center gap-2'>
          <Mail className='h-4 w-4 text-gray-500' />
          <p className='text-sm text-gray-500'>You can respond to messages here or via email</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
