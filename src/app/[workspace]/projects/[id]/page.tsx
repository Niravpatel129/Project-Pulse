'use client';

import ProjectHeader from '@/components/ProjectPage/ProjectHeader';
import ProjectMain from '@/components/ProjectPage/ProjectMain';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { useParams } from 'next/navigation';

export default function ProjectPage() {
  const { id } = useParams();

  return (
    <ProjectProvider projectId={id as string}>
      <div className='min-h-screen bg-white w-full'>
        <ProjectHeader />
        <div className='container mx-auto flex items-center justify-between px-0 py-3'>
          <ProjectMain />
        </div>
      </div>
    </ProjectProvider>
  );
}
