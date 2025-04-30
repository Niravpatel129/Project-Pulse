import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface InvoiceShippingProps {
  shippingMethods: any[];
  selectedShippingMethod: any | null;
  setSelectedShippingMethod: (method: any | null) => void;
  selectedClient: any | null;
  useShippingAddress: boolean;
  setUseShippingAddress: (use: boolean) => void;
  shippingAddress: any | null;
  setShippingAddress: (address: any) => void;
  addShippingToInvoice: () => void;
  setActiveTab: (tab: string) => void;
}

const InvoiceShipping = ({
  shippingMethods,
  selectedShippingMethod,
  setSelectedShippingMethod,
  selectedClient,
  useShippingAddress,
  setUseShippingAddress,
  shippingAddress,
  setShippingAddress,
  addShippingToInvoice,
  setActiveTab,
}: InvoiceShippingProps) => {
  const formatAddress = (address: any): ReactNode => {
    if (!address) return null;

    return (
      <div className='space-y-1'>
        <p>{address.line1}</p>
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.country}</p>
      </div>
    );
  };

  return (
    <motion.div
      key='shipping'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className='space-y-6'
    >
      <div>
        <h3 className='font-medium mb-3'>Shipping Method</h3>
        <RadioGroup
          value={selectedShippingMethod?.id || ''}
          onValueChange={(value) => {
            const method = shippingMethods.find((m) => {
              return m.id === value;
            });
            setSelectedShippingMethod(method || null);
          }}
        >
          {shippingMethods.map((method) => {
            return (
              <div key={method.id} className='flex items-center space-x-2 mb-2'>
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className='flex-1 cursor-pointer'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <span className='font-medium'>{method.name}</span>
                      <p className='text-sm text-muted-foreground'>
                        {method.carrier} - {method.estimatedDays}
                      </p>
                    </div>
                    <span className='font-medium'>${method.price.toFixed(2)}</span>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <Button
          className='mt-4 w-full'
          onClick={addShippingToInvoice}
          disabled={!selectedShippingMethod}
        >
          Add Shipping to Invoice
        </Button>
      </div>

      <Separator />

      <div>
        <h3 className='font-medium mb-3'>Shipping Address</h3>

        {selectedClient ? (
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Switch
                checked={useShippingAddress}
                onCheckedChange={setUseShippingAddress}
                id='use-shipping-address'
              />
              <Label htmlFor='use-shipping-address'>Use different shipping address</Label>
            </div>

            {useShippingAddress ? (
              <Card>
                <CardContent className='pt-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='shipping-line1'>Address Line 1</Label>
                      <Input
                        id='shipping-line1'
                        className='mt-1'
                        value={shippingAddress?.line1 || ''}
                        onChange={(e) => {
                          return setShippingAddress({
                            ...(shippingAddress || {}),
                            line1: e.target.value,
                            city: shippingAddress?.city || '',
                            state: shippingAddress?.state || '',
                            postalCode: shippingAddress?.postalCode || '',
                            country: shippingAddress?.country || '',
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor='shipping-line2'>Address Line 2 (Optional)</Label>
                      <Input
                        id='shipping-line2'
                        className='mt-1'
                        value={shippingAddress?.line2 || ''}
                        onChange={(e) => {
                          return setShippingAddress({
                            ...(shippingAddress || {}),
                            line2: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4 mt-4'>
                    <div>
                      <Label htmlFor='shipping-city'>City</Label>
                      <Input
                        id='shipping-city'
                        className='mt-1'
                        value={shippingAddress?.city || ''}
                        onChange={(e) => {
                          return setShippingAddress({
                            ...(shippingAddress || {}),
                            city: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor='shipping-state'>State/Province</Label>
                      <Input
                        id='shipping-state'
                        className='mt-1'
                        value={shippingAddress?.state || ''}
                        onChange={(e) => {
                          return setShippingAddress({
                            ...(shippingAddress || {}),
                            state: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-4 mt-4'>
                    <div>
                      <Label htmlFor='shipping-postal'>Postal Code</Label>
                      <Input
                        id='shipping-postal'
                        className='mt-1'
                        value={shippingAddress?.postalCode || ''}
                        onChange={(e) => {
                          return setShippingAddress({
                            ...(shippingAddress || {}),
                            postalCode: e.target.value,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor='shipping-country'>Country</Label>
                      <Input
                        id='shipping-country'
                        className='mt-1'
                        value={shippingAddress?.country || ''}
                        onChange={(e) => {
                          return setShippingAddress({
                            ...(shippingAddress || {}),
                            country: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                {selectedClient.shippingAddress ? (
                  <Card>
                    <CardContent className='pt-4'>
                      {formatAddress(selectedClient.shippingAddress)}
                    </CardContent>
                  </Card>
                ) : (
                  <div className='text-center p-4 border rounded-lg'>
                    <p className='text-muted-foreground'>
                      No shipping address available for this client.
                    </p>
                    <p className='text-sm mt-2'>
                      Please add a shipping address or select a different client.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className='text-center p-6 border rounded-lg'>
            <p className='text-muted-foreground'>Please select a client first.</p>
            <Button
              variant='link'
              onClick={() => {
                return setActiveTab('client');
              }}
              className='mt-2'
            >
              Go to Client Selection
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InvoiceShipping;
