import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';

interface EmailAddress {
  id: number;
  name: string;
  email: string;
  card_name: string;
  handle: string;
  display_name: string;
  avatar: string;
  initials: string;
  card_id: number;
  card_url: string;
  url: string;
}

interface SendEmailPayload {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
  fromEmail: string;
  inReplyToEmailId?: string;
}

interface MessageReference {
  messageId: string;
  inReplyTo: string | null;
  references: string[];
  type: 'reply' | 'original';
  position: number;
}

interface SendEmailResponse {
  success: boolean;
  data: {
    _id: string;
    threadId: string;
    workspaceId: string;
    userId: string;
    gmailMessageId: string;
    from: EmailAddress;
    to: EmailAddress[];
    cc: EmailAddress[];
    bcc: EmailAddress[];
    subject: string;
    body: {
      mimeType: string;
      parts: Array<{
        mimeType: string;
        content: string;
      }>;
    };
    attachments: Array<{
      filename: string;
      mimeType: string;
      size: number;
      attachmentId: string;
      storageUrl: string;
      storagePath: string;
    }>;
    historyId: string;
    internalDate: string;
    direction: 'outbound';
    status: 'sent';
    sentAt: string;
    messageReferences: MessageReference[];
    readBy: string[];
  };
}

export const useSendEmail = () => {
  return useMutation<SendEmailResponse, Error, SendEmailPayload>({
    mutationFn: async (payload) => {
      const { data } = await newRequest.post<SendEmailResponse>('/inbox/send-email', {
        ...payload,
        inReplyToEmailId: payload.inReplyToEmailId,
      });
      return data;
    },
  });
};
