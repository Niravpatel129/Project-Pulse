'use client';

import { Card } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { FileText, Mail, User } from 'lucide-react';
import { EmailComponent } from './EmailComponent';
import { EmailList } from './EmailList';

interface ActivityUser {
  _id: string;
  name: string;
  email: string;
}

interface ActivityProject {
  _id: string;
  name: string;
}

interface Activity {
  _id: string;
  user: ActivityUser;
  workspace: string;
  project: ActivityProject;
  type: string;
  action: string;
  description: string;
  entityId: string;
  entityType: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ActivitiesResponse {
  statusCode: number;
  data: Activity[];
  message: string;
  success: boolean;
}

export default function ProjectHome() {
  const { project } = useProject();
  console.log('🚀 project:', project);
  const { data: activitiesData, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['recentActivities', project?._id],
    queryFn: async () => {
      const response = await newRequest.get<ActivitiesResponse>(
        `/activities/recent/${project._id}`,
        {
          params: {
            limit: 5,
          },
        },
      );
      return response.data;
    },
    enabled: !!project?._id,
  });

  const recentActivities = activitiesData?.data || [];

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
                // Determine icon based on activity type/action
                let icon = 'file-text';
                if (activity.type === 'user') icon = 'user';
                else if (activity.type === 'email' || activity.type === 'message') icon = 'mail';

                return (
                  <Card key={`activity-${activity._id}`} className='p-3'>
                    <div className='flex items-center gap-3'>
                      <div className='flex-shrink-0 bg-gray-100 p-2 rounded-full'>
                        {icon === 'user' && <User className='h-4 w-4 text-gray-500' />}
                        {icon === 'file-text' && <FileText className='h-4 w-4 text-gray-500' />}
                        {icon === 'mail' && <Mail className='h-4 w-4 text-gray-500' />}
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{activity.description}</p>
                        <p className='text-xs text-gray-500'>
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
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
