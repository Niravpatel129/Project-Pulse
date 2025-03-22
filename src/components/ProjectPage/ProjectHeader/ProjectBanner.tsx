import Image from 'next/image';
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
            <h1 className='text-xl sm:text-2xl font-medium capitalize'>{project.name}</h1>
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
    </div>
  );
}
