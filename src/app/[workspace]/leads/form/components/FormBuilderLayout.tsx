'use client';

import { ReactNode } from 'react';
import { useFormBuilder } from '../context/FormBuilderContext';
import FormBuilderHeader from './FormBuilderHeader';
import FormBuilderSidebar from './FormBuilderSidebar';

interface FormBuilderLayoutProps {
  children: ReactNode;
  getElementIcon: (type: string) => React.ReactNode;
}

export default function FormBuilderLayout({ children, getElementIcon }: FormBuilderLayoutProps) {
  const { previewMode, isMobile, showMobileNav, showMobileMenu } = useFormBuilder();

  return (
    <div className='flex flex-col h-[calc(100vh-66px)] overflow-hidden'>
      {/* Header */}
      <div className=''>
        <FormBuilderHeader />
      </div>

      {/* Main content area with sidebar and children */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar - fixed only within this layout */}
        <div className={`${previewMode ? 'hidden' : 'w-0 md:w-80 flex-shrink-0'}`}>
          <div
            className={`
            w-full md:w-80 border-r bg-white h-full overflow-y-auto shadow-sm pt-2
            ${!previewMode && isMobile && !showMobileNav ? 'hidden' : ''}
            ${!previewMode && isMobile && showMobileNav ? 'fixed inset-0 z-40' : ''}
          `}
          >
            <FormBuilderSidebar getElementIcon={getElementIcon} />
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1 overflow-y-auto'>{children}</div>
      </div>
    </div>
  );
}
