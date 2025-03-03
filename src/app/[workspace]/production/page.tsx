'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowUpDown,
  CheckCircle2,
  Clock4,
  Download,
  Factory,
  MoreHorizontal,
  Plus,
  Search,
  Timer,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock production data
const MOCK_PRODUCTION_ITEMS = [
  {
    id: 1,
    projectId: 101,
    projectName: 'Enterprise CRM Implementation',
    client: 'Acme Corporation',
    stage: 'In Production',
    startDate: '2024-04-15',
    dueDate: '2024-04-30',
    assignedTo: 'Michael Chen',
    priority: 'High',
    progress: 65,
    status: 'On Track',
    lastUpdated: '2 hours ago',
  },
  {
    id: 2,
    projectId: 102,
    projectName: 'E-commerce Platform Upgrade',
    client: 'Global Retail',
    stage: 'Quality Assurance',
    startDate: '2024-04-10',
    dueDate: '2024-04-25',
    assignedTo: 'Sarah Johnson',
    priority: 'Medium',
    progress: 80,
    status: 'On Track',
    lastUpdated: '1 day ago',
  },
  {
    id: 3,
    projectId: 103,
    projectName: 'Mobile App Development - iOS',
    client: 'QuickShop',
    stage: 'Initial Setup',
    startDate: '2024-04-18',
    dueDate: '2024-05-12',
    assignedTo: 'David Miller',
    priority: 'High',
    progress: 15,
    status: 'At Risk',
    lastUpdated: '3 days ago',
  },
  {
    id: 4,
    projectId: 104,
    projectName: 'Data Warehouse Migration',
    client: 'Financial Services Inc.',
    stage: 'Testing',
    startDate: '2024-04-05',
    dueDate: '2024-04-28',
    assignedTo: 'Jessica Taylor',
    priority: 'Critical',
    progress: 45,
    status: 'Delayed',
    lastUpdated: '4 hours ago',
  },
  {
    id: 5,
    projectId: 105,
    projectName: 'Website Redesign',
    client: 'TechSolutions',
    stage: 'Design Review',
    startDate: '2024-04-12',
    dueDate: '2024-05-05',
    assignedTo: 'Robert Clark',
    priority: 'Medium',
    progress: 30,
    status: 'On Track',
    lastUpdated: '1 day ago',
  },
  {
    id: 6,
    projectId: 106,
    projectName: 'Cloud Infrastructure Setup',
    client: 'Startup Ventures',
    stage: 'Completed',
    startDate: '2024-03-25',
    dueDate: '2024-04-15',
    assignedTo: 'Alex Wong',
    priority: 'High',
    progress: 100,
    status: 'Completed',
    lastUpdated: '2 days ago',
  },
];

// Production stages for filtering and kanban board
const PRODUCTION_STAGES = [
  'All Stages',
  'Initial Setup',
  'Design Review',
  'In Production',
  'Testing',
  'Quality Assurance',
  'Completed',
];

// Production stages for kanban (without 'All Stages')
const KANBAN_STAGES = PRODUCTION_STAGES.filter((stage) => stage !== 'All Stages');

// Type for production item
type ProductionItem = (typeof MOCK_PRODUCTION_ITEMS)[0];

// Sortable Item component using dnd-kit
function SortableProductionItem({ item }: { item: ProductionItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id.toString(),
    data: {
      type: 'production-item',
      item,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className='cursor-move shadow-sm transition-all'
      {...attributes}
      {...listeners}
    >
      <CardContent className='p-4 space-y-2'>
        <div className='flex justify-between items-start gap-2'>
          <Link
            href={`/dashboard/production/${item.id}`}
            className='font-medium text-sm line-clamp-2 hover:underline text-primary'
            onClick={(e) => e.stopPropagation()}
          >
            {item.projectName}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-6 w-6 -mt-1 -mr-1'>
                <MoreHorizontal className='h-3 w-3' />
                <span className='sr-only'>Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/production/${item.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/production/${item.id}/edit`}>Edit Item</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>{item.client}</span>
        </div>

        <div className='flex justify-between items-center gap-2'>
          <span className='text-xs font-medium'>{item.progress}%</span>
          <span className='text-xs text-muted-foreground'>
            {new Date(item.dueDate).toLocaleDateString()}
          </span>
        </div>

        <div className='w-full h-2 bg-secondary rounded-full overflow-hidden'>
          <div
            className={`h-full ${
              item.progress === 100
                ? 'bg-green-500'
                : item.progress > 60
                ? 'bg-blue-500'
                : item.progress > 30
                ? 'bg-amber-500'
                : 'bg-primary'
            }`}
            style={{ width: `${item.progress}%` }}
          />
        </div>

        <div className='flex justify-between items-center pt-2'>
          <span className='text-xs'>
            <Badge
              className={`${
                item.status === 'Completed'
                  ? 'bg-green-100 text-green-800'
                  : item.status === 'On Track'
                  ? 'bg-blue-100 text-blue-800'
                  : item.status === 'At Risk'
                  ? 'bg-amber-100 text-amber-800'
                  : item.status === 'Delayed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-slate-100 text-slate-800'
              } flex items-center`}
            >
              {item.status === 'Completed' && <CheckCircle2 className='h-3 w-3 mr-1' />}
              {item.status === 'On Track' && <Timer className='h-3 w-3 mr-1' />}
              {(item.status === 'At Risk' || item.status === 'Delayed') && (
                <Clock4 className='h-3 w-3 mr-1' />
              )}
              {item.status}
            </Badge>
          </span>

          <div className='flex items-center gap-1'>
            <span
              className={`w-2 h-2 rounded-full ${
                item.priority === 'Critical'
                  ? 'bg-red-500'
                  : item.priority === 'High'
                  ? 'bg-amber-500'
                  : item.priority === 'Medium'
                  ? 'bg-blue-500'
                  : 'bg-green-500'
              }`}
            ></span>
            <span className='text-xs'>{item.priority}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductionTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All Stages');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [productionItems, setProductionItems] = useState(MOCK_PRODUCTION_ITEMS);
  const [sortColumn, setSortColumn] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeItem, setActiveItem] = useState<ProductionItem | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after moving 5px
      },
    }),
  );

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter production items
  const filteredItems = productionItems.filter((item) => {
    const matchesSearch =
      item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === 'All Stages' || item.stage === stageFilter;

    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && item.stage !== 'Completed') ||
      (activeTab === 'completed' && item.stage === 'Completed');

    return matchesSearch && matchesStage && matchesPriority && matchesTab;
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;

    if (sortColumn === 'progress' || sortColumn === 'priority') {
      // For numeric comparison
      if (sortColumn === 'priority') {
        // Convert priority to numeric value for sorting
        const priorityValues = { Low: 1, Medium: 2, High: 3, Critical: 4 };
        comparison =
          (priorityValues[a[sortColumn as keyof typeof a] as keyof typeof priorityValues] || 0) -
          (priorityValues[b[sortColumn as keyof typeof b] as keyof typeof priorityValues] || 0);
      } else {
        comparison =
          (a[sortColumn as keyof typeof a] as number) - (b[sortColumn as keyof typeof b] as number);
      }
    } else if (sortColumn === 'dueDate' || sortColumn === 'startDate') {
      // For date comparison
      comparison =
        new Date(a[sortColumn as keyof typeof a] as string).getTime() -
        new Date(b[sortColumn as keyof typeof b] as string).getTime();
    } else {
      // For string comparison
      const aValue = String(a[sortColumn as keyof typeof a]).toLowerCase();
      const bValue = String(b[sortColumn as keyof typeof b]).toLowerCase();
      comparison = aValue.localeCompare(bValue);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Get items for each stage in kanban view
  const getItemsByStage = (stage: string) => {
    return productionItems.filter(
      (item) =>
        item.stage === stage &&
        (searchQuery === '' ||
          item.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (priorityFilter === 'All' || item.priority === priorityFilter) &&
        (activeTab === 'all' ||
          (activeTab === 'active' && item.stage !== 'Completed') ||
          (activeTab === 'completed' && item.stage === 'Completed')),
    );
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id.toString();
    const foundItem = productionItems.find((item) => item.id.toString() === id);
    if (foundItem) {
      setActiveItem(foundItem);
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeItemId = active.id.toString();
    const overId = over.id.toString();

    if (activeItemId === overId) return;

    // If the over element is a stage container, not an item
    if (KANBAN_STAGES.includes(overId)) {
      const activeItem = productionItems.find((item) => item.id.toString() === activeItemId);

      if (activeItem && activeItem.stage !== overId) {
        setProductionItems((items) =>
          items.map((item) =>
            item.id.toString() === activeItemId ? { ...item, stage: overId } : item,
          ),
        );
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeItemId = active.id.toString();
    const overId = over.id.toString();

    // Handle dropping an item over a stage
    if (KANBAN_STAGES.includes(overId)) {
      setProductionItems((items) =>
        items.map((item) =>
          item.id.toString() === activeItemId ? { ...item, stage: overId } : item,
        ),
      );
    }

    setActiveItem(null);
  };

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    let className = '';
    let icon = null;

    switch (status) {
      case 'Completed':
        className = 'bg-green-100 text-green-800';
        icon = <CheckCircle2 className='h-3 w-3 mr-1' />;
        break;
      case 'On Track':
        className = 'bg-blue-100 text-blue-800';
        icon = <Timer className='h-3 w-3 mr-1' />;
        break;
      case 'At Risk':
        className = 'bg-amber-100 text-amber-800';
        icon = <Clock4 className='h-3 w-3 mr-1' />;
        break;
      case 'Delayed':
        className = 'bg-red-100 text-red-800';
        icon = <Clock4 className='h-3 w-3 mr-1' />;
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

  // Function to render priority indicator
  const renderPriorityIndicator = (priority: string) => {
    let className = '';

    switch (priority) {
      case 'Critical':
        className = 'bg-red-500';
        break;
      case 'High':
        className = 'bg-amber-500';
        break;
      case 'Medium':
        className = 'bg-blue-500';
        break;
      case 'Low':
        className = 'bg-green-500';
        break;
      default:
        className = 'bg-slate-500';
    }

    return (
      <div className='flex items-center'>
        <span className={`w-2 h-2 rounded-full mr-2 ${className}`}></span>
        {priority}
      </div>
    );
  };

  // Function to render progress bar
  const renderProgressBar = (progress: number) => (
    <div className='w-full h-2 bg-secondary rounded-full overflow-hidden'>
      <div
        className={`h-full ${
          progress === 100
            ? 'bg-green-500'
            : progress > 60
            ? 'bg-blue-500'
            : progress > 30
            ? 'bg-amber-500'
            : 'bg-primary'
        }`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  // Helper for sortable column headers
  const SortableColumnHeader = ({ column, label }: { column: string; label: string }) => (
    <div className='flex items-center cursor-pointer' onClick={() => handleSort(column)}>
      {label}
      <ArrowUpDown className='ml-2 h-4 w-4' />
    </div>
  );

  return (
    <div className='container mx-auto py-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Production Tracking</h1>
          <p className='text-muted-foreground mt-1'>
            Monitor and manage production status of your client projects
          </p>
        </div>
        <div className='flex space-x-2 mt-4 md:mt-0'>
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Production Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue='all' className='mb-6' onValueChange={setActiveTab}>
        <div className='flex justify-between items-center'>
          <TabsList>
            <TabsTrigger value='all'>All Items</TabsTrigger>
            <TabsTrigger value='active'>Active</TabsTrigger>
            <TabsTrigger value='completed'>Completed</TabsTrigger>
          </TabsList>

          <div className='flex border rounded-md overflow-hidden'>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              className='rounded-none px-3'
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size='sm'
              className='rounded-none px-3'
              onClick={() => setViewMode('kanban')}
            >
              Kanban Board
            </Button>
          </div>
        </div>
      </Tabs>

      {/* Filters and search */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search projects, clients, or team members...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {viewMode === 'list' && (
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className='w-full md:w-[180px]'>
              <SelectValue placeholder='Filter by stage' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='All Stages'>All Stages</SelectItem>
                {PRODUCTION_STAGES.filter((stage) => stage !== 'All Stages').map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className='w-full md:w-[160px]'>
            <SelectValue placeholder='Priority' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='All'>All Priorities</SelectItem>
              <SelectItem value='Critical'>Critical</SelectItem>
              <SelectItem value='High'>High</SelectItem>
              <SelectItem value='Medium'>Medium</SelectItem>
              <SelectItem value='Low'>Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {sortedItems.length > 0 ? (
            <Card>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SortableColumnHeader column='projectName' label='Project' />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader column='client' label='Client' />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader column='stage' label='Stage' />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader column='assignedTo' label='Assigned To' />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader column='priority' label='Priority' />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader column='dueDate' label='Due Date' />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader column='progress' label='Progress' />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader column='status' label='Status' />
                      </TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className='font-medium'>
                          <Link
                            href={`/dashboard/production/${item.id}`}
                            className='hover:underline text-primary'
                          >
                            {item.projectName}
                          </Link>
                        </TableCell>
                        <TableCell>{item.client}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.stage === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : item.stage === 'In Production'
                                ? 'bg-blue-100 text-blue-800'
                                : item.stage === 'Testing' || item.stage === 'Quality Assurance'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {item.stage}
                          </span>
                        </TableCell>
                        <TableCell>{item.assignedTo}</TableCell>
                        <TableCell>{renderPriorityIndicator(item.priority)}</TableCell>
                        <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='text-xs flex justify-between'>
                              <span>{item.progress}%</span>
                            </div>
                            {renderProgressBar(item.progress)}
                          </div>
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
                                <Link href={`/dashboard/production/${item.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/production/${item.id}/edit`}>
                                  Edit Item
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/projects/${item.projectId}`}>
                                  View Source Project
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className='text-destructive focus:text-destructive'>
                                Delete Item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className='text-center py-12'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4'>
                <Factory className='h-6 w-6 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-medium'>No production items found</h3>
              <p className='text-muted-foreground mt-2 mb-4'>
                {searchQuery || stageFilter !== 'All Stages' || priorityFilter !== 'All'
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : 'Get started by creating your first production item.'}
              </p>
              {!searchQuery && stageFilter === 'All Stages' && priorityFilter === 'All' && (
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  New Production Item
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Kanban Board View with DND Kit */}
      {viewMode === 'kanban' && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
            {KANBAN_STAGES.map((stage) => {
              const stageItems = getItemsByStage(stage);
              return (
                <div key={stage} id={stage} className='flex flex-col h-full'>
                  <div className='flex items-center justify-between px-3 py-2 bg-muted/60 rounded-t-lg border border-border'>
                    <h3 className='font-medium text-sm'>{stage}</h3>
                    <span className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary/10'>
                      {stageItems.length}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex-1 p-2 rounded-b-lg border border-t-0 border-border overflow-y-auto max-h-[calc(100vh-300px)] min-h-[300px]',
                    )}
                  >
                    <SortableContext
                      items={stageItems.map((item) => item.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      {stageItems.length > 0 ? (
                        <div className='grid gap-2'>
                          {stageItems.map((item) => (
                            <SortableProductionItem key={item.id} item={item} />
                          ))}
                        </div>
                      ) : (
                        <div className='h-full flex items-center justify-center'>
                          <p className='text-xs text-muted-foreground'>No items</p>
                        </div>
                      )}
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>

          <DragOverlay>
            {activeItem ? (
              <Card className='cursor-move shadow-md opacity-80'>
                <CardContent className='p-4 space-y-2'>
                  <div className='flex justify-between items-start gap-2'>
                    <div className='font-medium text-sm line-clamp-2 text-primary'>
                      {activeItem.projectName}
                    </div>
                    <Button variant='ghost' size='icon' className='h-6 w-6 -mt-1 -mr-1'>
                      <MoreHorizontal className='h-3 w-3' />
                    </Button>
                  </div>

                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span>{activeItem.client}</span>
                  </div>

                  <div className='flex justify-between items-center gap-2'>
                    <span className='text-xs font-medium'>{activeItem.progress}%</span>
                    <span className='text-xs text-muted-foreground'>
                      {new Date(activeItem.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  {renderProgressBar(activeItem.progress)}

                  <div className='flex justify-between items-center pt-2'>
                    <span className='text-xs'>{renderStatusBadge(activeItem.status)}</span>

                    <div className='flex items-center gap-1'>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeItem.priority === 'Critical'
                            ? 'bg-red-500'
                            : activeItem.priority === 'High'
                            ? 'bg-amber-500'
                            : activeItem.priority === 'Medium'
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                        }`}
                      ></span>
                      <span className='text-xs'>{activeItem.priority}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Analytics summary cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Active Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {productionItems.filter((item) => item.stage !== 'Completed').length}
            </div>
            <p className='text-xs text-muted-foreground'>
              Across {productionItems.length} total items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-amber-600'>
              {productionItems.filter((item) => item.status === 'At Risk').length}
            </div>
            <p className='text-xs text-muted-foreground'>Items requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Due This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>3</div>
            <p className='text-xs text-muted-foreground'>2 on track, 1 delayed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Avg. Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>14.3 days</div>
            <p className='text-xs text-muted-foreground'>-2.5 days from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
