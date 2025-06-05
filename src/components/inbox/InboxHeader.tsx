import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Archive,
  Copy,
  ExternalLink,
  Info,
  Link2,
  Mail,
  MoreVertical,
  Paperclip,
  Printer,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface InboxHeaderProps {
  subject: string;
  threadId: string;
  isUnread: boolean;
  hasAttachments: boolean;
  status?: string;
}

export default function InboxHeader({
  subject,
  threadId,
  isUnread,
  hasAttachments,
  status = 'unassigned',
}: InboxHeaderProps) {
  const [localStatus, setLocalStatus] = useState(status);

  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  console.log('status', status);
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const markAsUnreadMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.post(`/inbox/${threadId}/read-status`, {
        isUnread: !isUnread,
      });
      return response.data;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['email-chain', threadId] });
      await queryClient.cancelQueries({ queryKey: ['inbox-threads'] });

      // Snapshot the previous value
      const previousEmailChain = queryClient.getQueryData(['email-chain', threadId]);
      const previousInboxThreads = queryClient.getQueryData(['inbox-threads']);

      // Optimistically update the cache
      queryClient.setQueryData(['email-chain', threadId], (old: any) => {
        return {
          ...old,
          isUnread: !isUnread,
        };
      });

      queryClient.setQueryData(['inbox-threads'], (old: any) => {
        if (!old) return old;
        return old.map((thread: any) => {
          return thread.id === threadId ? { ...thread, isUnread: !isUnread } : thread;
        });
      });

      return { previousEmailChain, previousInboxThreads };
    },
    onError: (err, newTodo, context) => {
      // Rollback on error
      if (context?.previousEmailChain) {
        queryClient.setQueryData(['email-chain', threadId], context.previousEmailChain);
      }
      if (context?.previousInboxThreads) {
        queryClient.setQueryData(['inbox-threads'], context.previousInboxThreads);
      }
      toast({
        title: 'Error',
        description: 'Failed to update read status',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['email-chain', threadId] });
      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
    },
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: isUnread ? 'Marked as read' : 'Marked as unread',
      });
    },
  });

  const moveToTrashMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.post(`/inbox/${threadId}/trash`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['email-chain', threadId] });
      await queryClient.cancelQueries({ queryKey: ['inbox-threads'] });

      const previousEmailChain = queryClient.getQueryData(['email-chain', threadId]);
      const previousInboxThreads = queryClient.getQueryData(['inbox-threads']);

      queryClient.setQueryData(['email-chain', threadId], (old: any) => {
        return {
          ...old,
          isTrashed: true,
        };
      });

      queryClient.setQueryData(['inbox-threads'], (old: any) => {
        if (!old) return old;
        return old.filter((thread: any) => {
          return thread.id !== threadId;
        });
      });

      return { previousEmailChain, previousInboxThreads };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousEmailChain) {
        queryClient.setQueryData(['email-chain', threadId], context.previousEmailChain);
      }
      if (context?.previousInboxThreads) {
        queryClient.setQueryData(['inbox-threads'], context.previousInboxThreads);
      }
      toast({
        title: 'Error',
        description: 'Failed to move conversation to trash',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['email-chain', threadId] });
      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
    },
    onSuccess: () => {
      toast({
        title: 'Moved to trash',
        description: 'The conversation has been moved to trash',
      });
    },
  });

  const markAsSpamMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.post(`/inbox/${threadId}/spam`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['email-chain', threadId] });
      await queryClient.cancelQueries({ queryKey: ['inbox-threads'] });

      const previousEmailChain = queryClient.getQueryData(['email-chain', threadId]);
      const previousInboxThreads = queryClient.getQueryData(['inbox-threads']);

      queryClient.setQueryData(['email-chain', threadId], (old: any) => {
        return {
          ...old,
          isSpam: true,
        };
      });

      queryClient.setQueryData(['inbox-threads'], (old: any) => {
        if (!old) return old;
        return old.filter((thread: any) => {
          return thread.id !== threadId;
        });
      });

      return { previousEmailChain, previousInboxThreads };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousEmailChain) {
        queryClient.setQueryData(['email-chain', threadId], context.previousEmailChain);
      }
      if (context?.previousInboxThreads) {
        queryClient.setQueryData(['inbox-threads'], context.previousInboxThreads);
      }
      toast({
        title: 'Error',
        description: 'Failed to mark conversation as spam',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['email-chain', threadId] });
      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
    },
    onSuccess: () => {
      toast({
        title: 'Marked as spam',
        description: 'The conversation has been marked as spam',
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.post(`/inbox/${threadId}/archive`);
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['email-chain', threadId] });
      await queryClient.cancelQueries({ queryKey: ['inbox-threads'] });

      const previousEmailChain = queryClient.getQueryData(['email-chain', threadId]);
      const previousInboxThreads = queryClient.getQueryData(['inbox-threads']);

      queryClient.setQueryData(['email-chain', threadId], (old: any) => {
        return {
          ...old,
          isArchived: true,
        };
      });

      queryClient.setQueryData(['inbox-threads'], (old: any) => {
        if (!old) return old;
        return old.filter((thread: any) => {
          return thread.id !== threadId;
        });
      });

      return { previousEmailChain, previousInboxThreads };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousEmailChain) {
        queryClient.setQueryData(['email-chain', threadId], context.previousEmailChain);
      }
      if (context?.previousInboxThreads) {
        queryClient.setQueryData(['inbox-threads'], context.previousInboxThreads);
      }
      toast({
        title: 'Error',
        description: 'Failed to archive conversation',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['email-chain', threadId] });
      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
    },
    onSuccess: () => {
      toast({
        title: 'Archived',
        description: 'The conversation has been archived',
      });
    },
  });

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.post(`/inbox/${threadId}/summarize`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-chain', threadId] });
      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
      toast({
        title: 'Success',
        description: 'Conversation summarized successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to summarize conversation',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const response = await newRequest.post(`/inbox/${threadId}/stage`, {
        stage: newStatus,
      });
      return response.data;
    },
    onMutate: async (newStatus) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['email-chain', threadId] });
      await queryClient.cancelQueries({ queryKey: ['inbox-threads'] });

      // Snapshot the previous value
      const previousEmailChain = queryClient.getQueryData(['email-chain', threadId]);
      const previousInboxThreads = queryClient.getQueryData(['inbox-threads']);

      // Optimistically update the cache
      queryClient.setQueryData(['email-chain', threadId], (old: any) => {
        return {
          ...old,
          status: newStatus,
        };
      });

      queryClient.setQueryData(['inbox-threads'], (old: any) => {
        if (!old) return old;
        return old.map((thread: any) => {
          return thread.id === threadId ? { ...thread, status: newStatus } : thread;
        });
      });

      return { previousEmailChain, previousInboxThreads };
    },
    onError: (err, newStatus, context) => {
      // Rollback on error
      if (context?.previousEmailChain) {
        queryClient.setQueryData(['email-chain', threadId], context.previousEmailChain);
      }
      if (context?.previousInboxThreads) {
        queryClient.setQueryData(['inbox-threads'], context.previousInboxThreads);
      }
      toast({
        title: 'Error',
        description: 'Failed to update thread status',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['email-chain', threadId] });
      queryClient.invalidateQueries({ queryKey: ['inbox-threads'] });
    },
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'Thread status has been updated',
      });
    },
  });

  const handleMarkAsUnread = () => {
    markAsUnreadMutation.mutate();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyConversationId = async () => {
    try {
      await navigator.clipboard.writeText(threadId);
      toast({
        title: 'Copied!',
        description: 'Thread ID copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy thread ID',
        variant: 'destructive',
      });
    }
  };

  const handleCopyConversationUrl = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Copied!',
        description: 'Thread URL copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy thread URL',
        variant: 'destructive',
      });
    }
  };

  const handleSummarize = () => {
    summarizeMutation.mutate();
  };

  const handleViewConversationDetails = () => {
    router.push(`/inbox/${threadId}/details`);
  };

  const handleViewAttachments = () => {
    if (!hasAttachments) {
      toast({
        title: 'No attachments',
        description: 'This thread has no attachments',
      });
      return;
    }
    router.push(`/inbox/${threadId}/attachments`);
  };

  const handleViewInExternalWindow = () => {
    window.open(window.location.href, '_blank');
  };

  const handleMoveToTrash = () => {
    moveToTrashMutation.mutate();
  };

  const handleMarkAsSpam = () => {
    markAsSpamMutation.mutate();
  };

  const handleArchive = () => {
    archiveMutation.mutate();
  };

  const handleStatusChange = (newStatus: string) => {
    setLocalStatus(newStatus);
    updateStatusMutation.mutate(newStatus);
  };

  return (
    <div className='flex justify-between items-center mb-4'>
      <h2 className='text-xl font-bold text-[#121212] dark:text-white'>{subject}</h2>
      <div className='flex items-center gap-1'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <MoreVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-64'>
            <DropdownMenuItem onClick={handleMarkAsUnread}>
              <Mail className='mr-2 h-4 w-4' />
              {isUnread ? 'Mark as read' : 'Mark as unread'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className='mr-2 h-4 w-4' />
              Print
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Link to conversation</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleCopyConversationId}>
              <Copy className='mr-2 h-4 w-4' />
              Copy thread ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyConversationUrl}>
              <Link2 className='mr-2 h-4 w-4' />
              Copy thread URL
              <Info className='ml-auto h-4 w-4 opacity-60' />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSummarize}>
              <Sparkles className='mr-2 h-4 w-4' />
              Summarize
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewConversationDetails}>
              <Info className='mr-2 h-4 w-4' />
              View thread details
              <span className='ml-auto text-xs text-muted-foreground'>⇧I</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewAttachments} disabled={!hasAttachments}>
              <Paperclip className='mr-2 h-4 w-4' />
              View attachments
              {!hasAttachments && <Info className='ml-auto h-4 w-4 opacity-60' />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewInExternalWindow}>
              <ExternalLink className='mr-2 h-4 w-4' />
              View in external window
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleMoveToTrash}
              className='text-red-600 dark:text-red-400'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Move to Trash
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleMarkAsSpam}
              className='text-orange-600 dark:text-orange-400'
            >
              <AlertTriangle className='mr-2 h-4 w-4' />
              Mark as Spam
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className='mr-2 h-4 w-4' />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Select value={localStatus} onValueChange={handleStatusChange}>
          <SelectTrigger
            className={`font-semibold rounded-full px-3 py-1.5 h-auto border-0 focus-visible:ring-0 focus-visible:border-0 active:ring-0 active:border-0 focus:ring-0 focus:border-1 ${
              localStatus === 'unassigned'
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : localStatus === 'assigned'
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : localStatus === 'archived'
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : localStatus === 'snoozed'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : localStatus === 'trash'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : localStatus === 'spam'
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <SelectValue placeholder='Unassigned' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='unassigned' className='focus:bg-gray-100'>
              Unassigned
            </SelectItem>
            <SelectItem value='assigned' className='focus:bg-blue-100'>
              Assigned
            </SelectItem>
            <SelectItem value='archived' className='focus:bg-purple-100'>
              Archived
            </SelectItem>
            <SelectItem value='snoozed' className='focus:bg-yellow-100'>
              Snoozed
            </SelectItem>
            <SelectItem value='trash' className='focus:bg-red-100'>
              Trash
            </SelectItem>
            <SelectItem value='spam' className='focus:bg-orange-100'>
              Spam
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
