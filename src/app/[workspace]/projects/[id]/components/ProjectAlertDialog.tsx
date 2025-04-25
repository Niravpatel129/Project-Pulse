'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Bell, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import useProjectAlert from '../hooks/useProjectAlert';

// Status options for the dropdown
const PROJECT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'completed', label: 'Completed' },
];

// Default alert for testing (in case no alert exists)
const DEFAULT_TEST_ALERT = {
  _id: 'test-alert-id',
  project: 'test-project',
  type: 'inactivity',
  message: 'No updates in 7 days.',
  isDismissed: false,
  createdBySystem: true,
  sentAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function ProjectAlertDialog() {
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    console.log('ProjectAlertDialog - Alerts:', alerts);
    console.log('ProjectAlertDialog - isLoading:', isLoading);
  }, [alerts, isLoading]);

  // Use either a real alert or the default test alert
  const activeAlert =
    (alerts &&
      alerts.find((alert) => {
        return !alert.isDismissed;
      })) ||
    DEFAULT_TEST_ALERT;

  const alertTime = formatDistanceToNow(new Date(activeAlert.createdAt), { addSuffix: true });

  // Get alert type
  const type = activeAlert.type || 'inactivity';

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

  const handleDismiss = () => {
    // Only call API if it's a real alert
    if (activeAlert._id !== 'test-alert-id') {
      dismissAlert(activeAlert._id);
    }
    setOpen(false);
  };

  return (
    <div className='relative'>
      {/* Added outer container for visibility */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className='relative p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm'
            aria-label='Project alert'
            onClick={() => {
              return console.log('Alert button clicked');
            }}
          >
            <AlertTriangle className={`h-5 w-5 ${getAlertColor(type)}`} />
            <span className='absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse' />
          </button>
        </DialogTrigger>

        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className={`h-5 w-5 ${getAlertColor(type)}`} />
              Project Alert
            </DialogTitle>
          </DialogHeader>

          <div className='my-2'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col space-y-2'>
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='font-medium'>{activeAlert.message}</p>
                    <p className='text-xs text-gray-500 mt-1'>{alertTime}</p>
                  </div>
                  <Badge variant='outline' className={`${getAlertBadge(type)} h-fit text-xs px-2`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className='flex flex-col sm:flex-row gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                if (activeAlert._id !== 'test-alert-id') {
                  remindInThreeDays(activeAlert._id);
                }
              }}
              disabled={isReminding}
              className='w-full sm:w-auto'
            >
              <Bell className='h-4 w-4 mr-2' />
              Remind in 3 days
            </Button>

            <Button
              onClick={markProjectAsFinished}
              disabled={isMarkingFinished}
              className='w-full sm:w-auto'
            >
              <Check className='h-4 w-4 mr-2' />
              Mark as finished
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
