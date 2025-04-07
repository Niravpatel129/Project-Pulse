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
import { MoreHorizontal } from 'lucide-react';
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
}

export function ProjectTable({
  projects,
  onDelete,
  onStageChange,
  onProjectClick,
  renderStatusBadge,
  pipelineStages,
}: ProjectTableProps) {
  return (
    <div className='rounded-lg border shadow-sm overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/30'>
            <TableHead className='py-3'>Project Name</TableHead>
            <TableHead>Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stage</TableHead>
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
                      border: '0.1px solid',
                    }}
                  >
                    <div
                      className='h-1.5 w-1.5 rounded-full mr-1.5'
                      style={{ backgroundColor: project.stage?.color }}
                    ></div>
                    {project.stage?.name || '-'}
                  </span>
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className='text-red-600'
                        onClick={() => {
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
