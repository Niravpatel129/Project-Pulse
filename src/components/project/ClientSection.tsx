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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Building, Check, Hash, Mail, Phone, PlusCircle, User } from 'lucide-react';
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

            {!selectedClient && (
              <div className='flex items-center text-amber-500 text-sm'>
                <AlertCircle className='w-4 h-4 mr-1' />
                <span>Client selection required</span>
              </div>
            )}
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Select a previous client or create a new one for this project.
          </p>

          {/* Action Buttons */}
          <div className='flex space-x-3 mb-6'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        onClick={() => {
                          setClientPopoverOpen(true);
                        }}
                        className={cn(
                          'flex items-center justify-center transition-all duration-300 h-11',
                          selectedClient
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md border-0'
                            : 'hover:bg-gray-100 border-2 border-gray-200',
                        )}
                        variant='outline'
                      >
                        <User size={18} className='mr-2' />
                        <span className='font-medium'>Select Client</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0' align='start'>
                      <div className='py-2 px-3 border-b border-gray-100 bg-gray-50'>
                        <h3 className='text-sm font-medium'>Select a client</h3>
                      </div>
                      <div className='max-h-[250px] overflow-y-auto py-1'>
                        {clients.length > 0 ? (
                          clients.map((client) => {
                            return (
                              <button
                                key={client.id}
                                className={cn(
                                  'w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center',
                                  selectedClient === client.id && 'bg-blue-50',
                                )}
                                onClick={() => {
                                  setSelectedClient(client.id);
                                  setClientPopoverOpen(false);
                                }}
                              >
                                <div className='h-8 w-8 rounded-full bg-[#EDE9FE] flex items-center justify-center mr-2 shrink-0'>
                                  <span className='text-[#5B21B6] text-xs font-medium'>
                                    {client.name.charAt(0)}
                                  </span>
                                </div>
                                <div className='overflow-hidden'>
                                  <div className='text-sm font-medium truncate'>{client.name}</div>
                                  <div className='text-xs text-gray-500 truncate'>
                                    {client.email}
                                  </div>
                                </div>
                                {selectedClient === client.id && (
                                  <Check className='ml-auto h-4 w-4 text-blue-600' />
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className='px-3 py-2 text-sm text-gray-500'>
                            No clients available
                          </div>
                        )}
                      </div>
                      <div className='py-2 px-3 border-t border-gray-100 bg-gray-50'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='w-full justify-start text-blue-600'
                          onClick={() => {
                            setClientModalOpen(true);
                            setClientPopoverOpen(false);
                          }}
                        >
                          <PlusCircle className='h-4 w-4 mr-2' />
                          <span>Create a new client</span>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
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
                      setClientModalOpen(true);
                    }}
                    className='flex items-center justify-center transition-all duration-300 h-11 hover:bg-gray-100 border-2 border-gray-200'
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
            {selectedClient ? (
              <AnimatePresence mode='wait'>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className='border border-[#E5E7EB] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-all duration-200 w-full relative'
                >
                  {clients.map((client) => {
                    if (client.id !== selectedClient) return null;

                    return (
                      <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='border border-[#E5E7EB] hover:border-blue-300 group rounded-xl p-4 transition-all duration-200 ease-in-out bg-white shadow-sm hover:shadow-md hover:translate-y-[-1px]'
                      >
                        <div className='flex flex-col space-y-3'>
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

                            <div className='flex space-x-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setClientPopoverOpen(true);
                                }}
                                className='h-9 text-gray-500'
                              >
                                Change
                              </Button>
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
                                    {client.address.country && <div>{client.address.country}</div>}
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
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className='text-center p-8 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50 transition-all duration-200'>
                <div className='flex flex-col items-center justify-center space-y-3'>
                  <div className='rounded-full bg-amber-100 p-3'>
                    <AlertCircle size={22} className='text-amber-600' />
                  </div>
                  <h3 className='text-[#111827] font-medium'>Client Required</h3>
                  <p className='text-[#6B7280] text-sm max-w-[320px] leading-relaxed'>
                    Please select a client to continue. Click the &quot;Select Client&quot; button
                    to choose from available clients.
                  </p>
                  <Button
                    onClick={() => {
                      setClientPopoverOpen(true);
                    }}
                    className='bg-blue-600 hover:bg-blue-700 text-white mt-2'
                    size='sm'
                  >
                    <User size={16} className='mr-2' />
                    Select a Client
                  </Button>
                </div>
              </div>
            )}
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
              {isEditingClient ? 'Edit Client' : 'Create New Client'}
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
        isDisabled={!selectedClient}
        disabledTooltip='Please select a client to continue'
      />
    </div>
  );
}
