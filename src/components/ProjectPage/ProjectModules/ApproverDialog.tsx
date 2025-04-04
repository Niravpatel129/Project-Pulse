import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface Approver {
  id?: string;
  name: string;
  email: string;
  isProjectParticipant?: boolean;
}

interface ApproverDialogProps {
  isOpen: boolean;
  onClose: () => void;
  potentialApprovers: Approver[];
  selectedApprovers: Approver[];
  onSelectApprover: (approver: Approver) => void;
  onRemoveApprover: (email: string) => void;
  manualEmail: string;
  onManualEmailChange: (email: string) => void;
  onAddManualEmail: () => void;
  onRequestApproval: () => void;
  isLoading: boolean;
}

export function ApproverDialog({
  isOpen,
  onClose,
  potentialApprovers,
  selectedApprovers,
  onSelectApprover,
  onRemoveApprover,
  manualEmail,
  onManualEmailChange,
  onAddManualEmail,
  onRequestApproval,
  isLoading,
}: ApproverDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Select Approvers</DialogTitle>
          <DialogDescription>
            Choose who should approve this module. You can select project participants or add
            external email addresses.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Project Participants */}
          {potentialApprovers.length > 0 && (
            <div className='space-y-2'>
              <Label>Project Participants</Label>
              <div className='flex flex-wrap gap-2'>
                {potentialApprovers.map((approver) => {
                  return (
                    <Badge
                      key={approver.email}
                      variant={
                        selectedApprovers.some((a) => {
                          return a.email === approver.email;
                        })
                          ? 'default'
                          : 'outline'
                      }
                      className='cursor-pointer'
                      onClick={() => {
                        return onSelectApprover(approver);
                      }}
                    >
                      {approver.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Email Input */}
          <div className='space-y-2'>
            <Label>Add External Email</Label>
            <div className='flex gap-2'>
              <Input
                type='email'
                placeholder='Enter email address'
                value={manualEmail}
                onChange={(e) => {
                  return onManualEmailChange(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddManualEmail();
                  }
                }}
              />
              <Button onClick={onAddManualEmail}>Add</Button>
            </div>
          </div>

          {/* Selected Approvers */}
          <div className='space-y-2'>
            <Label>Selected Approvers</Label>
            <div className='space-y-2'>
              {selectedApprovers.map((approver) => {
                return (
                  <div
                    key={approver.email}
                    className='flex items-center justify-between p-2 border rounded-md'
                  >
                    <div>
                      <p className='font-medium'>{approver.name}</p>
                      <p className='text-sm text-muted-foreground'>{approver.email}</p>
                    </div>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        return onRemoveApprover(approver.email);
                      }}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                );
              })}
              {selectedApprovers.length === 0 && (
                <p className='text-sm text-muted-foreground text-center py-2'>
                  No approvers selected
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onRequestApproval}
            disabled={selectedApprovers.length === 0 || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Approval Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
