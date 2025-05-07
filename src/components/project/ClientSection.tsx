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
import { useClients } from '@/hooks/useClients';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  clients: propClients,
  selectedClient,
  setSelectedClient,
  setActiveSection,
}: ClientSectionProps) {
  const queryClient = useQueryClient();
  const { clients: apiClients, isLoading: isLoadingClients } = useClients();
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'billing' | 'shipping' | 'more'>(
    'contact',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [aiInput, setAiInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiGeneratedFields, setAiGeneratedFields] = useState<string[]>([]);
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
    setAttachments([]);
    setAiError(null);
    setAiGeneratedFields([]);
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

  const handleAiGenerate = () => {
    setIsAiGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      // Example AI-generated data - in real app, this would come from an AI service
      const aiGeneratedClient = {
        user: {
          name: 'Acme Corporation',
          email: 'contact@acmecorp.com',
        } as Client['user'],
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Business Ave',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zip: '94105',
        },
        taxId: 'TAX123456789',
        customFields: {},
      };
      setNewClient(aiGeneratedClient);
      setAiGeneratedFields([
        'user.name',
        'user.email',
        'phone',
        'address.street',
        'address.city',
        'address.state',
        'address.country',
        'address.zip',
        'taxId',
      ]);
      setClientModalOpen(true);
      setShowAiInput(false);
      setIsAiGenerating(false);
    }, 1500);
  };

  const filteredClients = apiClients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.user.name.toLowerCase().includes(searchLower) ||
      client.user.email.toLowerCase().includes(searchLower)
    );
  });

  const removeAttachment = (attachment: Attachment) => {
    setAttachments(
      attachments.filter((a) => {
        return a.id !== attachment.id;
      }),
    );
  };

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
            {apiClients.length > 0 && (
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
                    <h3 className='mt-2 text-xl font-semibold text-gray-900 mb-3'>
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
                          key={client._id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedClient === client._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            return setSelectedClient(client._id);
                          }}
                        >
                          <div className='flex justify-between items-start'>
                            <div className='space-y-1'>
                              <h3 className='font-medium text-gray-900'>{client.user.name}</h3>
                              <div className='space-y-0.5'>
                                {client.contact?.firstName && client.contact?.lastName && (
                                  <p className='text-sm text-gray-500'>
                                    {client.contact.firstName} {client.contact.lastName}
                                  </p>
                                )}
                                {client.user.email ? (
                                  <p className='text-sm text-gray-500'>{client.user.email}</p>
                                ) : (
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='text-sm text-blue-600 hover:text-blue-700 p-0 h-auto'
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
                                  <p className='text-sm text-gray-500'>{client.phone}</p>
                                )}
                                {client.address?.city && client.address?.country && (
                                  <p className='text-sm text-gray-500'>
                                    {client.address.city}, {client.address.country}
                                  </p>
                                )}
                                {client.website && (
                                  <p className='text-sm text-gray-500'>{client.website}</p>
                                )}
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              {client.accountNumber && (
                                <span className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
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
                              >
                                Edit
                              </Button>
                            </div>
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
                    <TabsContent value='contact' className='space-y-6 block'>
                      <div className='p-1'>
                        <div className='space-y-5'>
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
                                value={newClient.user?.name || ''}
                                onChange={(e) => {
                                  setNewClient({
                                    ...newClient,
                                    user: { ...newClient.user, name: e.target.value },
                                  });
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
                          </div>
                          <div className='grid grid-cols-2 gap-5'>
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
                                  value={newClient.user?.email || ''}
                                  onChange={(e) => {
                                    setNewClient({
                                      ...newClient,
                                      user: { ...newClient.user, email: e.target.value },
                                    });
                                    setAiGeneratedFields(
                                      aiGeneratedFields.filter((f) => {
                                        return f !== 'email';
                                      }),
                                    );
                                    if (emailError) setEmailError(null);
                                  }}
                                  onBlur={handleEmailBlur}
                                  placeholder=''
                                  className={`${
                                    aiGeneratedFields.includes('email') ? 'pl-8 ' : ''
                                  }w-full ${emailError ? 'border-red-500 focus:ring-red-200' : ''}`}
                                />
                                {aiGeneratedFields.includes('email') && (
                                  <Sparkles className='absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500' />
                                )}
                                {emailError && (
                                  <p className='absolute -bottom-5 left-0 text-xs text-red-400'>
                                    {emailError}
                                  </p>
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
                              <Input
                                placeholder='First name'
                                value={newClient.contact?.firstName || ''}
                                onChange={(e) => {
                                  return setNewClient({
                                    ...newClient,
                                    contact: { ...newClient.contact, firstName: e.target.value },
                                  });
                                }}
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
                        <Label className='block mb-1 text-sm font-medium text-gray-700'>
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
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
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
                            />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
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
                            />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
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
                            />
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
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
                            />
                          </div>
                          <div className='col-span-2'>
                            <Label className='block mb-1 text-sm font-medium text-gray-700'>
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
                            />
                          </div>
                        </div>
                        <div className='mt-5'>
                          <Label className='block mb-1 text-sm font-medium text-gray-700'>
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
      />
    </div>
  );
}
