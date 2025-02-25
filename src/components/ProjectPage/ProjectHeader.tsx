import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';

export default function ProjectHeader() {
  return (
    <div className='bg-white border-b'>
      {/* Project Banner */}
      <div className='container mx-auto px-4 py-6 border-b'>
        <div className='flex items-center gap-4'>
          <div className='relative h-16 w-16 rounded-md overflow-hidden'>
            <Image
              src='https://picsum.photos/200'
              alt='Project Thumbnail'
              fill
              className='object-cover'
              priority
            />
          </div>
          <div>
            <h1 className='text-2xl font-medium'>Wedding Photography Project</h1>
            <p className='text-sm text-muted-foreground'>Created on April 15, 2023</p>
          </div>
        </div>
      </div>

      {/* Participants Section */}
      <div className='container mx-auto flex items-center justify-between px-10 py-2'>
        <span className='text-xs text-muted-foreground'>Visible to you + 1 participant</span>
      </div>
      <div className='container mx-auto flex items-center justify-between px-4 pb-4'>
        <div className='flex items-center gap-4'>
          <TooltipProvider>
            <div className='flex items-center gap-4'>
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
                <div>
                  <p className='text-sm font-medium'>You</p>
                  <p className='text-xs text-muted-foreground'>PHOTOGRAPHER</p>
                </div>
              </div>

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
                <div>
                  <p className='text-sm font-medium'>Shannon Zurawski</p>
                  <p className='text-xs text-muted-foreground'>CLIENT</p>
                </div>
              </div>

              <Button
                variant='outline'
                className='ml-2 gap-1 rounded-full border-dashed hover:bg-gray-50'
              >
                <PlusCircle className='h-4 w-4' />
                <span className='text-xs'>ADD PARTICIPANT</span>
              </Button>
            </div>
          </TooltipProvider>
        </div>
        <Button className='bg-[#5DD3D1] hover:bg-[#4CC3C1] text-white'>NEW FILE</Button>
      </div>
    </div>
  );
}
