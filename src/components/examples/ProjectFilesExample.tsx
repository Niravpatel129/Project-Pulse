'use client';
import { FileType } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectFiles } from '@/contexts';
import { useEffect } from 'react';

export function ProjectFilesExample() {
  const {
    files,
    isLoading,
    error,
    loadFiles,
    createFile,
    deleteFile,
    updateStatus,
    filterFilesByType,
    clearFilters,
  } = useProjectFiles();

  useEffect(() => {
    // Load files when component mounts
    loadFiles();
  }, [loadFiles]);

  const handleCreateFile = async () => {
    const newFile = {
      name: `New Project ${new Date().toISOString()}`,
      type: 'proposal' as FileType,
      description: 'Created from example component',
      status: 'draft' as const,
      createdBy: 'current-user',
      attachments: [],
      comments: [],
    };

    await createFile(newFile);
  };

  const handleFilterByProposals = async () => {
    await filterFilesByType('proposal' as FileType);
  };

  const handleClearFilters = async () => {
    await clearFilters();
  };

  if (error) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-red-500'>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Project Files Example</CardTitle>
        <CardDescription>This component demonstrates using the ProjectFilesContext</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 mb-4'>
          <Button onClick={handleCreateFile}>Create File</Button>
          <Button variant='outline' onClick={handleFilterByProposals}>
            Show Proposals
          </Button>
          <Button variant='outline' onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Files ({files.length})</h3>
            {files.length === 0 ? (
              <p className='text-muted-foreground'>No files found</p>
            ) : (
              <ul className='space-y-2'>
                {files.map((file) => (
                  <li key={file.id} className='p-3 border rounded-md'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <h4 className='font-medium'>{file.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {file.type} - {file.status}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => updateStatus(file.id, 'approved' as const)}
                        >
                          Approve
                        </Button>
                        <Button variant='destructive' size='sm' onClick={() => deleteFile(file.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
