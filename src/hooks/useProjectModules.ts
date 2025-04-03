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

export interface TemplateField {
  name: string;
  type: string;
  required: boolean;
  options: any[];
  multiple: boolean;
  lookupFields: string[];
  relationType?: string;
  _id: string;
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  fields: TemplateField[];
  workspace: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await newRequest.get('/module-templates');
      return data.data;
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
    isLoadingTemplates,
    handleAddFileToProject,
  };
}
