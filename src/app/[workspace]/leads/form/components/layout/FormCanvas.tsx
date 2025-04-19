'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Eye,
  FileUp,
  HelpCircle,
  MessageSquare,
  Phone,
  Radio,
  Star,
  User2,
} from 'lucide-react';
import { FC, ReactNode } from 'react';
import { useFormBuilder } from '../../context/FormBuilderContext';
import { FormElement, FormValues } from '../../types/formTypes';

interface FormCanvasProps {
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  formElements: FormElement[];
  formValues: FormValues;
  handleFormValueChange: (elementId: string, value: string | string[] | boolean | number) => void;
  selectedElementId: string | null;
  selectElement: (id: string) => void;
  addElement: (type: string) => void;
  addClientDetailsSection: () => void;
  shouldShowElement: (element: FormElement) => boolean;
  isMobile: boolean;
  showMobileNav: boolean;
  setShowMobileNav: (show: boolean) => void;
  showElementMenu: (e: React.MouseEvent) => void;
  // In a real implementation, we would pass the actual elements
  renderFormElement: (element: FormElement) => ReactNode;
}

export const FormCanvas: FC<FormCanvasProps> = ({
  previewMode,
  setPreviewMode,
  formElements,
  formValues,
  handleFormValueChange,
  selectedElementId,
  selectElement,
  addElement,
  addClientDetailsSection,
  shouldShowElement,
  isMobile,
  showMobileNav,
  setShowMobileNav,
  showElementMenu,
  renderFormElement,
}) => {
  const { validationErrors } = useFormBuilder();

  return (
    <div
      className={cn('flex-1 overflow-y-auto p-4 md:p-8 bg-white', previewMode ? 'w-full' : '')}
      onContextMenu={!previewMode && !isMobile ? showElementMenu : undefined}
      onClick={() => {
        return isMobile && showMobileNav ? setShowMobileNav(false) : null;
      }}
    >
      {previewMode && (
        <div className='mb-6 p-4 bg-blue-50/70 text-blue-700 rounded-xl flex items-center justify-between shadow-sm'>
          <div className='flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            <span className='font-medium'>
              Preview Mode: See how your form will appear to users
            </span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              return setPreviewMode(false);
            }}
            className='rounded-full'
          >
            Exit Preview
          </Button>
        </div>
      )}

      {!previewMode && validationErrors.length > 0 && (
        <div className='mb-6 p-4 bg-amber-50/70 text-amber-700 rounded-xl flex items-center justify-between shadow-sm'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            <span className='font-medium'>{validationErrors[0]}</span>
          </div>
          {validationErrors[0].includes('Client Details') && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                return addClientDetailsSection();
              }}
              className='rounded-full'
            >
              Add Client Details
            </Button>
          )}
        </div>
      )}

      {formElements.length === 0 ? (
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
      ) : (
        <div className='space-y-4'>
          {formElements.map((element) => {
            // Check if element should be shown based on conditions
            if (!shouldShowElement(element)) return null;

            // Render the specific element component
            return renderFormElement(element);
          })}
        </div>
      )}
    </div>
  );
};
