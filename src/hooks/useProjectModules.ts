import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface ProjectModule {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  name: string;
  description: string;
}

export function useProjectModules() {
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { project } = useProject();

  useEffect(() => {
    return () => {
      queryClient.invalidateQueries({ queryKey: ['projectModules'] });
    };
  }, [queryClient]);

  const {
    data: modules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projectModules'],
    queryFn: async () => {
      const { data } = await newRequest.get(`/project-modules/${project._id}`);
      return data;
    },
  });

  const addModuleMutation = useMutation({
    mutationFn: async ({ content, type }: { content; type: string }) => {
      const { data } = await newRequest.post('/project-modules', {
        moduleType: type,
        moduleContent: content,
        projectId: project._id,
      });
      return data;
    },
    onSuccess: () => {
      toast.success('Module added successfully');
    },
    onError: () => {
      toast.error('Failed to add module');
    },
  });

  const templates: Template[] = [
    { name: 'Project Brief', description: 'Standard project overview template' },
    { name: 'Design Spec', description: 'Design specification document' },
    { name: 'Technical Doc', description: 'Technical documentation template' },
    { name: 'Meeting Notes', description: 'Meeting notes template' },
  ];

  const handleAddFileToProject = ({ type, content }: { type: string; content: any }) => {
    setIsFileUploadModalOpen(false);
    console.log('Uploaded files:', content);
    toast.success('File uploaded successfully');
    addModuleMutation.mutate({
      content: {
        fileId: content._id,
        fileName: content.name,
      },
      type,
    });
  };

  return {
    isFileUploadModalOpen,
    setIsFileUploadModalOpen,
    modules,
    isLoading,
    error,
    addModule: addModuleMutation.mutate,
    templates,
    handleAddFileToProject,
  };
}
