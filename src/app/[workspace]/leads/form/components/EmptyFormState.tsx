import { Button } from '@/components/ui/button';
import { FileUp, HelpCircle, MessageSquare, Phone, Radio, Star, User2 } from 'lucide-react';
import React from 'react';

interface EmptyFormStateProps {
  addElement: (elementType: string) => void;
  addClientDetailsSection: () => void;
}

const EmptyFormState: React.FC<EmptyFormStateProps> = ({ addElement, addClientDetailsSection }) => {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <div className='rounded-full bg-gray-100 p-3 md:p-4 mb-3 md:mb-5 shadow-sm'>
        <HelpCircle className='h-5 w-5 md:h-7 md:w-7 text-gray-400' />
      </div>
      <h3 className='text-lg md:text-xl font-medium mb-2 md:mb-3 text-gray-800 text-center px-4'>
        Get started with these Form Fields
      </h3>
      <p className='text-gray-500 mb-6 md:mb-10 text-sm md:text-base text-center px-4'>
        Or right-click anywhere to add elements
      </p>

      <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-5 max-w-3xl px-2 md:px-0'>
        <Button
          variant='outline'
          className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
          onClick={() => {
            return addElement('Text Block');
          }}
        >
          <MessageSquare className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
          <span className='font-normal text-xs md:text-sm'>Add Text Block</span>
        </Button>
        <Button
          variant='outline'
          className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
          onClick={() => {
            return addElement('Single Response');
          }}
        >
          <MessageSquare className='h-5 w-5 md:h-7 md:w-7 rotate-180 text-gray-500' />
          <span className='font-normal text-xs md:text-sm'>Add Single Response</span>
        </Button>
        <Button
          variant='outline'
          className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
          onClick={() => {
            return addElement('Rating');
          }}
        >
          <Star className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
          <span className='font-normal text-xs md:text-sm'>Add Rating</span>
        </Button>
        <Button
          variant='outline'
          className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
          onClick={() => {
            return addElement('Phone Number');
          }}
        >
          <Phone className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
          <span className='font-normal text-xs md:text-sm'>Add Phone Number</span>
        </Button>
        <Button
          variant='outline'
          className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
          onClick={() => {
            return addElement('Radio Buttons');
          }}
        >
          <Radio className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
          <span className='font-normal text-xs md:text-sm'>Add Radio Buttons</span>
        </Button>
        <Button
          variant='outline'
          className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4'
          onClick={() => {
            return addElement('File Upload');
          }}
        >
          <FileUp className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
          <span className='font-normal text-xs md:text-sm'>Add File Upload</span>
        </Button>
        <Button
          variant='outline'
          className='h-20 md:h-28 flex flex-col gap-2 md:gap-3 items-center justify-center rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all p-2 md:p-4 sm:col-span-2 lg:col-span-1'
          onClick={() => {
            return addClientDetailsSection();
          }}
        >
          <User2 className='h-5 w-5 md:h-7 md:w-7 text-gray-500' />
          <span className='font-normal text-xs md:text-sm'>Add Client Details</span>
        </Button>
      </div>
    </div>
  );
};

export default EmptyFormState;
