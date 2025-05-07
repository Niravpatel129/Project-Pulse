import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function ClientWorkTab() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Kanban Board */}
      <Card>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Project Kanban</h2>
          <div className='space-y-4'>
            <div className='bg-muted/50 p-4 rounded-lg'>
              <h3 className='font-medium mb-2'>To Do</h3>
              <div className='space-y-2'>
                <div className='bg-white p-3 rounded border'>Initial client meeting</div>
                <div className='bg-white p-3 rounded border'>Gather requirements</div>
              </div>
            </div>
            <div className='bg-muted/50 p-4 rounded-lg'>
              <h3 className='font-medium mb-2'>In Progress</h3>
              <div className='space-y-2'>
                <div className='bg-white p-3 rounded border'>Design mockups</div>
              </div>
            </div>
            <div className='bg-muted/50 p-4 rounded-lg'>
              <h3 className='font-medium mb-2'>Done</h3>
              <div className='space-y-2'>
                <div className='bg-white p-3 rounded border'>Project setup</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Notes */}
      <Card>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Team Notes</h2>
          <div className='space-y-4'>
            <div className='bg-muted/50 p-4 rounded-lg'>
              <div className='flex items-center gap-2 mb-2'>
                <Users className='w-4 h-4' />
                <span className='font-medium'>Team Updates</span>
              </div>
              <div className='space-y-3'>
                <div className='bg-white p-3 rounded border'>
                  <p className='text-sm'>Client requested additional features for the dashboard</p>
                  <p className='text-xs text-muted-foreground mt-1'>Added by John - 2 hours ago</p>
                </div>
                <div className='bg-white p-3 rounded border'>
                  <p className='text-sm'>Design assets are ready for review</p>
                  <p className='text-xs text-muted-foreground mt-1'>Added by Sarah - 1 day ago</p>
                </div>
              </div>
            </div>
            <Button variant='outline' size='sm' className='w-full'>
              Add new note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
