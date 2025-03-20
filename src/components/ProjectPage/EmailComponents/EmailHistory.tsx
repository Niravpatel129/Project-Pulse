import { Card } from '@/components/ui/card';

interface EmailHistoryItem {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  sentAt: string;
  sentBy: string;
}

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
          <Card key={email.id} className='p-4'>
            <div className='flex justify-between items-start'>
              <h4 className='font-medium'>{email.subject}</h4>
              <span className='text-xs text-gray-500'>{formatDate(email.sentAt)}</span>
            </div>
            <div className='text-sm mt-1'>To: {email.to.join(', ')}</div>
            <div className='text-sm text-gray-600 mt-2'>{email.body}</div>
          </Card>
        );
      })}
    </div>
  );
};
