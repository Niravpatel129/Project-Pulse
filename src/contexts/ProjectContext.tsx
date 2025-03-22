'use client';

import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export interface Project {
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

interface Participant {
  _id: string;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  status?: string;
}

interface ProjectContextType {
  project: Project | null;
  loading: boolean;
  error: string | null;
  updateProject: (data: Partial<Project>) => Promise<void>;
  participants: Participant[];
  fetchParticipants: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId: string;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Use react-query to fetch project data
  const { data: project, isLoading: loading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      try {
        const response = await newRequest.get(`/projects/${projectId}`);
        return response.data.data;
      } catch (err) {
        console.error('Error fetching project:', err);
        throw err;
      }
    },
    enabled: !!projectId,
  });

  const fetchParticipants = useCallback(async () => {
    if (!project?._id) return;
    try {
      const response = await newRequest.get(`/projects/${project._id}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  }, [project?._id]);

  useEffect(() => {
    if (project?._id) {
      fetchParticipants();
    }
  }, [project?._id, fetchParticipants]);

  const updateProject = async (data: Partial<Project>) => {
    try {
      const response = await newRequest.patch(`/projects/${projectId}`, data);
      if (response.data.success) {
        // Update the react-query cache
        queryClient.setQueryData(['project', projectId], (oldData: Project | undefined) => {
          if (!oldData) return response.data.data;
          return { ...oldData, ...data };
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
    <ProjectContext.Provider
      value={{ project, loading, error, updateProject, participants, fetchParticipants }}
    >
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
