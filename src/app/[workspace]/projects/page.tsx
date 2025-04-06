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

// Droppable column component for kanban view
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

  // Configure sensors for drag and drop with appropriate sensitivity
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
          <div className='absolute inset-0 bg-primary/5 rounded-lg border border-primary/20 pointer-events-none' />
        )}
        <Card
          className={cn(
            'cursor-move shadow-sm transition-all duration-200',
            isOver && 'ring-1 ring-primary ring-offset-1',
          )}
          {...attributes}
          {...listeners}
        >
          <CardContent className='p-4 space-y-3'>
            <div className='flex justify-between items-start gap-2'>
              <Link
                href={`/projects/${project._id}`}
                className='font-medium text-sm line-clamp-2 hover:text-primary transition-colors'
                onClick={(e) => {
                  return e.stopPropagation();
                }}
              >
                {project.name}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 -mt-1 -mr-1 opacity-70 hover:opacity-100 transition-opacity'
                  >
                    <MoreHorizontal className='h-3.5 w-3.5' />
                    <span className='sr-only'>Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='min-w-[180px]'>
                  <DropdownMenuItem asChild>
                    <Link href={`/projects/${project._id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/projects/${project._id}/edit`}>Edit Project</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
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

            <div className='flex justify-between items-center gap-2 pt-1'>
              <div className='flex items-center gap-2 w-full'>
                <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary rounded-full transition-all duration-300'
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className='text-xs font-medium min-w-[28px] text-right'>{progress}%</span>
              </div>
            </div>

            <div className='text-xs text-muted-foreground'>
              {project.tasks?.find((task: any) => {
                return task.dueDate;
              })?.dueDate
                ? new Date(
                    project.tasks.find((task: any) => {
                      return task.dueDate;
                    }).dueDate,
                  ).toLocaleDateString()
                : 'No due date'}
            </div>

            <div className='flex justify-between items-center pt-1 border-t border-border/40'>
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
        className='flex items-center text-xs font-normal py-0.5'
        style={{
          backgroundColor: `${statusConfig.color}15`,
          color: statusConfig.color,
          borderColor: `${statusConfig.color}30`,
        }}
      >
        <div
          className='h-1.5 w-1.5 rounded-full mr-1.5'
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
        className='flex items-center cursor-pointer group'
        onClick={() => {
          return setSort(column);
        }}
      >
        <span className='font-medium text-sm'>{label}</span>
        <ArrowUpDown className='ml-1.5 h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity' />
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
      <div className='container mx-auto py-10 flex flex-col min-h-[85vh]'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4'>
          <div>
            <h1 className='text-2xl font-semibold tracking-tight'>Projects</h1>
            <p className='text-muted-foreground mt-1.5 text-sm'>
              Manage and track all your client projects in one place
            </p>
          </div>
          <div className='flex space-x-3'>
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
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
          <div className='flex border rounded-md overflow-hidden shadow-sm'>
            <Button
              variant={!isKanban ? 'default' : 'ghost'}
              size='sm'
              className='rounded-none px-3 h-9'
              onClick={toggleView}
            >
              Table View
            </Button>
            <Button
              variant={isKanban ? 'default' : 'ghost'}
              size='sm'
              className='rounded-none px-3 h-9'
              onClick={toggleView}
            >
              Kanban Board
            </Button>
          </div>
          {isKanban && (
            <div className='flex border rounded-md overflow-hidden shadow-sm'>
              <Button
                variant={kanban === 'stages' ? 'default' : 'ghost'}
                size='sm'
                className='rounded-none px-3 h-9'
                onClick={() => {
                  return setKanban('stages');
                }}
              >
                By Stage
              </Button>
              <Button
                variant={kanban === 'status' ? 'default' : 'ghost'}
                size='sm'
                className='rounded-none px-3 h-9'
                onClick={() => {
                  return setKanban('status');
                }}
              >
                By Status
              </Button>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className='text-center py-16 space-y-4'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 mb-2 animate-pulse'>
              <Search className='h-5 w-5 text-muted-foreground opacity-70' />
            </div>
            <h3 className='text-base font-medium text-muted-foreground'>Loading projects...</h3>
          </div>
        ) : error ? (
          <div className='rounded-lg bg-amber-50 p-4 mb-6 border border-amber-200'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <AlertCircle className='h-5 w-5 text-amber-500' />
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
            <div className='grid grid-flow-col auto-cols-[minmax(280px,1fr)] overflow-x-auto pb-4 gap-6'>
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
                            className='flex items-center justify-between px-4 py-2.5 bg-muted/40 rounded-t-lg border border-border'
                            style={{
                              backgroundColor: `${config?.color}08`,
                              borderColor: `${config?.color}25`,
                            }}
                          >
                            <h3 className='font-medium text-sm truncate'>{column}</h3>
                            <span className='inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-primary/10'>
                              {items.length}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'flex-1 p-3 rounded-b-lg border border-t-0 border-border overflow-y-auto max-h-[calc(100vh-300px)] min-h-[350px]',
                              'relative',
                            )}
                            style={{
                              borderColor: `${config?.color}25`,
                            }}
                          >
                            <SortableContext
                              items={items.map((item) => {
                                return item._id;
                              })}
                              strategy={verticalListSortingStrategy}
                            >
                              {items.length > 0 ? (
                                <div className='grid gap-3'>
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
                            className='flex items-center justify-between px-4 py-2.5 bg-muted/40 rounded-t-lg border border-border'
                            style={{
                              backgroundColor: `${config?.color}08`,
                              borderColor: `${config?.color}25`,
                            }}
                          >
                            <h3 className='font-medium text-sm truncate'>{column}</h3>
                            <span className='inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-primary/10'>
                              {items.length}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'flex-1 p-3 rounded-b-lg border border-t-0 border-border overflow-y-auto max-h-[calc(100vh-300px)] min-h-[350px]',
                              'relative',
                            )}
                            style={{
                              borderColor: `${config?.color}25`,
                            }}
                          >
                            <SortableContext
                              items={items.map((item) => {
                                return item._id;
                              })}
                              strategy={verticalListSortingStrategy}
                            >
                              {items.length > 0 ? (
                                <div className='grid gap-3'>
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
                <Card className='cursor-move shadow-md opacity-90 w-[280px]'>
                  <CardContent className='p-4 space-y-3'>
                    <div className='flex justify-between items-start gap-2'>
                      <div className='font-medium text-sm line-clamp-2 text-primary'>
                        {activeItem.name}
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6 -mt-1 -mr-1 opacity-70'
                      >
                        <MoreHorizontal className='h-3.5 w-3.5' />
                      </Button>
                    </div>

                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span>{activeItem?.manager?.name || 'No manager assigned'}</span>
                    </div>

                    <div className='flex justify-between items-center gap-2 pt-1'>
                      <div className='flex items-center gap-2 w-full'>
                        <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-primary rounded-full'
                            style={{
                              width: `${
                                activeItem.tasks?.filter((task: any) => {
                                  return task.status === 'completed';
                                })?.length || 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className='text-xs font-medium min-w-[28px] text-right'>
                          {activeItem.tasks?.filter((task: any) => {
                            return task.status === 'completed';
                          })?.length || 0}
                          %
                        </span>
                      </div>
                    </div>

                    <div className='text-xs text-muted-foreground'>
                      {(() => {
                        const taskWithDueDate = activeItem.tasks?.find((task: any) => {
                          return task.dueDate;
                        });
                        return taskWithDueDate?.dueDate
                          ? new Date(taskWithDueDate.dueDate).toLocaleDateString()
                          : 'No due date';
                      })()}
                    </div>

                    <div className='flex justify-between items-center pt-1 border-t border-border/40'>
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
          <div className='rounded-lg border shadow-sm overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30'>
                  <TableHead className='py-3'>
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
                      className='cursor-pointer transition-colors hover:bg-muted/30'
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
                              <Button variant='ghost' className='h-8 px-2 py-1 -ml-2'>
                                {renderStatusBadge(project.status)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='start' className='min-w-[180px]'>
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
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal ${
                            project.stage === 'Closed Won'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : project.stage === 'Proposal'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : project.stage === 'Negotiation'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : project.stage === 'Needs Analysis'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
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
                            <DropdownMenuContent align='end' className='min-w-[180px]'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/projects/${project._id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/projects/${project._id}/edit`}>Edit Project</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
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
          <div className='text-center py-16 space-y-3'>
            <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 mb-3'>
              <Search className='h-5 w-5 text-muted-foreground opacity-70' />
            </div>
            <h3 className='text-base font-medium'>No projects found</h3>
            <p className='text-muted-foreground text-sm max-w-md mx-auto mb-5'>
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
