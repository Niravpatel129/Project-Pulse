'use client';

import { Attachment as ApiAttachment } from '@/api/models';
import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { FileText, Mail, User } from 'lucide-react';
import { EmailCard } from './EmailCard';
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
  console.log('🚀 message:', message);

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
  console.log('🚀 notesData:', notesData);

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

  return (
    <div className='space-y-6'>
      {/* Message Input */}
      <ProjectMessageInput />

      {/* Combined Activity and Email Feed */}
      <div className='space-y-4'>
        <h3 className='text-sm font-medium'>Recent activity & messages</h3>
        <div className='space-y-4'>
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
                    <div key={`activity-${activity._id}`}>
                      {/* line across */}
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
                    </div>
                  );
                } else if (item.type === 'note') {
                  const note = item.data as Note;
                  return (
                    <div key={`note-${note._id}`}>
                      <Card className='p-3'>
                        <div className='flex items-center gap-3'>
                          <div className='flex-shrink-0 bg-gray-100 p-2 rounded-full'>
                            <FileText className='h-4 w-4 text-gray-500' />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <p className='text-sm font-medium'>{note.createdBy.name}</p>
                              <p className='text-xs text-gray-500'>
                                {new Date(note.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div
                              className='mt-1 text-sm text-gray-700'
                              dangerouslySetInnerHTML={{ __html: note.content }}
                            />
                            {note.attachments && note.attachments.length > 0 && (
                              <div className='mt-2 flex flex-wrap gap-2'>
                                {note.attachments.map((attachment) => {
                                  return (
                                    <a
                                      key={attachment._id}
                                      href={attachment.downloadURL}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-xs text-blue-500 hover:underline'
                                    >
                                      {attachment.originalName}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                } else {
                  const thread = item.data as EmailThread & {
                    latestMessage: EmailMessage;
                    isLatestInThread: boolean;
                  };
                  const latestMessage = thread.latestMessage;
                  return (
                    <div key={`email-${thread.threadId || latestMessage._id}`} className='w-full'>
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
                    </div>
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
