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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
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
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      <CheckCircle2 className='h-4 w-4 text-green-500' />
    ) : (
      <XCircle className='h-4 w-4 text-red-500' />
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
                      <CheckCircle2 className='h-3 w-3' />
                      Connected
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46]/60 dark:text-[#8b8b8b] flex items-center gap-1'
                    >
                      <AlertCircle className='h-3 w-3' />
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
                  <CreditCard className='h-6 w-6 text-purple-600' />
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
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
        <h2 className='text-2xl font-semibold mb-6 text-[#3F3F46] dark:text-white'>
          Payment Terminals
        </h2>
        <Card className='bg-white dark:bg-[#181818] border-[#E4E4E7] dark:border-[#232428] shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div>
              <CardTitle className='text-lg text-[#3F3F46] dark:text-white'>Terminals</CardTitle>
              <CardDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b] mt-1'>
                Manage your payment terminals for in-person transactions
              </CardDescription>
            </div>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button className='bg-black hover:bg-black/90 text-white'>+ Add terminal</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='flex items-center justify-between border-b border-[#ECECEC] dark:border-[#232428] px-8 py-5'>
                  <div className='flex items-center gap-3'>
                    <DrawerTitle className='text-lg font-semibold text-[#232428] dark:text-white tracking-tight'>
                      Manage Payment Terminals
                    </DrawerTitle>
                    <Badge variant='outline' className='text-xs font-normal'>
                      {stripeStatus?.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <DrawerClose asChild>
                    <button className='rounded p-1.5 transition hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10'>
                      <span className='sr-only'>Close</span>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </DrawerClose>
                </div>
                <div className='flex-1 overflow-y-auto'>
                  <div className='max-w-2xl mx-auto pt-8 pb-12 px-6 md:px-0'>
                    {/* Shop Info */}
                    <div className='mb-8 p-4 rounded-lg bg-white dark:bg-[#232428] border border-[#ECECEC] dark:border-[#313131]'>
                      {isEditingShop ? (
                        <form onSubmit={handleUpdateShopInfo} className='space-y-4'>
                          <div className='flex items-center justify-between'>
                            <input
                              type='text'
                              value={shopInfo.name}
                              onChange={(e) => {
                                return setShopInfo({ ...shopInfo, name: e.target.value });
                              }}
                              className='text-sm font-medium bg-transparent border-b border-[#ECECEC] dark:border-[#313131] focus:outline-none focus:border-black dark:focus:border-white'
                            />
                            <div className='flex gap-2'>
                              <Button type='submit' size='sm' className='text-xs'>
                                Save
                              </Button>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='text-xs'
                                onClick={() => {
                                  return setIsEditingShop(false);
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <MapPin className='h-4 w-4 text-[#6C6C6C] dark:text-[#A0A0A0]' />
                            <input
                              type='text'
                              value={shopInfo.address}
                              onChange={(e) => {
                                return setShopInfo({ ...shopInfo, address: e.target.value });
                              }}
                              className='text-xs bg-transparent border-b border-[#ECECEC] dark:border-[#313131] focus:outline-none focus:border-black dark:focus:border-white w-full'
                            />
                          </div>
                        </form>
                      ) : (
                        <div className='flex flex-col gap-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium text-[#232428] dark:text-white'>
                              {shopInfo.name}
                            </span>
                            <Button
                              variant='outline'
                              size='sm'
                              className='text-xs'
                              onClick={() => {
                                return setIsEditingShop(true);
                              }}
                            >
                              Edit Details
                            </Button>
                          </div>
                          <div className='flex items-center gap-2 text-xs text-[#6C6C6C] dark:text-[#A0A0A0]'>
                            <MapPin className='h-4 w-4' />
                            {shopInfo.address}
                          </div>
                          <div className='flex items-center gap-2 mt-1'>
                            <Badge className='bg-[#F6E9C6] text-[#8A6D1B] font-normal px-2 py-0.5 rounded'>
                              {shopInfo.gatewayStatus === 'complete' ? 'Complete' : 'Incomplete'}
                            </Badge>
                            <span className='text-xs text-[#A0A0A0] dark:text-[#6C6C6C]'>
                              {shopInfo.status === 'active' ? 'Active gateway' : 'Inactive gateway'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Terminals Table */}
                    <div className='rounded-xl bg-white dark:bg-[#181818] border border-[#ECECEC] dark:border-[#232428] p-0 shadow-sm'>
                      <div className='p-4 border-b border-[#ECECEC] dark:border-[#232428]'>
                        <h3 className='text-sm font-medium text-[#232428] dark:text-white'>
                          Connected Terminals
                        </h3>
                        <p className='text-xs text-[#6C6C6C] dark:text-[#A0A0A0] mt-1'>
                          Manage your payment terminals and their settings
                        </p>
                      </div>
                      <table className='w-full text-xs md:text-sm border-separate border-spacing-0'>
                        <thead>
                          <tr className='bg-[#FAFAFA] dark:bg-[#232428]'>
                            <th className='py-3 px-4 text-left font-medium text-[#232428] dark:text-white'>
                              Name
                            </th>
                            <th className='py-3 px-4 text-left font-medium text-[#232428] dark:text-white'>
                              Model
                            </th>
                            <th className='py-3 px-4 text-left font-medium text-[#232428] dark:text-white'>
                              Serial
                            </th>
                            <th className='py-3 px-2 text-right font-medium text-[#232428] dark:text-white'>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {terminals.map((terminal) => {
                            return (
                              <tr
                                key={terminal.id}
                                className='transition-colors hover:bg-[#F5F5F5] dark:hover:bg-[#232428]'
                              >
                                <td className='py-3 px-4 whitespace-nowrap text-[#232428] dark:text-white font-medium'>
                                  {terminal.name}
                                </td>
                                <td className='py-3 px-4 text-[#6C6C6C] dark:text-[#A0A0A0]'>
                                  {terminal.model}
                                </td>
                                <td className='py-3 px-4 text-[#6C6C6C] dark:text-[#A0A0A0]'>
                                  {terminal.serial}
                                </td>
                                <td className='py-3 px-2 text-right'>
                                  <div className='flex justify-end gap-1'>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            className='rounded p-1.5 transition hover:bg-[#ECECEC] dark:hover:bg-[#232428]'
                                            aria-label='Test connection'
                                            onClick={() => {
                                              return handleTestConnection(terminal.id);
                                            }}
                                            disabled={isTestingConnection === terminal.id}
                                          >
                                            {isTestingConnection === terminal.id ? (
                                              <Loader2 className='h-4 w-4 animate-spin' />
                                            ) : (
                                              <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='h-4 w-4 text-[#6C6C6C] dark:text-[#A0A0A0]'
                                                fill='none'
                                                viewBox='0 0 24 24'
                                                stroke='currentColor'
                                              >
                                                <path
                                                  strokeLinecap='round'
                                                  strokeLinejoin='round'
                                                  strokeWidth={2}
                                                  d='M9 12l2 2 4-4'
                                                />
                                              </svg>
                                            )}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Test terminal connection</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <button
                                          className='rounded p-1.5 transition hover:bg-[#ECECEC] dark:hover:bg-[#232428]'
                                          aria-label='Delete terminal'
                                        >
                                          <Trash2 className='w-4 h-4 text-[#D14343]' />
                                        </button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Terminal?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently
                                            delete the terminal from your account.
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
                      {/* Add Terminal Form */}
                      <Card className='border-none shadow-none p-4'>
                        <CardHeader className='p-0 mb-4'>
                          <h2 className='text-lg font-semibold text-[#232428] dark:text-white'>
                            Add a Payment Terminal
                          </h2>
                        </CardHeader>
                        <CardContent className='p-0'>
                          <form onSubmit={handleAddTerminal} className='flex flex-col gap-6'>
                            <div>
                              <Label htmlFor='terminal-name' className='mb-1'>
                                Terminal Name
                              </Label>
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
                              <Label htmlFor='terminal-model' className='mb-1'>
                                Terminal Model
                              </Label>
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
                              <Label className='mb-1'>Activation Code</Label>
                              <p className='text-sm text-muted-foreground bg-muted rounded p-3 border border-border'>
                                To generate your activation code, swipe the terminal screen from
                                left edge to right edge. Tap Settings and enter the admin code 0 7 1
                                3 9 when prompted. Tap &quot;Generate pairing code&quot; to obtain
                                your activation code.
                              </p>
                            </div>
                            <div className='flex items-end'>
                              <Button
                                type='submit'
                                className='bg-black hover:bg-black/90 text-white'
                              >
                                Add
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
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
                              className='text-[#3F3F46] dark:text-white'
                              onClick={() => {
                                return handleTestConnection(terminal.id);
                              }}
                              disabled={isTestingConnection === terminal.id}
                            >
                              {isTestingConnection === terminal.id ? (
                                <>
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
                                  <Trash2 className='w-4 h-4 text-red-500' />
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
