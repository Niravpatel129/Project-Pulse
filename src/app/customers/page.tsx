'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useClients } from '@/hooks/useClients';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Plus, Search, UserRound } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AddCustomerDialog } from './components/AddCustomerDialog';

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
    <div className='flex flex-col h-full w-full mt-2'>
      <div className='flex items-center justify-between px-4 py-2 border-b border-[#E4E4E7] dark:border-[#232428]'>
        <div className='flex items-center gap-2'>
          <h1 className='text-lg font-semibold text-[#3F3F46] dark:text-white'>Customers</h1>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='bg-[#F4F4F5] dark:bg-[#232323] border-[#E4E4E7] dark:border-[#333] text-[#3F3F46] dark:text-white text-sm h-8 px-4'
            onClick={() => {
              setCustomerModalOpen(true);
            }}
          >
            <Plus className='w-4 h-4 mr-2' />
            Add Customer
          </Button>
        </div>
      </div>

      <div className='px-4 py-2'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3F3F46]/60 dark:text-[#8C8C8C]' />
          <Input
            type='text'
            placeholder='Search customers...'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
            className='w-full pl-9 bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C] focus-visible:ring-1 focus-visible:ring-[#3F3F46]/60 dark:focus-visible:ring-[#8C8C8C]'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-1 scrollbar-hide'>
        <div className='px-3'>
          <div className='grid grid-cols-12 gap-4 py-2 text-sm font-medium text-[#3F3F46]/60 dark:text-[#8C8C8C] border-b border-[#E4E4E7] dark:border-[#232428]'>
            <div
              className='col-span-4 cursor-pointer'
              onClick={() => {
                return handleSort('name');
              }}
            >
              Name
            </div>
            <div
              className='col-span-3 cursor-pointer'
              onClick={() => {
                return handleSort('contact');
              }}
            >
              Contact
            </div>
            <div
              className='col-span-2 cursor-pointer'
              onClick={() => {
                return handleSort('totalSpent');
              }}
            >
              Total Spent
            </div>
          </div>

          {isLoadingClients ? (
            <div className='flex items-center justify-center h-32'>
              <Loader2 className='w-6 h-6 text-[#3F3F46]/60 dark:text-[#8C8C8C] animate-spin' />
            </div>
          ) : sortedClients.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-32 text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
              <p className='text-lg'>No customers found</p>
              <p className='text-sm mt-2'>Add your first customer to get started</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {sortedClients.map((client) => {
                return (
                  <div
                    key={client._id}
                    className='grid grid-cols-12 gap-4 py-3 text-sm border-b border-[#E4E4E7] dark:border-[#232428] hover:bg-[#F4F4F5] dark:hover:bg-[#252525] transition-colors'
                  >
                    <div className='col-span-4'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-[#E4E4E7] dark:bg-[#373737] flex items-center justify-center text-[#3F3F46] dark:text-[#9f9f9f]'>
                          <UserRound className='w-4 h-4' />
                        </div>
                        <div>
                          <div className='font-medium text-[#3F3F46] dark:text-white'>
                            {client.user.name}
                          </div>
                          <div className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs'>
                            {client.industry || 'No industry'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='col-span-3'>
                      <div className='flex flex-col'>
                        <div className='text-[#3F3F46] dark:text-white'>
                          {client.contact?.firstName} {client.contact?.lastName}
                        </div>
                        <div className='text-[#3F3F46]/60 dark:text-[#8C8C8C] text-xs'>
                          {client.user.email || 'No email'}
                        </div>
                      </div>
                    </div>
                    <div className='col-span-2 text-[#3F3F46] dark:text-white'>
                      {client.totalSpent?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0.00'}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      <AddCustomerDialog open={customerModalOpen} onOpenChange={setCustomerModalOpen} />
    </div>
  );
}
