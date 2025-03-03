'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

export default function DashboardAnalyticsPage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold'>Analytics</h1>
          <p className='text-muted-foreground mt-1'>
            Track performance and gain insights into your business
          </p>
        </div>
      </div>

      <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$248,590.00</div>
            <p className='text-xs text-green-500 flex items-center mt-1'>
              <TrendingUp className='h-3 w-3 mr-1' />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,429</div>
            <p className='text-xs text-green-500 flex items-center mt-1'>
              <TrendingUp className='h-3 w-3 mr-1' />
              +4.7% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>38</div>
            <p className='text-xs text-muted-foreground mt-1'>12 pending approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$54,239.00</div>
            <p className='text-xs text-amber-500 flex items-center mt-1'>15 invoices pending</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8'>
        <Card className='col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between'>
              <span>Revenue Over Time</span>
              <LineChart className='h-4 w-4 text-muted-foreground' />
            </CardTitle>
          </CardHeader>
          <CardContent className='h-80 flex items-center justify-center bg-muted/30'>
            <p className='text-muted-foreground'>Revenue chart will appear here</p>
          </CardContent>
        </Card>

        <Card className='col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between'>
              <span>Customer Growth</span>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardTitle>
          </CardHeader>
          <CardContent className='h-80 flex items-center justify-center bg-muted/30'>
            <p className='text-muted-foreground'>Customer growth chart will appear here</p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 grid-cols-1 lg:grid-cols-3'>
        <Card className='lg:col-span-1'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center justify-between'>
              <span>Revenue by Category</span>
              <PieChart className='h-4 w-4 text-muted-foreground' />
            </CardTitle>
          </CardHeader>
          <CardContent className='h-80 flex items-center justify-center bg-muted/30'>
            <p className='text-muted-foreground'>Revenue by category chart will appear here</p>
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader className='pb-2'>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent className='h-80 flex items-center justify-center bg-muted/30'>
            <p className='text-muted-foreground'>Customer table will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
