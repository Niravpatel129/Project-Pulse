'use client';

import SubmissionsTable from '@/app/[workspace]/leads/components/SubmissionsTable';
import { FormSettings } from '@/components/leads/FormSettings';
import { useState } from 'react';
import LeadFormsTable from './components/LeadFormsTable';

export default function LeadsInterface() {
  const [activeTab, setActiveTab] = useState('forms');

  return (
    <div className='bg-background'>
      {/* Navigation */}
      <div className='border-b'>
        <div className='container mx-auto px-4'>
          <nav className='flex space-x-8 gap-4'>
            <button
              onClick={() => {
                return setActiveTab('forms');
              }}
              className={`py-4 font-medium ${
                activeTab === 'forms'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Forms
            </button>
            <button
              onClick={() => {
                return setActiveTab('submissions');
              }}
              className={`py-4 font-medium ${
                activeTab === 'submissions'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Submissions
            </button>
            <button
              onClick={() => {
                return setActiveTab('settings');
              }}
              className={`py-4 font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-6'>
        {activeTab === 'forms' ? (
          <LeadFormsTable />
        ) : activeTab === 'submissions' ? (
          <SubmissionsTable />
        ) : (
          <FormSettings />
        )}
      </div>
    </div>
  );
}
