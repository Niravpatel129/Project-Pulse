'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/contexts/AuthContext';
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
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Remove mock customer data
const MOCK_CUSTOMERS: any[] = [];

export default function CustomersPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
          <Button asChild>
            <Link href='/customers/new'>
              <Plus className='mr-2 h-4 w-4' />
              New Customer
            </Link>
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
          {!searchQuery && statusFilter === 'all' && (
            <Button asChild>
              <Link href='/customers/new'>
                <Plus className='mr-2 h-4 w-4' />
                New Customer
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
