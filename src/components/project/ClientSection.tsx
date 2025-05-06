'use client';

import SectionFooter from './SectionFooter';
import { Client, Section } from './types';

type ClientSectionProps = {
  clients: Client[];
  selectedClient: string;
  setSelectedClient: (clientId: string) => void;
  showNotification: (message: string, type?: string) => void;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
};

export default function ClientSection({
  clients,
  selectedClient,
  setSelectedClient,
  showNotification,
  setActiveSection,
}: ClientSectionProps) {
  return (
    <div className='flex flex-col h-full relative'>
      <div className='absolute inset-0 pt-6 px-8 pb-16 overflow-y-auto'>
        <div className='mb-8'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-[#111827]'>Select Client</h2>
          </div>
          <p className='text-[#6B7280] text-sm leading-5 mb-6'>
            Choose an existing client or create a new one for this project.
          </p>

          <div className='space-y-4'>
            {clients.map((client) => {
              return (
                <div
                  key={client.id}
                  className={`border ${
                    selectedClient === client.id ? 'border-[#111827]' : 'border-[#E5E7EB]'
                  } rounded-md p-4 cursor-pointer hover:border-[#111827] transition-colors`}
                  onClick={() => {
                    setSelectedClient(client.id);
                    showNotification(`Selected ${client.name}`, 'info');
                  }}
                >
                  <div className='flex items-center'>
                    <div className='w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center mr-3'>
                      <span className='text-[#5B21B6] text-sm font-medium'>
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className='text-[#111827] text-sm font-medium'>{client.name}</div>
                      <div className='text-[#6B7280] text-xs'>{client.email}</div>
                    </div>
                    {selectedClient === client.id && (
                      <div className='ml-auto w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center'>
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
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              className='flex items-center border border-[#E5E7EB] rounded-md p-4 w-full hover:bg-[#F9FAFB] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200'
              onClick={() => {
                return showNotification('Client creation coming soon', 'info');
              }}
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                className='mr-3'
              >
                <path
                  d='M10 4.16666V15.8333M4.16667 10H15.8333'
                  stroke='#6B7280'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <span className='text-[#6B7280] text-sm'>Create new client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SectionFooter
        onContinue={() => {
          setActiveSection('comments');
          showNotification('Moved to Comments section');
        }}
        currentSection={2}
        totalSections={3}
      />
    </div>
  );
}
