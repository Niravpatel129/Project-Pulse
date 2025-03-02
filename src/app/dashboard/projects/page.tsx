'use client';

import ProjectsPage from '@/app/projects/page';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardProjectsPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // For this implementation, we'll reuse the existing projects page
  // Eventually, you might want to copy the actual implementation here instead
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className='container mx-auto py-8'>Loading projects...</div>;
  }

  return (
    <>
      <ProjectsPage />
    </>
  );
}
