import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useProject } from '@/contexts/ProjectContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProjectData } from './types';

interface ProjectBannerProps {
  project: ProjectData & {
    name: string;
    projectType: string;
    createdAt: string | Date;
  };
  bannerRef: React.RefObject<HTMLDivElement>;
}

export function ProjectBanner({ project, bannerRef }: ProjectBannerProps) {
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState(project.name);
  const queryClient = useQueryClient();
  const { updateProject } = useProject();

  const updateProjectNameMutation = useMutation({
    mutationFn: async (name: string) => {
      return updateProject({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      toast.success('Project name updated successfully');
      setIsEditNameModalOpen(false);
    },
    onError: (error) => {
      console.error('Error updating project name:', error);
      toast.error('Failed to update project name');
    },
  });

  const handleUpdateProjectName = () => {
    if (!newProjectName.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    updateProjectNameMutation.mutate(newProjectName);
  };

  return (
    <div ref={bannerRef} className='w-full'>
      <div className='container mx-auto px-4 py-1 sm:py-1'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
          <div className='relative h-8 w-8 sm:h-16 sm:w-16 rounded-md overflow-hidden'>
            <Image
              src='https://picsum.photos/200'
              alt='Project Thumbnail'
              fill
              className='object-cover'
              priority
            />
          </div>
          <div>
            <h1
              className='text-xl sm:text-2xl font-medium capitalize cursor-pointer hover:underline'
              onClick={() => {
                return setIsEditNameModalOpen(true);
              }}
            >
              {project.name}
            </h1>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              {project.projectType} - Created on{' '}
              {new Date(project.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isEditNameModalOpen} onOpenChange={setIsEditNameModalOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Project Name</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <Input
              id='projectName'
              value={newProjectName}
              onChange={(e) => {
                return setNewProjectName(e.target.value);
              }}
              placeholder='Enter project name'
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                return setIsEditNameModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProjectName}
              disabled={updateProjectNameMutation.isPending}
            >
              {updateProjectNameMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
