import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

interface SendInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}

const SendInvoiceDialog: React.FC<SendInvoiceDialogProps> = ({ isOpen, onClose, invoice }) => {
  const [email, setEmail] = useState(invoice.customer?.email || '');
  const [subject, setSubject] = useState(
    `Invoice #${invoice.invoiceNumber} from ${invoice.customer?.name}`,
  );
  const [message, setMessage] = useState(
    `Please find attached the invoice #${invoice.invoiceNumber} for ${invoice.customer?.name}.`,
  );
  const queryClient = useQueryClient();

  const sendInvoiceMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.post(`/invoices2/${invoice._id}/send`, {
        email,
        subject,
        message,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      onClose();
    },
  });

  const handleSend = () => {
    sendInvoiceMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Send Invoice</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              value={email}
              onChange={(e) => {
                return setEmail(e.target.value);
              }}
              placeholder='Enter recipient email'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='subject'>Subject</Label>
            <Input
              id='subject'
              value={subject}
              onChange={(e) => {
                return setSubject(e.target.value);
              }}
              placeholder='Enter email subject'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              value={message}
              onChange={(e) => {
                return setMessage(e.target.value);
              }}
              placeholder='Enter email message'
              className='min-h-[100px]'
            />
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendInvoiceMutation.isPending}>
            {sendInvoiceMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvoiceDialog;
