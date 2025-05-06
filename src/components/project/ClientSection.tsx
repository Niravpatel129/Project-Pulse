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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Building, Check, Hash, Mail, Phone, PlusCircle, User } from 'lucide-react';
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
  const [clientOption, setClientOption] = useState<'existing' | 'new'>(
    selectedClient ? 'existing' : 'new',
  );

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
    // In a real app, this would likely be an API call
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
    setClientModalOpen(true);
  };

  const handleUpdateClient = () => {
    if (!newClient.name || !newClient.email) {
      return;
    }

    // Update client in the list
    // In a real app, this would likely be an API call
    setClientModalOpen(false);
    resetClientForm();
    setIsEditingClient(false);
  };

  const handleClientSelect = (value: string) => {
    setSelectedClient(value);
  };

  return (
    <div className='flex flex-col h-full relative bg-[#FAFAFA]'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Client Information</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Select a previous client or enter new client information for this project.
          </p>

          {/* Action Buttons */}
          <div className='flex space-x-3 mb-6'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      return setClientOption('existing');
                    }}
                    className={cn(
                      'flex items-center justify-center transition-all duration-300 h-11',
                      clientOption === 'existing'
                        ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md border-0'
                        : 'hover:bg-gray-100 border-2 border-gray-200',
                    )}
                    variant='outline'
                  >
                    <User size={18} className='mr-2' />
                    <span className='font-medium'>Select Existing Client</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose from your existing clients</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      return setClientOption('new');
                    }}
                    className={cn(
                      'flex items-center justify-center transition-all duration-300 h-11',
                      clientOption === 'new'
                        ? 'bg-purple-600 text-white hover:bg-purple-700 hover:text-white shadow-md border-0'
                        : 'hover:bg-gray-100 border-2 border-gray-200',
                    )}
                    variant='outline'
                  >
                    <PlusCircle size={18} className='mr-2' />
                    <span className='font-medium'>Create New Client</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new client for this project</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className='space-y-6'>
            {clientOption === 'existing' ? (
              <AnimatePresence mode='wait'>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className='border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full relative'
                >
                  <div className='mb-4'>
                    <Label
                      htmlFor='client-select'
                      className='block mb-2 text-sm font-medium text-gray-700'
                    >
                      Choose a client
                    </Label>
                    <Select value={selectedClient} onValueChange={handleClientSelect}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a client' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {clients.map((client) => {
                            return (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedClient ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='border border-[#E5E7EB] hover:border-blue-300 group rounded-xl p-4 transition-all duration-200 ease-in-out bg-white shadow-sm hover:shadow-md hover:translate-y-[-1px]'
                    >
                      {clients.map((client) => {
                        if (client.id !== selectedClient) return null;

                        return (
                          <div key={client.id} className='flex flex-col space-y-3'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center'>
                                <div className='w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center mr-4'>
                                  <span className='text-[#5B21B6] text-sm font-medium'>
                                    {client.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className='text-[#111827] text-base font-medium mb-1'>
                                    {client.name}
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  handleEditClient(client);
                                }}
                                className='h-9'
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
                                  className='mr-2'
                                >
                                  <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
                                  <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
                                </svg>
                                Edit Client
                              </Button>
                            </div>

                            <Separator className='my-2' />

                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div className='flex items-center'>
                                <Mail className='h-4 w-4 text-gray-400 mr-2' />
                                <span>{client.email}</span>
                              </div>
                              {client.phone && (
                                <div className='flex items-center'>
                                  <Phone className='h-4 w-4 text-gray-400 mr-2' />
                                  <span>{client.phone}</span>
                                </div>
                              )}
                            </div>

                            {client.address &&
                              Object.values(client.address).some((v) => {
                                return v;
                              }) && (
                                <div className='mt-2 text-sm'>
                                  <div className='flex items-start'>
                                    <Building className='h-4 w-4 text-gray-400 mr-2 mt-0.5' />
                                    <div>
                                      {client.address.street && <div>{client.address.street}</div>}
                                      {(client.address.city ||
                                        client.address.state ||
                                        client.address.postalCode) && (
                                        <div>
                                          {client.address.city}
                                          {client.address.city && client.address.state ? ', ' : ''}
                                          {client.address.state} {client.address.postalCode}
                                        </div>
                                      )}
                                      {client.address.country && (
                                        <div>{client.address.country}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                            {client.taxId && (
                              <div className='flex items-center text-sm'>
                                <Hash className='h-4 w-4 text-gray-400 mr-2' />
                                <span>Tax ID: {client.taxId}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : clients.length > 0 ? (
                    <div className='text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-white transition-all duration-200 hover:border-blue-200'>
                      <div className='flex flex-col items-center justify-center space-y-3'>
                        <div className='rounded-full bg-blue-50 p-3'>
                          <User size={22} className='text-blue-600' />
                        </div>
                        <h3 className='text-[#111827] font-medium'>Select a client</h3>
                        <p className='text-[#6B7280] text-sm max-w-[320px] leading-relaxed'>
                          Choose a client from the dropdown above to see their details.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-white transition-all duration-200 hover:border-blue-200'>
                      <div className='flex flex-col items-center justify-center space-y-3'>
                        <div className='rounded-full bg-blue-50 p-3'>
                          <User size={22} className='text-blue-600' />
                        </div>
                        <h3 className='text-[#111827] font-medium'>No clients available</h3>
                        <p className='text-[#6B7280] text-sm max-w-[320px] leading-relaxed'>
                          You don't have any clients yet. Create your first client to get started.
                        </p>
                        <Button
                          onClick={() => {
                            return setClientOption('new');
                          }}
                          className='bg-blue-600 hover:bg-blue-700 text-white mt-2'
                          size='sm'
                        >
                          <PlusCircle size={16} className='mr-2' />
                          Create New Client
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <AnimatePresence mode='wait'>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className='border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full relative'
                >
                  <div className='flex items-center mb-6'>
                    <div className='w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center mr-4'>
                      <User className='text-[#5B21B6] h-5 w-5' />
                    </div>
                    <h3 className='text-[#111827] text-base font-medium'>New Client Information</h3>
                  </div>

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
                            htmlFor='client-name'
                            className='block mb-1 text-sm font-medium text-gray-700'
                          >
                            Client Name <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            id='client-name'
                            value={newClient.name}
                            onChange={(e) => {
                              setNewClient({ ...newClient, name: e.target.value });
                            }}
                            placeholder='e.g. Acme Corporation'
                            required
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor='client-email'
                            className='block mb-1 text-sm font-medium text-gray-700'
                          >
                            Email <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            id='client-email'
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
                          htmlFor='client-phone'
                          className='block mb-1 text-sm font-medium text-gray-700'
                        >
                          Phone Number
                        </Label>
                        <Input
                          id='client-phone'
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
                          htmlFor='client-tax-id'
                          className='block mb-1 text-sm font-medium text-gray-700'
                        >
                          Tax ID / VAT Number
                        </Label>
                        <Input
                          id='client-tax-id'
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
                            htmlFor='client-street'
                            className='block mb-1 text-sm font-medium text-gray-700'
                          >
                            Street Address
                          </Label>
                          <Input
                            id='client-street'
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
                              htmlFor='client-city'
                              className='block mb-1 text-sm font-medium text-gray-700'
                            >
                              City
                            </Label>
                            <Input
                              id='client-city'
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
                              htmlFor='client-state'
                              className='block mb-1 text-sm font-medium text-gray-700'
                            >
                              State / Province
                            </Label>
                            <Input
                              id='client-state'
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
                              htmlFor='client-postal-code'
                              className='block mb-1 text-sm font-medium text-gray-700'
                            >
                              Postal Code
                            </Label>
                            <Input
                              id='client-postal-code'
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
                              htmlFor='client-country'
                              className='block mb-1 text-sm font-medium text-gray-700'
                            >
                              Country
                            </Label>
                            <Input
                              id='client-country'
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

                  <div className='mt-6 flex justify-end'>
                    <Button
                      onClick={handleCreateClient}
                      className='bg-blue-600 hover:bg-blue-700 text-white'
                      disabled={!newClient.name || !newClient.email}
                    >
                      <Check size={16} className='mr-2' />
                      Save Client
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Client Edit Modal */}
      <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center text-lg font-semibold'>
              <div className='mr-2 p-1.5 bg-blue-100 rounded-full'>
                <User size={18} className='text-blue-600' />
              </div>
              {isEditingClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
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
                    placeholder='e.g. Acme Corporation'
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
                setIsEditingClient(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditingClient ? handleUpdateClient : handleCreateClient}
              className='bg-blue-600 hover:bg-blue-700 text-white'
              disabled={!newClient.name || !newClient.email}
            >
              {isEditingClient ? 'Update Client' : 'Create Client'}
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
      />
    </div>
  );
}
