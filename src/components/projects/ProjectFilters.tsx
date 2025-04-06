import { Button } from '@/components/ui/button';
import { PipelineSettings } from './PipelineSettings';

interface ProjectFiltersProps {
  isKanban: boolean;
  kanban: 'stages' | 'status';
  toggleView: () => void;
  setKanban: (view: 'stages' | 'status') => void;
}

export function ProjectFilters({ isKanban, kanban, toggleView, setKanban }: ProjectFiltersProps) {
  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
      <div className='flex border rounded-md overflow-hidden shadow-sm'>
        <Button
          variant={!isKanban ? 'default' : 'ghost'}
          size='sm'
          className='rounded-none px-3 h-9'
          onClick={toggleView}
        >
          Table View
        </Button>
        <Button
          variant={isKanban ? 'default' : 'ghost'}
          size='sm'
          className='rounded-none px-3 h-9'
          onClick={toggleView}
        >
          Kanban Board
        </Button>
      </div>
      {isKanban && (
        <div className='flex border rounded-md overflow-hidden shadow-sm'>
          <Button
            variant={kanban === 'stages' ? 'default' : 'ghost'}
            size='sm'
            className='rounded-none px-3 h-9'
            onClick={() => {
              return setKanban('stages');
            }}
          >
            By Stage
          </Button>
          <Button
            variant={kanban === 'status' ? 'default' : 'ghost'}
            size='sm'
            className='rounded-none px-3 h-9'
            onClick={() => {
              return setKanban('status');
            }}
          >
            By Status
          </Button>
        </div>
      )}
      <PipelineSettings />
    </div>
  );
}
