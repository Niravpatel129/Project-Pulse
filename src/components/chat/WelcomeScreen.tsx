import { ActionCard } from './ActionCard';

interface WelcomeScreenProps {
  onActionCardClick: (title: string) => void;
}

export function WelcomeScreen({ onActionCardClick }: WelcomeScreenProps) {
  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 flex items-center justify-center'>
        <div className='max-w-3xl px-6 text-center'>
          <div className='mb-12'>
            <h2 className='text-4xl font-medium mb-4 text-gray-900 dark:text-white'>
              Welcome to Script
            </h2>
            <p className='text-base text-gray-500 dark:text-[#8b8b8b] leading-relaxed max-w-lg mx-auto'>
              Get started by Script a task and Chat can do the rest. Not sure where to start?
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto'>
            <ActionCard
              icon='📝'
              iconBg='bg-amber-50 dark:bg-[#232323]'
              title='Write copy'
              onClick={() => {
                return onActionCardClick('Write copy');
              }}
            />
            <ActionCard
              icon='🔮'
              iconBg='bg-blue-50 dark:bg-[#232323]'
              title='Image generation'
              onClick={() => {
                return onActionCardClick('Image generation');
              }}
            />
            <ActionCard
              icon='👤'
              iconBg='bg-green-50 dark:bg-[#232323]'
              title='Create avatar'
              onClick={() => {
                return onActionCardClick('Create avatar');
              }}
            />
            <ActionCard
              icon='💻'
              iconBg='bg-pink-50 dark:bg-[#232323]'
              title='Write code'
              onClick={() => {
                return onActionCardClick('Write code');
              }}
            />
          </div>

          <div className='text-xs text-gray-400 dark:text-[#8b8b8b] mb-8'>
            Script may generate inaccurate information about people, places, or facts. Model: Script
            AI v1.3
          </div>
        </div>
      </div>
    </div>
  );
}
