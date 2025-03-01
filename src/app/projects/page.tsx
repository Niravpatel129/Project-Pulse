'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useAuth } from '@/contexts/AuthContext';
import { Clock, MoreHorizontal, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Example project data
const MOCK_PROJECTS = [
  {
    id: 1,
    name: 'Website Redesign',
    type: 'Development',
    leadSource: 'Referral',
    stage: 'Proposal',
    lastUpdated: '2 hours ago',
    progress: 65,
  },
  {
    id: 2,
    name: 'Mobile App Development',
    type: 'Development',
    leadSource: 'Website',
    stage: 'Needs Analysis',
    lastUpdated: '1 day ago',
    progress: 25,
  },
  {
    id: 3,
    name: 'Marketing Campaign',
    type: 'Marketing',
    leadSource: 'Social Media',
    stage: 'Closed Won',
    lastUpdated: '3 days ago',
    progress: 100,
  },
  {
    id: 4,
    name: 'Database Migration',
    type: 'Research',
    leadSource: 'Direct Contact',
    stage: 'Negotiation',
    lastUpdated: '1 week ago',
    progress: 40,
  },
  {
    id: 5,
    name: 'Security Audit',
    type: 'Consulting',
    leadSource: 'Conference',
    stage: 'Initial Contact',
    lastUpdated: '2 days ago',
    progress: 0,
  },
];

export default function ProjectsPage() {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  // Filter projects based on search query and status filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.leadSource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.stage === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Function to handle project deletion
  const handleDeleteProject = (projectId: number) => {
    setProjects(projects.filter((project) => project.id !== projectId));
  };

  return (
    <div className='container mx-auto py-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Projects</h1>
          <p className='text-muted-foreground mt-1'>
            Manage and track all your projects in one place
          </p>
        </div>
        <Button asChild className='mt-4 md:mt-0'>
          <Link href='/projects/new'>
            <Plus className='mr-2 h-4 w-4' />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters and search */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search projects...'
            className='pl-8'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
      </div>

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredProjects.map((project) => (
            <Card key={project.id} className='overflow-hidden'>
              <CardHeader className='pb-2'>
                <div className='flex justify-between items-start'>
                  <CardTitle className='text-lg font-semibold'>
                    <Link href={`/projects/${project.id}`} className='hover:underline'>
                      {project.name}
                    </Link>
                  </CardTitle>
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
                        <Link href={`/projects/${project.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/projects/${project.id}/edit`}>Edit Project</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(project.id)}
                        className='text-destructive focus:text-destructive'
                      >
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className='line-clamp-2'>
                  {project.type} • {project.leadSource}
                </CardDescription>
              </CardHeader>
              <CardContent className='pb-2'>
                {/* Progress bar */}
                <div className='space-y-2'>
                  <div className='flex justify-between text-xs'>
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className='w-full h-2 bg-secondary rounded-full overflow-hidden'>
                    <div
                      className={`h-full ${
                        project.stage === 'Closed Won'
                          ? 'bg-green-500'
                          : project.progress > 50
                          ? 'bg-blue-500'
                          : project.stage === 'Negotiation'
                          ? 'bg-amber-500'
                          : 'bg-primary'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stage badge */}
                <div className='mt-4'>
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
                </div>
              </CardContent>
              <CardFooter className='pt-2 flex justify-between items-center'>
                <div className='flex items-center text-xs bg-muted px-2 py-1 rounded'>
                  {project.type}
                </div>
                <div className='flex items-center text-xs text-muted-foreground'>
                  <Clock className='h-3 w-3 mr-1' />
                  {project.lastUpdated}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
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
  );
}
