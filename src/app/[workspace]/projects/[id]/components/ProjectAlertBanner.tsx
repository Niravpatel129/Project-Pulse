'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Bell, Check, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import useProjectAlert from '../hooks/useProjectAlert';

// Status options for the dropdown
const PROJECT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'completed', label: 'Completed' },
];

interface ProjectAlertBannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectAlertBanner({ isOpen, onClose }: ProjectAlertBannerProps) {
  const {
    alerts,
    isLoading,
    dismissAlert,
    remindInThreeDays,
    updateProjectStatus,
    markProjectAsFinished,
    isDismissing,
    isReminding,
    isUpdatingStatus,
    isMarkingFinished,
  } = useProjectAlert();

  // Log when props change for debugging
  useEffect(() => {
    console.log('ProjectAlertBanner isOpen:', isOpen);
  }, [isOpen]);

  // Only display the first non-dismissed alert
  const activeAlert = useMemo(() => {
    if (!alerts || alerts.length === 0) return null;
    return (
      alerts.find((alert) => {
        return !alert.isDismissed;
      }) || null
    );
  }, [alerts]);

  if (isLoading) return null;
  if (!activeAlert) return null;

  const alertTime = formatDistanceToNow(new Date(activeAlert.createdAt), { addSuffix: true });

  // Determine alert color based on type
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'inactivity':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800';
      case 'deadline':
        return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800';
      case 'payment':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:border-gray-700';
    }
  };

  // Determine alert badge color based on type
  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'inactivity':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'deadline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'payment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  // Get the alert icon color based on type
  const getAlertIconColor = (type: string) => {
    switch (type) {
      case 'inactivity':
        return 'text-amber-500';
      case 'deadline':
        return 'text-red-500';
      case 'payment':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleDismiss = () => {
    dismissAlert(activeAlert._id);
    onClose();
  };

  return (
    <>
      {/* Debug visibility indicator */}
      <div className='hidden'>Alert Banner isOpen: {isOpen ? 'true' : 'false'}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='w-full mb-4 overflow-hidden'
          >
            <Card
              className={`w-full p-0 overflow-hidden border-2 ${getAlertStyle(activeAlert.type)}`}
            >
              <div className='p-4 flex flex-col md:flex-row gap-3 md:items-center'>
                {/* Alert Icon and Message */}
                <div className='flex flex-1 items-center gap-3'>
                  <div className='flex-shrink-0'>
                    <AlertTriangle className={`h-5 w-5 ${getAlertIconColor(activeAlert.type)}`} />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-col md:flex-row md:items-center md:gap-2'>
                      <span className='font-medium'>{activeAlert.message}</span>
                      <Badge
                        variant='outline'
                        className={`${getAlertBadge(
                          activeAlert.type,
                        )} md:mt-0 mt-1 w-fit text-xs px-2`}
                      >
                        {activeAlert.type.charAt(0).toUpperCase() + activeAlert.type.slice(1)}
                      </Badge>
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>{alertTime}</p>
                  </div>
                </div>

                {/* Actions - Desktop layout */}
                <div className='hidden md:flex items-center gap-2 flex-wrap md:flex-nowrap'>
                  <Select onValueChange={updateProjectStatus}>
                    <SelectTrigger className='w-[140px] h-8'>
                      <SelectValue placeholder='Update status' />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((status) => {
                        return (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      return remindInThreeDays(activeAlert._id);
                    }}
                    disabled={isReminding}
                  >
                    <Bell className='h-4 w-4' />
                    Remind in 3 days
                  </Button>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={markProjectAsFinished}
                    disabled={isMarkingFinished}
                  >
                    <Check className='h-4 w-4' />
                    Mark as finished
                  </Button>

                  <Button variant='ghost' size='sm' onClick={handleDismiss} disabled={isDismissing}>
                    <X className='h-4 w-4' />
                    <span className='sr-only'>Dismiss</span>
                  </Button>
                </div>

                {/* Actions - Mobile layout */}
                <div className='flex md:hidden flex-wrap gap-2'>
                  <Select onValueChange={updateProjectStatus}>
                    <SelectTrigger className='w-full h-8'>
                      <SelectValue placeholder='Update status' />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUSES.map((status) => {
                        return (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <div className='flex w-full gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={() => {
                        return remindInThreeDays(activeAlert._id);
                      }}
                      disabled={isReminding}
                    >
                      <Bell className='h-4 w-4' />
                      Remind later
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1'
                      onClick={markProjectAsFinished}
                      disabled={isMarkingFinished}
                    >
                      <Check className='h-4 w-4' />
                      Mark finished
                    </Button>

                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleDismiss}
                      disabled={isDismissing}
                    >
                      <X className='h-4 w-4' />
                      <span className='sr-only'>Dismiss</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Export a component for the alert indicator that can be used in the header
export function ProjectAlertIndicator({
  hasAlert,
  onClick,
  type = 'inactivity',
}: {
  hasAlert: boolean;
  onClick: () => void;
  type?: string;
}) {
  if (!hasAlert) return null;

  // Determine alert color based on type
  const getAlertColor = (type: string) => {
    switch (type) {
      case 'inactivity':
        return 'text-amber-500';
      case 'deadline':
        return 'text-red-500';
      case 'payment':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <button
      onClick={onClick}
      className='relative p-1.5 rounded-full hover:bg-gray-100 transition-colors'
      aria-label='Project alert'
    >
      <AlertTriangle className={`h-5 w-5 ${getAlertColor(type)}`} />
      <span className='absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse' />
    </button>
  );
}
