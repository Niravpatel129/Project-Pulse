import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

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
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold mb-4 text-[#3F3F46] dark:text-white'>
          Payment Integrations
        </h2>
        <Card className='bg-white dark:bg-[#181818] border-[#E4E4E7] dark:border-[#232428]'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div>
              <CardTitle className='text-base text-[#3F3F46] dark:text-white'>
                Stripe Connect
              </CardTitle>
              <CardDescription className='text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                Connect your workspace to Stripe to process payments and invoices
              </CardDescription>
            </div>
            {stripeStatus?.status === 'active' ||
            stripeStatus?.status === 'requirements.past_due' ? (
              <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Connected</Badge>
            ) : (
              <Badge
                variant='outline'
                className='border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46]/60 dark:text-[#8b8b8b]'
              >
                Not Connected
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between py-2'>
              <div className='flex items-center space-x-4'>
                <div className='bg-purple-100 p-2 rounded-full'>
                  <CreditCard className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  {stripeStatus?.status === 'active' ||
                  stripeStatus?.status === 'requirements.past_due' ? (
                    <div className='space-y-1'>
                      <p className='text-sm font-medium text-[#3F3F46] dark:text-white'>
                        Stripe Account Connected
                      </p>
                      <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                        Account ID: {stripeStatus?.accountId}
                      </p>
                      <div className='mt-2 space-y-1'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`h-2 w-2 rounded-full ${
                              stripeStatus?.chargesEnabled ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                            Charges: {stripeStatus?.chargesEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`h-2 w-2 rounded-full ${
                              stripeStatus?.payoutsEnabled ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                            Payouts: {stripeStatus?.payoutsEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`h-2 w-2 rounded-full ${
                              stripeStatus?.detailsSubmitted ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <p className='text-xs text-[#3F3F46]/60 dark:text-[#8b8b8b]'>
                            Details: {stripeStatus?.detailsSubmitted ? 'Submitted' : 'Pending'}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`h-2 w-2 rounded-full ${
                              stripeStatus?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
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
                <Button
                  variant='outline'
                  onClick={disconnectStripe}
                  disabled={stripeStatus?.status === 'active'}
                  className='bg-white dark:bg-[#232323] border-[#E4E4E7] dark:border-[#313131] text-[#3F3F46] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#252525]'
                >
                  Disconnect
                </Button>
              ) : (
                <Button onClick={connectStripe} className='bg-black hover:bg-black/90 text-white'>
                  Connect Stripe
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
