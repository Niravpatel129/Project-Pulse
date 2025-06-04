interface InboxMainProps {
  selectedThreadId?: string;
}

export default function InboxMain({ selectedThreadId }: InboxMainProps) {
  return (
    <div className='flex-1 flex items-center justify-center bg-white dark:bg-[#141414]'>
      {selectedThreadId ? (
        <div className='text-[#3F3F46] dark:text-[#fafafa]'>
          Selected thread: {selectedThreadId}
        </div>
      ) : (
        <div className='text-[#3F3F46]/60 dark:text-[#8C8C8C]'>
          Select an email to view its contents
        </div>
      )}
    </div>
  );
}
