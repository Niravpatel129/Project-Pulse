import { Plus } from 'lucide-react';
import { FcDocument } from 'react-icons/fc';

const fakeModules = [
  { name: 'Project Brief', description: 'Project overview document' },
  { name: 'Design Assets', description: 'Logos and brand guidelines' },
  { name: 'Contract', description: 'Signed agreement document' },
  { name: 'Timeline', description: 'Project milestones and deadlines' },
  { name: 'Requirements', description: 'Technical specifications' },
];

export default function NewProjectModules() {
  const renderProjectItem = (item) => {
    return (
      <div className='border rounded-xl w-full aspect-square max-w-[220px] hover:bg-muted/50 cursor-pointer flex flex-col'>
        {/* Top Part */}
        <div className='flex items-center justify-center flex-grow'>
          <FcDocument className='h-[50%] w-[50%] max-h-[60px] max-w-[60px]' />
        </div>
        {/* Bottom Part */}
        <div className='border-t'>
          <div className='py-3 px-3 flex flex-col gap-1'>
            <p className='text-sm font-medium truncate'>{item.name}</p>
            <p className='text-xs text-gray-500 truncate'>{item.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAddNewModule = () => {
    return (
      <div className='border border-dashed rounded-xl w-full aspect-square max-w-[220px] hover:bg-muted/50 cursor-pointer flex flex-col items-center justify-center'>
        <div className='flex flex-col items-center gap-2'>
          <div className='rounded-full bg-muted p-3'>
            <Plus className='h-6 w-6 text-muted-foreground' />
          </div>
          <div className='text-center px-4'>
            <p className='text-sm font-medium'>Add New Module</p>
            <p className='text-xs text-muted-foreground mt-1'>Click to create a new module</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className=''>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr'>
          {fakeModules.map((item, index) => {
            return (
              <div key={index} className='flex justify-center'>
                {renderProjectItem(item)}
              </div>
            );
          })}
          <div className='flex justify-center'>{renderAddNewModule()}</div>
        </div>
      </div>
    </div>
  );
}
