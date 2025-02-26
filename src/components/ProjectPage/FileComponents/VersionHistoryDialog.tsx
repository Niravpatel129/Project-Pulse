import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Attachment, FileVersion } from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import { Check, Clock, Download, Eye, Plus, RefreshCw, Upload } from 'lucide-react';
import React from 'react';

interface VersionHistoryDialogProps {
  selectedAttachment: Attachment | null;
  changeDescription: string;
  setChangeDescription: (value: string) => void;
  notifyClient: boolean;
  setNotifyClient: (value: boolean) => void;
  handleCreateNewVersion: () => void;
  handleRevertToVersion: (version: FileVersion) => void;
  handleCompareVersions: (older: FileVersion, newer: FileVersion) => void;
}

const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({
  selectedAttachment,
  changeDescription,
  setChangeDescription,
  notifyClient,
  setNotifyClient,
  handleCreateNewVersion,
  handleRevertToVersion,
  handleCompareVersions,
}) => {
  if (!selectedAttachment) return null;

  return (
    <DialogContent className='max-w-3xl'>
      <DialogHeader>
        <DialogTitle>Version History</DialogTitle>
        <DialogDescription>
          {selectedAttachment.name} - Track changes and manage file versions
        </DialogDescription>
      </DialogHeader>

      <div className='py-4'>
        {/* New version form */}
        <div className='mb-6 p-4 border rounded-md bg-gray-50'>
          <h4 className='text-sm font-medium mb-2'>Upload New Version</h4>
          <div className='flex flex-col gap-3'>
            <div className='flex'>
              <div className='flex-grow'>
                <Label htmlFor='change-description' className='text-xs'>
                  What changed in this version?
                </Label>
                <Textarea
                  id='change-description'
                  placeholder='Describe what changes you made to the design...'
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className='border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center'>
              <Upload className='h-8 w-8 text-gray-400 mb-2' />
              <p className='text-sm text-gray-500 mb-2'>Drag and drop your updated file here</p>
              <Button
                size='sm'
                variant='outline'
                onClick={() => document.getElementById('version-file-upload')?.click()}
              >
                Browse Files
              </Button>
              <Input id='version-file-upload' type='file' className='hidden' />
            </div>

            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='notify-client'
                  checked={notifyClient}
                  onCheckedChange={setNotifyClient}
                />
                <Label htmlFor='notify-client' className='text-sm'>
                  Notify client(s) about this update
                </Label>
              </div>
              <Button onClick={handleCreateNewVersion} disabled={!changeDescription.trim()}>
                <Plus className='h-4 w-4 mr-1' />
                Save as New Version
              </Button>
            </div>
          </div>
        </div>

        {/* Version timeline */}
        <div className='mb-4'>
          <h4 className='text-sm font-medium mb-2'>Version Timeline</h4>
          <div className='relative pt-2 pb-2'>
            <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200'></div>
            <div className='space-y-4'>
              {selectedAttachment.versions?.map((version, index, versions) => (
                <div key={version.id} className='relative pl-12'>
                  <div
                    className={`absolute left-0 top-2 h-8 w-8 rounded-full flex items-center justify-center ${
                      version.isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {version.isCurrent ? (
                      <Check className='h-5 w-5' />
                    ) : (
                      <span>{version.versionNumber}</span>
                    )}
                  </div>
                  <div
                    className={`p-3 border rounded-md ${
                      version.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div>
                        <div className='flex items-center mb-1'>
                          {version.isCurrent ? (
                            <span className='bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mr-2'>
                              Current
                            </span>
                          ) : (
                            <span className='text-xs text-gray-500'>
                              Version {version.versionNumber}
                            </span>
                          )}
                          <span className='text-sm font-medium ml-2'>
                            {version.changeDescription}
                          </span>
                        </div>
                        <div className='flex items-center text-xs text-gray-500'>
                          <Clock className='h-3 w-3 mr-1' />
                          <span className='mr-2'>
                            {format(new Date(version.dateCreated), 'MMM d, yyyy h:mm a')}
                          </span>
                          <span className='mr-2'>• by {version.createdBy}</span>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        {!version.isCurrent && (
                          <Button
                            variant='outline'
                            size='sm'
                            className='mr-2'
                            onClick={() => handleRevertToVersion(version)}
                          >
                            <RefreshCw className='h-3 w-3 mr-1' />
                            Restore
                          </Button>
                        )}
                        <Button variant='ghost' size='sm'>
                          <Eye className='h-3 w-3 mr-1' />
                          View
                        </Button>
                        <Button variant='ghost' size='sm'>
                          <Download className='h-3 w-3 mr-1' />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Compare with previous version button */}
                    {index < versions.length - 1 && (
                      <div className='mt-2 flex justify-end'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-xs'
                          onClick={() => handleCompareVersions(versions[index + 1], version)}
                        >
                          Compare with Version {versions[index + 1].versionNumber}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default VersionHistoryDialog;
