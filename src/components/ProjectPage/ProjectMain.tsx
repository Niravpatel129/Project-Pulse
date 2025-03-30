'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useProject, type Project } from '@/contexts/ProjectContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, CreditCard, Home, Menu, PanelsTopLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState, useTransition } from 'react';
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const projectId = params.id as string;

  const getActiveTab = () => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    return lastSegment === projectId ? 'home' : lastSegment;
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const handleResize = () => {
      return setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      return window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleUpdateProject = async (data: Partial<Project>) => {
    await updateProject(data);
  };

  const baseUrl = `/projects/${projectId}`;

  const navigationLinks = [
    { href: baseUrl, label: 'Home', icon: Home, tab: 'home' },
    { href: `${baseUrl}/schedule`, label: 'Schedule', icon: CalendarDays, tab: 'schedule' },
    { href: `${baseUrl}/modules`, label: 'Modules', icon: PanelsTopLeft, tab: 'modules', badge: 5 },
    { href: `${baseUrl}/payments`, label: 'Payments', icon: CreditCard, tab: 'payments' },
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
        {badge && (
          <Badge className='ms-1.5 min-w-5 px-1 bg-primary/10' variant='secondary'>
            {badge}
          </Badge>
        )}
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
    <div className='min-h-screen w-full bg-white/30 backdrop-blur-sm'>
      <div className='lg:hidden flex justify-end py-3'>
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
      </div>

      <div className='w-full'>
        <ScrollArea className='pb-2'>
          <div className='flex gap-2 py-1'>{navigationLinks.map(renderNavigationLink)}</div>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>

        <div className='flex flex-col gap-6 py-2 md:flex-row'>
          <div className='w-full lg:flex-1 md:px-2'>
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
              >
                <Suspense
                  fallback={<div className='w-full h-32 animate-pulse bg-accent/20 rounded-lg' />}
                >
                  {activeTab === 'activity' && <ProjectActivity />}
                  {activeTab === 'home' && <ProjectHome />}
                  {activeTab === 'timeline' && <TimelineExample />}
                  {activeTab === 'schedule' && <ProjectSchedule />}
                  {activeTab === 'files' && <ProjectFiles />}
                  {activeTab === 'modules' && <ProjectModules />}
                  {activeTab === 'payments' && <ProjectPayments />}
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
