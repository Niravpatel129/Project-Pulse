import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';

export default function ProjectHeader() {
  return (
    <div className='bg-white border-b'>
      {/* Project Banner */}
      <div className='container mx-auto px-4 py-4 sm:py-6'>
        <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
          <div className='relative h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden'>
            <Image
              src='https://picsum.photos/200'
              alt='Project Thumbnail'
              fill
              className='object-cover'
              priority
            />
          </div>
          <div>
            <h1 className='text-xl sm:text-2xl font-medium'>Wedding Photography Project</h1>
            <p className='text-xs sm:text-sm text-muted-foreground'>Created on April 15, 2023</p>
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <div className='container mx-auto px-4 py-3 sm:py-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-4'>
            <TooltipProvider>
              <div className='flex flex-wrap items-center gap-4'>
                {/* You */}
                <div className='flex items-center gap-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className='h-8 w-8 cursor-pointer'>
                        <AvatarImage src='https://picsum.photos/100/100?random=1' alt='You' />
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <p className='font-medium'>You</p>
                        <p className='text-xs text-muted-foreground'>PHOTOGRAPHER</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className='hidden sm:block'>
                    <p className='text-sm font-medium'>You</p>
                    <p className='text-xs text-muted-foreground'>PHOTOGRAPHER</p>
                  </div>
                </div>

                {/* Client */}
                <div className='flex items-center gap-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className='flex h-8 w-8 cursor-pointer items-center justify-center bg-gray-100'>
                        <span className='text-sm'>SZ</span>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>
                        <p className='font-medium'>Shannon Zurawski</p>
                        <p className='text-xs text-muted-foreground'>CLIENT</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <div className='hidden sm:block'>
                    <p className='text-sm font-medium'>Shannon Zurawski</p>
                    <p className='text-xs text-muted-foreground'>CLIENT</p>
                  </div>
                </div>

                {/* Add Participant Button */}
                <Button
                  variant='outline'
                  className='ml-0 sm:ml-2 gap-1 rounded-full border-dashed hover:bg-gray-50'
                  size='sm'
                >
                  <PlusCircle className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='text-xs hidden xs:inline'>ADD PARTICIPANT</span>
                </Button>
              </div>
            </TooltipProvider>
          </div>
          <Button className='bg-[#5DD3D1] hover:bg-[#4CC3C1] text-white w-full sm:w-auto'>
            NEW FILE
          </Button>
        </div>
      </div>
    </div>
  );
}
