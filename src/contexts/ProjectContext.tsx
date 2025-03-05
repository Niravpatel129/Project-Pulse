'use client';

import { newRequest } from '@/utils/newRequest';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface Project {
  _id: string;
  name: string;
  projectType: string;
  createdAt: string;
  projectStatus: string;
  tasks: Array<{
    _id: string | number;
    title: string;
    description: string;
    status: string;
    dueDate: string;
  }>;
  participants: Array<{
    _id: string;
    name: string;
    role: string;
    avatar?: string;
    email?: string;
    status?: string;
  }>;
  stage?: string;
  leadSource?: string;
  workflow?: {
    name: string;
    status: string;
  };
}

interface ProjectContextType {
  project: Project | null;
  loading: boolean;
  error: string | null;
  updateProject: (data: Partial<Project>) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId: string;
}) {
  const [project, setProject] = useState<Project | null>(null);
  console.log('🚀 project:', project);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await newRequest.get(`/projects/${projectId}`);
        setProject(response.data.data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const updateProject = async (data: Partial<Project>) => {
    try {
      const response = await newRequest.patch(`/projects/${projectId}`, data);
      if (response.data.success) {
        // Update only the changed fields in the project state
        setProject((prevProject) => {
          if (!prevProject) return response.data.data;
          return { ...prevProject, ...data };
        });
      } else {
        throw new Error(response.data.message || 'Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      throw new Error('Failed to update project');
    }
  };

  return (
    <ProjectContext.Provider value={{ project, loading, error, updateProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
