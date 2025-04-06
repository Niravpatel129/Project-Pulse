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
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AlertCircle, ArrowUpDown, MoreHorizontal, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const {
    projects,
    isLoading,
    error,
    activeItem,
    kanban,
    isKanban,
    search,
    status,
    sort,
    direction,
    sortedProjects,
    shouldShowNoStage,
    shouldShowNoStatus,
    pipelineStages,
    pipelineStatuses,
    toggleView,
    setKanban,
    setSearch,
    setStatus,
    setSort,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    getItemsByStage,
    getItemsByStatus,
  } = useProjects();

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after moving 5px
      },
    }),
  );

  // Function to handle project deletion
  const handleDeleteProject = (projectId: number) => {
    if (!projectId) {
      return null;
    }
    // TODO: Implement delete project mutation
  };

  // Function to handle stage change
  const handleStageChange = (projectId: string, newStage: string) => {
    // TODO: Implement stage change mutation
  };

  // Function to navigate to project details
  const navigateToProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
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
    const statusConfig = pipelineStatuses.find((s) => {
      return s.name === status;
    });
    if (!statusConfig) return null;

    return (
      <Badge
        className='flex items-center text-xs font-medium'
        style={{
          backgroundColor: `${statusConfig.color}20`,
          color: statusConfig.color,
          borderColor: `${statusConfig.color}40`,
        }}
      >
        <div
          className='h-2 w-2 rounded-full mr-1.5'
          style={{ backgroundColor: statusConfig.color }}
        ></div>
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
          return setSort(column);
        }}
      >
        {label}
        <ArrowUpDown className='ml-2 h-4 w-4' />
        {sort === column && (
          <span className='ml-1 text-xs text-muted-foreground'>
            {direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
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
              variant={!isKanban ? 'default' : 'ghost'}
              size='sm'
              className='rounded-none px-3'
              onClick={toggleView}
            >
              Table View
            </Button>
            <Button
              variant={isKanban ? 'default' : 'ghost'}
              size='sm'
              className='rounded-none px-3'
              onClick={toggleView}
            >
              Kanban Board
            </Button>
          </div>
          {isKanban && (
            <div className='flex border rounded-md overflow-hidden'>
              <Button
                variant={kanban === 'stages' ? 'default' : 'ghost'}
                size='sm'
                className='rounded-none px-3'
                onClick={() => {
                  return setKanban('stages');
                }}
              >
                By Stage
              </Button>
              <Button
                variant={kanban === 'status' ? 'default' : 'ghost'}
                size='sm'
                className='rounded-none px-3'
                onClick={() => {
                  return setKanban('status');
                }}
              >
                By Status
              </Button>
            </div>
          )}
        </div>

        {/* Filters and search */}
        <div className='flex flex-col md:flex-row gap-4 mb-8'>
          <div className='relative flex-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search projects...'
              className='pl-8'
              value={search}
              onChange={(e) => {
                return setSearch(e.target.value);
              }}
            />
          </div>
          {isKanban && (
            <Select value={status} onValueChange={setStatus}>
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
        ) : isKanban ? (
          // Kanban View
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <div className='grid grid-flow-col auto-cols-[minmax(200px,1fr)] gap-4'>
              {kanban === 'stages'
                ? [
                    ...pipelineStages.map((s) => {
                      return s.name;
                    }),
                    ...(shouldShowNoStage ? ['No Stage'] : []),
                  ].map((column) => {
                    const items = getItemsByStage(column);
                    const config =
                      column === 'No Stage'
                        ? { name: 'No Stage', color: '#94a3b8' }
                        : pipelineStages.find((s) => {
                            return s.name === column;
                          });

                    return (
                      <DroppableColumn key={column} stage={column}>
                        <div className='flex flex-col min-w-0'>
                          <div
                            className='flex items-center justify-between px-3 py-2 bg-muted/60 rounded-t-lg border border-border'
                            style={{
                              backgroundColor: `${config?.color}10`,
                              borderColor: `${config?.color}30`,
                            }}
                          >
                            <h3 className='font-medium text-sm truncate'>{column}</h3>
                            <span className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary/10'>
                              {items.length}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'flex-1 p-2 rounded-b-lg border border-t-0 border-border overflow-y-auto max-h-[calc(100vh-300px)] min-h-[300px]',
                              'relative',
                            )}
                            style={{
                              borderColor: `${config?.color}30`,
                            }}
                          >
                            <SortableContext
                              items={items.map((item) => {
                                return item._id;
                              })}
                              strategy={verticalListSortingStrategy}
                            >
                              {items.length > 0 ? (
                                <div className='grid gap-2'>
                                  {items.map((item) => {
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
                        </div>
                      </DroppableColumn>
                    );
                  })
                : [
                    ...pipelineStatuses.map((s) => {
                      return s.name;
                    }),
                    ...(shouldShowNoStatus ? ['No Status'] : []),
                  ].map((column) => {
                    const items = getItemsByStatus(column);
                    const config =
                      column === 'No Status'
                        ? { name: 'No Status', color: '#94a3b8' }
                        : pipelineStatuses.find((s) => {
                            return s.name === column;
                          });

                    return (
                      <DroppableColumn key={column} stage={column}>
                        <div className='flex flex-col min-w-0'>
                          <div
                            className='flex items-center justify-between px-3 py-2 bg-muted/60 rounded-t-lg border border-border'
                            style={{
                              backgroundColor: `${config?.color}10`,
                              borderColor: `${config?.color}30`,
                            }}
                          >
                            <h3 className='font-medium text-sm truncate'>{column}</h3>
                            <span className='inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary/10'>
                              {items.length}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'flex-1 p-2 rounded-b-lg border border-t-0 border-border overflow-y-auto max-h-[calc(100vh-300px)] min-h-[300px]',
                              'relative',
                            )}
                            style={{
                              borderColor: `${config?.color}30`,
                            }}
                          >
                            <SortableContext
                              items={items.map((item) => {
                                return item._id;
                              })}
                              strategy={verticalListSortingStrategy}
                            >
                              {items.length > 0 ? (
                                <div className='grid gap-2'>
                                  {items.map((item) => {
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
                        {(() => {
                          const taskWithDueDate = activeItem.tasks?.find((task: any) => {
                            return task.dueDate;
                          });
                          return taskWithDueDate?.dueDate
                            ? new Date(taskWithDueDate.dueDate).toLocaleDateString()
                            : 'No due date';
                        })()}
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
        ) : (
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
                              {pipelineStages.map((status) => {
                                return (
                                  <DropdownMenuItem
                                    key={status.name}
                                    onClick={() => {
                                      return handleStageChange(project._id, status.name);
                                    }}
                                    className='flex items-center'
                                  >
                                    {renderStatusBadge(status.name)}
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
        )}

        {!isLoading && !error && sortedProjects.length === 0 && (
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4'>
              <Search className='h-6 w-6 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-medium'>No projects found</h3>
            <p className='text-muted-foreground mt-2 mb-4'>
              {search || status !== 'all'
                ? "Try adjusting your search or filter to find what you're looking for."
                : 'Get started by creating your first project.'}
            </p>
            {!search && status === 'all' && (
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
