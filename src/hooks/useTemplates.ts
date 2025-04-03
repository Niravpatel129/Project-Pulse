import { Template } from '@/api/models';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useTemplates = () => {
  const queryClient = useQueryClient();

  const createTemplate = useMutation({
    mutationFn: (data: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
      return newRequest.post('/module-templates', data);
    },
    onSuccess: () => {
      // Invalidate and refetch templates query
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create template');
      console.error('Error creating template:', error);
    },
  });

  return {
    createTemplate,
  };
};
