import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, User } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (client: any) => void;
  initialData?: any;
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  onEdit,
  initialData,
}: AddCustomerDialogProps) {
  const [activeTab, setActiveTab] = useState<'contact' | 'billing' | 'shipping' | 'more'>(
    'contact',
  );
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    industry: '',
    type: 'Individual',
    totalSpent: 0,
    projects: 0,
    rating: 0,
    status: 'Active',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zip: '',
    },
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      zip: '',
    },
    website: '',
    internalNotes: '',
  });
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const [tabContentHeight, setTabContentHeight] = useState<number | undefined>(undefined);
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (initialData && open) {
      setNewCustomer({
        ...newCustomer,
        ...initialData,
      });

      const sameAddress =
        initialData.address?.street === initialData.shippingAddress?.street &&
        initialData.address?.city === initialData.shippingAddress?.city &&
        initialData.address?.state === initialData.shippingAddress?.state &&
        initialData.address?.country === initialData.shippingAddress?.country &&
        initialData.address?.zip === initialData.shippingAddress?.zip;

      setShippingSameAsBilling(sameAddress);
    }
  }, [initialData, open]);

  useLayoutEffect(() => {
    if (tabContentRef.current) {
      setTabContentHeight(tabContentRef.current.scrollHeight);
    }
  }, [activeTab, open]);

  const resetCustomerForm = () => {
    setNewCustomer({
      name: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      industry: '',
      type: 'Individual',
      totalSpent: 0,
      projects: 0,
      rating: 0,
      status: 'Active',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zip: '',
      },
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        zip: '',
      },
      website: '',
      internalNotes: '',
    });
    setActiveTab('contact');
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const createClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await newRequest.post('/clients', clientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onOpenChange(false);
      resetCustomerForm();
      toast.success('Customer added successfully');
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async (clientData: any) => {
      const response = await newRequest.put(`/clients/${initialData.id}`, clientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onOpenChange(false);
      resetCustomerForm();
      toast.success('Customer updated successfully');
    },
  });

  const handleCreateCustomer = () => {
    if (!newCustomer.name) return;

    const clientData = {
      user: {
        name: newCustomer.name,
        email: newCustomer.contactEmail,
      },
      phone: newCustomer.contactPhone,
      address: newCustomer.address,
      shippingAddress: newCustomer.shippingAddress,
      contact: {
        firstName: newCustomer.contactName.split(' ')[0] || '',
        lastName: newCustomer.contactName.split(' ').slice(1).join(' ') || '',
      },
      industry: newCustomer.industry,
      type: newCustomer.type,
      status: newCustomer.status,
      website: newCustomer.website,
      internalNotes: newCustomer.internalNotes,
    };

    if (initialData) {
      updateClientMutation.mutate(clientData);
    } else {
      createClientMutation.mutate(clientData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428]'>
        <DialogHeader>
          <DialogTitle className='flex items-center text-lg font-semibold text-[#3F3F46] dark:text-white'>
            <div className='mr-2 p-1.5 bg-[#F4F4F5] dark:bg-[#232428] rounded-full'>
              <User size={18} className='text-[#3F3F46] dark:text-[#8b5df8]' />
            </div>
            {initialData ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
          <p className='text-sm text-[#71717A] dark:text-[#8C8C8C] mt-1'>
            {initialData
              ? 'Update your customer information below. Required fields are marked with an asterisk (*).'
              : 'Fill in your customer information below. Required fields are marked with an asterisk (*).'}
          </p>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            return setActiveTab(value as any);
          }}
          className='mt-4'
        >
          <TabsList className='grid grid-cols-4 mb-6 bg-[#F4F4F5] dark:bg-[#232428]'>
            <TabsTrigger
              value='contact'
              className='text-[#3F3F46] dark:text-[#fafafa] data-[state=active]:bg-white dark:data-[state=active]:bg-[#141414]'
            >
              Contact
            </TabsTrigger>
            <TabsTrigger
              value='billing'
              className='text-[#3F3F46] dark:text-[#fafafa] data-[state=active]:bg-white dark:data-[state=active]:bg-[#141414]'
            >
              Billing
            </TabsTrigger>
            <TabsTrigger
              value='shipping'
              className='text-[#3F3F46] dark:text-[#fafafa] data-[state=active]:bg-white dark:data-[state=active]:bg-[#141414]'
            >
              Shipping
            </TabsTrigger>
            <TabsTrigger
              value='more'
              className='text-[#3F3F46] dark:text-[#fafafa] data-[state=active]:bg-white dark:data-[state=active]:bg-[#141414]'
            >
              More
            </TabsTrigger>
          </TabsList>
          <div className='p-1'>
            <div
              style={{
                height: tabContentHeight,
                transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className='relative overflow-hidden'
            >
              <div ref={tabContentRef}>
                {/* Contact Tab */}
                {activeTab === 'contact' && (
                  <TabsContent value='contact' className='space-y-6 block'>
                    <div className='p-1'>
                      <div className='space-y-5'>
                        <div>
                          <Label
                            htmlFor='customer-name'
                            className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'
                          >
                            Customer Name <span className='text-[#F43F5E]'>*</span>
                          </Label>
                          <div className='relative p-1'>
                            <Input
                              id='customer-name'
                              value={newCustomer.name}
                              onChange={(e) => {
                                return setNewCustomer({ ...newCustomer, name: e.target.value });
                              }}
                              placeholder='Business or person'
                              required
                              className='w-full bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                            />
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-5'>
                          <div>
                            <Label
                              htmlFor='customer-email'
                              className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'
                            >
                              Email
                            </Label>
                            <div className='relative p-1'>
                              <Input
                                id='customer-email'
                                type='email'
                                value={newCustomer.contactEmail}
                                onChange={(e) => {
                                  setNewCustomer({
                                    ...newCustomer,
                                    contactEmail: e.target.value,
                                  });
                                  if (emailError) setEmailError(null);
                                }}
                                onBlur={handleEmailBlur}
                                className={`w-full bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] ${
                                  emailError ? 'border-[#F43F5E] focus:ring-[#F43F5E]/20' : ''
                                }`}
                              />
                              {emailError && (
                                <p className='absolute -bottom-5 left-0 text-xs text-[#F43F5E]'>
                                  {emailError}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor='customer-phone'
                              className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'
                            >
                              Phone
                            </Label>
                            <div className='relative p-1'>
                              <Input
                                id='customer-phone'
                                type='tel'
                                value={newCustomer.contactPhone}
                                onChange={(e) => {
                                  return setNewCustomer({
                                    ...newCustomer,
                                    contactPhone: e.target.value,
                                  });
                                }}
                                className='w-full bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa]'
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                            Contact Name
                          </Label>
                          <div className='p-1'>
                            <Input
                              value={newCustomer.contactName}
                              onChange={(e) => {
                                return setNewCustomer({
                                  ...newCustomer,
                                  contactName: e.target.value,
                                });
                              }}
                              className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                            />
                          </div>
                        </div>
                        <div>
                          <Label className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                            Industry
                          </Label>
                          <div className='p-1'>
                            <Input
                              value={newCustomer.industry}
                              onChange={(e) => {
                                return setNewCustomer({
                                  ...newCustomer,
                                  industry: e.target.value,
                                });
                              }}
                              className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                  <TabsContent value='billing' className='space-y-4 block'>
                    <div className='p-1'>
                      <Label className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                        Billing address
                      </Label>
                      <div className='space-y-2'>
                        <div className='p-1'>
                          <Input
                            placeholder='Address line 1'
                            value={newCustomer.address.street}
                            onChange={(e) => {
                              return setNewCustomer({
                                ...newCustomer,
                                address: { ...newCustomer.address, street: e.target.value },
                              });
                            }}
                            className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-2 p-1'>
                          <Input
                            placeholder='City'
                            value={newCustomer.address.city}
                            onChange={(e) => {
                              return setNewCustomer({
                                ...newCustomer,
                                address: { ...newCustomer.address, city: e.target.value },
                              });
                            }}
                            className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                          />
                          <Input
                            placeholder='Postal/ZIP code'
                            value={newCustomer.address.zip}
                            onChange={(e) => {
                              return setNewCustomer({
                                ...newCustomer,
                                address: { ...newCustomer.address, zip: e.target.value },
                              });
                            }}
                            className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-2 p-1'>
                          <Input
                            placeholder='Country'
                            value={newCustomer.address.country}
                            onChange={(e) => {
                              return setNewCustomer({
                                ...newCustomer,
                                address: { ...newCustomer.address, country: e.target.value },
                              });
                            }}
                            className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                          />
                          <Input
                            placeholder='Province/State'
                            value={newCustomer.address.state}
                            onChange={(e) => {
                              return setNewCustomer({
                                ...newCustomer,
                                address: { ...newCustomer.address, state: e.target.value },
                              });
                            }}
                            className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* Shipping Tab */}
                {activeTab === 'shipping' && (
                  <TabsContent value='shipping' className='space-y-4 block'>
                    <div className='p-1'>
                      <Label className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                        Shipping address
                      </Label>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2 mb-2 p-1'>
                          <input
                            type='checkbox'
                            className='accent-[#0891B2] dark:accent-[#8b5df8] w-4 h-4'
                            id='same-as-billing'
                            checked={shippingSameAsBilling}
                            onChange={(e) => {
                              setShippingSameAsBilling(e.target.checked);
                              if (e.target.checked) {
                                setNewCustomer({
                                  ...newCustomer,
                                  shippingAddress: { ...newCustomer.address },
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor='same-as-billing'
                            className='text-[#3F3F46] dark:text-[#fafafa]'
                          >
                            Same as billing address
                          </Label>
                        </div>
                        {!shippingSameAsBilling && (
                          <div className='space-y-2'>
                            <div className='p-1'>
                              <Input
                                placeholder='Address line 1'
                                value={newCustomer.shippingAddress.street}
                                onChange={(e) => {
                                  return setNewCustomer({
                                    ...newCustomer,
                                    shippingAddress: {
                                      ...newCustomer.shippingAddress,
                                      street: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                              />
                            </div>
                            <div className='grid grid-cols-2 gap-2 p-1'>
                              <Input
                                placeholder='City'
                                value={newCustomer.shippingAddress.city}
                                onChange={(e) => {
                                  return setNewCustomer({
                                    ...newCustomer,
                                    shippingAddress: {
                                      ...newCustomer.shippingAddress,
                                      city: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                              />
                              <Input
                                placeholder='Postal/ZIP code'
                                value={newCustomer.shippingAddress.zip}
                                onChange={(e) => {
                                  return setNewCustomer({
                                    ...newCustomer,
                                    shippingAddress: {
                                      ...newCustomer.shippingAddress,
                                      zip: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                              />
                            </div>
                            <div className='grid grid-cols-2 gap-2 p-1'>
                              <Input
                                placeholder='Country'
                                value={newCustomer.shippingAddress.country}
                                onChange={(e) => {
                                  return setNewCustomer({
                                    ...newCustomer,
                                    shippingAddress: {
                                      ...newCustomer.shippingAddress,
                                      country: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                              />
                              <Input
                                placeholder='Province/State'
                                value={newCustomer.shippingAddress.state}
                                onChange={(e) => {
                                  return setNewCustomer({
                                    ...newCustomer,
                                    shippingAddress: {
                                      ...newCustomer.shippingAddress,
                                      state: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                )}

                {/* More Tab */}
                {activeTab === 'more' && (
                  <TabsContent value='more' className='space-y-6 block'>
                    <div className='p-1'>
                      <div className='grid grid-cols-2 gap-5'>
                        <div>
                          <Label className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                            Customer Type
                          </Label>
                          <div className='p-1'>
                            <Select
                              value={newCustomer.type}
                              onValueChange={(value) => {
                                return setNewCustomer({ ...newCustomer, type: value });
                              }}
                            >
                              <SelectTrigger className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa]'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Individual'>Individual</SelectItem>
                                <SelectItem value='Enterprise'>Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                            Status
                          </Label>
                          <div className='p-1'>
                            <Select
                              value={newCustomer.status}
                              onValueChange={(value) => {
                                return setNewCustomer({ ...newCustomer, status: value });
                              }}
                            >
                              <SelectTrigger className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa]'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='Active'>Active</SelectItem>
                                <SelectItem value='Inactive'>Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className='col-span-2'>
                          <Label className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                            Website
                          </Label>
                          <div className='p-1'>
                            <Input
                              value={newCustomer.website}
                              onChange={(e) => {
                                return setNewCustomer({
                                  ...newCustomer,
                                  website: e.target.value,
                                });
                              }}
                              className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa]'
                            />
                          </div>
                        </div>
                      </div>
                      <div className='mt-5'>
                        <Label className='block mb-1 text-sm font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                          Internal notes
                        </Label>
                        <textarea
                          value={newCustomer.internalNotes}
                          onChange={(e) => {
                            return setNewCustomer({
                              ...newCustomer,
                              internalNotes: e.target.value,
                            });
                          }}
                          placeholder='Notes entered here will not be visible to your customer'
                          className='italic w-full rounded-lg border border-[#E4E4E7] dark:border-[#232428] px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#0891B2]/20 dark:focus:ring-[#8b5df8]/20 focus:border-[#0891B2] dark:focus:border-[#8b5df8] text-sm resize-y bg-white dark:bg-[#141414] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#71717A] dark:placeholder:text-[#8C8C8C]'
                        />
                      </div>
                    </div>
                  </TabsContent>
                )}
              </div>
            </div>
          </div>
        </Tabs>

        <DialogFooter className='mt-6'>
          <Button
            variant='outline'
            onClick={() => {
              onOpenChange(false);
              resetCustomerForm();
            }}
            className='bg-[#F4F4F5] dark:bg-[#232323] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#E4E4E7] dark:hover:bg-[#232428]'
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCustomer}
            disabled={!newCustomer.name || createClientMutation.isPending}
            className='bg-[#0891B2] dark:bg-[#8b5df8] hover:bg-[#0891B2]/90 dark:hover:bg-[#7c3aed] text-white'
          >
            {createClientMutation.isPending ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : null}
            {initialData ? 'Update Customer' : 'Add Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
