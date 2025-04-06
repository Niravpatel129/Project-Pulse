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
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
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
                    {renderStatusBadge(project.status)}
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
