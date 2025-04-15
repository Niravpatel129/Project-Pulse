'use client';

import ProjectHeader from '@/components/ProjectPage/ProjectHeader';
import ProjectMain from '@/components/ProjectPage/ProjectMain';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import ProjectWrapper from './components/ProjectWrapper';

export default function ProjectPage() {
  const { id } = useParams();

  return (
    <ProjectProvider projectId={id as string}>
      <ProjectWrapper>
        <div className='flex-1'>
          <ProjectHeader />
          <BlockWrapper>
            <div className='container mx-auto flex items-center justify-between px-0 py-3'>
              <Suspense
                fallback={
                  <div className='w-full h-32 animate-pulse bg-gray-100 rounded-lg mb-10' />
                }
              >
                <ProjectMain />
              </Suspense>
            </div>
          </BlockWrapper>
        </div>
      </ProjectWrapper>
    </ProjectProvider>
  );
}
