import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileVersion } from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import { FileClock, RotateCcw } from 'lucide-react';
import React from 'react';

interface VersionCompareDialogProps {
  compareVersions: {
    older: FileVersion | null;
    newer: FileVersion | null;
  };
  handleRevertToVersion: (version: FileVersion) => void;
  onClose: () => void;
}

const VersionCompareDialog: React.FC<VersionCompareDialogProps> = ({
  compareVersions,
  handleRevertToVersion,
  onClose,
}) => {
  return (
    <DialogContent className='max-w-4xl h-[80vh]'>
      <DialogHeader>
        <DialogTitle>Compare Versions</DialogTitle>
        <DialogDescription>
          Comparing Version {compareVersions.older?.versionNumber} with Version{' '}
          {compareVersions.newer?.versionNumber}
        </DialogDescription>
      </DialogHeader>

      <div className='h-full overflow-hidden py-4'>
        <div className='flex justify-between mb-4'>
          <div className='flex-1 border-r pr-4'>
            <div className='flex items-center mb-2'>
              <span className='text-sm font-medium mr-3'>
                Version {compareVersions.older?.versionNumber}
              </span>
              <span className='text-xs text-gray-500'>
                {compareVersions.older?.dateCreated &&
                  format(new Date(compareVersions.older.dateCreated), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <div className='text-sm text-gray-700 mb-2'>
              {compareVersions.older?.changeDescription}
            </div>
          </div>
          <div className='flex-1 pl-4'>
            <div className='flex items-center mb-2'>
              <span className='text-sm font-medium mr-3'>
                Version {compareVersions.newer?.versionNumber}
              </span>
              <span className='text-xs text-gray-500'>
                {compareVersions.newer?.dateCreated &&
                  format(new Date(compareVersions.newer.dateCreated), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            <div className='text-sm text-gray-700 mb-2'>
              {compareVersions.newer?.changeDescription}
            </div>
          </div>
        </div>

        {/* Comparison view */}
        <div className='border rounded-md h-[calc(100%-120px)] overflow-hidden flex'>
          {/* Left side: older version */}
          <div className='w-1/2 border-r overflow-auto p-1'>
            <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
              <div className='text-center p-4'>
                <FileClock className='mx-auto h-12 w-12 text-gray-400 mb-2' />
                <p className='text-sm text-gray-500'>
                  Version {compareVersions.older?.versionNumber} Preview
                </p>
              </div>
            </div>
          </div>

          {/* Right side: newer version */}
          <div className='w-1/2 overflow-auto p-1'>
            <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
              <div className='text-center p-4'>
                <FileClock className='mx-auto h-12 w-12 text-gray-400 mb-2' />
                <p className='text-sm text-gray-500'>
                  Version {compareVersions.newer?.versionNumber} Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant='outline'
          onClick={() => compareVersions.older && handleRevertToVersion(compareVersions.older)}
          disabled={!compareVersions.older}
        >
          <RotateCcw className='h-4 w-4 mr-1' />
          Restore Version {compareVersions.older?.versionNumber}
        </Button>
        <Button variant='default' onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default VersionCompareDialog;
