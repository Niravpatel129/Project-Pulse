'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Calendar,
  CalendarCheck2,
  CreditCard,
  DollarSign,
  DownloadCloud,
  ExternalLink,
  Layers,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';

// Mock data for the dashboard
const RECENT_PROJECTS = [
  {
    id: 1,
    name: 'Enterprise CRM Implementation',
    client: 'Acme Corp',
    progress: 65,
    status: 'In Progress',
    deadline: '2024-05-15',
  },
  {
    id: 2,
    name: 'E-commerce Platform Upgrade',
    client: 'Global Retail',
    progress: 80,
    status: 'In Progress',
    deadline: '2024-04-30',
  },
  {
    id: 3,
    name: 'Mobile App Development - Retail',
    client: 'QuickShop',
    progress: 20,
    status: 'In Progress',
    deadline: '2024-06-10',
  },
];

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: 'Client Meeting - Acme Corp',
    type: 'Meeting',
    date: '2024-04-19',
    time: '10:00 - 11:30',
  },
  {
    id: 2,
    title: 'Website Design Review',
    type: 'Internal',
    date: '2024-04-19',
    time: '13:00 - 14:00',
  },
  {
    id: 3,
    title: 'Project Kickoff - Mobile App',
    type: 'Meeting',
    date: '2024-04-20',
    time: '09:30 - 11:00',
  },
];

export default function DashboardPage() {
  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Function to get event type badge styling
  const getEventBadge = (type: string) => {
    switch (type) {
      case 'Meeting':
        return 'bg-blue-100 text-blue-800';
      case 'Internal':
        return 'bg-slate-100 text-slate-800';
      case 'Deadline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className='container mx-auto space-y-8'>
      {/* Header with welcome message and date */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground mt-1'>
            Welcome to Pulse. Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className='mt-4 md:mt-0 flex items-center gap-2'>
          <Button variant='outline' size='sm'>
            <DownloadCloud className='mr-2 h-4 w-4' />
            Download Report
          </Button>
          <Button size='sm'>
            <CalendarCheck2 className='mr-2 h-4 w-4' />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-white hover:shadow-md transition-all'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Total Revenue</p>
                <h3 className='text-2xl font-bold mt-1'>$24,780</h3>
                <p className='text-xs text-green-600 mt-1 flex items-center'>
                  <TrendingUp className='h-3 w-3 mr-1' /> 12% from last month
                </p>
              </div>
              <div className='rounded-full p-2 bg-primary/10'>
                <DollarSign className='h-5 w-5 text-primary' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-md transition-all'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Active Projects</p>
                <h3 className='text-2xl font-bold mt-1'>8</h3>
                <p className='text-xs text-green-600 mt-1 flex items-center'>
                  <TrendingUp className='h-3 w-3 mr-1' /> 2 new this week
                </p>
              </div>
              <div className='rounded-full p-2 bg-blue-50'>
                <Layers className='h-5 w-5 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-md transition-all'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Total Customers</p>
                <h3 className='text-2xl font-bold mt-1'>142</h3>
                <p className='text-xs text-green-600 mt-1 flex items-center'>
                  <TrendingUp className='h-3 w-3 mr-1' /> 8 new this month
                </p>
              </div>
              <div className='rounded-full p-2 bg-purple-50'>
                <Users className='h-5 w-5 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-white hover:shadow-md transition-all'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Pending Invoices</p>
                <h3 className='text-2xl font-bold mt-1'>$12,450</h3>
                <p className='text-xs text-amber-600 mt-1 flex items-center'>
                  <CreditCard className='h-3 w-3 mr-1' /> 3 awaiting payment
                </p>
              </div>
              <div className='rounded-full p-2 bg-amber-50'>
                <CreditCard className='h-5 w-5 text-amber-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content with Tabs */}
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='mb-6 bg-muted w-full sm:w-auto'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='activity'>Recent Activity</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* Project Status and Calendar row */}
          <div className='grid gap-6 grid-cols-1 lg:grid-cols-3'>
            {/* Project Status */}
            <Card className='lg:col-span-2'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle>Project Status</CardTitle>
                  <Button variant='ghost' size='sm' className='text-xs h-8' asChild>
                    <Link href='/projects'>
                      View All <ExternalLink className='ml-1 h-3 w-3' />
                    </Link>
                  </Button>
                </div>
                <CardDescription>Recent project progress and updates</CardDescription>
              </CardHeader>
              <CardContent className='pb-0'>
                <div className='space-y-4'>
                  {RECENT_PROJECTS.map((project) => (
                    <div
                      key={project.id}
                      className='border rounded-lg p-3 hover:bg-muted/5 transition-colors'
                    >
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h4 className='font-medium'>{project.name}</h4>
                            <Badge className={getStatusBadge(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <p className='text-sm text-muted-foreground'>Client: {project.client}</p>
                        </div>
                        <div className='text-sm whitespace-nowrap'>
                          Due: {formatDate(project.deadline)}
                        </div>
                      </div>
                      <div className='mt-3'>
                        <div className='flex items-center justify-between text-xs mb-1'>
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className='h-2' />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className='pt-2'>
                <Button variant='outline' size='sm' asChild className='mt-2 w-full'>
                  <Link href='/projects/new'>Create New Project</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle>Upcoming Events</CardTitle>
                  <Button variant='ghost' size='sm' className='text-xs h-8' asChild>
                    <Link href='/calendar'>
                      View Calendar <ExternalLink className='ml-1 h-3 w-3' />
                    </Link>
                  </Button>
                </div>
                <CardDescription>Your schedule for today and tomorrow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {UPCOMING_EVENTS.map((event) => (
                    <div
                      key={event.id}
                      className='flex gap-3 p-2 border rounded hover:bg-muted/5 transition-colors'
                    >
                      <div className='flex flex-col items-center justify-center bg-muted/10 px-2 py-1 rounded text-center min-w-12'>
                        <span className='text-xs font-medium'>
                          {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className='flex flex-col flex-1'>
                        <h4 className='font-medium text-sm'>{event.title}</h4>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge className={getEventBadge(event.type)}>{event.type}</Badge>
                          <span className='text-xs text-muted-foreground'>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className='pt-0'>
                <Button variant='outline' size='sm' asChild className='w-full'>
                  <Link href='/calendar'>
                    <Calendar className='mr-2 h-4 w-4' />
                    View Full Calendar
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Quick Action Links */}
          <h3 className='text-lg font-medium mt-6'>Quick Access</h3>
          <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
            <Link href='/projects' className='group'>
              <Card className='transition-all hover:shadow-md group-hover:border-primary'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg'>Projects</CardTitle>
                    <Layers className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground'>
                    Manage client projects, track progress, and organize deliverables
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href='/customers' className='group'>
              <Card className='transition-all hover:shadow-md group-hover:border-primary'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg'>Customers</CardTitle>
                    <Users className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground'>
                    Manage customer relationships, contacts, and engagement history
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href='/inventory' className='group'>
              <Card className='transition-all hover:shadow-md group-hover:border-primary'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg'>Inventory</CardTitle>
                    <Package className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground'>
                    Track products, services, and manage stock levels
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value='activity' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your team&apos;s latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-5'>
                <div className='border-l-2 border-primary pl-4 pb-5 relative'>
                  <div className='absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-0'></div>
                  <p className='text-sm font-medium'>New client project created</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Mobile App Development for QuickShop
                  </p>
                  <p className='text-xs text-muted-foreground mt-2'>
                    2 hours ago • by Sarah Johnson
                  </p>
                </div>

                <div className='border-l-2 border-muted pl-4 pb-5 relative'>
                  <div className='absolute w-3 h-3 bg-muted rounded-full -left-[7px] top-0'></div>
                  <p className='text-sm font-medium'>Invoice paid</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Global Retail - Invoice #INV-2024-042
                  </p>
                  <p className='text-xs text-muted-foreground mt-2'>Yesterday • Automated</p>
                </div>

                <div className='border-l-2 border-muted pl-4 pb-5 relative'>
                  <div className='absolute w-3 h-3 bg-muted rounded-full -left-[7px] top-0'></div>
                  <p className='text-sm font-medium'>New team member added</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    David Chen joined the Design team
                  </p>
                  <p className='text-xs text-muted-foreground mt-2'>Yesterday • by Admin</p>
                </div>

                <div className='border-l-2 border-muted pl-4 relative'>
                  <div className='absolute w-3 h-3 bg-muted rounded-full -left-[7px] top-0'></div>
                  <p className='text-sm font-medium'>Project milestone completed</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    E-commerce Platform Upgrade - Phase 1
                  </p>
                  <p className='text-xs text-muted-foreground mt-2'>
                    2 days ago • by Michael Brown
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='performance' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Business Performance</CardTitle>
              <CardDescription>Key metrics and analytics for your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='rounded-lg border p-6 flex items-center justify-center h-[300px]'>
                <div className='text-center'>
                  <BarChart className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
                  <h3 className='text-lg font-medium'>Performance Analytics</h3>
                  <p className='text-sm text-muted-foreground mt-2 max-w-md mx-auto'>
                    Detailed analytics charts and performance metrics would be displayed here. This
                    includes revenue trends, project completion rates, and customer acquisition
                    data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
