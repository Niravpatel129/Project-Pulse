'use client';

import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { FileText, Mail, User } from 'lucide-react';
import { EmailComponent } from './EmailComponent';
import { EmailList } from './EmailList';

interface Activity {
  id: number;
  icon: 'user' | 'file-text' | 'mail' | 'payment' | 'milestone';
  description: string;
  date: string;
  actor?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ActivitiesResponse {
  items: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProjectHome() {
  const { project } = useProject();
  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const response = await newRequest.get<ActivitiesResponse>(
        `/activities/recent/${project?._id}`,
        {
          params: {
            limit: 5,
          },
        },
      );
      return response.data;
    },
  });

  const recentActivities = activitiesData?.items || [];

  return (
    <div className='space-y-6'>
      <EmailComponent />

      {/* Combined Activity and Email Feed */}
      <div className='space-y-4'>
        <h3 className='text-sm font-medium'>Recent activity & messages</h3>
        <div className='space-y-3'>
          {isLoadingActivities ? (
            <div className='text-sm text-gray-500'>Loading activities...</div>
          ) : (
            <>
              {/* Activities */}
              {recentActivities.map((activity) => {
                return (
                  <Card key={`activity-${activity.id}`} className='p-3'>
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

              {/* Email List */}
              <EmailList />
            </>
          )}
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
