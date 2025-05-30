import { Button } from '@/components/ui/button';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface GmailIntegrationProps {
  onSuccess?: () => void;
}

interface GmailStatus {
  connected: boolean;
  message: string;
  primaryEmail: string | null;
  integrations: Array<{
    email: string;
    isPrimary: boolean;
    isActive: boolean;
    lastSynced: string;
    isExpired: boolean;
    connectedAt: string;
  }>;
}

export function GmailIntegration({ onSuccess }: GmailIntegrationProps) {
  const queryClient = useQueryClient();

  // Fetch Gmail status
  const { data: gmailStatus, isLoading } = useQuery<GmailStatus>({
    queryKey: ['gmail-status'],
    queryFn: async () => {
      const response = await newRequest.get('/gmail/status');
      return response.data;
    },
  });

  // Connect Gmail mutation
  const connectGmailMutation = useMutation({
    mutationFn: async () => {
      const response = await newRequest.get('/gmail/auth-url');

      let authUrl = response.data.authUrl;

      if (authUrl) {
        const url = new URL(authUrl);
        if (!url.searchParams.has('response_type')) {
          url.searchParams.append('response_type', 'code');
        }

        if (!url.searchParams.has('state')) {
          url.searchParams.append('state', 'gmail_auth');
        }

        // Add the proper redirect URI
        if (!url.searchParams.has('redirect_uri')) {
          url.searchParams.append('redirect_uri', 'https://www.hourblock.com/sync/google/callback');
        }

        authUrl = url.toString();

        // Create a popup window for authentication
        const width = 600;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          authUrl,
          'gmailAuth',
          `width=${width},height=${height},left=${left},top=${top}`,
        );

        // Set up message listener for communication from the popup
        const messageHandler = (event: MessageEvent) => {
          // Validate origin for security
          if (event.origin !== window.location.origin) return;

          // Handle the auth success message
          if (event.data?.type === 'GMAIL_AUTH_SUCCESS') {
            window.removeEventListener('message', messageHandler);
            // Refresh Gmail status after successful connection
            queryClient.invalidateQueries({ queryKey: ['gmail-status'] });
            onSuccess?.();
          }

          // Handle auth error message
          if (event.data?.type === 'GMAIL_AUTH_ERROR') {
            window.removeEventListener('message', messageHandler);
            console.error('Gmail auth error:', event.data.error);
            toast.error('Failed to connect Gmail account');
          }
        };

        window.addEventListener('message', messageHandler);

        // Also check if popup was closed manually
        const checkPopupClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopupClosed);
            window.removeEventListener('message', messageHandler);
          }
        }, 500);
      } else {
        throw new Error('No authorization URL provided');
      }
    },
    onError: (error) => {
      console.error('Failed to connect Gmail:', error);
      toast.error('Failed to connect Gmail account');
    },
  });

  if (isLoading) {
    return (
      <div className='flex items-center gap-3 mb-4'>
        <div>
          <h4 className='font-medium text-[#3F3F46] dark:text-white'>Google Workspace / Gmail</h4>
          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>Loading status...</p>
        </div>
        <Button disabled className='ml-auto bg-black/50 text-white'>
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3 mb-4'>
      <div>
        <h4 className='font-medium text-[#3F3F46] dark:text-white'>Google Workspace / Gmail</h4>
        <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
          {gmailStatus?.connected
            ? gmailStatus.primaryEmail
              ? `Connected as ${gmailStatus.primaryEmail}`
              : 'Connected'
            : 'Recommended for most teams'}
        </p>
      </div>
      <Button
        onClick={() => {
          return connectGmailMutation.mutate();
        }}
        disabled={connectGmailMutation.isPending || gmailStatus?.connected}
        className='ml-auto bg-black hover:bg-black/90 text-white'
      >
        {connectGmailMutation.isPending
          ? 'Connecting...'
          : gmailStatus?.connected
          ? 'Connected'
          : 'Connect Gmail'}
      </Button>
    </div>
  );
}
