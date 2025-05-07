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
import { User } from 'lucide-react';
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
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'billing'>('basic');
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
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);

  const resetClientForm = () => {
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
    setActiveTab('basic');
    setIsEditingClient(false);
    setEditClientId(null);
  };

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
    const updatedClients = [...clients, createdClient];
    clients.splice(0, clients.length, ...updatedClients);

    setSelectedClient(clientId);
    setClientModalOpen(false);
    resetClientForm();
  };

  const handleEditClient = (client: Client) => {
    setIsEditingClient(true);
    setNewClient({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      taxId: client.taxId,
      customFields: client.customFields,
    });
    setEditClientId(client.id);
    setClientModalOpen(true);
  };

  const handleUpdateClient = () => {
    if (!newClient.name || !newClient.email || !editClientId) {
      return;
    }

    const updatedClients = clients.map((client) => {
      if (client.id === editClientId) {
        return {
          ...client,
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          address: newClient.address,
          taxId: newClient.taxId,
          customFields: newClient.customFields,
        };
      }
      return client;
    });

    clients.splice(0, clients.length, ...updatedClients);
    setClientModalOpen(false);
    resetClientForm();
  };

  return (
    <div className='flex flex-col h-full relative bg-[#FAFAFA]'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Client Information</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            {clients.length === 0
              ? "Let's start by adding your client's information. This will be used on the invoice."
              : 'Select an existing client or add a new one for this project.'}
          </p>

          {/* Dropdown for existing clients */}
          {clients.length > 0 && (
            <div className='mb-6'>
              <Label
                htmlFor='existing-client-select'
                className='block mb-1 text-sm font-medium text-gray-700'
              >
                Select Existing Client
              </Label>
              <select
                id='existing-client-select'
                value={selectedClient}
                onChange={(e) => {
                  const clientId = e.target.value;
                  setSelectedClient(clientId);
                  if (clientId) {
                    const client = clients.find((c) => {
                      return c.id === clientId;
                    });
                    if (client) {
                      setNewClient({
                        name: client.name,
                        email: client.email,
                        phone: client.phone,
                        address: client.address,
                        taxId: client.taxId,
                        customFields: client.customFields,
                      });
                    }
                  } else {
                    resetClientForm();
                  }
                }}
                className='w-full border rounded px-3 py-2 text-sm'
              >
                <option value=''>-- New Client --</option>
                {clients.map((client) => {
                  return (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Inline client creation/edit form */}
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedClient) {
                  handleUpdateClient();
                } else {
                  handleCreateClient();
                }
              }}
              className='space-y-4'
            >
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label
                    htmlFor='client-name-inline'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    Client Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='client-name-inline'
                    value={newClient.name}
                    onChange={(e) => {
                      return setNewClient({ ...newClient, name: e.target.value });
                    }}
                    placeholder='Enter client name'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='client-email-inline'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    Email <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='client-email-inline'
                    type='email'
                    value={newClient.email || ''}
                    onChange={(e) => {
                      return setNewClient({ ...newClient, email: e.target.value });
                    }}
                    placeholder='e.g. contact@client.com'
                    required
                  />
                </div>
              </div>
              <div>
                <Label
                  htmlFor='client-phone-inline'
                  className='block mb-1 text-sm font-medium text-gray-700'
                >
                  Phone Number
                </Label>
                <Input
                  id='client-phone-inline'
                  type='tel'
                  value={newClient.phone || ''}
                  onChange={(e) => {
                    return setNewClient({ ...newClient, phone: e.target.value });
                  }}
                  placeholder='e.g. +1 (555) 123-4567'
                />
              </div>
              <div>
                <Label
                  htmlFor='client-tax-id-inline'
                  className='block mb-1 text-sm font-medium text-gray-700'
                >
                  Tax ID / VAT Number
                </Label>
                <Input
                  id='client-tax-id-inline'
                  value={newClient.taxId || ''}
                  onChange={(e) => {
                    return setNewClient({ ...newClient, taxId: e.target.value });
                  }}
                  placeholder='e.g. VAT123456789'
                />
              </div>
              {/* Address fields */}
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <Label
                    htmlFor='client-street-inline'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    Street Address
                  </Label>
                  <Input
                    id='client-street-inline'
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
                <div>
                  <Label
                    htmlFor='client-city-inline'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    City
                  </Label>
                  <Input
                    id='client-city-inline'
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
                  <Label
                    htmlFor='client-state-inline'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    State / Province
                  </Label>
                  <Input
                    id='client-state-inline'
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
                <div>
                  <Label
                    htmlFor='client-postal-code-inline'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    Postal Code
                  </Label>
                  <Input
                    id='client-postal-code-inline'
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
                  <Label
                    htmlFor='client-country-inline'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    Country
                  </Label>
                  <Input
                    id='client-country-inline'
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
              <div className='flex justify-end mt-6'>
                <Button
                  type='submit'
                  className='bg-blue-600 hover:bg-blue-700 text-white px-8'
                  disabled={!newClient.name || !newClient.email}
                >
                  {selectedClient ? 'Update Client' : 'Add Client'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Client Modal */}
      <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center text-lg font-semibold'>
              <div className='mr-2 p-1.5 bg-blue-100 rounded-full'>
                <User size={18} className='text-blue-600' />
              </div>
              {isEditingClient ? 'Edit Client' : 'Add Client Information'}
            </DialogTitle>
            {!isEditingClient && (
              <p className='text-sm text-gray-500 mt-1'>
                This information will be used on the invoice. Required fields are marked with an
                asterisk (*).
              </p>
            )}
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as any);
            }}
            className='mt-4'
          >
            <TabsList className='grid grid-cols-2 mb-6'>
              <TabsTrigger value='basic'>Basic Info</TabsTrigger>
              <TabsTrigger value='billing'>Billing Address</TabsTrigger>
            </TabsList>

            <TabsContent value='basic' className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label
                    htmlFor='client-name-modal'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    Client Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='client-name-modal'
                    value={newClient.name}
                    onChange={(e) => {
                      setNewClient({ ...newClient, name: e.target.value });
                    }}
                    placeholder='Enter client name'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='client-email-modal'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    Email <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='client-email-modal'
                    type='email'
                    value={newClient.email || ''}
                    onChange={(e) => {
                      setNewClient({ ...newClient, email: e.target.value });
                    }}
                    placeholder='e.g. contact@acmecorp.com'
                    required
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor='client-phone-modal'
                  className='block mb-1 text-sm font-medium text-gray-700'
                >
                  Phone Number
                </Label>
                <Input
                  id='client-phone-modal'
                  type='tel'
                  value={newClient.phone || ''}
                  onChange={(e) => {
                    setNewClient({ ...newClient, phone: e.target.value });
                  }}
                  placeholder='e.g. +1 (555) 123-4567'
                />
              </div>

              <div>
                <Label
                  htmlFor='client-tax-id-modal'
                  className='block mb-1 text-sm font-medium text-gray-700'
                >
                  Tax ID / VAT Number
                </Label>
                <Input
                  id='client-tax-id-modal'
                  value={newClient.taxId || ''}
                  onChange={(e) => {
                    setNewClient({ ...newClient, taxId: e.target.value });
                  }}
                  placeholder='e.g. VAT123456789'
                />
              </div>
            </TabsContent>

            <TabsContent value='billing' className='space-y-4'>
              <div className='space-y-3'>
                <div>
                  <Label
                    htmlFor='client-street-modal'
                    className='block mb-1 text-sm font-medium text-gray-700'
                  >
                    Street Address
                  </Label>
                  <Input
                    id='client-street-modal'
                    value={newClient.address?.street || ''}
                    onChange={(e) => {
                      setNewClient({
                        ...newClient,
                        address: { ...newClient.address, street: e.target.value },
                      });
                    }}
                    placeholder='e.g. 123 Main St.'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <Label
                      htmlFor='client-city-modal'
                      className='block mb-1 text-sm font-medium text-gray-700'
                    >
                      City
                    </Label>
                    <Input
                      id='client-city-modal'
                      value={newClient.address?.city || ''}
                      onChange={(e) => {
                        setNewClient({
                          ...newClient,
                          address: { ...newClient.address, city: e.target.value },
                        });
                      }}
                      placeholder='e.g. New York'
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='client-state-modal'
                      className='block mb-1 text-sm font-medium text-gray-700'
                    >
                      State / Province
                    </Label>
                    <Input
                      id='client-state-modal'
                      value={newClient.address?.state || ''}
                      onChange={(e) => {
                        setNewClient({
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
                    <Label
                      htmlFor='client-postal-code-modal'
                      className='block mb-1 text-sm font-medium text-gray-700'
                    >
                      Postal Code
                    </Label>
                    <Input
                      id='client-postal-code-modal'
                      value={newClient.address?.postalCode || ''}
                      onChange={(e) => {
                        setNewClient({
                          ...newClient,
                          address: { ...newClient.address, postalCode: e.target.value },
                        });
                      }}
                      placeholder='e.g. 10001'
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor='client-country-modal'
                      className='block mb-1 text-sm font-medium text-gray-700'
                    >
                      Country
                    </Label>
                    <Input
                      id='client-country-modal'
                      value={newClient.address?.country || ''}
                      onChange={(e) => {
                        setNewClient({
                          ...newClient,
                          address: { ...newClient.address, country: e.target.value },
                        });
                      }}
                      placeholder='e.g. USA'
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className='mt-6'>
            <Button
              variant='outline'
              onClick={() => {
                setClientModalOpen(false);
                resetClientForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditingClient ? handleUpdateClient : handleCreateClient}
              className='bg-blue-600 hover:bg-blue-700 text-white'
              disabled={!newClient.name || !newClient.email}
            >
              {isEditingClient ? 'Update Client' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          setActiveSection('comments');
        }}
        currentSection={2}
        totalSections={4}
        isDisabled={!selectedClient}
        disabledTooltip='Please select a client to continue'
      />
    </div>
  );
}
