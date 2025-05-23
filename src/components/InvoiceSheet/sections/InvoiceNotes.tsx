import { Textarea } from '@/components/ui/textarea';
import { useRef, useState } from 'react';

const InvoiceNotes = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className='mt-8'>
      <div className='flex-1'>
        <div className='mb-2'>
          <span className='text-[11px] text-[#878787] font-mono'>Notes/Memo</span>
        </div>
        <div className='relative'>
          <Textarea
            ref={textareaRef}
            className={`!text-[11px] min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden ${
              !isFocused && !content
                ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] p-0'
                : 'p-0 h-auto'
            }`}
            defaultValue=''
            name='from_address'
            onFocus={() => {
              return setIsFocused(true);
            }}
            onBlur={() => {
              return setIsFocused(false);
            }}
            onChange={(e) => {
              setContent(e.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceNotes;
