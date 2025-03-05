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
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Download,
  Edit,
  MoreHorizontal,
  Package2,
  Plus,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock inventory data
const MOCK_INVENTORY = [
  {
    id: 1,
    name: 'Premium Web Hosting Plan',
    category: 'Digital Services',
    sku: 'WH-PREM-2024',
    price: 79.99,
    cost: 25.0,
    quantityAvailable: 'Unlimited',
    status: 'Active',
    lastUpdated: '2024-04-05',
    description: 'Premium web hosting plan with unlimited storage, bandwidth, and 24/7 support.',
  },
  {
    id: 2,
    name: 'Basic SEO Package',
    category: 'Digital Services',
    sku: 'SEO-BASIC-2024',
    price: 499.99,
    cost: 250.0,
    quantityAvailable: 'Limited',
    status: 'Active',
    lastUpdated: '2024-03-28',
    description:
      'Basic SEO package including keyword research, on-page optimization, and monthly reporting.',
  },
  {
    id: 3,
    name: 'Custom Logo Design',
    category: 'Design Services',
    sku: 'DES-LOGO-2024',
    price: 299.99,
    cost: 120.0,
    quantityAvailable: 15,
    status: 'Active',
    lastUpdated: '2024-04-10',
    description: 'Professional custom logo design with unlimited revisions and all source files.',
  },
  {
    id: 4,
    name: 'Enterprise CRM License',
    category: 'Software',
    sku: 'SW-CRM-ENT-2024',
    price: 1299.99,
    cost: 700.0,
    quantityAvailable: 8,
    status: 'Low Stock',
    lastUpdated: '2024-04-01',
    description: 'Annual enterprise CRM license with premium support and unlimited users.',
  },
  {
    id: 5,
    name: 'Social Media Management - Basic',
    category: 'Marketing Services',
    sku: 'SMM-BASIC-2024',
    price: 349.99,
    cost: 175.0,
    quantityAvailable: 20,
    status: 'Active',
    lastUpdated: '2024-04-12',
    description:
      'Monthly social media management package for 2 platforms with weekly posts and basic analytics.',
  },
  {
    id: 6,
    name: 'Mobile App Development - Standard',
    category: 'Development Services',
    sku: 'DEV-MOBILE-STD-2024',
    price: 7999.99,
    cost: 4500.0,
    quantityAvailable: 3,
    status: 'Low Stock',
    lastUpdated: '2024-03-15',
    description: 'Standard mobile app development package for iOS and Android with basic features.',
  },
  {
    id: 7,
    name: 'E-commerce Website Package',
    category: 'Development Services',
    sku: 'DEV-ECOM-2024',
    price: 4999.99,
    cost: 2200.0,
    quantityAvailable: 'Limited',
    status: 'Active',
    lastUpdated: '2024-04-08',
    description:
      'Complete e-commerce website with product management, payment processing, and basic SEO.',
  },
  {
    id: 8,
    name: 'Data Migration Service',
    category: 'IT Services',
    sku: 'IT-DATAMIG-2024',
    price: 2499.99,
    cost: 1200.0,
    quantityAvailable: 0,
    status: 'Out of Stock',
    lastUpdated: '2024-04-02',
    description:
      'Professional data migration service for databases and content management systems.',
  },
  {
    id: 9,
    name: 'IT Security Audit',
    category: 'IT Services',
    sku: 'IT-SECAUDIT-2024',
    price: 1799.99,
    cost: 900.0,
    quantityAvailable: 5,
    status: 'Active',
    lastUpdated: '2024-04-15',
    description:
      'Comprehensive IT security audit with detailed vulnerability report and remediation recommendations.',
  },
  {
    id: 10,
    name: 'Content Marketing Package',
    category: 'Marketing Services',
    sku: 'MKT-CONTENT-2024',
    price: 899.99,
    cost: 450.0,
    quantityAvailable: 10,
    status: 'Active',
    lastUpdated: '2024-03-30',
    description:
      'Monthly content marketing package including blog posts, social media content, and email newsletters.',
  },
];

export default function InventoryPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique categories for filter
  const categories = [...new Set(inventory.map((item) => {return item.category}))];

  // Function to handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter inventory based on search query, category and status filters
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.price).includes(searchQuery);

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort the filtered inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    // Handle different column types appropriately
    let comparison = 0;

    if (sortColumn === 'price' || sortColumn === 'cost') {
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

  // Function to handle inventory item deletion
  const handleDeleteItem = (itemId: number) => {
    setInventory(inventory.filter((item) => {return item.id !== itemId}));
  };

  // Function to render item status badge
  const renderStatusBadge = (status: string) => {
    let className = '';
    let icon = null;

    switch (status) {
      case 'Active':
        className = 'bg-green-100 text-green-800';
        break;
      case 'Low Stock':
        className = 'bg-amber-100 text-amber-800';
        icon = <AlertTriangle className='h-3 w-3 mr-1' />;
        break;
      case 'Out of Stock':
        className = 'bg-red-100 text-red-800';
        icon = <AlertTriangle className='h-3 w-3 mr-1' />;
        break;
      default:
        className = 'bg-slate-100 text-slate-800';
        break;
    }

    return (
      <Badge className={`${className} flex items-center`}>
        {icon}
        {status}
      </Badge>
    );
  };

  // Helper for column header with sorting
  const SortableColumnHeader = ({ column, label }: { column: string; label: string }) => {return (
    <div className='flex items-center cursor-pointer' onClick={() => {return handleSort(column)}}>
      {label}
      <ArrowUpDown className='ml-2 h-4 w-4' />
    </div>
  )};

  // Calculate profit margin for an item
  const calculateProfitMargin = (price: number, cost: number) => {
    const margin = ((price - cost) / price) * 100;
    return `${margin.toFixed(0)}%`;
  };

  return (
    <div className='container mx-auto py-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Inventory</h1>
          <p className='text-muted-foreground mt-1'>
            Manage your products, services, and stock levels
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button variant='outline'>
            <BarChart3 className='mr-2 h-4 w-4' />
            Analytics
          </Button>
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button asChild>
            <Link href='/inventory/new'>
              <Plus className='mr-2 h-4 w-4' />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search inventory...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => {return setSearchQuery(e.target.value)}}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className='w-full md:w-[200px]'>
            <SelectValue placeholder='Filter by category' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value='all'>All Categories</SelectItem>
              {categories.map((category) => {return (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              )})}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full md:w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value='Active'>Active</SelectItem>
              <SelectItem value='Low Stock'>Low Stock</SelectItem>
              <SelectItem value='Out of Stock'>Out of Stock</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Inventory table */}
      {sortedInventory.length > 0 ? (
        <div className='rounded-md border shadow-sm'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableColumnHeader column='name' label='Item' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='sku' label='SKU' />
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='category' label='Category' />
                </TableHead>
                <TableHead className='text-right'>
                  <SortableColumnHeader column='price' label='Price' />
                </TableHead>
                <TableHead className='text-right'>
                  <SortableColumnHeader column='cost' label='Cost' />
                </TableHead>
                <TableHead className='text-right'>
                  <div className='flex items-center justify-end'>Margin</div>
                </TableHead>
                <TableHead>
                  <div className='flex items-center'>Quantity</div>
                </TableHead>
                <TableHead>
                  <SortableColumnHeader column='status' label='Status' />
                </TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInventory.map((item) => {return (
                <TableRow key={item.id}>
                  <TableCell className='font-medium'>
                    <Link
                      href={`/inventory/${item.id}`}
                      className='hover:underline text-primary flex items-center'
                    >
                      <Package2 className='h-4 w-4 mr-2 text-muted-foreground' />
                      {item.name}
                    </Link>
                    <div className='text-xs text-muted-foreground mt-1 ml-6'>
                      {item.description.substring(0, 60)}...
                    </div>
                  </TableCell>
                  <TableCell className='font-mono text-xs'>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className='text-right font-medium'>${item.price.toFixed(2)}</TableCell>
                  <TableCell className='text-right text-muted-foreground'>
                    ${item.cost.toFixed(2)}
                  </TableCell>
                  <TableCell className='text-right font-semibold'>
                    {calculateProfitMargin(item.price, item.cost)}
                  </TableCell>
                  <TableCell>
                    {typeof item.quantityAvailable === 'number'
                      ? item.quantityAvailable
                      : item.quantityAvailable}
                  </TableCell>
                  <TableCell>{renderStatusBadge(item.status)}</TableCell>
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
                          <Link href={`/inventory/${item.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/inventory/${item.id}/edit`}>
                            <Edit className='h-4 w-4 mr-2' />
                            Edit Item
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {return handleDeleteItem(item.id)}}
                          className='text-destructive focus:text-destructive'
                        >
                          Delete Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className='text-center py-12'>
          <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4'>
            <Package2 className='h-6 w-6 text-muted-foreground' />
          </div>
          <h3 className='text-lg font-medium'>No inventory items found</h3>
          <p className='text-muted-foreground mt-2 mb-4'>
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? "Try adjusting your search or filters to find what you're looking for."
              : 'Get started by adding your first inventory item.'}
          </p>
          {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && (
            <Button asChild>
              <Link href='/inventory/new'>
                <Plus className='mr-2 h-4 w-4' />
                Add Item
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
