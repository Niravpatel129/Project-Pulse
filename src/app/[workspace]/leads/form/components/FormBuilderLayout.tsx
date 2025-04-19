'use client';

import { ReactNode } from 'react';
import FormBuilderHeader from './FormBuilderHeader';
import FormBuilderSidebar from './FormBuilderSidebar';

interface FormBuilderLayoutProps {
  children: ReactNode;
  formElements: any[];
  setFormElements: (elements: any[]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  setEditingElement: (element: any | null) => void;
  setChangesSaved: (saved: boolean) => void;
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  isMobile: boolean;
  showMobileNav: boolean;
  setShowMobileNav: (show: boolean) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  isDragging: boolean;
  draggedElementId: string | null;
  dragOverElementId: string | null;
  handleDragStart: (e: React.DragEvent, elementId: string) => void;
  handleDragOver: (e: React.DragEvent, elementId: string) => void;
  handleDrop: (e: React.DragEvent, targetElementId: string) => void;
  handleDragEnd: () => void;
  getElementIcon: (type: string) => React.ReactNode;
  generateId: () => string;
}

export default function FormBuilderLayout({
  children,
  formElements,
  setFormElements,
  activeTab,
  setActiveTab,
  selectedElementId,
  setSelectedElementId,
  setEditingElement,
  setChangesSaved,
  previewMode,
  setPreviewMode,
  isMobile,
  showMobileNav,
  setShowMobileNav,
  showMobileMenu,
  setShowMobileMenu,
  isDragging,
  draggedElementId,
  dragOverElementId,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  getElementIcon,
  generateId,
}: FormBuilderLayoutProps) {
  return (
    <div className='flex flex-col h-[calc(100vh-66px)] overflow-hidden'>
      {/* Header */}
      <div className=''>
        <FormBuilderHeader
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          isMobile={isMobile}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
        />
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
            <FormBuilderSidebar
              formElements={formElements}
              setFormElements={setFormElements}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedElementId={selectedElementId}
              setSelectedElementId={setSelectedElementId}
              setEditingElement={setEditingElement}
              setChangesSaved={setChangesSaved}
              previewMode={previewMode}
              isMobile={isMobile}
              showMobileNav={showMobileNav}
              setShowMobileNav={setShowMobileNav}
              isDragging={isDragging}
              draggedElementId={draggedElementId}
              dragOverElementId={dragOverElementId}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              getElementIcon={getElementIcon}
              generateId={generateId}
            />
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1 overflow-y-auto'>{children}</div>
      </div>
    </div>
  );
}
