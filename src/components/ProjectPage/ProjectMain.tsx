'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useProject, type Project } from '@/contexts/ProjectContext';
import { CalendarDays, CreditCard, Home, LineChart, Menu, PanelsTopLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProjectActivity from './ProjectActivity';
import ProjectFiles from './ProjectFiles';
import ProjectHome from './ProjectHome';
import ProjectModules from './ProjectModules/ProjectModules';
import ProjectPayments from './ProjectPayments';
import ProjectSchedule from './ProjectSchedule';
import { ProjectSidebar } from './ProjectSidebar';
import TimelineExample from './TimelineExample';

export default function ProjectMain() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0,
  );
  const { project, updateProject } = useProject();
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;

  // Extract the tab from the pathname or default to 'home'
  const getActiveTab = () => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];

    // If the last segment is the project ID, then we're at the root project route
    if (lastSegment === projectId) {
      return 'home';
    }

    return lastSegment;
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      return window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleUpdateProject = async (data: Partial<Project>) => {
    await updateProject(data);
  };

  // Build base URL for project tabs
  const baseUrl = `/projects/${projectId}`;

  return (
    <div className='min-h-screen w-full'>
      <div className=''>
        <div className=''>
          <div className='lg:hidden flex justify-end py-3'>
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
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

          <div className='w-full'>
            <ScrollArea>
              <div className='text-foreground mb-3 h-auto gap-2 rounded-none bg-transparent px-0 py-1 flex'>
                <Link
                  href={baseUrl}
                  className={`hover:bg-accent hover:text-foreground relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 ${
                    activeTab === 'home'
                      ? 'after:bg-primary bg-transparent shadow-none font-semibold'
                      : 'after:opacity-0 hover:after:opacity-50'
                  } px-3 py-2 rounded flex items-center`}
                >
                  <Home className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
                  Home
                </Link>

                <Link
                  href={`${baseUrl}/schedule`}
                  className={`hover:bg-accent hover:text-foreground relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 ${
                    activeTab === 'schedule'
                      ? 'after:bg-primary bg-transparent shadow-none font-semibold'
                      : 'after:opacity-0 hover:after:opacity-50'
                  } px-3 py-2 rounded flex items-center`}
                >
                  <CalendarDays
                    className='-ms-0.5 me-1.5 opacity-60'
                    size={16}
                    aria-hidden='true'
                  />
                  Schedule
                </Link>

                <Link
                  href={`${baseUrl}/timeline`}
                  className={`hover:bg-accent hover:text-foreground relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 ${
                    activeTab === 'timeline'
                      ? 'after:bg-primary bg-transparent shadow-none font-semibold'
                      : 'after:opacity-0 hover:after:opacity-50'
                  } px-3 py-2 rounded flex items-center`}
                >
                  <LineChart className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
                  Timeline
                </Link>

                <Link
                  href={`${baseUrl}/modules`}
                  className={`hover:bg-accent hover:text-foreground relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 ${
                    activeTab === 'modules'
                      ? 'after:bg-primary bg-transparent shadow-none font-semibold'
                      : 'after:opacity-0 hover:after:opacity-50'
                  } px-3 py-2 rounded flex items-center`}
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
                </Link>

                <Link
                  href={`${baseUrl}/payments`}
                  className={`hover:bg-accent hover:text-foreground relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 ${
                    activeTab === 'payments'
                      ? 'after:bg-primary bg-transparent shadow-none font-semibold'
                      : 'after:opacity-0 hover:after:opacity-50'
                  } px-3 py-2 rounded flex items-center`}
                >
                  <CreditCard className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />
                  Payments
                </Link>
              </div>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
            <div className='flex flex-col gap-6 py-2 md:flex-row relative'>
              <div className='w-full lg:flex-1 md:px-2'>
                {activeTab === 'activity' && <ProjectActivity />}
                {activeTab === 'home' && <ProjectHome />}
                {activeTab === 'timeline' && <TimelineExample />}
                {activeTab === 'schedule' && <ProjectSchedule />}
                {activeTab === 'files' && <ProjectFiles />}
                {activeTab === 'modules' && <ProjectModules />}
                {activeTab === 'payments' && <ProjectPayments />}
              </div>

              {/* Desktop Sidebar - only visible on lg and larger screens */}
              <div className='hidden lg:block'>
                <ProjectSidebar onUpdateProject={handleUpdateProject} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
