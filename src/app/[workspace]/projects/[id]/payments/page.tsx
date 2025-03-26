'use client';

import ProjectHeader from '@/components/ProjectPage/ProjectHeader';
import ProjectMain from '@/components/ProjectPage/ProjectMain';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { useParams } from 'next/navigation';

export default function ProjectPaymentsPage() {
  const { id } = useParams();

  return (
    <ProjectProvider projectId={id as string}>
      <div className='min-h-screen w-full mt-1 flex flex-col gap-4'>
        <ProjectHeader />
        <BlockWrapper>
          <div className='container mx-auto flex items-center justify-between px-0 py-3'>
            <ProjectMain />
          </div>
        </BlockWrapper>
      </div>
    </ProjectProvider>
  );
}
