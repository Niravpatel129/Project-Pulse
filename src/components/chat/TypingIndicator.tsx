export function TypingIndicator() {
  return (
    <div className='flex justify-start'>
      <div className='max-w-[80%]'>
        <div className='bg-gray-100 dark:bg-gray-900 px-4 py-3 rounded-lg'>
          <div className='flex items-center space-x-1'>
            <div className='flex space-x-1'>
              <div className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce'></div>
              <div
                className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce'
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className='w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce'
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
