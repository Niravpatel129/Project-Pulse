import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectFile } from '@/lib/mock/projectFiles';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDownUp, Check, History } from 'lucide-react';
import React, { useState } from 'react';

interface TemplateItemHistoryModalProps {
  item: ProjectFile;
  onClose: () => void;
  onVersionRestore?: (itemId: string, versionId: string) => void;
  onVersionView?: (itemId: string, versionId: string) => void;
}

const TemplateItemHistoryModal: React.FC<TemplateItemHistoryModalProps> = ({
  item,
  onClose,
  onVersionRestore,
  onVersionView,
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const versions = item.versions || [];

  const handleRestoreVersion = (versionId: string) => {
    if (onVersionRestore) {
      onVersionRestore(item.id, versionId);
    }
  };

  const handleViewVersion = (versionId: string) => {
    if (onVersionView) {
      onVersionView(item.id, versionId);
    }
  };

  const sortedVersions = [...versions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <History className='h-5 w-5' /> Version History
          </DialogTitle>
          <DialogDescription>View and manage all versions of {item.name}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-1'
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <ArrowDownUp className='h-4 w-4' />
              {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            </Button>
          </div>

          <div className='space-y-2'>
            {sortedVersions.length > 0 ? (
              sortedVersions.map((version, index) => {
                const isLatest = index === 0 && sortOrder === 'desc';
                return (
                  <div
                    key={version.id}
                    className={`border rounded-md p-3 ${
                      isLatest ? 'bg-primary/5 border-primary/30' : ''
                    }`}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <div className='flex items-center gap-1'>
                          <span className='font-medium'>
                            Version {sortedVersions.length - index}
                          </span>
                          {isLatest && (
                            <span className='bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5 flex items-center gap-0.5'>
                              <Check className='h-3 w-3' /> Current
                            </span>
                          )}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {formatDistanceToNow(new Date(version.date), { addSuffix: true })} by{' '}
                          {version.createdBy}
                        </div>
                      </div>
                    </div>
                    <p className='text-sm mb-3'>{version.changes}</p>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex items-center gap-1'
                        onClick={() => handleViewVersion(version.id)}
                      >
                        View Details
                      </Button>
                      {!isLatest && (
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => handleRestoreVersion(version.id)}
                        >
                          Restore to This Version
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className='text-center py-6 text-muted-foreground'>
                <p>No version history available for this template item.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateItemHistoryModal;
