'use client';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Project } from 'next/dist/build/swc/types';
import { useState } from 'react';
import ProjectActivity from './ProjectActivity';
import { ProjectSidebar } from './ProjectSidebar';
import TimelineExample from './TimelineExample';

export default function ProjectPage() {
  const [activeTab, setActiveTab] = useState('activity');
  const [project, setProject] = useState({
    id: '1',
    stage: 'FOLLOW_UP',
    leadSource: 'INSTAGRAM',
    workflow: {
      name: 'Wedding Photography',
      status: 'In Progress',
    },
  });

  const handleUpdateProject = async (data: Partial<Project>) => {
    setProject((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className='min-h-screen w-full'>
      <div className=' bg-white'>
        <div className='container mx-auto px-4 '>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='w-full justify-start border-0 bg-transparent p-0'>
              <TabsTrigger
                value='activity'
                className='rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value='timeline'
                className='rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
              >
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value='schedule'
                className='rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value='files'
                className='rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
              >
                Files
                <Badge variant='secondary' className='ml-2'>
                  {5}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value='payments'
                className='rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
              >
                Payments
              </TabsTrigger>
            </TabsList>
            <div className='container mx-auto flex gap-6 py-3'>
              <div className='flex-1'>
                <TabsContent value='activity'>
                  <ProjectActivity />
                </TabsContent>
                <TabsContent value='timeline'>
                  <TimelineExample />
                </TabsContent>
                <TabsContent value='schedule'>
                  <>Schedule </>
                </TabsContent>
                <TabsContent value='files'>
                  <>Files </>
                </TabsContent>
                <TabsContent value='payments'>
                  <>Payments </>
                </TabsContent>
              </div>
              <ProjectSidebar project={project} onUpdateProject={handleUpdateProject} />
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
