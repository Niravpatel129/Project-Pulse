'use client';

import { PipelineSettings } from '@/components/projects/PipelineSettings';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectCreateForm } from '@/components/projects/ProjectCreateForm';
import { ProjectEmptyState } from '@/components/projects/ProjectEmptyState';
import { ProjectTable } from '@/components/projects/ProjectTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

// Skeleton components for loading states
function TableSkeleton() {
  return (
    <div className='rounded-lg border shadow-sm overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30'>
            <TableHead className='py-3'>Project Name</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => {
            return (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className='h-4 w-[200px]' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-[120px]' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-[100px]' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-[150px]' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-[80px]' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-[100px]' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='h-4 w-[40px]' />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className='grid grid-flow-col auto-cols-[minmax(280px,1fr)] overflow-x-auto pb-4 gap-6'>
      {Array.from({ length: 4 }).map((_, i) => {
        return (
          <div key={i} className='flex flex-col min-w-0'>
            <div className='flex items-center justify-between px-4 py-2.5 bg-muted/40 rounded-t-lg border border-border'>
              <Skeleton className='h-4 w-[100px]' />
              <Skeleton className='h-6 w-6 rounded-full' />
            </div>
            <div className='flex-1 p-3 rounded-b-lg border border-t-0 border-border overflow-y-auto max-h-[calc(100vh-300px)] min-h-[350px]'>
              <div className='grid gap-3'>
                {Array.from({ length: 3 }).map((_, j) => {
                  return (
                    <Card key={j} className='shadow-sm'>
                      <CardContent className='p-4 space-y-3'>
                        <Skeleton className='h-4 w-[200px]' />
                        <Skeleton className='h-3 w-[150px]' />
                        <Skeleton className='h-2 w-full' />
                        <Skeleton className='h-3 w-[100px]' />
                        <div className='flex justify-between items-center pt-1 border-t border-border/40'>
                          <Skeleton className='h-3 w-[60px]' />
                          <Skeleton className='h-3 w-[80px]' />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProjectsPage() {
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
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
    deleteProject,
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
  const handleDeleteProject = (projectId: string) => {
    if (!projectId) return;
    console.log('delete project', projectId);
    // TODO: Implement delete project mutation
    deleteProject.mutate(projectId);
  };

  // Function to handle stage change
  const handleStageChange = (projectId: string, newStage: string) => {
    // TODO: Implement stage change mutation
  };

  // Function to navigate to project details
  const navigateToProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: { name: string; color: string }) => {
    if (!status) return null;

    return (
      <Badge
        className='flex items-center text-xs font-normal py-0.5'
        style={{
          backgroundColor: `${status.color}15`,
          color: status.color,
          borderColor: `${status.color}30`,
        }}
      >
        <div
          className='h-1.5 w-1.5 rounded-full mr-1.5'
          style={{ backgroundColor: status.color }}
        ></div>
        {status.name}
      </Badge>
    );
  };

  const dropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
  };

  return (
    <div className='min-h-screen bg-white'>
      <div className='border-b'>
        <div className='container mx-auto px-4'>
          <nav className='flex space-x-8 gap-4'>
            <div
              className={` py-4 font-medium  cursor-pointer ${
                !isKanban ? 'border-b-2 text-green-600 border-green-500' : ''
              }`}
              style={{}}
              onClick={() => {
                router.push('/projects?view=table');
              }}
            >
              Table View
            </div>
            <div
              className={`py-4 font-medium text-gray-600 cursor-pointer ${
                isKanban ? 'border-b-2 text-green-600 border-green-500' : ''
              }`}
              style={{}}
              onClick={() => {
                router.push('/projects?view=kanban&kanban=stages');
              }}
            >
              Kanban Board
            </div>
          </nav>
        </div>
      </div>

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

            <ProjectCreateForm
              setIsNewProjectDialogOpen={setIsNewProjectDialogOpen}
              isNewProjectDialogOpen={isNewProjectDialogOpen}
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          isKanban ? (
            <KanbanSkeleton />
          ) : (
            <TableSkeleton />
          )
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
                                    return (
                                      <ProjectCard
                                        key={item._id}
                                        project={item}
                                        onDelete={handleDeleteProject}
                                        renderStatusBadge={renderStatusBadge}
                                      />
                                    );
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
                                    return (
                                      <ProjectCard
                                        key={item._id}
                                        project={item}
                                        onDelete={handleDeleteProject}
                                        renderStatusBadge={renderStatusBadge}
                                      />
                                    );
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
              {activeItem && (
                <ProjectCard
                  project={activeItem}
                  onDelete={handleDeleteProject}
                  renderStatusBadge={renderStatusBadge}
                />
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          // Table View
          <ProjectTable
            projects={sortedProjects}
            onDelete={handleDeleteProject}
            onStageChange={handleStageChange}
            onProjectClick={navigateToProject}
            renderStatusBadge={renderStatusBadge}
            pipelineStages={pipelineStages}
          />
        )}

        {!isLoading && !error && sortedProjects.length === 0 && (
          <ProjectEmptyState
            search={search}
            status={status}
            handleNewProject={() => {
              setIsNewProjectDialogOpen(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
