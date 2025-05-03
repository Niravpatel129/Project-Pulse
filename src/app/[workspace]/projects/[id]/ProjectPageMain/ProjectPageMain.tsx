import ProjectHeader from '@/components/ProjectPage/ProjectHeader';
import ProjectInvoiceReview from '@/components/ProjectPage/ProjectInvoiceReview/ProjectInvoiceReview';
import ProjectInvoiceStatus from '@/components/ProjectPage/ProjectInvoiceStatus/ProjectInvoiceStatus';
import ProjectMain from '@/components/ProjectPage/ProjectMain';
import BlockWrapper from '@/components/wrappers/BlockWrapper';
import { useProject } from '@/contexts/ProjectContext';
import { Suspense } from 'react';
import DesktopProjectAlertBanner from '../components/DesktopProjectAlertBanner';

export default function ProjectPageMain() {
  const { project } = useProject();

  return (
    <div>
      <div className='flex-1 flex flex-col h-full'>
        <ProjectHeader />
        {project?.state === 'invoice-created' || project?.state === 'invoice-paid' ? (
          <>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <ProjectInvoiceReview />
              </div>
              <div className='w-full md:w-[320px] lg:w-[360px]'>
                <BlockWrapper className='py-5 px-6'>
                  <ProjectInvoiceStatus />
                </BlockWrapper>
              </div>
            </div>
          </>
        ) : (
          <BlockWrapper className='flex-1 overflow-auto min-h-0'>
            <div className='container mx-auto flex flex-col px-0 py-3 h-full overflow-auto'>
              <DesktopProjectAlertBanner />
              <Suspense
                fallback={
                  <div className='w-full h-32 animate-pulse bg-gray-100 rounded-lg mb-10' />
                }
              >
                <ProjectMain />
              </Suspense>
            </div>
          </BlockWrapper>
        )}
      </div>
    </div>
  );
}
