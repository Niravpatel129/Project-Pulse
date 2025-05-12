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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUpDown,
  Building2,
  Download,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Star,
  StarHalf,
  User,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';

// Remove mock customer data
const MOCK_CUSTOMERS: any[] = [];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
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

  const handleCreateCustomer = () => {
    if (!newCustomer.name) return;

    const newId = customers.length + 1;
    setCustomers([...customers, { ...newCustomer, id: newId }]);
    setCustomerModalOpen(false);
    resetCustomerForm();
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

  // Filter customers based on search query and status filter
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort the filtered customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    // Handle different column types appropriately
    let comparison = 0;

    if (sortColumn === 'totalSpent' || sortColumn === 'projects' || sortColumn === 'rating') {
      // Numeric comparison
      comparison =
        (a[sortColumn as keyof typeof a] as number) - (b[sortColumn as keyof typeof b] as number);
    } else {
      // String comparison
      const aValue = String(a[sortColumn as keyof typeof a]).toLowerCase();
      const bValue = String(b[sortColumn as keyof typeof b]).toLowerCase();
      comparison = aValue.localeCompare(bValue);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Function to handle customer deletion
  const handleDeleteCustomer = (customerId: number) => {
    setCustomers(
      customers.filter((customer) => {
        return customer.id !== customerId;
      }),
    );
  };

  // Function to render customer status badge
  const renderStatusBadge = (status: string) => {
    return (
      <Badge
        className={`${
          status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
        }`}
      >
        {status}
      </Badge>
    );
  };

  // Function to render customer rating
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className='h-4 w-4 fill-amber-400 text-amber-400' />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key='half' className='h-4 w-4 fill-amber-400 text-amber-400' />);
    }

    return <div className='flex items-center'>{stars}</div>;
  };

  // Helper for column header with sorting
  const SortableColumnHeader = ({ column, label }: { column: string; label: string }) => {
    return (
      <div
        className='flex items-center cursor-pointer'
        onClick={() => {
          return handleSort(column);
        }}
      >
        {label}
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </div>
    );
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
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full md:w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='Active'>Active</SelectItem>
              <SelectItem value='Inactive'>Inactive</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Customers table */}
      {sortedCustomers.length > 0 ? (
        <div className='rounded-md border shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableColumnHeader column='name' label='Customer' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='contactName' label='Contact' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='industry' label='Industry' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='type' label='Type' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='totalSpent' label='Total Spent' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='projects' label='Projects' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='rating' label='Rating' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='status' label='Status' />
                </TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.map((customer) => {
                return (
                  <TableRow key={customer.id}>
                    <TableCell className='font-medium'>
                      <Link
                        href={`/customers/${customer.id}`}
                        className='hover:underline text-primary flex items-center'
                      >
                        {customer.type === 'Enterprise' ? (
                          <Building2 className='h-4 w-4 mr-2 text-muted-foreground' />
                        ) : (
                          <UserRound className='h-4 w-4 mr-2 text-muted-foreground' />
                        )}
                        {customer.name}
                      </Link>
                      <div className='text-xs text-muted-foreground mt-1 ml-6'>
                        <div className='flex items-center'>
                          <MapPin className='h-3 w-3 mr-1' />
                          {customer.address.split(',')[0]}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{customer.contactName}</div>
                      <div className='text-xs text-muted-foreground flex items-center mt-1'>
                        <Mail className='h-3 w-3 mr-1' />
                        {customer.contactEmail}
                      </div>
                      <div className='text-xs text-muted-foreground flex items-center mt-1'>
                        <Phone className='h-3 w-3 mr-1' />
                        {customer.contactPhone}
                      </div>
                    </TableCell>
                    <TableCell>{customer.industry}</TableCell>
                    <TableCell>{customer.type}</TableCell>
                    <TableCell>${customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className='text-center'>{customer.projects}</TableCell>
                    <TableCell>{renderRating(customer.rating)}</TableCell>
                    <TableCell>{renderStatusBadge(customer.status)}</TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-8 w-8'>
                            <MoreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}/edit`}>Edit Customer</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/customers/${customer.id}/contact`}>Contact</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleDeleteCustomer(customer.id);
                            }}
                            className='text-destructive focus:text-destructive'
                          >
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
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
        </div>
      )}

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
