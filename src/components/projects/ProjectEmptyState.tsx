import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

interface ProjectEmptyStateProps {
  search: string;
  status: string;
}

export function ProjectEmptyState({ search, status }: ProjectEmptyStateProps) {
  return (
    <div className='text-center py-16 space-y-3'>
      <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 mb-3'>
        <Search className='h-5 w-5 text-muted-foreground opacity-70' />
      </div>
      <h3 className='text-base font-medium'>No projects found</h3>
      <p className='text-muted-foreground text-sm max-w-md mx-auto mb-5'>
        {search || status !== 'all'
          ? "Try adjusting your search or filter to find what you're looking for."
          : 'Get started by creating your first project.'}
      </p>
      {!search && status === 'all' && (
        <Button asChild>
          <Link href='/projects/new'>
            <Plus className='mr-2 h-4 w-4' />
            New Project
          </Link>
        </Button>
      )}
    </div>
  );
}
