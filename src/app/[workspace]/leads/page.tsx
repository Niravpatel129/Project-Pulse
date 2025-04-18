'use client';

import { CreateFormModal } from '@/components/leads/CreateFormModal';
import { FormSettings } from '@/components/leads/FormSettings';
import { FormsTable } from '@/components/leads/FormsTable';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CiFolderOn } from 'react-icons/ci';

export default function LeadsInterface() {
  const [activeTab, setActiveTab] = useState('leads');
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);
  const [hasForms, setHasForms] = useState(false);
  const router = useRouter();

  const handleFormCreated = () => {
    setHasForms(true);
  };

  return (
    <div className=' bg-white'>
      {/* Navigation */}
      <div className='border-b'>
        <div className='container mx-auto px-4'>
          <nav className='flex space-x-8 gap-4'>
            <button
              onClick={() => {
                return setActiveTab('leads');
              }}
              className={`py-4 font-medium ${
                activeTab === 'leads' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
            >
              Forms
            </button>
            <button
              onClick={() => {
                return setActiveTab('settings');
              }}
              className={`py-4 font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>
      {/* Main Content */}
      <div className=''>
        {activeTab === 'leads' ? (
          <>
            {!hasForms ? (
              <div className='flex justify-center items-center relative z-10'>
                <div className='flex flex-col justify-center p-6 max-w-2xl text-center mt-[50px]'>
                  <div className='relative mb-4'>
                    <div className='absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-30 blur-md'></div>
                    <div className='relative flex items-center justify-center'>
                      <CiFolderOn className='h-16 w-16 mx-auto text-blue-500 drop-shadow-md' />
                    </div>
                  </div>
                  <div className='mx-auto'>
                    <h2 className='text-3xl font-bold text-gray-800 mb-6'>Lead Forms</h2>
                    <p className='text-gray-600 mb-8'>
                      Create forms to collect leads and automatically turn them into projects.
                      Customize fields, set up notifications, and track submissions all in one
                      place.
                    </p>

                    <div className='mb-8 flex justify-center'>
                      <Button
                        className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md'
                        onClick={() => {
                          router.push('/leads/form');
                        }}
                      >
                        Create New Form
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <h2 className='text-2xl font-bold text-gray-800'>Forms</h2>
                  <Button
                    className='bg-blue-500 hover:bg-blue-600 text-white'
                    onClick={() => {
                      return setIsCreateFormModalOpen(true);
                    }}
                  >
                    Create New Form
                  </Button>
                </div>
                <FormsTable />
              </div>
            )}
          </>
        ) : (
          <FormSettings />
        )}
      </div>
      <CreateFormModal
        open={isCreateFormModalOpen}
        onOpenChange={setIsCreateFormModalOpen}
        onFormCreated={handleFormCreated}
      />
    </div>
  );
}
