'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckCircle, Clock, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import useProjectAlert from '../hooks/useProjectAlert';

export default function DesktopProjectAlertBanner() {
  const { alerts, dismissAlert, remindInThreeDays, updateProjectStatus, markProjectAsFinished } =
    useProjectAlert();
  const editorRef = useRef<HTMLDivElement | null>(null);

  // Clean up classes if component unmounts during animation
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.classList.remove('editor-flash');
      }
    };
  }, []);

  if (!alerts || alerts.length === 0) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes flash-shadow {
          0% {
            box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 113, 227, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 113, 227, 0);
          }
        }

        .editor-flash {
          animation: flash-shadow 1.5s ease-out;
        }
      `}</style>

      {alerts.map((alert) => {
        return (
          <div key={alert._id} className='rounded-xl bg-[#fffbb3] mb-4'>
            <div className='px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <h3 className='text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]'>
                    {alert.message}
                  </h3>
                </div>

                <div className='flex items-center gap-2'>
                  {/* Project actions */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-8 rounded-full text-xs font-medium border-[#1D1D1F]/20 hover:bg-[#E8E8ED] dark:hover:bg-[#2D2D2F] dark:border-[#F5F5F7]/20'
                      >
                        <CheckCircle className='h-3.5 w-3.5 mr-1' />
                        Close Project
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-1 rounded-xl shadow-lg border-0 bg-[#F5F5F7] dark:bg-[#1D1D1F]'
                      align='end'
                    >
                      <div className='grid gap-0.5'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return markProjectAsFinished();
                          }}
                          className='justify-start text-xs h-8 font-medium rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2D2D2F]'
                        >
                          Mark as Completed
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return markProjectAsFinished();
                          }}
                          className='justify-start text-xs h-8 font-medium rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2D2D2F]'
                        >
                          Archive Project
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Reminder options */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-8 rounded-full text-xs font-medium border-[#1D1D1F]/20 hover:bg-[#E8E8ED] dark:hover:bg-[#2D2D2F] dark:border-[#F5F5F7]/20'
                      >
                        <Clock className='h-3.5 w-3.5 mr-1' />
                        Remind Later
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-auto p-1 rounded-xl shadow-lg border-0 bg-[#F5F5F7] dark:bg-[#1D1D1F]'
                      align='end'
                    >
                      <div className='grid gap-0.5'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return remindInThreeDays(alert._id);
                          }}
                          className='justify-start text-xs h-8 font-medium rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2D2D2F]'
                        >
                          Tomorrow
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return remindInThreeDays(alert._id);
                          }}
                          className='justify-start text-xs h-8 font-medium rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2D2D2F]'
                        >
                          In 3 days
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            return remindInThreeDays(alert._id);
                          }}
                          className='justify-start text-xs h-8 font-medium rounded-lg text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2D2D2F]'
                        >
                          In a week
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Mute/dismiss button */}
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => {
                      return dismissAlert(alert._id);
                    }}
                    className='h-8 w-8 rounded-full text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#E8E8ED] dark:hover:bg-[#2D2D2F]'
                  >
                    <X className='h-4 w-4' />
                    <span className='sr-only'>Dismiss</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
