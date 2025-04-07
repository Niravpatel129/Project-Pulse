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
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ProjectTableProps {
  projects: any[];
  onDelete: (projectId: string) => void;
  onStageChange: (projectId: string, newStage: string) => void;
  onProjectClick: (projectId: string) => void;
  renderStatusBadge: (status: string) => React.ReactNode;
  pipelineStages: any[];
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
            <TableHead>Clients</TableHead>
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
                className='cursor-pointer transition-colors hover:bg-muted/30'
                onClick={(e) => {
                  if (
                    e.target instanceof HTMLElement &&
                    !e.target.closest('.status-dropdown') &&
                    !e.target.closest('.actions-dropdown')
                  ) {
                    onProjectClick(project._id);
                  }
                }}
              >
                <TableCell className='font-medium'>{project.name}</TableCell>
                <TableCell>
                  {project.clients && project.clients.length > 0 ? (
                    <div className='flex flex-col gap-1'>
                      {project.clients.map((client: any, index: number) => {
                        return (
                          <div
                            key={`${client.user?.name || client}-${index}`}
                            className='flex items-center gap-2'
                          >
                            <Avatar className='h-5 w-5'>
                              <AvatarFallback className='bg-muted text-black'>
                                {client.user?.name?.charAt(0) || '-'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{client.user?.name || '-'}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {project.manager?.name ? (
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-5 w-5'>
                        <AvatarImage src={project.manager.avatar} alt={project.manager.name} />
                        <AvatarFallback>{project.manager.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{project.manager.name}</span>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <div
                    className='status-dropdown'
                    onClick={(e) => {
                      return e.stopPropagation();
                    }}
                  >
                    {renderStatusBadge(project.status?.name || '')}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal'
                    style={{
                      backgroundColor: `${project.stage?.color}15`,
                      color: project.stage?.color,
                      borderColor: `${project.stage?.color}30`,
                      border: '1px solid',
                    }}
                  >
                    {project.stage?.name || '-'}
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
                            return onDelete(project._id);
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
  );
}
