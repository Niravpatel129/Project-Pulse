import { Card } from '@/components/ui/card';
import { EmailHistoryItem } from '@/hooks/useEmails';

interface EmailHistoryProps {
  history: EmailHistoryItem[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
}

export const EmailHistory = ({ history, isLoading, formatDate }: EmailHistoryProps) => {
  if (isLoading) {
    return <div className='text-center py-8'>Loading email history...</div>;
  }

  if (!Array.isArray(history) || history.length === 0) {
    return <div className='text-center py-8 text-gray-500'>No email history found</div>;
  }

  return (
    <div className='space-y-3'>
      {history.map((email) => {
        return (
          <Card key={email._id} className='p-4'>
            <div className='flex justify-between items-start mb-2'>
              <div>
                <div className='font-medium'>{email.subject}</div>
                <div className='text-sm text-gray-500'>
                  To: {email.to.join(', ')}
                  {email.cc?.length ? ` • CC: ${email.cc.join(', ')}` : ''}
                  {email.bcc?.length ? ` • BCC: ${email.bcc.join(', ')}` : ''}
                </div>
              </div>
              <div className='text-sm text-gray-500'>
                {formatDate(email.sentAt)} • {email.sentBy.name}
              </div>
            </div>
            <div className='text-sm text-gray-600 line-clamp-3'>{email.body}</div>
          </Card>
        );
      })}
    </div>
  );
};
