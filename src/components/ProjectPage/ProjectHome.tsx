'use client';

import { Card } from '@/components/ui/card';
import { FileText, Mail, User } from 'lucide-react';
import { EmailComponent } from './EmailComponent';
import { EmailList } from './EmailList';

export default function ProjectHome() {
  // Mock activity data - in a real app, this would come from an API or context
  const recentActivities = [
    {
      id: 1,
      icon: 'user',
      description: 'Nirav Patel added asdasdad to this workspace',
      date: 'Wed, Mar 5, 2025',
    },
    {
      id: 2,
      icon: 'file-text',
      description: 'New document created by Alex Wong',
      date: 'Tue, Mar 4, 2025',
    },
  ];

  return (
    <div className='space-y-6'>
      <EmailComponent />
      <EmailList />

      {/* Recent Activity Section */}
      <div className='mt-8'>
        <h3 className='text-sm font-medium mb-2'>Recent activity</h3>
        <div className='space-y-3'>
          {recentActivities.map((activity) => {
            return (
              <Card key={activity.id} className='p-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex-shrink-0 bg-gray-100 p-2 rounded-full'>
                    {activity.icon === 'user' && <User className='h-4 w-4 text-gray-500' />}
                    {activity.icon === 'file-text' && (
                      <FileText className='h-4 w-4 text-gray-500' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{activity.description}</p>
                    <p className='text-xs text-gray-500'>{activity.date}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer information */}
      <div className='mt-6 pt-4 border-t border-gray-200 text-center w-full flex justify-center items-center'>
        <div className='flex items-center gap-2'>
          <Mail className='h-4 w-4 text-gray-500' />
          <p className='text-sm text-gray-500'>You can respond to messages here or via email</p>
        </div>
      </div>
    </div>
  );
}
