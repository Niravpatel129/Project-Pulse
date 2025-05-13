'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useProject, type Project } from '@/contexts/ProjectContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChartBar, Home, PanelsTopLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import ProjectActivity from './ProjectActivity';
import ProjectHome from './ProjectHome';
import ProjectKanban from './ProjectKanban/ProjectKanban';
import ProjectModules from './ProjectModules/ProjectModules';
import ProjectSchedule from './ProjectSchedule';
import { ProjectSidebar } from './ProjectSidebar';
import TimelineExample from './TimelineExample';

export default function ProjectMain() {
  const { updateProject } = useProject();
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;

  const getActiveTab = () => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    return lastSegment === projectId ? 'home' : lastSegment;
  };

  const activeTab = getActiveTab();

  const handleUpdateProject = async (data: Partial<Project>) => {
    await updateProject(data);
  };

  const baseUrl = `/projects/${projectId}`;

  const navigationLinks = [
    { href: baseUrl, label: 'Home', icon: Home, tab: 'home' },
    { href: `${baseUrl}/kanban`, label: 'Kanban', icon: ChartBar, tab: 'kanban' },
    { href: `${baseUrl}/schedule`, label: 'Schedule', icon: CalendarDays, tab: 'schedule' },
    {
      href: `${baseUrl}/deliverables`,
      label: 'Deliverables',
      icon: PanelsTopLeft,
      tab: 'deliverables',
      badge: 5,
    },
  ];

  const renderNavigationLink = ({
    href,
    label,
    icon: Icon,
    tab,
    badge,
  }: {
    href: string;
    label: string;
    icon: any;
    tab: string;
    badge?: number;
  }) => {
    const isActive = activeTab === tab;
    return (
      <Link
        key={tab}
        href={href}
        scroll={false}
        prefetch={true}
        className='relative flex items-center px-3 py-2 rounded transition-colors duration-200 hover:bg-accent/80 hover:text-foreground'
      >
        <Icon className='me-1.5 opacity-80' size={16} aria-hidden='true' />
        {label}

        {isActive && (
          <motion.div
            className='absolute inset-x-0 bottom-0 h-0.5 bg-primary'
            layoutId='activeTab'
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          />
        )}
      </Link>
    );
  };

  return (
    <div className='w-full h-full bg-white/30 backdrop-blur-sm'>
      {/* <div className='lg:hidden flex justify-end py-3'>
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <button className='p-2 rounded-md transition-all duration-200 hover:bg-accent/90'>
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent className='w-[85%] sm:max-w-md'>
            <ProjectSidebar onUpdateProject={handleUpdateProject} />
          </SheetContent>
        </Sheet>
      </div> */}

      <div className='w-full h-full flex flex-col'>
        <ScrollArea className='pb-2'>
          <div className='flex gap-2 py-1'>{navigationLinks.map(renderNavigationLink)}</div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>

        <div className='flex flex-col gap-6 py-2 md:flex-row flex-1 '>
          <div className='w-full lg:flex-1 md:px-2 overflow-x-auto '>
            <AnimatePresence mode='wait'>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                className='h-full'
              >
                <Suspense
                  fallback={<div className='w-full h-32 animate-pulse bg-accent/20 rounded-lg' />}
                >
                  {activeTab === 'activity' && <ProjectActivity />}
                  {activeTab === 'home' && <ProjectHome />}
                  {activeTab === 'kanban' && <ProjectKanban />}
                  {activeTab === 'timeline' && <TimelineExample />}
                  {activeTab === 'schedule' && <ProjectSchedule />}
                  {activeTab === 'deliverables' && <ProjectModules />}
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className='hidden lg:block'>
            <ProjectSidebar onUpdateProject={handleUpdateProject} />
          </div>
        </div>
      </div>
    </div>
  );
}
