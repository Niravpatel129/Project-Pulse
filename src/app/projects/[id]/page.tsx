'use client';

import ProjectHeader from '@/components/ProjectPage/ProjectHeader';
import ProjectMain from '@/components/ProjectPage/ProjectMain';

export default function ProjectPage() {
  return (
    <div className='min-h-screen bg-white'>
      <ProjectHeader />
      <div className='container mx-auto flex items-center justify-between px-10 py-2'>
        <ProjectMain />
      </div>
    </div>
  );
}
