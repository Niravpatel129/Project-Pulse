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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import {
  FiAlertCircle,
  FiCheck,
  FiCreditCard,
  FiLoader,
  FiPlus,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

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
        description: 'Successfully connected to Stripe',
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
                  {stripeStatus?.status === 'active' ||
                  stripeStatus?.status === 'requirements.past_due' ? (
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
                  {stripeStatus?.status === 'active' ||
                  stripeStatus?.status === 'requirements.past_due' ? (
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

              {stripeStatus?.status === 'active' ||
              stripeStatus?.status === 'requirements.past_due' ? (
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
      {/* Payment Terminals Section */}
      <div>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-semibold text-[#3F3F46] dark:text-white'>
            Payment Terminals
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className='bg-black hover:bg-black/90 text-white'>
                <FiPlus className='mr-2 h-4 w-4' />
                Add Terminal
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Add Payment Terminal</DialogTitle>
                <DialogDescription>
                  Add a new payment terminal to your account. Make sure you have the terminal&apos;s
                  activation code ready.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTerminal} className='space-y-6 py-4'>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='terminal-name'>Terminal Name</Label>
                    <Input
                      id='terminal-name'
                      placeholder='Enter terminal name'
                      value={newTerminal.name}
                      onChange={(e) => {
                        return setNewTerminal({ ...newTerminal, name: e.target.value });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor='terminal-model'>Terminal Model</Label>
                    <Select
                      value={newTerminal.model}
                      onValueChange={(value) => {
                        return setNewTerminal({ ...newTerminal, model: value });
                      }}
                    >
                      <SelectTrigger id='terminal-model'>
                        <SelectValue placeholder='Select model' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='BBPOS WisePOS E'>BBPOS WisePOS E</SelectItem>
                        {/* Add more models as needed */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Activation Code</Label>
                    <div className='mt-2 p-4 rounded-lg bg-muted border border-border'>
                      <p className='text-sm text-muted-foreground'>
                        To generate your activation code:
                      </p>
                      <ol className='mt-2 text-sm text-muted-foreground list-decimal list-inside space-y-1'>
                        <li>Swipe the terminal screen from left edge to right edge</li>
                        <li>Tap Settings and enter the admin code 0 7 1 3 9</li>
                        <li>
                          Tap &quot;Generate pairing code&quot; to obtain your activation code
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div className='flex justify-end gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      return setIsDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' className='bg-black hover:bg-black/90 text-white'>
                    Add Terminal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className='bg-white dark:bg-[#181818] border-[#E4E4E7] dark:border-[#232428] shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div>
              <CardTitle className='text-lg text-[#3F3F46] dark:text-white'>Terminals</CardTitle>
              <CardDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b] mt-1'>
                Manage your payment terminals for in-person transactions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr className='border-b border-[#E4E4E7] dark:border-[#232428] bg-[#FAFAFA] dark:bg-[#232428]'>
                    <th className='py-3 px-4 text-left font-medium text-[#3F3F46] dark:text-white'>
                      Name
                    </th>
                    <th className='py-3 px-4 text-left font-medium text-[#3F3F46] dark:text-white'>
                      Model Number
                    </th>
                    <th className='py-3 px-4 text-left font-medium text-[#3F3F46] dark:text-white'>
                      Serial Number
                    </th>
                    <th className='py-3 px-4 text-right font-medium text-[#3F3F46] dark:text-white'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {terminals.map((terminal) => {
                    return (
                      <tr
                        key={terminal.id}
                        className='border-b border-[#E4E4E7] dark:border-[#232428] hover:bg-[#F5F5F5] dark:hover:bg-[#232428] transition-colors'
                      >
                        <td className='py-3 px-4'>
                          <span className='text-blue-700 font-medium cursor-pointer hover:underline'>
                            {terminal.name}
                          </span>
                        </td>
                        <td className='py-3 px-4'>{terminal.model}</td>
                        <td className='py-3 px-4'>{terminal.serial}</td>
                        <td className='py-3 px-4 text-right'>
                          <div className='flex justify-end gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              className='text-[#3F3F46] dark:text-white'
                              onClick={() => {
                                return handleTestConnection(terminal.id);
                              }}
                              disabled={isTestingConnection === terminal.id}
                            >
                              {isTestingConnection === terminal.id ? (
                                <>
                                  <FiLoader className='mr-2 h-4 w-4 animate-spin' />
                                  Testing...
                                </>
                              ) : (
                                'Test connection'
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant='outline'
                                  size='icon'
                                  className='border-[#E4E4E7] dark:border-[#313131]'
                                >
                                  <FiTrash2 className='w-4 h-4 text-red-500' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Terminal?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    terminal from your account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className='bg-red-600 hover:bg-red-700'
                                    onClick={() => {
                                      return handleDeleteTerminal(terminal.id);
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
