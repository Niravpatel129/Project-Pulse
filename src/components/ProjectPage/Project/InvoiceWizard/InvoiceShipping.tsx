import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface InvoiceShippingProps {
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
  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();
  const [isCreatingShipping, setIsCreatingShipping] = useState(false);
  const [newShipping, setNewShipping] = useState({
    name: '',
    carrier: '',
    price: 0,
    estimatedDays: '',
  });

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

  const handleSettingsUpdate = (updates: Partial<typeof invoiceSettings>) => {
    updateInvoiceSettings.mutate({
      settings: {
        ...invoiceSettings,
        ...updates,
      },
    });
  };

  const handleAddShippingMethod = () => {
    if (!newShipping.name || !newShipping.carrier || newShipping.price <= 0) return;

    const newShippingId = `shipping-${Date.now()}`;
    const updatedShippingMethods = [
      ...(invoiceSettings?.shippingMethods || []),
      {
        id: newShippingId,
        name: newShipping.name,
        carrier: newShipping.carrier,
        price: Number(newShipping.price),
        estimatedDays: newShipping.estimatedDays || 'Varies',
      },
    ];

    handleSettingsUpdate({ shippingMethods: updatedShippingMethods });
    setNewShipping({ name: '', carrier: '', price: 0, estimatedDays: '' });
    setIsCreatingShipping(false);
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
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-medium'>Shipping Method</h3>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              return setIsCreatingShipping(true);
            }}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Shipping Method
          </Button>
        </div>

        {isCreatingShipping && (
          <div className='mb-4 p-4 bg-gray-50 rounded-lg'>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <Label htmlFor='shipping-name'>Method Name</Label>
                <Input
                  id='shipping-name'
                  placeholder='e.g. Standard Shipping'
                  value={newShipping.name}
                  onChange={(e) => {
                    return setNewShipping({ ...newShipping, name: e.target.value });
                  }}
                />
              </div>
              <div>
                <Label htmlFor='shipping-carrier'>Carrier</Label>
                <Input
                  id='shipping-carrier'
                  placeholder='e.g. USPS, FedEx'
                  value={newShipping.carrier}
                  onChange={(e) => {
                    return setNewShipping({ ...newShipping, carrier: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <Label htmlFor='shipping-price'>Price ($)</Label>
                <Input
                  id='shipping-price'
                  type='number'
                  min='0'
                  step='0.01'
                  value={newShipping.price}
                  onChange={(e) => {
                    return setNewShipping({ ...newShipping, price: Number(e.target.value) });
                  }}
                />
              </div>
              <div>
                <Label htmlFor='shipping-days'>Estimated Delivery</Label>
                <Input
                  id='shipping-days'
                  placeholder='e.g. 2-3 Days'
                  value={newShipping.estimatedDays}
                  onChange={(e) => {
                    return setNewShipping({ ...newShipping, estimatedDays: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setIsCreatingShipping(false);
                  setNewShipping({ name: '', carrier: '', price: 0, estimatedDays: '' });
                }}
              >
                Cancel
              </Button>
              <Button size='sm' onClick={handleAddShippingMethod}>
                Add Method
              </Button>
            </div>
          </div>
        )}

        <RadioGroup
          value={selectedShippingMethod?.id || ''}
          onValueChange={(value) => {
            const method = invoiceSettings?.shippingMethods?.find((m) => {
              return m.id === value;
            });
            setSelectedShippingMethod(method || null);
          }}
        >
          {invoiceSettings?.shippingMethods?.map((method) => {
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

        {(invoiceSettings?.shippingMethods?.length === 0 || !invoiceSettings?.shippingMethods) && (
          <div className='text-center p-4 border rounded-lg'>
            <p className='text-muted-foreground'>No shipping methods available.</p>
            <p className='text-sm mt-2'>Add a shipping method to continue.</p>
          </div>
        )}

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
