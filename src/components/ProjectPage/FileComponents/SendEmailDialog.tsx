import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ProjectFile } from '@/lib/mock/projectFiles';
import { Clock, Loader2, Send } from 'lucide-react';
import React, { useState } from 'react';

interface SendEmailDialogProps {
  selectedFile: ProjectFile | null;
  emailSubject: string;
  setEmailSubject: (value: string) => void;
  emailMessage: string;
  setEmailMessage: (value: string) => void;
  requestApproval: boolean;
  setRequestApproval: (value: boolean) => void;
  handleSendEmail: () => Promise<void>;
  onClose: () => void;
}

const SendEmailDialog: React.FC<SendEmailDialogProps> = ({
  selectedFile,
  emailSubject,
  setEmailSubject,
  emailMessage,
  setEmailMessage,
  requestApproval,
  setRequestApproval,
  handleSendEmail,
  onClose,
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    setIsSending(true);
    try {
      await handleSendEmail();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DialogContent className='max-w-md'>
      <DialogHeader>
        <DialogTitle>Send Files to Client</DialogTitle>
        <DialogDescription>Email these files directly to your client.</DialogDescription>
      </DialogHeader>

      <div className='space-y-4 py-4'>
        <div className='space-y-2'>
          <Label htmlFor='client-email'>To</Label>
          <Input
            id='client-email'
            value={selectedFile?.clientEmail || 'client@example.com'}
            readOnly
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email-subject'>Subject</Label>
          <Input
            id='email-subject'
            value={emailSubject}
            onChange={(e) => {
              return setEmailSubject(e.target.value);
            }}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email-message'>Message</Label>
          <Textarea
            id='email-message'
            value={emailMessage}
            onChange={(e) => {
              return setEmailMessage(e.target.value);
            }}
            rows={4}
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Switch
            id='request-approval'
            checked={requestApproval}
            onCheckedChange={setRequestApproval}
          />
          <Label htmlFor='request-approval'>Request Approval</Label>
        </div>

        {requestApproval && (
          <div className='rounded bg-gray-50 p-3 text-sm'>
            <p className='flex items-center text-gray-700'>
              <Clock className='h-4 w-4 mr-2' />
              Client will receive an approval request that they can accept or decline.
            </p>
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={onClose} disabled={isSending}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Sending...
            </>
          ) : (
            <>
              <Send className='mr-2 h-4 w-4' />
              Send Email
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default SendEmailDialog;
