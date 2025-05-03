'use client';

import { ProjectProvider } from '@/contexts/ProjectContext';
import { useParams } from 'next/navigation';
import ProjectWrapper from './components/ProjectWrapper';
import ProjectPageMain from './ProjectPageMain/ProjectPageMain';

export default function ProjectPage() {
  const { id } = useParams();

  return (
    <ProjectProvider projectId={id as string}>
      <ProjectWrapper>
        <ProjectPageMain />
      </ProjectWrapper>
    </ProjectProvider>
  );
}
