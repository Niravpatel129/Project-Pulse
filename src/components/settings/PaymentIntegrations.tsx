import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { FiAlertCircle, FiCheck, FiCreditCard, FiLoader, FiX } from 'react-icons/fi';

interface Terminal {
  id: string;
  name: string;
  model: string;
  serial: string;
}

interface ShopInfo {
  name: string;
  address: string;
  status: 'active' | 'inactive';
  gatewayStatus: 'complete' | 'incomplete';
}

interface PaymentIntegrationsProps {
  stripeStatus: {
    status?: string;
    accountId?: string;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    detailsSubmitted?: boolean;
  } | null;
  connectStripe: () => void;
  disconnectStripe: () => void;
}

export function PaymentIntegrations({
  stripeStatus,
  connectStripe,
  disconnectStripe,
}: PaymentIntegrationsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);

  // Mock data - replace with actual data from your backend
  const [shopInfo, setShopInfo] = useState<ShopInfo>({
    name: 'Lightspeed Shop',
    address: '1326 Maguire Ave., Montreal, QC, CAN, G1T 1Z3',
    status: 'inactive',
    gatewayStatus: 'incomplete',
  });

  const [terminals, setTerminals] = useState<Terminal[]>([
    {
      id: '1',
      name: 'FRONT COUNTER',
      model: 'BBPOS WisePOS E',
      serial: 'WSC513124045532',
    },
  ]);

  const [newTerminal, setNewTerminal] = useState<Omit<Terminal, 'id'>>({
    name: '',
    model: '',
    serial: '',
  });

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectStripe();
      toast({
        title: 'Success',
        description: 'Redirecting to Stripe...',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to Stripe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectStripe();
      toast({
        title: 'Success',
        description: 'Successfully disconnected from Stripe',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect from Stripe',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleTestConnection = async (terminalId: string) => {
    setIsTestingConnection(terminalId);
    try {
      // Simulate API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 1000);
      });
      toast({
        title: 'Success',
        description: 'Terminal connection test successful',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terminal connection test failed',
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(null);
    }
  };

  const handleDeleteTerminal = async (terminalId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 500);
      });
      setTerminals(
        terminals.filter((t) => {
          return t.id !== terminalId;
        }),
      );
      toast({
        title: 'Success',
        description: 'Terminal deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete terminal',
        variant: 'destructive',
      });
    }
  };

  const handleAddTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerminal.name || !newTerminal.model || !newTerminal.serial) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 500);
      });
      const newTerminalWithId = {
        ...newTerminal,
        id: Math.random().toString(36).substr(2, 9),
      };
      setTerminals([...terminals, newTerminalWithId]);
      setNewTerminal({ name: '', model: '', serial: '' });
      toast({
        title: 'Success',
        description: 'Terminal added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add terminal',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateShopInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 500);
      });
      setIsEditingShop(false);
      toast({
        title: 'Success',
        description: 'Shop information updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update shop information',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'requirements.past_due':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusIcon = (enabled: boolean | undefined) => {
    if (enabled === undefined) return null;
    return enabled ? (
      <FiCheck className='h-4 w-4 text-green-500' />
    ) : (
      <FiX className='h-4 w-4 text-red-500' />
    );
  };

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-semibold mb-6 text-[#3F3F46] dark:text-white'>
          Payment Integrations
        </h2>
        <Card className='bg-white dark:bg-[#181818] border-[#E4E4E7] dark:border-[#232428] shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div>
              <CardTitle className='text-lg text-[#3F3F46] dark:text-white'>
                Stripe Connect
              </CardTitle>
              <CardDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b] mt-1'>
                Connect your workspace to Stripe to process payments and invoices
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {(stripeStatus?.status === 'active' ||
                    stripeStatus?.status === 'requirements.past_due') &&
                  stripeStatus?.detailsSubmitted ? (
                    <Badge className='bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1'>
                      <FiCheck className='h-3 w-3' />
                      Connected
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46]/60 dark:text-[#8b8b8b] flex items-center gap-1'
                    >
                      <FiAlertCircle className='h-3 w-3' />
                      Not Connected
                    </Badge>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current connection status</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between py-4'>
              <div className='flex items-center space-x-4'>
                <div className='bg-purple-100 p-3 rounded-full'>
                  <FiCreditCard className='h-6 w-6 text-purple-600' />
                </div>
                <div>
                  {(stripeStatus?.status === 'active' ||
                    stripeStatus?.status === 'requirements.past_due') &&
                  stripeStatus?.detailsSubmitted ? (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-[#3F3F46] dark:text-white'>
                        Stripe Account Connected
                      </p>
                      <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                        Account ID: {stripeStatus?.accountId}
                      </p>
                      <div className='mt-3 space-y-2'>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(stripeStatus?.chargesEnabled)}
                          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                            Charges: {stripeStatus?.chargesEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(stripeStatus?.payoutsEnabled)}
                          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                            Payouts: {stripeStatus?.payoutsEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(stripeStatus?.detailsSubmitted)}
                          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                            Details: {stripeStatus?.detailsSubmitted ? 'Submitted' : 'Pending'}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`h-2 w-2 rounded-full ${getStatusColor(
                              stripeStatus?.status,
                            )}`}
                          />
                          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                            Status:{' '}
                            {stripeStatus?.status?.charAt(0).toUpperCase() +
                              stripeStatus?.status?.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className='text-sm text-[#3F3F46] dark:text-white'>
                      Connect your Stripe account to start accepting payments
                    </p>
                  )}
                </div>
              </div>

              {(stripeStatus?.status === 'active' ||
                stripeStatus?.status === 'requirements.past_due') &&
              stripeStatus?.detailsSubmitted ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='outline'
                      disabled={stripeStatus?.status === 'active' || isDisconnecting}
                      className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#252525]'
                    >
                      {isDisconnecting ? (
                        <>
                          <FiLoader className='mr-2 h-4 w-4 animate-spin' />
                          Disconnecting...
                        </>
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect Stripe Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. You will need to reconnect your Stripe account
                        to process payments again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDisconnect}
                        className='bg-red-600 hover:bg-red-700'
                      >
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  onClick={handleConnect}
                  className='bg-black hover:bg-black/90 text-white'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className='mr-2 h-4 w-4 animate-spin' />
                      Connecting...
                    </>
                  ) : (
                    'Connect Stripe'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
