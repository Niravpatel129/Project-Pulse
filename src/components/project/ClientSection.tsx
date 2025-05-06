'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import SectionFooter from './SectionFooter';
import { Client, Section } from './types';

type ClientSectionProps = {
  clients: Client[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
};

export default function ClientSection({
  clients,
  selectedClient,
  setSelectedClient,
  setActiveSection,
}: ClientSectionProps) {
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    taxId: '',
    customFields: {},
  });
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientId, setEditClientId] = useState<string | null>(null);

  const handleCreateClient = () => {
    if (!newClient.name || !newClient.email) {
      return;
    }

    const clientId = `client${Date.now()}`;
    const createdClient: Client = {
      id: clientId,
      name: newClient.name,
      email: newClient.email,
      phone: newClient.phone,
      address: newClient.address,
      taxId: newClient.taxId,
      customFields: newClient.customFields,
    };

    // Add client to the list and select it
    // In a real app, this would likely be an API call
    setSelectedClient(clientId);
    setIsCreatingClient(false);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      taxId: '',
      customFields: {},
    });
  };

  const handleEditClient = (client: Client) => {
    setIsEditingClient(true);
    setEditClientId(client.id);
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      taxId: client.taxId,
      customFields: client.customFields,
    });
  };

  const handleUpdateClient = () => {
    if (!newClient.name || !newClient.email) {
      return;
    }

    // Update client in the list
    // In a real app, this would likely be an API call
    setIsEditingClient(false);
    setEditClientId(null);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      taxId: '',
      customFields: {},
    });
  };

  return (
    <div className='flex flex-col h-full relative'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Select Client</h2>
            <Button
              onClick={() => {
                return setIsCreatingClient(true);
              }}
              className='px-3 py-1.5 text-sm'
              disabled={isCreatingClient || isEditingClient}
            >
              Add New Client
            </Button>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Choose an existing client or create a new one for this project.
          </p>

          {isCreatingClient || isEditingClient ? (
            <div className='border border-[#E5E7EB] rounded-md p-4 mb-6'>
              <h3 className='text-sm font-medium text-[#111827] mb-3'>
                {isCreatingClient ? 'New Client' : 'Edit Client'}
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='client-name' className='block mb-1'>
                      Client Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='client-name'
                      value={newClient.name}
                      onChange={(e) => {
                        return setNewClient({ ...newClient, name: e.target.value });
                      }}
                      placeholder='e.g. Acme Corporation'
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor='client-email' className='block mb-1'>
                      Email <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='client-email'
                      type='email'
                      value={newClient.email}
                      onChange={(e) => {
                        return setNewClient({ ...newClient, email: e.target.value });
                      }}
                      placeholder='e.g. contact@acmecorp.com'
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='client-phone' className='block mb-1'>
                    Phone Number
                  </Label>
                  <Input
                    id='client-phone'
                    type='tel'
                    value={newClient.phone || ''}
                    onChange={(e) => {
                      return setNewClient({ ...newClient, phone: e.target.value });
                    }}
                    placeholder='e.g. +1 (555) 123-4567'
                  />
                </div>

                <div>
                  <Label htmlFor='client-tax-id' className='block mb-1'>
                    Tax ID / VAT Number
                  </Label>
                  <Input
                    id='client-tax-id'
                    value={newClient.taxId || ''}
                    onChange={(e) => {
                      return setNewClient({ ...newClient, taxId: e.target.value });
                    }}
                    placeholder='e.g. VAT123456789'
                  />
                </div>

                <div>
                  <h4 className='text-sm font-medium text-[#111827] mb-2'>Billing Address</h4>
                  <div className='space-y-3'>
                    <div>
                      <Label htmlFor='client-street' className='block mb-1'>
                        Street Address
                      </Label>
                      <Input
                        id='client-street'
                        value={newClient.address?.street || ''}
                        onChange={(e) => {
                          return setNewClient({
                            ...newClient,
                            address: { ...newClient.address, street: e.target.value },
                          });
                        }}
                        placeholder='e.g. 123 Main St.'
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label htmlFor='client-city' className='block mb-1'>
                          City
                        </Label>
                        <Input
                          id='client-city'
                          value={newClient.address?.city || ''}
                          onChange={(e) => {
                            return setNewClient({
                              ...newClient,
                              address: { ...newClient.address, city: e.target.value },
                            });
                          }}
                          placeholder='e.g. New York'
                        />
                      </div>
                      <div>
                        <Label htmlFor='client-state' className='block mb-1'>
                          State / Province
                        </Label>
                        <Input
                          id='client-state'
                          value={newClient.address?.state || ''}
                          onChange={(e) => {
                            return setNewClient({
                              ...newClient,
                              address: { ...newClient.address, state: e.target.value },
                            });
                          }}
                          placeholder='e.g. NY'
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <Label htmlFor='client-postal-code' className='block mb-1'>
                          Postal Code
                        </Label>
                        <Input
                          id='client-postal-code'
                          value={newClient.address?.postalCode || ''}
                          onChange={(e) => {
                            return setNewClient({
                              ...newClient,
                              address: { ...newClient.address, postalCode: e.target.value },
                            });
                          }}
                          placeholder='e.g. 10001'
                        />
                      </div>
                      <div>
                        <Label htmlFor='client-country' className='block mb-1'>
                          Country
                        </Label>
                        <Input
                          id='client-country'
                          value={newClient.address?.country || ''}
                          onChange={(e) => {
                            return setNewClient({
                              ...newClient,
                              address: { ...newClient.address, country: e.target.value },
                            });
                          }}
                          placeholder='e.g. USA'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end space-x-3 pt-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsCreatingClient(false);
                      setIsEditingClient(false);
                      setEditClientId(null);
                      setNewClient({
                        name: '',
                        email: '',
                        phone: '',
                        address: {
                          street: '',
                          city: '',
                          state: '',
                          country: '',
                          postalCode: '',
                        },
                        taxId: '',
                        customFields: {},
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={isCreatingClient ? handleCreateClient : handleUpdateClient}>
                    {isCreatingClient ? 'Create Client' : 'Update Client'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {clients.map((client) => {
                return (
                  <div
                    key={client.id}
                    className={`border ${
                      selectedClient === client.id ? 'border-[#111827]' : 'border-[#E5E7EB]'
                    } rounded-md p-4 cursor-pointer hover:border-[#111827] transition-colors`}
                    onClick={() => {
                      setSelectedClient(client.id);
                    }}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center mr-3'>
                          <span className='text-[#5B21B6] text-sm font-medium'>
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className='text-[#111827] text-sm font-medium'>{client.name}</div>
                          <div className='text-[#6B7280] text-xs'>{client.email}</div>
                          {client.phone && (
                            <div className='text-[#6B7280] text-xs'>{client.phone}</div>
                          )}
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Button
                          variant='ghost'
                          className='h-8 w-8 p-0'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClient(client);
                          }}
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='text-[#6B7280]'
                          >
                            <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
                            <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
                          </svg>
                        </Button>
                        {selectedClient === client.id && (
                          <div className='w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center'>
                            <svg
                              width='12'
                              height='12'
                              viewBox='0 0 12 12'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                d='M10 3L4.5 8.5L2 6'
                                stroke='white'
                                strokeWidth='1.5'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          setActiveSection('comments');
        }}
        currentSection={2}
        totalSections={4}
      />
    </div>
  );
}
