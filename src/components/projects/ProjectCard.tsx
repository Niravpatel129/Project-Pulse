import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

interface ProjectCardProps {
  project: any;
  onDelete: (projectId: string) => void;
  renderStatusBadge: (status: string) => React.ReactNode;
}

export function ProjectCard({ project, onDelete, renderStatusBadge }: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({
      id: project._id,
      data: {
        type: 'project',
        project,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
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
                    return onDelete(project._id);
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
