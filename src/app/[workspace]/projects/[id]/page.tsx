'use client';

import ProjectHeader from '@/components/ProjectPage/ProjectHeader';
import ProjectMain from '@/components/ProjectPage/ProjectMain';
import { newRequest } from '@/utils/newRequest';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  console.log('🚀 project:', project);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await newRequest.get(`/projects/${id}`);
        setProject(response.data.data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  if (loading)
    return (
      <div className='min-h-screen flex items-center justify-center w-full'>Loading project...</div>
    );
  if (error)
    return (
      <div className='min-h-screen flex items-center justify-center text-red-500'>{error}</div>
    );

  return (
    <div className='min-h-screen bg-white w-full'>
      <ProjectHeader project={project} />
      <div className='container mx-auto flex items-center justify-between px-0 py-6'>
        <ProjectMain />
      </div>
    </div>
  );
}
