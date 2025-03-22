import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users } from 'lucide-react';
import Image from 'next/image';
import { ProjectData } from './types';

interface StickyHeaderProps {
  project: ProjectData & {
    name: string;
    projectType: string;
    projectStatus?: string;
  };
  onShowParticipants: () => void;
  onProjectStatus: () => void;
}

export function StickyHeader({ project, onShowParticipants, onProjectStatus }: StickyHeaderProps) {
  return (
    <div className='fixed bg-white top-0 left-0 right-0 z-50 shadow-md border-b'>
      <div className='container mx-auto px-4 py-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='relative h-8 w-8 rounded-md overflow-hidden'>
              <Image
                src='https://picsum.photos/200'
                alt='Project Thumbnail'
                fill
                className='object-cover'
                priority
              />
            </div>
            <h2 className='text-lg font-medium capitalize'>{project.name}</h2>
            <Badge variant='outline' className='ml-2 bg-gray-100 text-gray-800'>
              {project.projectType}
            </Badge>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-1'
              onClick={onShowParticipants}
            >
              <Users className='h-4 w-4' />
              <span className='hidden sm:inline'>Participants</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-1'
              onClick={onProjectStatus}
            >
              <Clock className='h-4 w-4' />
              <span className='hidden sm:inline'>Project Status</span>
              <Badge variant='outline' className='ml-2 bg-gray-100 text-gray-800'>
                {project.projectStatus || 'Active'}
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
