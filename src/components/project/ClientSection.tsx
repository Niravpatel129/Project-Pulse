'use client';

import AICard from '@/components/ui/ai-card';
import AIInput, { Attachment } from '@/components/ui/ai-input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, Plus, Search, Sparkles, User } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'contact' | 'billing' | 'shipping' | 'more'>(
    'contact',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGeneratedFields, setAiGeneratedFields] = useState<string[]>([]);
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const [tabContentHeight, setTabContentHeight] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (tabContentRef.current) {
      setTabContentHeight(tabContentRef.current.scrollHeight);
    }
  }, [activeTab, clientModalOpen]);

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
    setActiveTab('contact');
    setIsEditingClient(false);
    setEditClientId(null);
    setAttachments([]);
    setAiError(null);
    setAiGeneratedFields([]);
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

  const handleAiGenerate = () => {
    setIsAiGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      // Example AI-generated data - in real app, this would come from an AI service
      const aiGeneratedClient = {
        name: 'Acme Corporation',
        email: 'contact@acmecorp.com',
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Business Ave',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postalCode: '94105',
        },
        taxId: 'TAX123456789',
        customFields: {},
      };
      setNewClient(aiGeneratedClient);
      setAiGeneratedFields([
        'name',
        'email',
        'phone',
        'address.street',
        'address.city',
        'address.state',
        'address.country',
        'address.postalCode',
        'taxId',
      ]);
      setClientModalOpen(true);
      setShowAiInput(false);
      setIsAiGenerating(false);
    }, 1500);
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower)
    );
  });

  const removeAttachment = (attachment: Attachment) => {
    setAttachments(
      attachments.filter((a) => {
        return a.id !== attachment.id;
      }),
    );
  };

  return (
    <div className='flex flex-col h-full relative bg-[#FAFAFA]'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Client Information</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Select an existing client or add a new one for this project. This information will be
            used on the invoice.
          </p>

          {/* Search and client list */}
          <div className='bg-white rounded-xl border border-gray-200 p-6'>
            {clients.length > 0 && (
              <div className='flex gap-2 mb-4'>
                <div className='relative flex-1'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                  <Input
                    type='text'
                    placeholder='Search clients...'
                    value={searchQuery}
                    onChange={(e) => {
                      return setSearchQuery(e.target.value);
                    }}
                    className='pl-10'
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className='bg-gray-900 hover:bg-gray-800 text-white whitespace-nowrap border border-gray-700 shadow-sm'>
                      <Plus className='w-4 h-4 mr-2' />
                      Add Client
                      <ChevronDown className='w-4 h-4 ml-2' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-[200px]'>
                    <DropdownMenuItem
                      onClick={() => {
                        resetClientForm();
                        setClientModalOpen(true);
                      }}
                      className='cursor-pointer'
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Manual Entry
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        return setShowAiInput(true);
                      }}
                      className='cursor-pointer'
                    >
                      <Sparkles className='w-4 h-4 mr-2' />
                      AI-Powered
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {showAiInput ? (
              <AICard
                title='AI-Powered Client Creation'
                onClose={() => {
                  setShowAiInput(false);
                  setAiInput('');
                  setAttachments([]);
                  setAiError(null);
                }}
              >
                <AIInput
                  value={aiInput}
                  onChange={setAiInput}
                  onGenerate={handleAiGenerate}
                  isGenerating={isAiGenerating}
                  error={aiError}
                  placeholder='Describe your client in natural language...'
                  exampleText='Example: "Acme Corp, a tech company in San Francisco, contact email is contact@acmecorp.com, phone is 555-123-4567"'
                  attachments={attachments}
                  onAttachmentAdd={setAttachments}
                  onAttachmentRemove={(id: any) => {
                    removeAttachment(id);
                  }}
                />
              </AICard>
            ) : (
              <>
                {filteredClients.length === 0 ? (
                  <div className='text-center py-0 px-4'>
                    <div className='relative'>
                      <div className='absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 blur-xl opacity-50 rounded-full'></div>
                      <div className='bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 relative'>
                        <User className='w-10 h-10 text-gray-400' />
                      </div>
                    </div>
                    <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                      Add Your First Client
                    </h3>
                    <p className='text-gray-500 mb-8 max-w-md mx-auto'>
                      {searchQuery
                        ? 'No clients match your search. Try a different search term or add a new client.'
                        : 'Get started by adding your first client. Choose from two convenient options:'}
                    </p>

                    {!searchQuery && (
                      <div className='grid grid-cols-2 gap-6 max-w-2xl mx-auto'>
                        <div className='bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors flex flex-col'>
                          <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 blur-xl opacity-50 rounded-full'></div>
                            <div className='bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 relative'>
                              <Plus className='w-6 h-6 text-blue-600' />
                            </div>
                          </div>
                          <h4 className='font-medium text-gray-900 mb-2'>Manual Entry</h4>
                          <p className='text-sm text-gray-500 mb-4 flex-grow'>
                            Perfect for when you have all the client details ready. Enter
                            information directly into our organized form.
                          </p>
                          <Button
                            onClick={() => {
                              resetClientForm();
                              setClientModalOpen(true);
                            }}
                            className='w-full bg-gray-900 hover:bg-gray-800 text-white'
                          >
                            Add Manually
                          </Button>
                        </div>

                        <div className='bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors flex flex-col'>
                          <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-r from-purple-100 to-purple-50 blur-xl opacity-50 rounded-full'></div>
                            <div className='bg-purple-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 relative'>
                              <Sparkles className='w-6 h-6 text-purple-600' />
                            </div>
                          </div>
                          <h4 className='font-medium text-gray-900 mb-2'>AI-Powered</h4>
                          <p className='text-sm text-gray-500 mb-4 flex-grow'>
                            Let AI help you create a client profile. Just describe your client in
                            natural language.
                          </p>
                          <Button
                            onClick={() => {
                              return setShowAiInput(true);
                            }}
                            className='w-full bg-gray-900 hover:bg-gray-800 text-white'
                          >
                            Use AI Assistant
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
                          key={client.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedClient === client.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            return setSelectedClient(client.id);
                          }}
                        >
                          <div className='flex justify-between items-start'>
                            <div>
                              <h3 className='font-medium text-gray-900'>{client.name}</h3>
                              <p className='text-sm text-gray-500'>{client.email}</p>
                              {client.phone && (
                                <p className='text-sm text-gray-500 mt-1'>{client.phone}</p>
                              )}
                            </div>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClient(client);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
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
              {isEditingClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <p className='text-sm text-gray-500 mt-1'>
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
            <TabsList className='grid grid-cols-4 mb-6'>
              <TabsTrigger value='contact'>Contact</TabsTrigger>
              <TabsTrigger value='billing'>Billing</TabsTrigger>
              <TabsTrigger value='shipping'>Shipping</TabsTrigger>
              <TabsTrigger value='more'>More</TabsTrigger>
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
                    <TabsContent value='contact' className='space-y-4 block'>
                      <div className='p-1'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <Label
                              htmlFor='client-name-modal'
                              className='block mb-1 text-sm font-medium text-gray-700'
                            >
                              Customer <span className='text-red-500'>*</span>
                            </Label>
                            <div className='relative'>
                              <Input
                                id='client-name-modal'
                                value={newClient.name}
                                onChange={(e) => {
                                  setNewClient({ ...newClient, name: e.target.value });
                                  setAiGeneratedFields(
                                    aiGeneratedFields.filter((f) => {
                                      return f !== 'name';
                                    }),
                                  );
                                }}
                                placeholder='Business or person'
                                required
                                className={
                                  (aiGeneratedFields.includes('name') ? 'pl-8 ' : '') + 'w-full'
                                }
                              />
                              {aiGeneratedFields.includes('name') && (
                                <Sparkles className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500' />
                              )}
                            </div>
                            {/* Error message example */}
                            {/* <p className='text-xs text-red-600 mt-1'>Enter a value.</p> */}
                          </div>
                          <div></div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <Label
                              htmlFor='client-email-modal'
                              className='block mb-1 text-sm font-medium text-gray-700'
                            >
                              Email
                            </Label>
                            <div className='relative'>
                              <Input
                                id='client-email-modal'
                                type='email'
                                value={newClient.email || ''}
                                onChange={(e) => {
                                  setNewClient({ ...newClient, email: e.target.value });
                                  setAiGeneratedFields(
                                    aiGeneratedFields.filter((f) => {
                                      return f !== 'email';
                                    }),
                                  );
                                }}
                                placeholder=''
                                className={
                                  aiGeneratedFields.includes('email') ? 'pl-8 w-full' : 'w-full'
                                }
                              />
                              {aiGeneratedFields.includes('email') && (
                                <Sparkles className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500' />
                              )}
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor='client-phone-modal'
                              className='block mb-1 text-sm font-medium text-gray-700'
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
                                  setAiGeneratedFields(
                                    aiGeneratedFields.filter((f) => {
                                      return f !== 'phone';
                                    }),
                                  );
                                }}
                                placeholder=''
                                className={
                                  aiGeneratedFields.includes('phone') ? 'pl-8 w-full' : 'w-full'
                                }
                              />
                              {aiGeneratedFields.includes('phone') && (
                                <Sparkles className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500' />
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className='block mb-1 text-sm font-medium text-gray-700'>
                            Contact
                          </Label>
                          <div className='grid grid-cols-2 gap-2'>
                            <Input placeholder='First name' className='italic' />
                            <Input placeholder='Last name' className='italic' />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                  {/* Billing Tab */}
                  {activeTab === 'billing' && (
                    <TabsContent value='billing' className='space-y-4 block'>
                      <div className='p-1'>
                        <Label className='block mb-1 text-sm font-medium text-gray-700'>
                          Billing address
                        </Label>
                        <div className='space-y-2'>
                          <Input placeholder='Address line 1' className='italic' />
                          <Input placeholder='Address line 2' className='italic' />
                          <div className='grid grid-cols-2 gap-2'>
                            <Input placeholder='City' className='italic' />
                            <Input placeholder='Postal/ZIP code' className='italic' />
                          </div>
                          <div className='grid grid-cols-2 gap-2'>
                            <Input placeholder='Country' className='italic' />
                            <Input placeholder='Province/State' className='italic' />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                  {/* Shipping Tab */}
                  {activeTab === 'shipping' && (
                    <TabsContent value='shipping' className='space-y-4 block'>
                      <div className='p-1'>
                        <Label className='block mb-1 text-sm font-medium text-gray-700'>
                          Shipping address
                        </Label>
                        <div className='flex items-center gap-2 mb-2'>
                          <input
                            type='checkbox'
                            className='accent-blue-600 w-4 h-4'
                            id='same-as-billing'
                            checked={shippingSameAsBilling}
                            onChange={(e) => {
                              return setShippingSameAsBilling(e.target.checked);
                            }}
                          />
                          <Label htmlFor='same-as-billing' className='text-gray-700'>
                            Same as billing address
                          </Label>
                        </div>
                        {!shippingSameAsBilling && (
                          <div className='space-y-2'>
                            <Input placeholder='Address line 1' className='italic' />
                            <Input placeholder='Address line 2' className='italic' />
                            <div className='grid grid-cols-2 gap-2'>
                              <Input placeholder='City' className='italic' />
                              <Input placeholder='Postal/ZIP code' className='italic' />
                            </div>
                            <div className='grid grid-cols-2 gap-2'>
                              <Input placeholder='Country' className='italic' />
                              <Input placeholder='Province/State' className='italic' />
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
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
                              Account number
                            </Label>
                            <Input className='w-full' />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
                              Fax
                            </Label>
                            <Input className='w-full' />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
                              Mobile
                            </Label>
                            <Input className='w-full' />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
                              Toll-free
                            </Label>
                            <Input className='w-full' />
                          </div>
                          <div className='col-span-2'>
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
                              Website
                            </Label>
                            <Input className='w-full' />
                          </div>
                        </div>
                        <div>
                          <Label className='block mb-1 text-sm font-medium text-gray-700'>
                            Internal notes
                          </Label>
                          <textarea
                            placeholder='Notes entered here will not be visible to your customer'
                            className='italic w-full rounded-lg border border-gray-200 px-3 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm resize-y bg-gray-50'
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
          return setActiveSection('comments');
        }}
        currentSection={2}
        totalSections={4}
        isDisabled={!selectedClient}
        disabledTooltip='Please select a client to continue'
      />
    </div>
  );
}
