'use client';

import { Section } from './types';

type LeftSidebarProps = {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  total: string;
};

export default function LeftSidebar({ activeSection, setActiveSection, total }: LeftSidebarProps) {
  return (
    <div className='w-[300px] bg-white p-6 border-r border-[#F3F4F6] flex flex-col'>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold mb-2 text-[#111827]'>New Project</h1>
        <p className='text-[#4B5563] text-sm leading-5'>
          Create new project to help manage items, clients and notes in one place.
        </p>
      </div>

      <div className='space-y-3 flex-grow'>
        <button
          className={`flex items-center w-full text-left p-2 rounded-md ${
            activeSection === 'items' ? 'bg-[#F9FAFB]' : ''
          } hover:bg-[#F9FAFB] transition-colors`}
          onClick={() => {
            return setActiveSection('items');
          }}
        >
          <div
            className={`w-6 h-6 rounded-full ${
              activeSection === 'items' ? 'bg-[#111827]' : 'border border-[#D1D5DB]'
            } flex items-center justify-center mr-3 transition-colors`}
          >
            {activeSection === 'items' ? (
              <svg
                width='12'
                height='12'
                viewBox='0 0 12 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 3L4.5 8.5L2 6'
                  stroke='white'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='text-[#6B7280] text-xs'>1</span>
            )}
          </div>
          <span
            className={`text-sm ${
              activeSection === 'items' ? 'text-[#111827] font-medium' : 'text-[#6B7280]'
            }`}
          >
            Items
          </span>
        </button>

        <button
          className={`flex items-center w-full text-left p-2 rounded-md ${
            activeSection === 'client' ? 'bg-[#F9FAFB]' : ''
          } hover:bg-[#F9FAFB] transition-colors`}
          onClick={() => {
            return setActiveSection('client');
          }}
        >
          <div
            className={`w-6 h-6 rounded-full ${
              activeSection === 'client' ? 'bg-[#111827]' : 'border border-[#D1D5DB]'
            } flex items-center justify-center mr-3 transition-colors`}
          >
            {activeSection === 'client' ? (
              <svg
                width='12'
                height='12'
                viewBox='0 0 12 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 3L4.5 8.5L2 6'
                  stroke='white'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='text-[#6B7280] text-xs'>2</span>
            )}
          </div>
          <span
            className={`text-sm ${
              activeSection === 'client' ? 'text-[#111827] font-medium' : 'text-[#6B7280]'
            }`}
          >
            Client
          </span>
        </button>

        <button
          className={`flex items-center w-full text-left p-2 rounded-md ${
            activeSection === 'comments' ? 'bg-[#F9FAFB]' : ''
          } hover:bg-[#F9FAFB] transition-colors`}
          onClick={() => {
            return setActiveSection('comments');
          }}
        >
          <div
            className={`w-6 h-6 rounded-full ${
              activeSection === 'comments' ? 'bg-[#111827]' : 'border border-[#D1D5DB]'
            } flex items-center justify-center mr-3 transition-colors`}
          >
            {activeSection === 'comments' ? (
              <svg
                width='12'
                height='12'
                viewBox='0 0 12 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10 3L4.5 8.5L2 6'
                  stroke='white'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : (
              <span className='text-[#6B7280] text-xs'>3</span>
            )}
          </div>
          <span
            className={`text-sm ${
              activeSection === 'comments' ? 'text-[#111827] font-medium' : 'text-[#6B7280]'
            }`}
          >
            Comments
          </span>
        </button>
      </div>

      {/* Total at bottom of sidebar */}
      <div className='mt-auto pt-6 border-t border-[#E5E7EB]'>
        <div className='flex justify-between items-center mb-3'>
          <span className='text-[#6B7280] text-sm'>Total</span>
          <span className='text-[#111827] text-base font-medium'>${total}</span>
        </div>
        <div className='flex items-center'>
          <span className='text-[#6B7280] text-xs'>project.example.com/acme-corp</span>
        </div>
      </div>
    </div>
  );
}
