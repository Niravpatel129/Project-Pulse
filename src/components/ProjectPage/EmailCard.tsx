import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { useEmails } from '@/hooks/useEmails';
import { format } from 'date-fns';
import { Reply, Send, X } from 'lucide-react';
import { useState } from 'react';
import { Descendant } from 'slate';
import { toast } from 'sonner';
import { EmailEditor } from './EmailComponents/EmailEditor';

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

export function EmailCard({
  email = {
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
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editorValue, setEditorValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
  const { project } = useProject();
  const { sendEmail } = useEmails(project?._id || '');

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Message required', {
        description: 'Please add a message to your reply.',
      });
      return;
    }

    try {
      await sendEmail({
        to: [email.from.email],
        subject: `Re: ${email.subject}`,
        body: replyContent,
        projectId: project?._id || '',
      });

      toast.success('Reply sent', {
        description: 'Your reply has been sent successfully.',
      });

      setIsReplying(false);
      setReplyContent('');
      setEditorValue([
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]);
    } catch (error) {
      toast.error('Failed to send reply', {
        description: 'There was an error sending your reply. Please try again.',
      });
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-0'>
        <Card key={email.id} className='p-4'>
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
                <Tooltip>
                  <TooltipTrigger>
                    <span className='text-sm text-gray-500'>
                      {format(new Date(email.date), 'MMM d, yyyy')}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{format(new Date(email.date), 'MMM d, yyyy hh:mm a')}</span>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className='text-sm text-gray-500'>To: {email.to}</div>
              <h3 className='text-base font-medium mt-1'>{email.subject}</h3>
              <p className='text-sm text-gray-600 mt-4 border-t pt-4 pb-8'>{email.content}</p>
              <div className='flex justify-end'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReplying(!isReplying);
                  }}
                >
                  <Reply className='h-4 w-4 mr-2' />
                  {isReplying ? 'Cancel Reply' : 'Reply'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {isReplying && (
          <div className='relative'>
            <Card className='mt-4'>
              <div className='p-4 space-y-4'>
                <div className='flex justify-between items-center'>
                  <div>
                    <div className='text-sm text-gray-500'>
                      To: {email.from.name} ({email.from.email})
                    </div>
                    <div className='text-sm font-medium'>Re: {email.subject}</div>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      return setIsReplying(false);
                    }}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                <div className='border rounded-md mt-2'>
                  <EmailEditor
                    initialValue={editorValue}
                    onChange={(value, plainText) => {
                      setEditorValue(value);
                      setReplyContent(plainText);
                    }}
                    height='150px'
                  />
                </div>
                <div className='flex justify-end'>
                  <Button onClick={handleReply}>
                    <Send className='h-4 w-4 mr-2' />
                    Send Reply
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
