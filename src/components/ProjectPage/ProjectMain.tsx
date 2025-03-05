'use client';

import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/contexts/ProjectContext';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import ProjectActivity from './ProjectActivity';
import ProjectContext from './ProjectContext';
import ProjectFiles from './ProjectFiles';
import ProjectPayments from './ProjectPayments';
import ProjectSchedule from './ProjectSchedule';
import { ProjectSidebar } from './ProjectSidebar';
import TimelineExample from './TimelineExample';

export default function ProjectMain() {
  const [activeTab, setActiveTab] = useState('context');
  const { project, updateProject } = useProject();

  const handleUpdateProject = async (data: any) => {
    await updateProject(data);
  };

  return (
    <div className='min-h-screen w-full'>
      <div className='bg-white'>
        <div className='container mx-auto px-4 sm:px-6'>
          <div className='md:hidden flex justify-end py-3'>
            <Sheet>
              <SheetTitle className='sr-only'>Project Sidebar</SheetTitle>
              <SheetTrigger asChild>
                <button
                  className='bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition-colors'
                  aria-label='Open Sidebar'
                >
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent className='w-[85%] sm:max-w-md'>
                <div className='mt-6 w-full'>
                  <ProjectSidebar onUpdateProject={handleUpdateProject} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <div className='overflow-x-auto pb-2'>
              <TabsList className='w-full min-w-max justify-start border-0 bg-transparent p-0'>
                <TabsTrigger
                  value='context'
                  className='rounded-none border-b-2 border-transparent px-3 py-2 text-sm sm:px-4 sm:text-base data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
                >
                  Context
                </TabsTrigger>
                {/* <TabsTrigger
                  value='activity'
                  className='rounded-none border-b-2 border-transparent px-3 py-2 text-sm sm:px-4 sm:text-base data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
                >
                  Activity
                </TabsTrigger> */}
                {/* <TabsTrigger
                  value='timeline'
                  className='rounded-none border-b-2 border-transparent px-3 py-2 text-sm sm:px-4 sm:text-base data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
                >
                  Timeline
                </TabsTrigger> */}
                <TabsTrigger
                  value='schedule'
                  className='rounded-none border-b-2 border-transparent px-3 py-2 text-sm sm:px-4 sm:text-base data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
                >
                  Schedule
                </TabsTrigger>
                <TabsTrigger
                  value='files'
                  className='rounded-none border-b-2 border-transparent px-3 py-2 text-sm sm:px-4 sm:text-base data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
                >
                  Files
                  <Badge variant='secondary' className='ml-1 sm:ml-2'>
                    {5}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value='payments'
                  className='rounded-none border-b-2 border-transparent px-3 py-2 text-sm sm:px-4 sm:text-base data-[state=active]:border-[#5DD3D1] data-[state=active]:text-[#5DD3D1]'
                >
                  Payments
                </TabsTrigger>
              </TabsList>
            </div>
            <div className='mx-auto flex flex-col gap-6 py-2 md:flex-row relative'>
              <div className='w-full md:flex-1'>
                <TabsContent value='activity'>
                  <ProjectActivity />
                </TabsContent>
                <TabsContent value='context'>
                  <ProjectContext />
                </TabsContent>
                <TabsContent value='timeline'>
                  <TimelineExample />
                </TabsContent>
                <TabsContent value='schedule'>
                  <ProjectSchedule />
                </TabsContent>
                <TabsContent value='files'>
                  <ProjectFiles />
                </TabsContent>
                <TabsContent value='payments'>
                  <ProjectPayments />
                </TabsContent>
              </div>

              {/* Desktop Sidebar - only visible on md and larger screens */}
              <div className='hidden md:block'>
                <ProjectSidebar onUpdateProject={handleUpdateProject} />
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
