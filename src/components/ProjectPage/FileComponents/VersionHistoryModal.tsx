import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Attachment, FileVersion } from '@/lib/mock/projectFiles';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDownUp, Check, Clock, Download, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface VersionHistoryModalProps {
  attachment: Attachment;
  onClose: () => void;
  onVersionUpload?: (file: File, description: string) => void;
  onVersionRestore?: (versionId: string) => void;
  onVersionDownload?: (versionId: string) => void;
}

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  attachment,
  onClose,
  onVersionUpload,
  onVersionRestore,
  onVersionDownload,
}) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [versions, setVersions] = useState<FileVersion[]>(attachment.versions || []);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewVersionFile(e.target.files[0]);
    }
  };

  const handleUploadVersion = () => {
    if (!newVersionFile || !changeDescription.trim()) return;

    if (onVersionUpload) {
      onVersionUpload(newVersionFile, changeDescription);

      // Mock adding the version to the list (in a real app this would be handled by the server)
      const newVersion: FileVersion = {
        id: `v${versions.length + 1}`,
        versionNumber: versions.length + 1,
        versionId: `${Date.now()}`,
        dateCreated: new Date().toISOString(),
        createdBy: 'Current User', // Would come from auth in a real app
        changeDescription,
        size: `${(newVersionFile.size / (1024 * 1024)).toFixed(1)} MB`,
        url: '#',
        isCurrent: true,
      };

      // Set previous current version to false
      const updatedVersions = versions.map((v) => {return {
        ...v,
        isCurrent: false,
      }});

      setVersions([...updatedVersions, newVersion]);
      setShowUploadForm(false);
      setNewVersionFile(null);
      setChangeDescription('');
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    if (onVersionRestore) {
      onVersionRestore(versionId);

      // Mock updating the versions (in a real app this would be handled by the server)
      const updatedVersions = versions.map((v) => {return {
        ...v,
        isCurrent: v.versionId === versionId,
      }});

      setVersions(updatedVersions);
    }
  };

  const handleDownloadVersion = (versionId: string) => {
    if (onVersionDownload) {
      onVersionDownload(versionId);
    }
  };

  const sortedVersions = [...versions].sort((a, b) => {
    const dateA = new Date(a.dateCreated).getTime();
    const dateB = new Date(b.dateCreated).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' /> Version History
          </DialogTitle>
          <DialogDescription>View and manage all versions of {attachment.name}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center gap-1'
              onClick={() => {return setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}}
            >
              <ArrowDownUp className='h-4 w-4' />
              {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            </Button>
            <Button
              onClick={() => {return setShowUploadForm(!showUploadForm)}}
              size='sm'
              className='flex items-center gap-1'
            >
              <Upload className='h-4 w-4' />
              Upload New Version
            </Button>
          </div>

          {showUploadForm && (
            <div className='border rounded-md p-4 space-y-3 bg-muted/30'>
              <h3 className='font-medium'>Upload New Version</h3>
              <div className='space-y-2'>
                <Label htmlFor='version-file'>File</Label>
                <Input id='version-file' type='file' onChange={handleFileChange} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='change-description'>Change Description</Label>
                <Textarea
                  id='change-description'
                  placeholder='Describe what changed in this version...'
                  value={changeDescription}
                  onChange={(e) => {return setChangeDescription(e.target.value)}}
                  rows={2}
                />
              </div>
              <div className='flex justify-end gap-2 mt-3'>
                <Button variant='outline' size='sm' onClick={() => {return setShowUploadForm(false)}}>
                  Cancel
                </Button>
                <Button
                  size='sm'
                  onClick={handleUploadVersion}
                  disabled={!newVersionFile || !changeDescription.trim()}
                >
                  Upload
                </Button>
              </div>
            </div>
          )}

          <div className='space-y-2'>
            {sortedVersions.length > 0 ? (
              sortedVersions.map((version) => {return (
                <div
                  key={version.versionId}
                  className={`border rounded-md p-3 ${
                    version.isCurrent ? 'bg-primary/5 border-primary/30' : ''
                  }`}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <div className='flex items-center gap-1'>
                        <span className='font-medium'>Version {version.versionNumber}</span>
                        {version.isCurrent && (
                          <span className='bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5 flex items-center gap-0.5'>
                            <Check className='h-3 w-3' /> Current
                          </span>
                        )}
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {formatDistanceToNow(new Date(version.dateCreated), { addSuffix: true })} by{' '}
                        {version.createdBy}
                      </div>
                    </div>
                    <div className='text-sm text-muted-foreground'>{version.size}</div>
                  </div>
                  <p className='text-sm mb-3'>{version.changeDescription}</p>
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex items-center gap-1'
                      onClick={() => {return handleDownloadVersion(version.versionId)}}
                    >
                      <Download className='h-3.5 w-3.5' />
                      Download
                    </Button>
                    {!version.isCurrent && (
                      <Button
                        size='sm'
                        variant='secondary'
                        onClick={() => {return handleRestoreVersion(version.versionId)}}
                      >
                        Set as Current
                      </Button>
                    )}
                  </div>
                </div>
              )})
            ) : (
              <div className='text-center py-6 text-muted-foreground'>
                <p>No version history available for this file.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionHistoryModal;
