'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowUpRight, Briefcase, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const mockData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const [recentProjects, setRecentProjects] = useState([
    { id: 1, name: 'Website Redesign', status: 'In Progress', updated: '2 hours ago' },
    { id: 2, name: 'Mobile App', status: 'Planning', updated: '1 day ago' },
    { id: 3, name: 'API Integration', status: 'Completed', updated: '3 days ago' },
    { id: 4, name: 'Database Migration', status: 'On Hold', updated: '1 week ago' },
  ]);

  return (
    <div className='container mx-auto py-6 space-y-8'>
      {/* Welcome Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
        <div>
          <h1 className='text-3xl font-bold'>
            {isAuthenticated
              ? `Welcome back, ${user?.name?.split(' ')[0] || 'User'}`
              : 'Welcome to Pulse'}
          </h1>
          <p className='text-muted-foreground mt-1'>Your project management dashboard</p>
        </div>
        <Button asChild className='mt-4 md:mt-0'>
          <Link href='/projects/new'>
            <Briefcase className='mr-2 h-4 w-4' />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Projects</CardTitle>
            <Briefcase className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>12</div>
            <p className='text-xs text-muted-foreground'>+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>4</div>
            <p className='text-xs text-muted-foreground'>-1 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Completed</CardTitle>
            <ArrowUpRight className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>7</div>
            <p className='text-xs text-muted-foreground'>+3 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Team Members</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>8</div>
            <p className='text-xs text-muted-foreground'>+1 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className='col-span-4'>
        <CardHeader>
          <CardTitle>Project Activity</CardTitle>
          <CardDescription>Project activity over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent className='px-2'>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='value' fill='#6366f1' />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your recently updated projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className='flex items-center justify-between border-b pb-4 last:border-0 last:pb-0'
              >
                <div className='space-y-1'>
                  <Link href={`/projects/${project.id}`} className='font-medium hover:underline'>
                    {project.name}
                  </Link>
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <span
                      className={`mr-2 w-2 h-2 rounded-full 
                      ${
                        project.status === 'In Progress'
                          ? 'bg-blue-500'
                          : project.status === 'Completed'
                          ? 'bg-green-500'
                          : project.status === 'On Hold'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                    ></span>
                    {project.status}
                  </div>
                </div>
                <div className='text-sm text-muted-foreground'>{project.updated}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
