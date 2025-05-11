'use client';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClients } from '@/hooks/useClients';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2, User } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import SectionFooter from './SectionFooter';
import { Client, Section } from './types';

type ClientSectionProps = {
  clients: Client[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
  onChatClick?: () => void;
  onSectionChange?: (section: number) => void;
};

export default function ClientSection({
  clients: propClients,
  selectedClient,
  setSelectedClient,
  setActiveSection,
  onChatClick,
  onSectionChange,
}: ClientSectionProps) {
  const queryClient = useQueryClient();
  const { clients: apiClients, isLoading: isLoadingClients } = useClients();
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'billing' | 'shipping' | 'more'>(
    'contact',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [newClient, setNewClient] = useState<Partial<Client>>({
    user: {
      name: '',
      email: '',
    } as Client['user'],
    phone: '',
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
    contact: {
      firstName: '',
      lastName: '',
    },
    taxId: '',
    accountNumber: '',
    fax: '',
    mobile: '',
    tollFree: '',
    website: '',
    internalNotes: '',
    customFields: {},
  });
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const [tabContentHeight, setTabContentHeight] = useState<number | undefined>(undefined);
  const [emailError, setEmailError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (tabContentRef.current) {
      setTabContentHeight(tabContentRef.current.scrollHeight);
    }
  }, [activeTab, clientModalOpen]);

  const resetClientForm = () => {
    setNewClient({
      user: {
        name: '',
        email: '',
      } as Client['user'],
      phone: '',
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
      contact: {
        firstName: '',
        lastName: '',
      },
      taxId: '',
      accountNumber: '',
      fax: '',
      mobile: '',
      tollFree: '',
      website: '',
      internalNotes: '',
      customFields: {},
    });
    setActiveTab('contact');
    setIsEditingClient(false);
    setEditClientId(null);
  };

  const createClientMutation = useMutation({
    mutationFn: async (clientData: Partial<Client>) => {
      const response = await newRequest.post('/clients', clientData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setClientModalOpen(false);
      resetClientForm();
      if (data._id) {
        setSelectedClient(data._id);
        if (onSectionChange) {
          onSectionChange(3);
        }
      }
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({
      clientId,
      clientData,
    }: {
      clientId: string;
      clientData: Partial<Client>;
    }) => {
      const response = await newRequest.put(`/clients/${clientId}`, clientData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setClientModalOpen(false);
      resetClientForm();
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await newRequest.delete(`/clients/${clientId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleCreateClient = () => {
    if (!newClient.user?.name) {
      return;
    }

    createClientMutation.mutate(newClient);
  };

  const handleUpdateClient = () => {
    if (!newClient.user?.name || !editClientId) {
      return;
    }

    updateClientMutation.mutate({
      clientId: editClientId,
      clientData: newClient,
    });
  };

  const handleEditClient = (client: Client) => {
    setIsEditingClient(true);
    setNewClient({
      user: client.user,
      phone: client.phone,
      address: client.address,
      shippingAddress: client.shippingAddress,
      contact: client.contact,
      taxId: client.taxId,
      accountNumber: client.accountNumber,
      fax: client.fax,
      mobile: client.mobile,
      tollFree: client.tollFree,
      website: client.website,
      internalNotes: client.internalNotes,
      customFields: client.customFields,
    });
    setEditClientId(client._id);
    setClientModalOpen(true);
  };

  const handleDeleteClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const filteredClients = apiClients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.user.name.toLowerCase().includes(searchLower) ||
      client.user.email.toLowerCase().includes(searchLower)
    );
  });

  const validateEmail = (email: string) => {
    if (!email) return true; // Empty email is valid since it's optional
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

  return (
    <div className='flex flex-col h-full relative bg-[#141414]'>
      <div className='absolute inset-0 pt-4 px-6 pb-16 overflow-y-auto'>
        <div className='mb-4'>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold text-[#fafafa]'>Client Information</h2>
          </div>
          <p className='text-[#8C8C8C] text-sm leading-5 mb-4'>
            Select an existing client or add a new one for this project. This information will be
            used on the invoice.
          </p>

          {/* Search and client list */}
          <div className='rounded-xl overflow-visible'>
            {apiClients.length > 0 && (
              <div className='flex gap-2 mb-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8C8C8C] w-4 h-4' />
                  <Input
                    type='text'
                    placeholder='Search clients...'
                    value={searchQuery}
                    onChange={(e) => {
                      return setSearchQuery(e.target.value);
                    }}
                    className='pl-10 bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                  />
                </div>
                <Button
                  onClick={() => {
                    resetClientForm();
                    setClientModalOpen(true);
                  }}
                  className='bg-[#232428] hover:bg-[#2A2A2F] text-[#fafafa] whitespace-nowrap border border-[#232428] shadow-sm'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Client
                </Button>
              </div>
            )}

            {filteredClients.length === 0 ? (
              <div className='text-center py-0 px-4'>
                <h3 className='mt-2 text-xl font-semibold text-[#fafafa] mb-3'>
                  Add Your First Client
                </h3>
                <p className='text-[#8C8C8C] mb-8 max-w-md mx-auto'>
                  {searchQuery
                    ? 'No clients match your search. Try a different search term or add a new client.'
                    : 'Get started by adding your first client.'}
                </p>

                {!searchQuery && (
                  <div className='max-w-md mx-auto'>
                    <div className='bg-[#232428] p-6 rounded-xl border border-[#232428] hover:border-[#2A2A2F] transition-colors flex flex-col'>
                      <div className='relative'>
                        <div className='absolute inset-0 bg-gradient-to-r from-[#232428] to-[#1A1A1A] blur-xl opacity-50 rounded-full'></div>
                        <div className='bg-[#232428] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 relative'>
                          <Plus className='w-6 h-6 text-[#8b5df8]' />
                        </div>
                      </div>
                      <h4 className='font-medium text-[#fafafa] mb-2'>Add Client</h4>
                      <p className='text-sm text-[#8C8C8C] mb-4 flex-grow'>
                        Enter your client information directly into our organized form.
                      </p>
                      <Button
                        onClick={() => {
                          resetClientForm();
                          setClientModalOpen(true);
                        }}
                        className='w-full bg-[#232428] hover:bg-[#2A2A2F] text-[#fafafa]'
                      >
                        Add Client
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='space-y-3'>
                {filteredClients.map((client) => {
                  return (
                    <div
                      key={client._id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedClient === client._id
                          ? 'border-[#8b5df8] bg-[#232428]'
                          : 'border-[#232428] hover:border-[#2A2A2F]'
                      }`}
                      onClick={() => {
                        return setSelectedClient(client._id);
                      }}
                    >
                      <div className='flex justify-between items-start'>
                        <div className='space-y-1'>
                          <h3 className='font-medium text-[#fafafa]'>{client.user.name}</h3>
                          <div className='space-y-0.5'>
                            {client.contact?.firstName && client.contact?.lastName && (
                              <p className='text-sm text-[#8C8C8C]'>
                                {client.contact.firstName} {client.contact.lastName}
                              </p>
                            )}
                            {client.user.email ? (
                              <p className='text-sm text-[#8C8C8C]'>{client.user.email}</p>
                            ) : (
                              <Button
                                variant='ghost'
                                size='sm'
                                className='text-sm text-[#8b5df8] hover:text-[#7c3aed] p-0 h-auto'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClient(client);
                                  setActiveTab('contact');
                                }}
                              >
                                + Add Email
                              </Button>
                            )}
                            {client.phone && (
                              <p className='text-sm text-[#8C8C8C]'>{client.phone}</p>
                            )}
                            {client.address?.city && client.address?.country && (
                              <p className='text-sm text-[#8C8C8C]'>
                                {client.address.city}, {client.address.country}
                              </p>
                            )}
                            {client.website && (
                              <p className='text-sm text-[#8C8C8C]'>{client.website}</p>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          {client.accountNumber && (
                            <span className='text-xs text-[#8C8C8C] bg-[#232428] px-2 py-1 rounded'>
                              #{client.accountNumber}
                            </span>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClient(client);
                            }}
                            className='text-[#fafafa] hover:bg-[#232428]'
                          >
                            Edit
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              return handleDeleteClient(client._id, e);
                            }}
                            className='text-[#F43F5E] hover:text-[#F43F5E] hover:bg-[#411D23]'
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Modal */}
      <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
        <DialogContent className='sm:max-w-[600px] bg-[#141414] border-[#232428]'>
          <DialogHeader>
            <DialogTitle className='flex items-center text-lg font-semibold text-[#fafafa]'>
              <div className='mr-2 p-1.5 bg-[#232428] rounded-full'>
                <User size={18} className='text-[#8b5df8]' />
              </div>
              {isEditingClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <p className='text-sm text-[#8C8C8C] mt-1'>
              {isEditingClient
                ? 'Update your client information below. Required fields are marked with an asterisk (*).'
                : 'Fill in your client information below. Required fields are marked with an asterisk (*).'}
            </p>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              return setActiveTab(value as any);
            }}
            className='mt-4'
          >
            <TabsList className='grid grid-cols-4 mb-6 bg-[#232428]'>
              <TabsTrigger
                value='contact'
                className='text-[#fafafa] data-[state=active]:bg-[#141414]'
              >
                Contact
              </TabsTrigger>
              <TabsTrigger
                value='billing'
                className='text-[#fafafa] data-[state=active]:bg-[#141414]'
              >
                Billing
              </TabsTrigger>
              <TabsTrigger
                value='shipping'
                className='text-[#fafafa] data-[state=active]:bg-[#141414]'
              >
                Shipping
              </TabsTrigger>
              <TabsTrigger value='more' className='text-[#fafafa] data-[state=active]:bg-[#141414]'>
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
                              htmlFor='client-name-modal'
                              className='block mb-1 text-sm font-medium text-[#fafafa]'
                            >
                              Customer <span className='text-[#F43F5E]'>*</span>
                            </Label>
                            <div className='relative'>
                              <Input
                                id='client-name-modal'
                                value={newClient.user?.name || ''}
                                onChange={(e) => {
                                  setNewClient({
                                    ...newClient,
                                    user: { ...newClient.user, name: e.target.value },
                                  });
                                }}
                                placeholder='Business or person'
                                required
                                className='w-full bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                              />
                            </div>
                          </div>
                          <div className='grid grid-cols-2 gap-5'>
                            <div>
                              <Label
                                htmlFor='client-email-modal'
                                className='block mb-1 text-sm font-medium text-[#fafafa]'
                              >
                                Email
                              </Label>
                              <div className='relative'>
                                <Input
                                  id='client-email-modal'
                                  type='email'
                                  value={newClient.user?.email || ''}
                                  onChange={(e) => {
                                    setNewClient({
                                      ...newClient,
                                      user: { ...newClient.user, email: e.target.value },
                                    });
                                    if (emailError) setEmailError(null);
                                  }}
                                  onBlur={handleEmailBlur}
                                  placeholder=''
                                  className={`w-full bg-[#141414] border-[#232428] text-[#fafafa] ${
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
                                htmlFor='client-phone-modal'
                                className='block mb-1 text-sm font-medium text-[#fafafa]'
                              >
                                Phone
                              </Label>
                              <div className='relative'>
                                <Input
                                  id='client-phone-modal'
                                  type='tel'
                                  value={newClient.phone || ''}
                                  onChange={(e) => {
                                    setNewClient({ ...newClient, phone: e.target.value });
                                  }}
                                  placeholder=''
                                  className='w-full bg-[#141414] border-[#232428] text-[#fafafa]'
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                              Contact
                            </Label>
                            <div className='grid grid-cols-2 gap-2'>
                              <Input
                                placeholder='First name'
                                value={newClient.contact?.firstName || ''}
                                onChange={(e) => {
                                  return setNewClient({
                                    ...newClient,
                                    contact: { ...newClient.contact, firstName: e.target.value },
                                  });
                                }}
                                className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                              />
                              <Input
                                placeholder='Last name'
                                value={newClient.contact?.lastName || ''}
                                onChange={(e) => {
                                  return setNewClient({
                                    ...newClient,
                                    contact: { ...newClient.contact, lastName: e.target.value },
                                  });
                                }}
                                className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                        <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                          Billing address
                        </Label>
                        <div className='space-y-2'>
                          <Input
                            placeholder='Address line 1'
                            value={newClient.address?.street || ''}
                            onChange={(e) => {
                              return setNewClient({
                                ...newClient,
                                address: { ...newClient.address, street: e.target.value },
                              });
                            }}
                            className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                          />
                          <div className='grid grid-cols-2 gap-2'>
                            <Input
                              placeholder='City'
                              value={newClient.address?.city || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  address: { ...newClient.address, city: e.target.value },
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                            />
                            <Input
                              placeholder='Postal/ZIP code'
                              value={newClient.address?.zip || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  address: { ...newClient.address, zip: e.target.value },
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                            />
                          </div>
                          <div className='grid grid-cols-2 gap-2'>
                            <Input
                              placeholder='Country'
                              value={newClient.address?.country || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  address: { ...newClient.address, country: e.target.value },
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                            />
                            <Input
                              placeholder='Province/State'
                              value={newClient.address?.state || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  address: { ...newClient.address, state: e.target.value },
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                        <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                          Shipping address
                        </Label>
                        <div className='flex items-center gap-2 mb-2'>
                          <input
                            type='checkbox'
                            className='accent-[#8b5df8] w-4 h-4'
                            id='same-as-billing'
                            checked={shippingSameAsBilling}
                            onChange={(e) => {
                              return setShippingSameAsBilling(e.target.checked);
                            }}
                          />
                          <Label htmlFor='same-as-billing' className='text-[#fafafa]'>
                            Same as billing address
                          </Label>
                        </div>
                        {!shippingSameAsBilling && (
                          <div className='space-y-2'>
                            <Input
                              placeholder='Address line 1'
                              value={newClient.shippingAddress?.street || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  shippingAddress: {
                                    ...newClient.shippingAddress,
                                    street: e.target.value,
                                  },
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                            />
                            <div className='grid grid-cols-2 gap-2'>
                              <Input
                                placeholder='City'
                                value={newClient.shippingAddress?.city || ''}
                                onChange={(e) => {
                                  return setNewClient({
                                    ...newClient,
                                    shippingAddress: {
                                      ...newClient.shippingAddress,
                                      city: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                              />
                              <Input
                                placeholder='Postal/ZIP code'
                                value={newClient.shippingAddress?.zip || ''}
                                onChange={(e) => {
                                  return setNewClient({
                                    ...newClient,
                                    shippingAddress: {
                                      ...newClient.shippingAddress,
                                      zip: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                              />
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                              <Input
                                placeholder='Country'
                                value={newClient.shippingAddress?.country || ''}
                                onChange={(e) => {
                                  return setNewClient({
                                    ...newClient,
                                    shippingAddress: {
                                      ...newClient.shippingAddress,
                                      country: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                              />
                              <Input
                                placeholder='Province/State'
                                value={newClient.shippingAddress?.state || ''}
                                onChange={(e) => {
                                  return setNewClient({
                                    ...newClient,
                                    shippingAddress: {
                                      ...newClient.shippingAddress,
                                      state: e.target.value,
                                    },
                                  });
                                }}
                                className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )}
                  {/* More Tab */}
                  {activeTab === 'more' && (
                    <TabsContent value='more' className='space-y-6 block'>
                      <div className='p-1'>
                        <div className='grid grid-cols-2 gap-5'>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                              Account number
                            </Label>
                            <Input
                              value={newClient.accountNumber || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  accountNumber: e.target.value,
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa]'
                            />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                              Fax
                            </Label>
                            <Input
                              value={newClient.fax || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  fax: e.target.value,
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa]'
                            />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                              Mobile
                            </Label>
                            <Input
                              value={newClient.mobile || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  mobile: e.target.value,
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa]'
                            />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                              Toll-free
                            </Label>
                            <Input
                              value={newClient.tollFree || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  tollFree: e.target.value,
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa]'
                            />
                          </div>
                          <div className='col-span-2'>
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                              Website
                            </Label>
                            <Input
                              value={newClient.website || ''}
                              onChange={(e) => {
                                return setNewClient({
                                  ...newClient,
                                  website: e.target.value,
                                });
                              }}
                              className='bg-[#141414] border-[#232428] text-[#fafafa]'
                            />
                          </div>
                        </div>
                        <div className='mt-5'>
                          <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                            Internal notes
                          </Label>
                          <textarea
                            value={newClient.internalNotes || ''}
                            onChange={(e) => {
                              return setNewClient({
                                ...newClient,
                                internalNotes: e.target.value,
                              });
                            }}
                            placeholder='Notes entered here will not be visible to your customer'
                            className='italic w-full rounded-lg border border-[#232428] px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#8b5df8]/20 focus:border-[#8b5df8] text-sm resize-y bg-[#141414] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                setClientModalOpen(false);
                resetClientForm();
              }}
              className='border-[#232428] text-[#fafafa] hover:bg-[#232428]'
            >
              Cancel
            </Button>
            <Button
              onClick={isEditingClient ? handleUpdateClient : handleCreateClient}
              className='bg-[#8b5df8] hover:bg-[#7c3aed] text-white'
              disabled={!newClient.user?.name}
            >
              {isEditingClient ? 'Update Client' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          return setActiveSection('invoice');
        }}
        currentSection={2}
        totalSections={4}
        isDisabled={!selectedClient}
        disabledTooltip='Please select a client to continue'
        onChatClick={onChatClick}
      />
    </div>
  );
}
