import { Button } from '@/components/ui/button';
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
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface ProjectTableProps {
  projects: Array<{
    _id: string;
    name: string;
    stage: {
      name: string;
      color: string;
    };
    status: {
      name: string;
      color: string;
    };
    manager: {
      name: string;
    };
    createdAt: string;
    tasks?: Array<{
      _id: string | number;
      title: string;
      description: string;
      status: string;
      dueDate: string;
    }>;
  }>;
  onDelete: (projectId: string) => void;
  onStageChange: (projectId: string, newStage: string) => void;
  onProjectClick: (projectId: string) => void;
  renderStatusBadge: (status: { name: string; color: string }) => React.ReactNode;
  pipelineStages: Array<{
    name: string;
    color: string;
  }>;
  sort: string;
  direction: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function ProjectTable({
  projects,
  onDelete,
  onStageChange,
  onProjectClick,
  renderStatusBadge,
  pipelineStages,
  sort,
  direction,
  onSort,
}: ProjectTableProps) {
  return (
    <div className='rounded-lg border shadow-sm overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30'>
            <TableHead className='py-3'>
              <Button
                variant='ghost'
                className='flex items-center gap-1'
                onClick={() => {
                  return onSort('name');
                }}
              >
                Project Name
                {sort === 'name' && (
                  <ArrowUpDown
                    className='h-3 w-3'
                    style={{ transform: direction === 'desc' ? 'rotate(180deg)' : 'none' }}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant='ghost'
                className='flex items-center gap-1'
                onClick={() => {
                  return onSort('manager');
                }}
              >
                Manager
                {sort === 'manager' && (
                  <ArrowUpDown
                    className='h-3 w-3'
                    style={{ transform: direction === 'desc' ? 'rotate(180deg)' : 'none' }}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant='ghost'
                className='flex items-center gap-1'
                onClick={() => {
                  return onSort('status');
                }}
              >
                Status
                {sort === 'status' && (
                  <ArrowUpDown
                    className='h-3 w-3'
                    style={{ transform: direction === 'desc' ? 'rotate(180deg)' : 'none' }}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant='ghost'
                className='flex items-center gap-1'
                onClick={() => {
                  return onSort('stage');
                }}
              >
                Stage
                {sort === 'stage' && (
                  <ArrowUpDown
                    className='h-3 w-3'
                    style={{ transform: direction === 'desc' ? 'rotate(180deg)' : 'none' }}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant='ghost'
                className='flex items-center gap-1'
                onClick={() => {
                  return onSort('createdAt');
                }}
              >
                Created
                {sort === 'createdAt' && (
                  <ArrowUpDown
                    className='h-3 w-3'
                    style={{ transform: direction === 'desc' ? 'rotate(180deg)' : 'none' }}
                  />
                )}
              </Button>
            </TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            return (
              <TableRow
                key={project._id}
                onClick={() => {
                  return onProjectClick(project._id);
                }}
                className='cursor-pointer'
              >
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Avatar className='h-6 w-6'>
                      <AvatarFallback>{project.manager.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{project.manager.name}</span>
                  </div>
                </TableCell>
                <TableCell>{renderStatusBadge(project.status)}</TableCell>
                <TableCell>
                  <span
                    className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal'
                    style={{
                      backgroundColor: `${project.stage?.color}15`,
                      color: project.stage?.color,
                      borderColor: `${project.stage?.color}30`,
                      borderWidth: '0.1px',
                      borderStyle: 'solid',
                    }}
                  >
                    <div
                      className='h-1.5 w-1.5 rounded-full mr-1.5'
                      style={{ backgroundColor: project.stage?.color }}
                    ></div>
                    {project.stage?.name || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  {project.createdAt
                    ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
                    : '-'}
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8'
                        onClick={(e) => {
                          return e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={(e) => {
                          e.stopPropagation();
                          return onDelete(project._id);
                        }}
                      >
                        Delete
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
  );
}
