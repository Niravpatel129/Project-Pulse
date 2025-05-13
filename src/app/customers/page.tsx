'use client';

import { Badge } from '@/components/ui/badge';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useClients } from '@/hooks/useClients';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Edit,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserRound,
} from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
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
  const { clients: apiClients, isLoading: isLoadingClients } = useClients();
  const queryClient = useQueryClient();

  useLayoutEffect(() => {
    if (tabContentRef.current) {
      setTabContentHeight(tabContentRef.current.scrollHeight);
    }
  }, [activeTab, customerModalOpen]);

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
      setCustomerModalOpen(false);
      resetCustomerForm();
      toast.success('Customer added successfully');
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

    createClientMutation.mutate(clientData);
  };

  // Function to handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter clients based on search query and status filter
  const filteredClients = apiClients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      client.user.name.toLowerCase().includes(searchLower) ||
      client.user.email?.toLowerCase().includes(searchLower) ||
      client.contact?.firstName?.toLowerCase().includes(searchLower) ||
      client.contact?.lastName?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort the filtered clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === 'totalSpent' || sortColumn === 'projects' || sortColumn === 'rating') {
      comparison = (a[sortColumn] || 0) - (b[sortColumn] || 0);
    } else {
      const aValue = String(a[sortColumn] || '').toLowerCase();
      const bValue = String(b[sortColumn] || '').toLowerCase();
      comparison = aValue.localeCompare(bValue);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const handleEditClient = (client: any) => {
    setNewCustomer({
      name: client.user.name,
      contactName: `${client.contact?.firstName || ''} ${client.contact?.lastName || ''}`.trim(),
      contactEmail: client.user.email || '',
      contactPhone: client.phone || '',
      industry: client.industry || '',
      type: client.type || 'Individual',
      totalSpent: client.totalSpent || 0,
      projects: client.projects || 0,
      rating: client.rating || 0,
      status: client.status || 'Active',
      address: {
        street: client.address?.street || '',
        city: client.address?.city || '',
        state: client.address?.state || '',
        country: client.address?.country || '',
        zip: client.address?.zip || '',
      },
      shippingAddress: {
        street: client.shippingAddress?.street || '',
        city: client.shippingAddress?.city || '',
        state: client.shippingAddress?.state || '',
        country: client.shippingAddress?.country || '',
        zip: client.shippingAddress?.zip || '',
      },
      website: client.website || '',
      internalNotes: client.internalNotes || '',
    });
    setCustomerModalOpen(true);
  };

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await newRequest.delete(`/clients/${clientId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully');
    },
  });

  const handleDeleteClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  return (
    <div className='container mx-auto py-8 bg-background'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Customers</h1>
          <p className='text-muted-foreground mt-1'>
            Manage your customer relationships and track engagement
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button
            onClick={() => {
              return setCustomerModalOpen(true);
            }}
          >
            <Plus className='mr-2 h-4 w-4' />
            New Customer
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search customers...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Customers list */}
      <div className='space-y-3'>
        {isLoadingClients ? (
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium'>Loading customers...</h3>
          </div>
        ) : sortedClients.length === 0 ? (
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4'>
              <UserRound className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium'>No customers found</h3>
            <p className='text-muted-foreground mt-2 mb-4'>
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your search or filter to find what you're looking for."
                : 'Get started by adding your first customer.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button
                onClick={() => {
                  return setCustomerModalOpen(true);
                }}
              >
                <Plus className='mr-2 h-4 w-4' />
                New Customer
              </Button>
            )}
          </div>
        ) : (
          sortedClients.map((client) => {
            return (
              <motion.div
                key={client._id}
                className='border border-[#232428] rounded-xl p-4 transition-all duration-200 ease-in-out hover:border-[#2A2A2F] group bg-[#141414] shadow-sm hover:shadow-md hover:translate-y-[-1px] relative'
              >
                {/* Action buttons */}
                <div className='absolute top-2 right-2 flex space-x-1'>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            handleEditClient(client);
                          }}
                          className='p-1.5 rounded-full bg-[#232428] text-[#8C8C8C] hover:bg-[#2A2A2F] hover:text-[#fafafa] opacity-0 group-hover:opacity-100 transition-all duration-200'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side='top'
                        className='bg-[#141414] border-[#232428] text-[#fafafa]'
                      >
                        <p>Edit customer</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={(e) => {
                            handleDeleteClient(client._id, e);
                          }}
                          className='p-1.5 rounded-full bg-[#232428] text-[#8C8C8C] hover:bg-[#411D23] hover:text-[#F43F5E] opacity-0 group-hover:opacity-100 transition-all duration-200'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        side='top'
                        className='bg-[#141414] border-[#232428] text-[#fafafa]'
                      >
                        <p>Delete customer</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className='flex justify-between items-start'>
                  <div className='flex items-start flex-1'>
                    <div className='flex-1'>
                      <div className='group/item'>
                        <div className='flex flex-col'>
                          <div className='flex items-center'>
                            <span className='text-[#fafafa] text-[14px] font-semibold group-hover/item:text-white transition-colors'>
                              {client.user.name}
                            </span>
                            {client.type === 'Enterprise' && (
                              <span className='ml-2 text-xs font-medium bg-[#232428] text-[#8C8C8C] rounded-full px-2 py-0.5'>
                                Enterprise
                              </span>
                            )}
                          </div>

                          <div className='mt-2 flex flex-wrap items-center gap-2'>
                            {client.contact?.firstName && client.contact?.lastName && (
                              <div className='text-xs text-[#8C8C8C]'>
                                {client.contact.firstName} {client.contact.lastName}
                              </div>
                            )}
                            {client.user.email && (
                              <div className='text-xs text-[#8C8C8C] flex items-center'>
                                <Mail className='h-3 w-3 mr-1' />
                                {client.user.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className='text-xs text-[#8C8C8C] flex items-center'>
                                <Phone className='h-3 w-3 mr-1' />
                                {client.phone}
                              </div>
                            )}
                            {client.address?.city && client.address?.country && (
                              <div className='text-xs text-[#8C8C8C] flex items-center'>
                                <MapPin className='h-3 w-3 mr-1' />
                                {client.address.city}, {client.address.country}
                              </div>
                            )}
                          </div>

                          <div className='mt-3 flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              {client.website && (
                                <div className='text-xs text-[#8C8C8C] flex items-center'>
                                  <Globe className='h-3 w-3 mr-1' />
                                  {client.website}
                                </div>
                              )}
                              {client.status && (
                                <Badge
                                  className={`${
                                    client.status === 'Active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {client.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Customer Modal */}
      <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
        <DialogContent className='sm:max-w-[600px] bg-[#141414] border-[#232428]'>
          <DialogHeader>
            <DialogTitle className='flex items-center text-lg font-semibold text-[#fafafa]'>
              <div className='mr-2 p-1.5 bg-[#232428] rounded-full'>
                <User size={18} className='text-[#8b5df8]' />
              </div>
              Add New Customer
            </DialogTitle>
            <p className='text-sm text-[#8C8C8C] mt-1'>
              Fill in your customer information below. Required fields are marked with an asterisk
              (*).
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
                              htmlFor='customer-name'
                              className='block mb-1 text-sm font-medium text-[#fafafa]'
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
                                className='w-full bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                              />
                            </div>
                          </div>
                          <div className='grid grid-cols-2 gap-5'>
                            <div>
                              <Label
                                htmlFor='customer-email'
                                className='block mb-1 text-sm font-medium text-[#fafafa]'
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
                                htmlFor='customer-phone'
                                className='block mb-1 text-sm font-medium text-[#fafafa]'
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
                                  className='w-full bg-[#141414] border-[#232428] text-[#fafafa]'
                                />
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
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
                                className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
                              />
                            </div>
                          </div>
                          <div>
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
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
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                              className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2 mb-2 p-1'>
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
                                  className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                                  className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                                  className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                                  className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                                  className='bg-[#141414] border-[#232428] text-[#fafafa] placeholder:text-[#8C8C8C]'
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
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                              Customer Type
                            </Label>
                            <div className='p-1'>
                              <Select
                                value={newCustomer.type}
                                onValueChange={(value) => {
                                  return setNewCustomer({ ...newCustomer, type: value });
                                }}
                              >
                                <SelectTrigger className='bg-[#141414] border-[#232428] text-[#fafafa]'>
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
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
                              Status
                            </Label>
                            <div className='p-1'>
                              <Select
                                value={newCustomer.status}
                                onValueChange={(value) => {
                                  return setNewCustomer({ ...newCustomer, status: value });
                                }}
                              >
                                <SelectTrigger className='bg-[#141414] border-[#232428] text-[#fafafa]'>
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
                            <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
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
                                className='bg-[#141414] border-[#232428] text-[#fafafa]'
                              />
                            </div>
                          </div>
                        </div>
                        <div className='mt-5'>
                          <Label className='block mb-1 text-sm font-medium text-[#fafafa]'>
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
                setCustomerModalOpen(false);
                resetCustomerForm();
              }}
              className='border-[#232428] text-[#fafafa] hover:bg-[#232428]'
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCustomer}
              className='bg-[#8b5df8] hover:bg-[#7c3aed] text-white'
              disabled={!newCustomer.name}
            >
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
