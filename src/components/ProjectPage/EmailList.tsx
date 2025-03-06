import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reply } from 'lucide-react';

interface Email {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string;
  subject: string;
  content: string;
  date: string;
}

export function EmailList() {
  // Mock email data - in a real app, this would come from an API or state management
  const emails: Email[] = [
    {
      id: '1',
      from: {
        name: 'Nirav Patel',
        email: 'mailman@email.com',
      },
      to: 'asd',
      subject: 'New Email',
      content:
        'Hi, I hope this email finds you well! I want to follow up regarding the email I sent you about the information you requested...',
      date: 'Thu, Mar 6, 2025',
    },
    // Add more mock emails here as needed
  ];

  const handleReply = (email: Email) => {
    // Handle reply functionality
    console.log('Replying to:', email);
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-3'>
        {emails.map((email) => {
          return (
            <Card key={email.id} className='p-4 hover:bg-gray-50 cursor-pointer'>
              <div className='flex items-start gap-4'>
                <Avatar className='h-10 w-10'>
                  <AvatarFallback className='bg-gray-100'>
                    {email.from.name
                      .split(' ')
                      .map((n) => {
                        return n[0];
                      })
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{email.from.name}</span>
                      <span className='text-gray-500'>({email.from.email})</span>
                    </div>
                    <span className='text-sm text-gray-500'>{email.date}</span>
                  </div>
                  <div className='text-sm text-gray-500'>To: {email.to}</div>
                  <h3 className='text-base font-medium mt-1'>{email.subject}</h3>
                  <p className='text-sm text-gray-600 mt-4 border-t pt-4 pb-8 truncate min-h-[40px]'>
                    {email.content}
                  </p>
                  <div className='flex justify-end'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(email);
                      }}
                    >
                      <Reply className='h-4 w-4 mr-2' />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
