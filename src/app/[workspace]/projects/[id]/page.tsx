'use client';

import ProjectHeader from '@/components/ProjectPage/ProjectHeader';
import ProjectMain from '@/components/ProjectPage/ProjectMain';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import ProjectAlertDialog from './components/ProjectAlertDialog';
import ProjectWrapper from './components/ProjectWrapper';

export default function ProjectPage() {
  const { id } = useParams();

  return (
    <ProjectProvider projectId={id as string}>
      <ProjectWrapper>
        <div className='flex-1 flex flex-col h-full'>
          <ProjectHeader />
          <BlockWrapper className='flex-1 overflow-auto min-h-0'>
            <div className='container mx-auto flex flex-col px-0 py-3 h-full overflow-auto'>
              {/* Debug alert placement */}
              <div className='bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200 flex justify-between items-center'>
                <div>
                  <h3 className='font-medium'>Project Alerts</h3>
                </div>
                <ProjectAlertDialog />
              </div>

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
