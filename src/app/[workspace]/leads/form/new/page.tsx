'use client';

import { cn } from '@/lib/utils';
import { Mona_Sans as FontSans } from 'next/font/google';
import ElementEditor from '../components/ElementEditor';
import ElementTypeMenu from '../components/ElementTypeMenu';
import FormBuilderLayout from '../components/FormBuilderLayout';
import FormCanvasContent from '../components/FormCanvasContent';
import MobileNavigation from '../components/MobileNavigation';
import { FormBuilderProvider, useFormBuilder } from '../context/FormBuilderContext';

// Import getElementIcon from utils
import { getElementIcon } from '../utils';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const FormBuilderContent = () => {
  const { previewMode, isMobile, showMobileNav, setShowMobileNav, showElementMenu } =
    useFormBuilder();

  return (
    <div className={cn('font-sans antialiased', fontSans.variable)}>
      <FormBuilderLayout getElementIcon={getElementIcon}>
        {/* Form Canvas */}
        <div
          className={cn(
            'flex-1 overflow-y-auto p-4 md:p-8 bg-white md:pb-0',
            previewMode ? 'w-full' : '',
            isMobile && !previewMode ? 'pb-20' : '',
          )}
          onContextMenu={!previewMode && !isMobile ? showElementMenu : undefined}
          onClick={() => {
            return isMobile && showMobileNav ? setShowMobileNav(false) : null;
          }}
        >
          <FormCanvasContent />
        </div>
      </FormBuilderLayout>

      {/* Mobile Navigation - This is now only for bottom navigation */}
      <MobileNavigation />

      {/* Element Editor Dialog */}
      <ElementEditor />

      {/* Element Type Menu */}
      <ElementTypeMenu />
    </div>
  );
};

export default function NewFormPage() {
  // Hard-code this as a new form (create mode)
  const formId = undefined;
  const isEditMode = false;

  return (
    <FormBuilderProvider formId={formId} isEditMode={isEditMode}>
      <FormBuilderContent />
    </FormBuilderProvider>
  );
}
