'use client';

import { AddCustomerDialog } from '@/app/[workspace]/dashboard/customers/components/AddCustomerDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClients } from '@/hooks/useClients';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Trash2 } from 'lucide-react';
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
  const [editClientData, setEditClientData] = useState<Client | null>(null);

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
    setEditClientData(client);
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

  // Transform our client data to match the format expected by AddCustomerDialog
  const mapClientToCustomerData = (client: Client) => {
    return {
      name: client.user?.name || '',
      contactName: `${client.contact?.firstName || ''} ${client.contact?.lastName || ''}`.trim(),
      contactEmail: client.user?.email || '',
      contactPhone: client.phone || '',
      industry: '',
      type: 'Individual',
      status: 'Active',
      address: client.address || {
        street: '',
        city: '',
        state: '',
        country: '',
        zip: '',
      },
      shippingAddress: client.shippingAddress || {
        street: '',
        city: '',
        state: '',
        country: '',
        zip: '',
      },
      website: client.website || '',
      internalNotes: client.internalNotes || '',
    };
  };

  // Function to handle client creation/update from the dialog
  const handleClientSave = (customerData: any) => {
    // Format data for our API
    const formattedData = {
      user: {
        name: customerData.name,
        email: customerData.contactEmail,
      },
      phone: customerData.contactPhone,
      address: customerData.address,
      shippingAddress: customerData.shippingAddress,
      contact: {
        firstName: customerData.contactName.split(' ')[0] || '',
        lastName: customerData.contactName.split(' ').slice(1).join(' ') || '',
      },
      taxId: '',
      accountNumber: '',
      fax: '',
      mobile: '',
      tollFree: '',
      website: customerData.website,
      internalNotes: customerData.internalNotes,
      customFields: {},
    };

    if (editClientData && editClientData._id) {
      updateClientMutation.mutate({
        clientId: editClientData._id,
        clientData: formattedData,
      });
    } else {
      createClientMutation.mutate(formattedData);
    }

    setEditClientData(null);
  };

  return (
    <div className='flex flex-col h-full relative bg-white dark:bg-[#141414]'>
      <div className='absolute inset-0 pt-4 px-6 pb-16 overflow-y-auto'>
        <div className='mb-4'>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-lg font-semibold text-[#3F3F46] dark:text-[#fafafa]'>
              Client Information
            </h2>
          </div>
          <p className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-sm leading-5 mb-4'>
            Select an existing client or add a new one for this project. This information will be
            used on the invoice.
          </p>

          {/* Search and client list */}
          <div className='rounded-xl overflow-visible p-1'>
            {apiClients.length > 0 && (
              <div className='flex gap-2 mb-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3F3F46]/60 dark:text-[#8C8C8C] w-4 h-4' />
                  <Input
                    type='text'
                    placeholder='Search clients...'
                    value={searchQuery}
                    onChange={(e) => {
                      return setSearchQuery(e.target.value);
                    }}
                    className='pl-10 bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
                  />
                </div>
                <Button
                  onClick={() => {
                    resetClientForm();
                    setClientModalOpen(true);
                  }}
                  className='bg-[#F4F4F5] hover:bg-[#E4E4E7] dark:bg-[#232428] dark:hover:bg-[#2A2A2F] text-[#3F3F46] dark:text-[#fafafa] whitespace-nowrap border border-[#E4E4E7] dark:border-[#232428] shadow-sm'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Add Client
                </Button>
              </div>
            )}

            {filteredClients.length === 0 ? (
              <div className='text-center py-0 px-4'>
                <h3 className='mt-2 text-xl font-semibold text-[#3F3F46] dark:text-[#fafafa] mb-3'>
                  Add Your First Client
                </h3>
                <p className='text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-8 max-w-md mx-auto'>
                  {searchQuery
                    ? 'No clients match your search. Try a different search term or add a new client.'
                    : 'Get started by adding your first client.'}
                </p>

                {!searchQuery && (
                  <div className='max-w-md mx-auto'>
                    <div className='bg-[#F4F4F5] dark:bg-[#232428] p-6 rounded-xl border border-[#E4E4E7] dark:border-[#232428] hover:border-[#D1D1D6] dark:hover:border-[#2A2A2F] transition-colors flex flex-col'>
                      <div className='relative'>
                        <div className='absolute inset-0 bg-gradient-to-r from-[#F4F4F5] to-[#E4E4E7] dark:from-[#232428] dark:to-[#1A1A1A] blur-xl opacity-50 rounded-full'></div>
                        <div className='bg-[#E4E4E7] dark:bg-[#232428] rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 relative'>
                          <Plus className='w-6 h-6 text-[#8b5df8]' />
                        </div>
                      </div>
                      <h4 className='font-medium text-[#3F3F46] dark:text-[#fafafa] mb-2'>
                        Add Client
                      </h4>
                      <p className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C] mb-4 flex-grow'>
                        Enter your client information directly into our organized form.
                      </p>
                      <Button
                        onClick={() => {
                          resetClientForm();
                          setClientModalOpen(true);
                        }}
                        className='w-full bg-[#F4F4F5] hover:bg-[#E4E4E7] dark:bg-[#232428] dark:hover:bg-[#2A2A2F] text-[#3F3F46] dark:text-[#fafafa]'
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
                          ? 'border-[#8b5df8] bg-[#F4F4F5] dark:bg-[#232428]'
                          : 'border-[#E4E4E7] dark:border-[#232428] hover:border-[#D1D1D6] dark:hover:border-[#2A2A2F]'
                      }`}
                      onClick={() => {
                        return setSelectedClient(client._id);
                      }}
                    >
                      <div className='flex justify-between items-start'>
                        <div className='space-y-1'>
                          <h3 className='font-medium text-[#3F3F46] dark:text-[#fafafa]'>
                            {client.user.name}
                          </h3>
                          <div className='space-y-0.5'>
                            {client.contact?.firstName && client.contact?.lastName && (
                              <p className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                                {client.contact.firstName} {client.contact.lastName}
                              </p>
                            )}
                            {client.user.email ? (
                              <p className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                                {client.user.email}
                              </p>
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
                              <p className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                                {client.phone}
                              </p>
                            )}
                            {client.address?.city && client.address?.country && (
                              <p className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                                {client.address.city}, {client.address.country}
                              </p>
                            )}
                            {client.website && (
                              <p className='text-sm text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
                                {client.website}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          {client.accountNumber && (
                            <span className='text-xs text-[#3F3F46]/60 dark:text-[#8C8C8C] bg-[#F4F4F5] dark:bg-[#232428] px-2 py-1 rounded'>
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
                            className='text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#F4F4F5] dark:hover:bg-[#232428]'
                          >
                            Edit
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              return handleDeleteClient(client._id, e);
                            }}
                            className='text-[#F43F5E] hover:text-[#F43F5E] hover:bg-[#FDE7EB] dark:hover:bg-[#411D23]'
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

      {/* Client Dialog - Use the AddCustomerDialog component instead */}
      <AddCustomerDialog
        open={clientModalOpen}
        onOpenChange={setClientModalOpen}
        onEdit={handleClientSave}
        initialData={editClientData ? mapClientToCustomerData(editClientData) : undefined}
      />

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
