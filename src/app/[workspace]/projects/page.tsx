'use client';

import { PipelineSettings } from '@/components/projects/PipelineSettings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Clock4,
  Download,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Fallback mock data in case API fails
const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Enterprise CRM Implementation',
    client: 'Acme Corporation',
    type: 'Software Implementation',
    leadSource: 'Industry Conference',
    stage: 'Proposal',
    startDate: '2023-09-15',
    endDate: '2024-03-30',
    teamSize: 6,
    manager: 'Sarah Johnson',
    lastUpdated: '2 hours ago',
    progress: 65,
    status: 'On Track',
    description:
      'Implementation of enterprise-wide CRM solution with custom integrations to existing ERP system.',
  },
  {
    id: 2,
    name: 'Mobile App Development - Retail',
    client: 'Fashion Forward Inc.',
    type: 'Mobile Development',
    leadSource: 'Website Inquiry',
    stage: 'Needs Analysis',
    startDate: '2023-11-01',
    endDate: '2024-04-15',
    teamSize: 8,
    manager: 'David Chen',
    lastUpdated: '1 day ago',
    progress: 25,
    status: 'At Risk',
    description:
      'Development of iOS and Android retail application with AR try-on features and loyalty program integration.',
  },
  {
    id: 3,
    name: 'Digital Transformation Strategy',
    client: 'Midwest Healthcare Group',
    type: 'Consulting',
    leadSource: 'Referral',
    stage: 'Closed Won',
    startDate: '2023-06-10',
    endDate: '2023-12-20',
    teamSize: 5,
    manager: 'Maria Rodriguez',
    lastUpdated: '3 days ago',
    progress: 100,
    status: 'Completed',
    description:
      'Strategic consulting to modernize healthcare provider systems, improve patient experience, and optimize operational workflows.',
  },
  {
    id: 4,
    name: 'Data Warehouse Migration',
    client: 'Global Financial Services',
    type: 'Data Engineering',
    leadSource: 'Previous Client',
    stage: 'Negotiation',
    startDate: '2024-01-15',
    endDate: '2024-08-31',
    teamSize: 12,
    manager: 'Robert Jackson',
    lastUpdated: '1 week ago',
    progress: 40,
    status: 'On Track',
    description:
      'Migration of legacy data warehouse to cloud-based solution with real-time analytics capabilities and enhanced security features.',
  },
  {
    id: 5,
    name: 'Cybersecurity Audit & Remediation',
    client: 'National Retail Chain',
    type: 'Security',
    leadSource: 'Marketing Campaign',
    stage: 'Initial Contact',
    startDate: '2024-03-01',
    endDate: '2024-05-30',
    teamSize: 4,
    manager: 'Emily Taylor',
    lastUpdated: '2 days ago',
    progress: 0,
    status: 'Not Started',
    description:
      'Comprehensive security audit of IT infrastructure, identification of vulnerabilities, and implementation of remediation measures.',
  },
  {
    id: 6,
    name: 'E-commerce Platform Upgrade',
    client: 'Artisan Goods Marketplace',
    type: 'Web Development',
    leadSource: 'Social Media',
    stage: 'Proposal',
    startDate: '2024-02-15',
    endDate: '2024-07-31',
    teamSize: 7,
    manager: 'Justin Miller',
    lastUpdated: '5 days ago',
    progress: 30,
    status: 'On Track',
    description:
      'Upgrade of existing e-commerce platform to improve performance, mobile responsiveness, and integration with modern payment systems.',
  },
  {
    id: 7,
    name: 'Supply Chain Optimization',
    client: 'Continental Manufacturing',
    type: 'Logistics Consulting',
    leadSource: 'Trade Show',
    stage: 'Needs Analysis',
    startDate: '2024-01-20',
    endDate: '2024-06-15',
    teamSize: 6,
    manager: 'Alex Wong',
    lastUpdated: '4 days ago',
    progress: 15,
    status: 'Delayed',
    description:
      'Analysis and optimization of manufacturing supply chain to reduce costs, improve delivery times, and enhance inventory management.',
  },
];

// Add this new component
function DroppableColumn({ stage, children }: { stage: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <div ref={setNodeRef} className='flex flex-col h-full'>
      {children}
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [activeItem, setActiveItem] = useState<any>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after moving 5px
      },
    }),
  );

  // Project stages for kanban board
  const KANBAN_STAGES = [
    'Initial Contact',
    'Needs Analysis',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
  ];

  // Fetch projects with React Query
  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await newRequest.get('/projects');
        console.log('🚀 response:', response);
        // Transform the data to match the expected structure
        return (
          response.data.data.map((project: any) => {
            return {
              _id: project._id,
              id: project._id,
              name: project.name,
              stage: project.stage,
              status: project.status,
              projectType: project.projectType,
              manager: project.manager,
              participants: project.participants || [],
              team: project.team || [],
              tasks: project.tasks || [],
              notes: project.notes || [],
              isActive: project.isActive,
              createdBy: project.createdBy,
              workspace: project.workspace,
              leadSource: project.leadSource,
              sharing: project.sharing,
              collaborators: project.collaborators || [],
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
            };
          }) || []
        );
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        return MOCK_PROJECTS;
      }
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: number) => {
      return newRequest.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => {
      console.error('Failed to delete project:', err);
    },
    // Optimistic update
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(['projects']);

      // Optimistically update to the new value
      queryClient.setQueryData(['projects'], (old: any[]) => {
        return old.filter((project) => {
          return project.id !== projectId;
        });
      });

      // Return a context object with the snapshot
      return { previousProjects };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update project stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async ({ projectId, newStage }: { projectId: string; newStage: string }) => {
      try {
        const response = await newRequest.put(`/projects/${projectId}`, { stage: newStage });
        return response.data;
      } catch (error) {
        console.error('Failed to update project stage:', error);
        throw error;
      }
    },
    onMutate: async ({ projectId, newStage }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData(['projects']);

      // Optimistically update to the new value
      queryClient.setQueryData(['projects'], (old: any[]) => {
        return old.map((project) => {
          if (project._id === projectId) {
            return { ...project, stage: newStage };
          }
          return project;
        });
      });

      // Return a context object with the snapshot
      return { previousProjects };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      console.error('Failed to update project stage:', err);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Function to handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter projects based on search query and status filter
  const filteredProjects = projects?.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.leadSource?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.manager?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.stage === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort the filtered projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    // Handle different column types appropriately
    let comparison = 0;

    if (sortColumn === 'progress' || sortColumn === 'teamSize') {
      // Numeric comparison
      comparison =
        (a[sortColumn as keyof typeof a] as number) - (b[sortColumn as keyof typeof b] as number);
    } else {
      // String comparison
      const aValue = String(a[sortColumn as keyof typeof a] || '').toLowerCase();
      const bValue = String(b[sortColumn as keyof typeof b] || '').toLowerCase();
      comparison = aValue.localeCompare(bValue);
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Function to handle project deletion
  const handleDeleteProject = (projectId: number) => {
    if (!projectId) {
      return null;
    }

    deleteProjectMutation.mutate(projectId);
  };

  // Function to handle stage change
  const handleStageChange = (projectId: string, newStage: string) => {
    updateStageMutation.mutate({ projectId, newStage });
  };

  // Function to navigate to project details
  const navigateToProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // Get items for each stage in kanban view
  const getItemsByStage = (stage: string) => {
    return projects.filter((project) => {
      return (
        project.stage === stage &&
        (searchQuery === '' ||
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.projectType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.manager?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id.toString();
    const foundItem = projects.find((project) => {
      return project._id === id;
    });
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
      const activeItem = projects.find((project) => {
        return project._id === activeItemId;
      });

      if (activeItem && activeItem.stage !== overId) {
        // Optimistically update the UI
        queryClient.setQueryData(['projects'], (old: any[]) => {
          return old.map((project) => {
            if (project._id === activeItemId) {
              return { ...project, stage: overId };
            }
            return project;
          });
        });

        // Trigger the mutation
        updateStageMutation.mutate({ projectId: activeItemId, newStage: overId });
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    const activeItemId = active.id.toString();
    const overId = over.id.toString();

    if (activeItemId === overId) {
      setActiveItem(null);
      return;
    }

    // If the over element is a stage container, not an item
    if (KANBAN_STAGES.includes(overId)) {
      const activeItem = projects.find((project) => {
        return project._id === activeItemId;
      });

      if (activeItem && activeItem.stage !== overId) {
        // Optimistically update the UI
        queryClient.setQueryData(['projects'], (old: any[]) => {
          return old.map((project) => {
            if (project._id === activeItemId) {
              return { ...project, stage: overId };
            }
            return project;
          });
        });

        // Trigger the mutation
        updateStageMutation.mutate({ projectId: activeItemId, newStage: overId });
      }
    }

    setActiveItem(null);
  };

  // Sortable Project Item component
  function SortableProjectItem({ project }: { project: any }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
      useSortable({
        id: project._id,
        data: {
          type: 'project',
          project,
        },
      });

    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1 : 0,
      position: 'relative' as const,
    };

    // Calculate progress based on tasks
    const totalTasks = project.tasks?.length || 0;
    const completedTasks =
      project.tasks?.filter((task: any) => {
        return task.status === 'completed';
      })?.length || 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
      <div ref={setNodeRef} style={style}>
        {isOver && (
          <div className='absolute inset-0 bg-primary/10 rounded-lg border-2 border-primary pointer-events-none' />
        )}
        <Card
          className={cn(
            'cursor-move shadow-sm transition-all',
            isOver && 'ring-2 ring-primary ring-offset-2',
          )}
          {...attributes}
          {...listeners}
        >
          <CardContent className='p-4 space-y-2'>
            <div className='flex justify-between items-start gap-2'>
              <Link
                href={`/projects/${project._id}`}
                className='font-medium text-sm line-clamp-2 hover:underline text-primary'
                onClick={(e) => {
                  return e.stopPropagation();
                }}
              >
                {project.name}
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
                    <Link href={`/projects/${project._id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/projects/${project._id}/edit`}>Edit Project</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      return handleDeleteProject(project._id);
                    }}
                    className='text-destructive focus:text-destructive'
                  >
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span>{project?.manager?.name || 'No manager assigned'}</span>
            </div>

            <div className='flex justify-between items-center gap-2'>
              <span className='text-xs font-medium'>{progress}%</span>
              <span className='text-xs text-muted-foreground'>
                {project.tasks?.find((task: any) => {
                  return task.dueDate;
                })?.dueDate
                  ? new Date(
                      project.tasks.find((task: any) => {
                        return task.dueDate;
                      }).dueDate,
                    ).toLocaleDateString()
                  : 'No due date'}
              </span>
            </div>

            <div className='flex justify-between items-center pt-2'>
              <span className='text-xs'>{renderStatusBadge(project.status)}</span>
              <span className='text-xs text-muted-foreground'>{project.stage}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let className = '';
    let icon = null;

    switch (status) {
      case 'Completed':
        className = 'bg-green-100 text-green-800 hover:bg-green-200';
        icon = <CheckCircle2 className='h-3 w-3 mr-1' />;
        break;
      case 'On Track':
        className = 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        icon = <Clock className='h-3 w-3 mr-1' />;
        break;
      case 'At Risk':
        className = 'bg-amber-100 text-amber-800 hover:bg-amber-200';
        icon = <AlertCircle className='h-3 w-3 mr-1' />;
        break;
      case 'Delayed':
        className = 'bg-red-100 text-red-800 hover:bg-red-200';
        icon = <Clock4 className='h-3 w-3 mr-1' />;
        break;
      case 'Not Started':
      default:
        className = 'bg-slate-100 text-slate-800 hover:bg-slate-200';
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

  const dropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
  };

  return (
    <BlockWrapper>
      <div className='container mx-auto py-8 flex flex-col min-h-[85vh]'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
          <div>
            <h1 className='text-3xl font-bold'>Projects</h1>
            <p className='text-muted-foreground mt-1'>
              Manage and track all your client projects in one place
            </p>
          </div>
          <div className='flex space-x-2'>
            <PipelineSettings />
            <Button variant='outline'>
              <Download className='mr-2 h-4 w-4' />
              Export
            </Button>
            <Button asChild>
              <Link href='/projects/new'>
                <Plus className='mr-2 h-4 w-4' />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* View mode toggle */}
        <div className='flex justify-between items-center mb-6'>
          <div className='flex border rounded-md overflow-hidden'>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size='sm'
              className='rounded-none px-3'
              onClick={() => {
                return setViewMode('table');
              }}
            >
              Table View
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size='sm'
              className='rounded-none px-3'
              onClick={() => {
                return setViewMode('kanban');
              }}
            >
              Kanban Board
            </Button>
          </div>
        </div>

        {/* Filters and search */}
        <div className='flex flex-col md:flex-row gap-4 mb-8'>
          <div className='relative flex-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search projects...'
              className='pl-8'
              value={searchQuery}
              onChange={(e) => {
                return setSearchQuery(e.target.value);
              }}
            />
          </div>
          {viewMode === 'table' && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Filter by stage' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Stage</SelectLabel>
                  <SelectItem value='all'>All Stages</SelectItem>
                  <SelectItem value='Initial Contact'>Initial Contact</SelectItem>
                  <SelectItem value='Needs Analysis'>Needs Analysis</SelectItem>
                  <SelectItem value='Proposal'>Proposal</SelectItem>
                  <SelectItem value='Negotiation'>Negotiation</SelectItem>
                  <SelectItem value='Closed Won'>Closed Won</SelectItem>
                  <SelectItem value='Closed Lost'>Closed Lost</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4 animate-pulse'>
              <Search className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium'>Loading projects...</h3>
          </div>
        ) : error ? (
          <div className='rounded-md bg-amber-50 p-4 mb-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <AlertCircle className='h-5 w-5 text-amber-400' />
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-amber-800'>
                  Failed to load projects. Using mock data instead.
                </h3>
              </div>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          // Table View
          <div className='rounded-md border shadow-sm'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableColumnHeader column='name' label='Project Name' />
                  </TableHead>
                  <TableHead>
                    <SortableColumnHeader column='client' label='Client' />
                  </TableHead>
                  <TableHead>
                    <SortableColumnHeader column='type' label='Type' />
                  </TableHead>
                  <TableHead>
                    <SortableColumnHeader column='manager' label='Manager' />
                  </TableHead>
                  <TableHead>
                    <SortableColumnHeader column='status' label='Status' />
                  </TableHead>
                  <TableHead>
                    <SortableColumnHeader column='stage' label='Stage' />
                  </TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project) => {
                  return (
                    <TableRow
                      key={project._id}
                      className='cursor-pointer transition-colors hover:bg-muted/50'
                      onClick={(e) => {
                        if (
                          e.target instanceof HTMLElement &&
                          !e.target.closest('.status-dropdown') &&
                          !e.target.closest('.actions-dropdown')
                        ) {
                          navigateToProject(project._id);
                        }
                      }}
                    >
                      <TableCell className='font-medium'>{project.name}</TableCell>
                      <TableCell>{project?.participants[0]?.participant?.name}</TableCell>
                      <TableCell>{project?.projectType}</TableCell>
                      <TableCell>{project?.manager?.name}</TableCell>
                      <TableCell>
                        <div
                          className='status-dropdown'
                          onClick={(e) => {
                            return e.stopPropagation();
                          }}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' className='h-8 px-2 py-1'>
                                {renderStatusBadge(project.status)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='start'>
                              {KANBAN_STAGES.map((status) => {
                                return (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => {
                                      return handleStageChange(project._id, status);
                                    }}
                                    className='flex items-center'
                                  >
                                    {renderStatusBadge(status)}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.stage === 'Closed Won'
                              ? 'bg-green-100 text-green-800'
                              : project.stage === 'Proposal'
                              ? 'bg-blue-100 text-blue-800'
                              : project.stage === 'Negotiation'
                              ? 'bg-amber-100 text-amber-800'
                              : project.stage === 'Needs Analysis'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {project.stage}
                        </span>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div
                          className='actions-dropdown'
                          onClick={(e) => {
                            return e.stopPropagation();
                          }}
                        >
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
                                <Link href={`/projects/${project._id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/projects/${project._id}/edit`}>Edit Project</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  return handleDeleteProject(project._id);
                                }}
                                className='text-destructive focus:text-destructive'
                              >
                                Delete Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          // Kanban View
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
              {KANBAN_STAGES.map((stage) => {
                const stageItems = getItemsByStage(stage);
                return (
                  <DroppableColumn key={stage} stage={stage}>
                    <div className='flex items-center justify-between px-3 py-2 bg-muted/60 rounded-t-lg border border-border'>
                      <h3 className='font-medium text-sm'>{stage}</h3>
                      <span className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary/10'>
                        {stageItems.length}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'flex-1 p-2 rounded-b-lg border border-t-0 border-border overflow-y-auto max-h-[calc(100vh-300px)] min-h-[300px]',
                        'relative',
                      )}
                    >
                      <SortableContext
                        items={stageItems.map((item) => {
                          return item._id;
                        })}
                        strategy={verticalListSortingStrategy}
                      >
                        {stageItems.length > 0 ? (
                          <div className='grid gap-2'>
                            {stageItems.map((item) => {
                              return <SortableProjectItem key={item._id} project={item} />;
                            })}
                          </div>
                        ) : (
                          <div className='h-full flex items-center justify-center'>
                            <p className='text-xs text-muted-foreground'>No items</p>
                          </div>
                        )}
                      </SortableContext>
                    </div>
                  </DroppableColumn>
                );
              })}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeItem ? (
                <Card className='cursor-move shadow-md opacity-80'>
                  <CardContent className='p-4 space-y-2'>
                    <div className='flex justify-between items-start gap-2'>
                      <div className='font-medium text-sm line-clamp-2 text-primary'>
                        {activeItem.name}
                      </div>
                      <Button variant='ghost' size='icon' className='h-6 w-6 -mt-1 -mr-1'>
                        <MoreHorizontal className='h-3 w-3' />
                      </Button>
                    </div>

                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span>{activeItem?.manager?.name || 'No manager assigned'}</span>
                    </div>

                    <div className='flex justify-between items-center gap-2'>
                      <span className='text-xs font-medium'>
                        {activeItem.tasks?.filter((task: any) => {
                          return task.status === 'completed';
                        })?.length || 0}
                        %
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {activeItem.tasks?.find((task: any) => {
                          return task.dueDate;
                        })?.dueDate
                          ? new Date(
                              activeItem.tasks.find((task: any) => {
                                return task.dueDate;
                              }).dueDate,
                            ).toLocaleDateString()
                          : 'No due date'}
                      </span>
                    </div>

                    <div className='flex justify-between items-center pt-2'>
                      <span className='text-xs'>{renderStatusBadge(activeItem.status)}</span>
                      <span className='text-xs text-muted-foreground'>{activeItem.stage}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {!isLoading && !error && sortedProjects.length === 0 && (
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4'>
              <Search className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium'>No projects found</h3>
            <p className='text-muted-foreground mt-2 mb-4'>
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your search or filter to find what you're looking for."
                : 'Get started by creating your first project.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href='/projects/new'>
                  <Plus className='mr-2 h-4 w-4' />
                  New Project
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </BlockWrapper>
  );
}
