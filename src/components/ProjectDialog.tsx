'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import ProjectManagement from './project/ProjectManagement';

export default function ProjectDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#FAFAFA]'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold mb-6'>Project Management</h1>
        <p className='text-muted-foreground mb-8 max-w-md mx-auto'>
          Create and manage projects with items, clients, and notes all in one place.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size='lg' className='gap-2'>
              <FileText size={18} />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent
            className='!overflow-hidden p-0 max-w-none w-full h-full md:max-w-[90vw] md:h-[90vh] md:rounded-lg'
            forceMount
          >
            <DialogTitle className='sr-only'>Project Management</DialogTitle>

            <ProjectManagement
              onClose={() => {
                return setDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
