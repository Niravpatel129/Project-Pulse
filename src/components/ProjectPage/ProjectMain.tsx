'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject, type Project } from '@/contexts/ProjectContext';
import { CalendarDays, CreditCard, Home, Menu, PanelsTopLeft } from 'lucide-react';
import { useState } from 'react';
import ProjectActivity from './ProjectActivity';
import ProjectFiles from './ProjectFiles';
import ProjectHome from './ProjectHome';
import ProjectModules from './ProjectModules/ProjectModules';
import ProjectPayments from './ProjectPayments';
import ProjectSchedule from './ProjectSchedule';
import { ProjectSidebar } from './ProjectSidebar';
import TimelineExample from './TimelineExample';

export default function ProjectMain() {
  const [activeTab, setActiveTab] = useState('home');
  const { project, updateProject } = useProject();

  const handleUpdateProject = async (data: Partial<Project>) => {
    await updateProject(data);
  };

  return (
    <div className='min-h-screen w-full'>
      <div className='bg-white'>
        <div className=''>
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
            <ScrollArea>
              <TabsList className='text-foreground mb-3 h-auto gap-2 rounded-none bg-transparent px-0 py-1'>
                <TabsTrigger
                  value='home'
                  className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
                >
                  <Home className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
                  Home
                </TabsTrigger>

                <TabsTrigger
                  value='schedule'
                  className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
                >
                  <CalendarDays
                    className='-ms-0.5 me-1.5 opacity-60'
                    size={16}
                    aria-hidden='true'
                  />
                  Schedule
                </TabsTrigger>

                <TabsTrigger
                  value='modules'
                  className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
                >
                  <PanelsTopLeft
                    className='-ms-0.5 me-1.5 opacity-60'
                    size={16}
                    aria-hidden='true'
                  />
                  Modules
                  <Badge className='bg-primary/15 ms-1.5 min-w-5 px-1' variant='secondary'>
                    {5}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value='payments'
                  className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
                >
                  <CreditCard className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
                  Payments
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
            <div className=' flex flex-col gap-6 py-2 md:flex-row relative'>
              <div className='w-full md:flex-1'>
                <TabsContent value='activity'>
                  <ProjectActivity />
                </TabsContent>
                <TabsContent value='home'>
                  <ProjectHome />
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
                <TabsContent value='modules'>
                  <ProjectModules />
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
